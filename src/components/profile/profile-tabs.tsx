"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { AtSign, Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react";
import type { Profile } from "@/lib/types/database";

interface ProfileTabsProps {
  profile: Profile;
}

const tabs = [
  { label: "Informations", value: "personal" },
  { label: "Spécialité", value: "specialty" },
  { label: "Liens", value: "links" },
  { label: "Bio", value: "bio" },
];

function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-[4px]">{label}</p>
      <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
        {icon && <span className="text-text-muted">{icon}</span>}
        {value}
      </p>
    </div>
  );
}

export function ProfileTabs({ profile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("personal");

  const links = (profile.links as Record<string, string> | null) || {};

  return (
    <div className="bg-bg-base rounded-xl shadow-card overflow-hidden">
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="rounded-t-xl" />

      <div className="p-[24px]">
        {activeTab === "personal" && (
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                Informations personnelles
              </h3>
              <ProfileEditForm profile={profile} section="personal" />
            </div>
            <div className="grid sm:grid-cols-2 gap-[24px]">
              <InfoField
                label="Identifiant X"
                value={`@${profile.x_handle}`}
                icon={<AtSign className="h-3.5 w-3.5" />}
              />
              <InfoField label="Nom complet" value={profile.full_name || "Non renseigné"} />
              <InfoField
                label="Adresse e-mail"
                value={profile.email}
                icon={<Mail className="h-3.5 w-3.5" />}
              />
              <InfoField
                label="Téléphone"
                value={profile.phone || "Non renseigné"}
                icon={<Phone className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        )}

        {activeTab === "specialty" && (
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                Spécialité et localisation
              </h3>
              <ProfileEditForm profile={profile} section="specialty" />
            </div>
            <div className="grid sm:grid-cols-2 gap-[24px]">
              <InfoField
                label="Spécialité"
                value={profile.specialty || "Non renseigné"}
              />
              <InfoField
                label="Localisation"
                value={profile.location || "Non renseigné"}
                icon={<MapPin className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <div className="flex items-center gap-[8px]">
                <LinkIcon className="h-[18px] w-[18px] text-text-muted" />
                <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                  Liens
                </h3>
              </div>
              <ProfileEditForm profile={profile} section="links" />
            </div>
            {Object.keys(links).length > 0 ? (
              <div className="space-y-[8px]">
                {Object.entries(links).map(([label, url]) => (
                  <div key={label} className="flex items-center gap-[8px]">
                    <span className="text-[12px] font-medium text-text-muted uppercase w-[80px]">{label}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-primary-600 hover:underline truncate"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Aucun lien renseigné.</p>
            )}
          </div>
        )}

        {activeTab === "bio" && (
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                Bio
              </h3>
              <ProfileEditForm profile={profile} section="bio" />
            </div>
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
              {profile.bio || "Aucune biographie renseignée."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
