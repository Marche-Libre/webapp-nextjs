"use client";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { AtSign, Mail, Phone, Link as LinkIcon, Globe } from "lucide-react";
import type { Profile } from "@/lib/types/database";

interface ProfileTabsProps {
  profile: Profile;
}

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
  const links = (profile.links as Record<string, string> | null) || {};

  return (
    <div className="space-y-[16px]">
      {/* Coordonnées */}
      <div className="bg-bg-base rounded-xl shadow-card p-[24px]">
        <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em] mb-[16px]">
          Coordonnées
        </h3>
        <div className="grid sm:grid-cols-2 gap-[24px]">
          {profile.first_name && (
            <InfoField
              label="Prénom"
              value={profile.first_name}
            />
          )}
          {profile.last_name && (
            <InfoField
              label="Nom"
              value={profile.last_name}
            />
          )}
          <InfoField
            label="Identifiant X"
            value={`@${profile.x_handle}`}
            icon={<AtSign className="h-3.5 w-3.5" />}
          />
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
          {profile.website && (
            <div>
              <p className="text-xs text-text-muted mb-[4px]">Site web</p>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary-500 hover:underline flex items-center gap-1.5"
              >
                <span className="text-text-muted"><Globe className="h-3.5 w-3.5" /></span>
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Liens */}
      <div className="bg-bg-base rounded-xl shadow-card p-[24px]">
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
    </div>
  );
}
