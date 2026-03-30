"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "service", label: "Proposition de service" },
  { value: "recherche", label: "Recherche" },
  { value: "collaboration", label: "Collaboration" },
  { value: "autre", label: "Autre" },
];

export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: insertError } = await supabase.from("annonces").insert({
      author_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: (formData.get("category") as string) || null,
      location: (formData.get("location") as string) || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/annonces");
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-[24px]">
      <div className="flex items-center gap-[12px]">
        <Link
          href="/annonces"
          className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
            Nouvelle annonce
          </h1>
          <p className="text-sm text-text-secondary mt-[4px]">
            Rédigez et publiez votre annonce au réseau
          </p>
        </div>
      </div>

      <Card className="shadow-card">
        {error && (
          <div className="mb-[16px] p-[12px] rounded-lg bg-error-bg border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <Input
            id="title"
            name="title"
            label="Titre de l'annonce"
            placeholder="ex : Recherche développeur React pour mission 3 mois"
            required
          />
          <Textarea
            id="description"
            name="description"
            label="Description détaillée"
            placeholder="Décrivez votre annonce : contexte, besoins, conditions…"
            rows={6}
            required
          />
          <div className="grid sm:grid-cols-2 gap-[16px]">
            <Select
              id="category"
              name="category"
              label="Catégorie"
              options={categories}
              placeholder="Sélectionnez une catégorie"
              defaultValue=""
            />
            <Input
              id="location"
              name="location"
              label="Localisation"
              placeholder="ex : Paris, Remote, Lyon"
            />
          </div>
          <div className="flex justify-end gap-[8px] pt-[8px]">
            <Link href="/annonces">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Publication…" : "Publier l\u2019annonce"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
