import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type CitySuggestion = {
  name: string;
  region: string | null;
  countryCode: string;
  countryName: string;
  label: string;
  source: "geonames" | "fallback-db";
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

const FRENCH_FALLBACK_PRIORITY = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Montpellier",
  "Strasbourg",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Saint-Étienne",
  "Toulon",
  "Le Havre",
  "Grenoble",
  "Dijon",
  "Angers",
  "Nîmes",
  "Villeurbanne",
  "Le Mans",
  "Aix-en-Provence",
  "Brest",
  "Tours",
  "Amiens",
  "Limoges",
  "Annecy",
  "Perpignan",
  "Metz",
  "Besançon",
  "Orléans",
  "Mulhouse",
  "Rouen",
  "Caen",
  "Nancy",
  "Argenteuil",
  "Montreuil",
  "Saint-Denis",
  "Avignon",
  "Poitiers",
  "Nanterre",
  "Créteil",
  "Versailles",
  "La Rochelle",
  "Pau",
  "Calais",
  "Cannes",
  "Colmar",
  "Béziers",
  "Ajaccio",
].map((name) => name.toLowerCase());

const FRENCH_FALLBACK_CITIES = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Montpellier",
  "Strasbourg",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Saint-Étienne",
  "Le Havre",
  "Toulon",
  "Grenoble",
  "Dijon",
  "Angers",
  "Nîmes",
  "Villeurbanne",
  "Le Mans",
  "Aix-en-Provence",
  "Brest",
  "Tours",
  "Amiens",
  "Annecy",
  "Limoges",
  "Perpignan",
  "Metz",
  "Besançon",
  "Orléans",
  "Mulhouse",
  "Rouen",
  "Caen",
  "Nancy",
  "Argenteuil",
  "Montreuil",
  "Saint-Denis",
  "Avignon",
  "Poitiers",
  "Nanterre",
  "Créteil",
  "Versailles",
  "La Rochelle",
  "Pau",
  "Calais",
  "Cannes",
  "Colmar",
  "Béziers",
  "Ajaccio",
] as const;

function normalizeLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;

  return Math.min(parsed, MAX_LIMIT);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function dedupeSuggestions(items: CitySuggestion[]): CitySuggestion[] {
  const seen = new Set<string>();
  const deduped: CitySuggestion[] = [];

  for (const item of items) {
    const key = `${item.name.toLowerCase()}|${item.countryCode.toUpperCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

async function getFallbackCities(
  query: string,
  countryCode: string | null,
  limit: number,
): Promise<CitySuggestion[]> {
  const supabase = await createClient();

  const { data: countries, error: countriesError } = await supabase
    .from("countries")
    .select("id, code, name");

  if (countriesError || !countries) return [];

  const countryById = new Map(countries.map((country) => [country.id, country]));

  const fallbackCountryCode = countryCode ?? "FR";
  const countryId = countries.find((country) => country.code === fallbackCountryCode)?.id ?? null;
  if (!countryId) return [];

  let citiesQuery = supabase
    .from("cities")
    .select("name, region, country_id")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(limit * 2);

  citiesQuery = citiesQuery.eq("country_id", countryId);

  const { data: cities, error: citiesError } = await citiesQuery;

  if (citiesError || !cities) return [];

  const suggestions: CitySuggestion[] = [];

  for (const city of cities) {
    const country = countryById.get(city.country_id);
    if (!country) continue;

    suggestions.push({
      name: city.name,
      region: city.region,
      countryCode: country.code,
      countryName: country.name,
      label: [city.name, city.region, country.name].filter(Boolean).join(", "),
      source: "fallback-db",
    });
  }

  if (fallbackCountryCode === "FR") {
    const priorityIndex = new Map(
      FRENCH_FALLBACK_PRIORITY.map((name, index) => [name, index]),
    );

    suggestions.sort((a, b) => {
      const aRank = priorityIndex.get(a.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const bRank = priorityIndex.get(b.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name, "fr");
    });
  }

  return suggestions.slice(0, limit);
}

async function getGeoNamesCities(
  query: string,
  countryCode: string | null,
  limit: number,
  language: string,
): Promise<CitySuggestion[]> {
  const username = process.env.GEONAMES_USERNAME;
  if (!username) return [];

  const params = new URLSearchParams({
    q: query,
    maxRows: String(limit),
    featureClass: "P",
    lang: language,
    style: "FULL",
    username,
  });

  if (countryCode) {
    params.set("country", countryCode);
  }

  const response = await fetch(`https://secure.geonames.org/searchJSON?${params.toString()}`, {
    headers: {
      "User-Agent": "MarcheLibre/1.0",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    geonames?: Array<{
      name?: string;
      countryCode?: string;
      countryName?: string;
      admin1Name?: string;
      admin2Name?: string;
    }>;
  };

  const suggestions: CitySuggestion[] = [];

  for (const item of payload.geonames ?? []) {
    if (!item.name || !item.countryCode || !item.countryName) continue;

    const region = item.admin1Name || item.admin2Name || null;

    suggestions.push({
      name: item.name,
      region,
      countryCode: item.countryCode,
      countryName: item.countryName,
      label: [item.name, region, item.countryName].filter(Boolean).join(", "),
      source: "geonames",
    });
  }

  return suggestions;
}

async function getOpenMeteoCities(
  query: string,
  countryCode: string | null,
  limit: number,
  language: string,
): Promise<CitySuggestion[]> {
  const params = new URLSearchParams({
    name: query,
    count: String(limit),
    language,
  });

  if (countryCode) {
    params.set("countryCode", countryCode);
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "MarcheLibre/1.0",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    results?: Array<{
      name?: string;
      country_code?: string;
      country?: string;
      admin1?: string;
      admin2?: string;
    }>;
  };

  const suggestions: CitySuggestion[] = [];

  for (const item of payload.results ?? []) {
    if (!item.name || !item.country_code || !item.country) continue;

    const region = item.admin1 || item.admin2 || null;
    suggestions.push({
      name: item.name,
      region,
      countryCode: item.country_code,
      countryName: item.country,
      label: [item.name, region, item.country].filter(Boolean).join(", "),
      source: "geonames",
    });
  }

  return suggestions;
}

function getStaticFrenchFallbackCities(
  query: string,
  countryCode: string | null,
  limit: number,
): CitySuggestion[] {
  if (countryCode && countryCode !== "FR") {
    return [];
  }

  const normalizedQuery = normalizeText(query);
  return FRENCH_FALLBACK_CITIES
    .filter((name) => normalizeText(name).includes(normalizedQuery))
    .slice(0, limit)
    .map((name) => ({
      name,
      region: null,
      countryCode: "FR",
      countryName: "France",
      label: `${name}, France`,
      source: "fallback-db",
    }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const rawCountry = request.nextUrl.searchParams.get("country");
  const countryCode = rawCountry?.trim().toUpperCase() ?? null;
  const language = request.nextUrl.searchParams.get("lang")?.trim().toLowerCase() || "fr";
  const limit = normalizeLimit(request.nextUrl.searchParams.get("limit"));

  let remoteResults: CitySuggestion[] = [];
  try {
    remoteResults = await getOpenMeteoCities(query, countryCode, limit, language);
  } catch {
    remoteResults = [];
  }

  if (remoteResults.length === 0) {
    try {
      remoteResults = await getGeoNamesCities(query, countryCode, limit, language);
    } catch {
      remoteResults = [];
    }
  }

  let fallbackResults: CitySuggestion[] = [];
  try {
    fallbackResults = await getFallbackCities(query, countryCode, limit);
  } catch {
    fallbackResults = [];
  }

  const staticFallbackResults = getStaticFrenchFallbackCities(
    query,
    countryCode,
    limit,
  );

  const results = dedupeSuggestions([
    ...remoteResults,
    ...staticFallbackResults,
    ...fallbackResults,
  ]).slice(0, limit);

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
