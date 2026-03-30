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

const contractTypes = [
  { value: "freelance", label: "Freelance" },
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "mission", label: "Mission ponctuelle" },
  { value: "stage", label: "Stage" },
];

export default function NouvelleOffrePage() {
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

    const { error: insertError } = await supabase
      .from("offres_emploi")
      .insert({
        author_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        company_name: (formData.get("company_name") as string) || null,
        contract_type: (formData.get("contract_type") as string) || null,
        location: (formData.get("location") as string) || null,
        salary_range: (formData.get("salary_range") as string) || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/offres");
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-[24px]">
      <div className="flex items-center gap-[12px]">
        <Link
          href="/offres"
          className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
            Nouvelle offre d&apos;emploi
          </h1>
          <p className="text-sm text-text-secondary mt-[4px]">
            Décrivez le poste et les conditions pour attirer les bons profils
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
            label="Intitulé du poste"
            placeholder="ex : Développeur Full-Stack React / Node.js"
            required
          />
          <Input
            id="company_name"
            name="company_name"
            label="Entreprise ou cabinet"
            placeholder="ex : Cabinet Dupont & Associés"
          />
          <Textarea
            id="description"
            name="description"
            label="Description du poste"
            placeholder="Décrivez les responsabilités, le contexte, les compétences attendues…"
            rows={8}
            required
          />
          <div className="grid sm:grid-cols-2 gap-[16px]">
            <Select
              id="contract_type"
              name="contract_type"
              label="Type de contrat"
              options={contractTypes}
              placeholder="Sélectionnez"
              defaultValue=""
            />
            <Input
              id="location"
              name="location"
              label="Localisation"
              placeholder="ex : Paris, Remote, Hybride"
            />
          </div>
          <Input
            id="salary_range"
            name="salary_range"
            label="Rémunération indicative"
            placeholder="ex : 45k–55k €/an, 400–500 €/jour"
          />
          <div className="flex justify-end gap-[8px] pt-[8px]">
            <Link href="/offres">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Publication…" : "Publier l\u2019offre"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
