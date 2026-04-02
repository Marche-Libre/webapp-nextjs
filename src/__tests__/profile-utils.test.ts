import { describe, it, expect } from "vitest";
import {
  getVisibility,
  applyVisibility,
  countryFlag,
  getAvailabilityOption,
  getProfileCompleteness,
  getSpecialtyDisplay,
} from "@/lib/profile-utils";
import type { Profile, SpecialtyCategory, Specialty } from "@/lib/types/database";

// ─── Helpers ───

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: "user-1",
  email: "test@test.com",
  full_name: "John Doe",
  first_name: "John",
  last_name: "Doe",
  specialty_ids: [],
  specialty_category_id: null,
  location: null,
  bio: null,
  x_handle: "johndoe",
  avatar_url: null,
  phone: null,
  years_experience: null,
  country_code: null,
  availability_status: "available",
  skills: [],
  daily_rate: null,
  website: null,
  visibility: {
    first_name: true, last_name: true, phone: false, email: false,
    location: true, specialty: true, bio: true, years_experience: true,
    links: true, daily_rate: false, website: true, skills: true,
  },
  status: "approved",
  is_admin: false,
  links: null,
  accept_sponsorship: true,
  accept_dms: true,
  sponsored_by: null,
  sponsor_approved: false,
  onboarding_completed: true,
  looking_for: null,
  hidden_channel_ids: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

const makeCategories = (): (SpecialtyCategory & { specialties: Specialty[] })[] => [
  {
    id: "cat-1",
    name: "Développeur",
    sector: "Tech & Digital",
    sort_order: 1,
    specialties: [
      { id: "spec-1", category_id: "cat-1", name: "Frontend" },
      { id: "spec-2", category_id: "cat-1", name: "Backend" },
      { id: "spec-3", category_id: "cat-1", name: "Fullstack" },
    ],
  },
  {
    id: "cat-2",
    name: "Avocat",
    sector: "Juridique",
    sort_order: 2,
    specialties: [
      { id: "spec-4", category_id: "cat-2", name: "Droit des affaires" },
    ],
  },
];

// ─── Tests ───

describe("getVisibility", () => {
  it("returns default visibility when profile has no visibility set", () => {
    const profile = makeProfile({ visibility: null as any });
    const vis = getVisibility(profile);
    expect(vis.first_name).toBe(true);
    expect(vis.phone).toBe(false);
    expect(vis.daily_rate).toBe(false);
  });

  it("merges profile visibility with defaults", () => {
    const profile = makeProfile({
      visibility: { phone: true } as any,
    });
    const vis = getVisibility(profile);
    expect(vis.phone).toBe(true);
    expect(vis.first_name).toBe(true);
  });
});

describe("applyVisibility", () => {
  it("returns unmodified profile for own profile", () => {
    const profile = makeProfile({ phone: "+33123456789" });
    const result = applyVisibility(profile, true);
    expect(result.phone).toBe("+33123456789");
  });

  it("hides phone when visibility is false", () => {
    const profile = makeProfile({
      phone: "+33123456789",
      visibility: {
        first_name: true, last_name: true, phone: false, email: false,
        location: true, specialty: true, bio: true, years_experience: true,
        links: true, daily_rate: false, website: true, skills: true,
      },
    });
    const result = applyVisibility(profile, false);
    expect(result.phone).toBeNull();
  });

  it("clears specialty when visibility is false", () => {
    const profile = makeProfile({
      specialty_ids: ["spec-1"],
      specialty_category_id: "cat-1",
      visibility: {
        first_name: true, last_name: true, phone: false, email: false,
        location: true, specialty: false, bio: true, years_experience: true,
        links: true, daily_rate: false, website: true, skills: true,
      },
    });
    const result = applyVisibility(profile, false);
    expect(result.specialty_ids).toEqual([]);
    expect(result.specialty_category_id).toBeNull();
  });

  it("recalculates full_name from visible first/last name", () => {
    const profile = makeProfile({
      first_name: "John",
      last_name: "Doe",
      visibility: {
        first_name: true, last_name: false, phone: false, email: false,
        location: true, specialty: true, bio: true, years_experience: true,
        links: true, daily_rate: false, website: true, skills: true,
      },
    });
    const result = applyVisibility(profile, false);
    expect(result.full_name).toBe("John");
    expect(result.last_name).toBeNull();
  });
});

describe("countryFlag", () => {
  it("returns flag emoji for FR", () => {
    expect(countryFlag("FR")).toBe("🇫🇷");
  });

  it("returns flag emoji for US", () => {
    expect(countryFlag("US")).toBe("🇺🇸");
  });
});

describe("getAvailabilityOption", () => {
  it("returns correct option for available", () => {
    expect(getAvailabilityOption("available").label).toBe("Disponible");
  });

  it("returns correct option for busy", () => {
    expect(getAvailabilityOption("busy").label).toBe("En mission");
  });

  it("defaults to available for unknown status", () => {
    expect(getAvailabilityOption("unknown").label).toBe("Disponible");
  });
});

describe("getProfileCompleteness", () => {
  it("returns 0% for empty profile", () => {
    const profile = makeProfile();
    const { percent } = getProfileCompleteness(profile);
    expect(percent).toBeLessThan(50);
  });

  it("returns 100% for fully completed profile", () => {
    const profile = makeProfile({
      first_name: "John",
      last_name: "Doe",
      specialty_ids: ["spec-1"],
      location: "Paris",
      bio: "Hello",
      years_experience: 5,
      country_code: "FR",
      skills: ["React"],
      website: "https://example.com",
      daily_rate: "500",
      avatar_url: "https://example.com/avatar.jpg",
    });
    const { percent, missing } = getProfileCompleteness(profile);
    expect(percent).toBe(100);
    expect(missing).toHaveLength(0);
  });

  it("counts arrays as filled only when non-empty", () => {
    const profile = makeProfile({ skills: [], specialty_ids: [] });
    const { missing } = getProfileCompleteness(profile);
    const missingKeys = missing.map((m) => m.key);
    expect(missingKeys).toContain("skills");
    expect(missingKeys).toContain("specialty_ids");
  });
});

describe("getSpecialtyDisplay", () => {
  const categories = makeCategories();

  it("returns empty for profile without category", () => {
    const result = getSpecialtyDisplay({ specialty_ids: [], specialty_category_id: null }, categories);
    expect(result.categoryName).toBeNull();
    expect(result.specialtyNames).toEqual([]);
  });

  it("returns category name and specialty names", () => {
    const result = getSpecialtyDisplay(
      { specialty_ids: ["spec-1", "spec-2"], specialty_category_id: "cat-1" },
      categories,
    );
    expect(result.categoryName).toBe("Développeur");
    expect(result.specialtyNames).toEqual(["Frontend", "Backend"]);
  });

  it("filters out dangling specialty IDs", () => {
    const result = getSpecialtyDisplay(
      { specialty_ids: ["spec-1", "nonexistent-id", "spec-3"], specialty_category_id: "cat-1" },
      categories,
    );
    expect(result.specialtyNames).toEqual(["Frontend", "Fullstack"]);
  });

  it("returns empty for nonexistent category", () => {
    const result = getSpecialtyDisplay(
      { specialty_ids: ["spec-1"], specialty_category_id: "nonexistent-cat" },
      categories,
    );
    expect(result.categoryName).toBeNull();
    expect(result.specialtyNames).toEqual([]);
  });
});
