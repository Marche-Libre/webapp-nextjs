"use client";

import { useState } from "react";
import { Pencil, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types/database";

interface ProfileEditFormProps {
  profile: Profile;
  section: "personal" | "specialty" | "bio" | "links";
}

export function ProfileEditForm({ profile, section }: ProfileEditFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkEntries, setLinkEntries] = useState<[string, string][]>(() => {
    const links = (profile.links as Record<string, string> | null) || {};
    const entries = Object.entries(links);
    return entries.length > 0 ? entries : [["", ""]];
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    let updates: Record<string, unknown> = {};

    if (section === "personal") {
      updates = {
        full_name: formData.get("full_name") as string,
        phone: (formData.get("phone") as string) || null,
      };
    } else if (section === "specialty") {
      updates = {
        specialty: (formData.get("specialty") as string) || null,
        location: (formData.get("location") as string) || null,
      };
    } else if (section === "bio") {
      updates = {
        bio: (formData.get("bio") as string) || null,
      };
    } else if (section === "links") {
      const linksObj: Record<string, string> = {};
      for (const [label, url] of linkEntries) {
        if (label.trim() && url.trim()) {
          linksObj[label.trim()] = url.trim();
        }
      }
      updates = { links: linksObj };
    }

    await supabase.from("profiles").update(updates).eq("id", profile.id);

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Modifier
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-[16px]">
      <div className="bg-bg-elevated rounded-xl border border-border-default p-[24px] w-full max-w-md shadow-modal">
        <div className="flex items-center justify-between mb-[20px]">
          <h3 className="font-display font-semibold text-text-primary tracking-[-0.02em]">
            {section === "personal" && "Informations personnelles"}
            {section === "specialty" && "Spécialité et localisation"}
            {section === "bio" && "Biographie"}
            {section === "links" && "Liens"}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-bg-surface text-text-muted cursor-pointer transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          {section === "personal" && (
            <>
              <Input
                id="full_name"
                name="full_name"
                label="Nom complet"
                defaultValue={profile.full_name}
              />
              <Input
                id="phone"
                name="phone"
                label="Téléphone"
                defaultValue={profile.phone || ""}
                placeholder="+33 6 12 34 56 78"
              />
            </>
          )}

          {section === "specialty" && (
            <>
              <Input
                id="specialty"
                name="specialty"
                label="Spécialité"
                defaultValue={profile.specialty || ""}
                placeholder="ex : Développeur Web, Avocat, Architecte"
              />
              <Input
                id="location"
                name="location"
                label="Localisation"
                defaultValue={profile.location || ""}
                placeholder="ex : Paris, Lyon, Bordeaux"
              />
            </>
          )}

          {section === "bio" && (
            <Textarea
              id="bio"
              name="bio"
              label="Biographie"
              defaultValue={profile.bio || ""}
              placeholder="Présentez-vous en quelques mots : votre parcours, votre expertise..."
              rows={6}
            />
          )}

          {section === "links" && (
            <div className="space-y-[8px]">
              {linkEntries.map(([label, url], i) => (
                <div key={i} className="flex gap-[8px] items-start">
                  <Input
                    id={`link_label_${i}`}
                    placeholder="Label"
                    value={label}
                    onChange={(e) => {
                      const next = [...linkEntries];
                      next[i] = [e.target.value, next[i][1]];
                      setLinkEntries(next as [string, string][]);
                    }}
                    className="w-[100px]"
                  />
                  <Input
                    id={`link_url_${i}`}
                    placeholder="https://…"
                    value={url}
                    onChange={(e) => {
                      const next = [...linkEntries];
                      next[i] = [next[i][0], e.target.value];
                      setLinkEntries(next as [string, string][]);
                    }}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLinkEntries(linkEntries.filter((_, j) => j !== i));
                    }}
                    className="p-2 rounded-md hover:bg-error-bg text-text-muted hover:text-error cursor-pointer mt-[24px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLinkEntries([...linkEntries, ["", ""]])}
                className="flex items-center gap-[6px] text-[12px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Ajouter un lien
              </button>
            </div>
          )}

          <div className="flex justify-end gap-[8px] pt-[8px]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
