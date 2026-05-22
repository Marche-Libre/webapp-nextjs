import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ApproveRejectButtons } from "@/components/admin/approve-reject-buttons";
import { formatDate } from "@/lib/utils";

type AdmissionFilter =
  | "all"
  | "todo"
  | "waiting_sponsor"
  | "sponsor_rejected"
  | "approved"
  | "rejected"
  | "admins";

type SponsorSummary = {
  x_handle: string | null;
  full_name: string | null;
};

type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  x_handle: string | null;
  avatar_url: string | null;
  status: "pending" | "approved" | "rejected";
  onboarding_completed: boolean | null;
  is_admin: boolean | null;
  sponsored_by: string | null;
  sponsor_approved: boolean | null;
  created_at: string;
  sponsor?: SponsorSummary | SponsorSummary[] | null;
};

type SponsorshipRequestSummary = {
  id: string;
  requester_id: string;
  sponsor_handle: string;
  sponsor_id: string | null;
  status: "pending" | "approved" | "rejected";
  attempt_number: number;
  created_at: string;
  sponsor?: SponsorSummary | SponsorSummary[] | null;
};

const FILTERS: { value: AdmissionFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "todo", label: "A traiter" },
  { value: "waiting_sponsor", label: "Attente parrain" },
  { value: "sponsor_rejected", label: "Parrainage refuse" },
  { value: "approved", label: "Approuves" },
  { value: "rejected", label: "Refuses" },
  { value: "admins", label: "Admins" },
];

const FILTER_VALUES = new Set(FILTERS.map((filter) => filter.value));

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function parseFilter(value: string | string[] | undefined): AdmissionFilter {
  const filter = Array.isArray(value) ? value[0] : value;

  if (filter && FILTER_VALUES.has(filter as AdmissionFilter)) {
    return filter as AdmissionFilter;
  }

  return "all";
}

function getSponsorshipState(
  profile: AdminProfile,
  latestRequest: SponsorshipRequestSummary | null,
) {
  if (profile.sponsor_approved === true && profile.sponsored_by) {
    return {
      label: "Confirmée",
      variant: "success" as const,
      key: "confirmed",
    };
  }

  if (latestRequest?.status === "pending") {
    return {
      label: "Demandée",
      variant: "warning" as const,
      key: "pending",
    };
  }

  if (latestRequest?.status === "rejected") {
    return {
      label: "Refusée",
      variant: "error" as const,
      key: "rejected",
    };
  }

  return {
    label: "Absent",
    variant: "default" as const,
    key: "absent",
  };
}

function canApproveProfile(profile: AdminProfile) {
  return Boolean(profile.sponsored_by && profile.sponsor_approved === true);
}

function shouldIncludeProfile(
  profile: AdminProfile,
  latestRequest: SponsorshipRequestSummary | null,
  activeFilter: AdmissionFilter,
) {
  const sponsorshipState = getSponsorshipState(profile, latestRequest);

  if (activeFilter === "todo") {
    return profile.status === "pending" && canApproveProfile(profile);
  }

  if (activeFilter === "waiting_sponsor") {
    return profile.status === "pending" && sponsorshipState.key === "pending";
  }

  if (activeFilter === "sponsor_rejected") {
    return sponsorshipState.key === "rejected";
  }

  if (activeFilter === "approved") {
    return profile.status === "approved";
  }

  if (activeFilter === "rejected") {
    return profile.status === "rejected";
  }

  if (activeFilter === "admins") {
    return profile.is_admin === true;
  }

  return true;
}

function getStatusBadgeVariant(status: AdminProfile["status"]) {
  if (status === "approved") return "success" as const;
  if (status === "rejected") return "error" as const;
  return "warning" as const;
}

function getStatusLabel(status: AdminProfile["status"]) {
  if (status === "approved") return "Approuvé";
  if (status === "rejected") return "Refusé";
  return "En attente";
}

function getSponsorLabel(
  profile: AdminProfile,
  latestRequest: SponsorshipRequestSummary | null,
) {
  const confirmedSponsor = firstRelation(profile.sponsor);

  if (confirmedSponsor?.x_handle) {
    return `@${confirmedSponsor.x_handle}`;
  }

  if (latestRequest?.sponsor_handle) {
    return `@${latestRequest.sponsor_handle}`;
  }

  return "Aucun";
}

function getLatestRequestLabel(request: SponsorshipRequestSummary | null) {
  if (!request) return "Aucune";

  return `@${request.sponsor_handle} - tentative ${request.attempt_number} - ${formatDate(request.created_at)}`;
}

type AdminUserRowProps = {
  profile: AdminProfile;
  latestRequest: SponsorshipRequestSummary | null;
};

function AdminUserRow({ profile, latestRequest }: AdminUserRowProps) {
  const sponsorshipState = getSponsorshipState(profile, latestRequest);
  const canApprove = canApproveProfile(profile);
  const blockedReason = canApprove
    ? ""
    : "Bloqué : parrainage manquant";
  const sponsorLabel = getSponsorLabel(profile, latestRequest);
  const latestRequestLabel = getLatestRequestLabel(latestRequest);
  const avatarName = profile.x_handle ?? profile.full_name ?? profile.email ?? "Utilisateur";

  return (
    <tr className="border-b border-border-default align-top last:border-0">
      <td className="py-[14px] pr-[16px]">
        <div className="flex min-w-[220px] items-center gap-[12px]">
          <Avatar src={profile.avatar_url} name={avatarName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              @{profile.x_handle ?? "handle-manquant"}
            </p>
            <p className="truncate text-xs text-text-muted">
              {profile.full_name || "Nom non renseigné"}
            </p>
            <p className="truncate text-xs text-text-muted">
              {profile.email || "Email non renseigné"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-[14px] pr-[16px]">
        <Badge variant={getStatusBadgeVariant(profile.status)}>
          {getStatusLabel(profile.status)}
        </Badge>
      </td>
      <td className="py-[14px] pr-[16px] text-xs text-text-muted">
        {profile.onboarding_completed ? "Complet" : "Incomplet"}
      </td>
      <td className="py-[14px] pr-[16px] text-xs text-text-muted">
        {profile.is_admin ? "Oui" : "Non"}
      </td>
      <td className="py-[14px] pr-[16px] text-xs text-text-muted">
        {sponsorLabel}
      </td>
      <td className="py-[14px] pr-[16px]">
        <Badge variant={sponsorshipState.variant}>
          {sponsorshipState.label}
        </Badge>
      </td>
      <td className="max-w-[260px] py-[14px] pr-[16px] text-xs text-text-muted">
        {latestRequestLabel}
      </td>
      <td className="py-[14px]">
        <ApproveRejectButtons
          userId={profile.id}
          currentStatus={profile.status}
          compact
          canApprove={canApprove}
          blockedReason={blockedReason}
        />
      </td>
    </tr>
  );
}

type UsersPageProps = {
  searchParams: Promise<{ filter?: string | string[] | undefined }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const supabase = await createClient();
  const query = await searchParams;
  const activeFilter = parseFilter(query.filter);

  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("*, sponsor:profiles!sponsored_by(x_handle, full_name)")
    .order("created_at", { ascending: false });

  const { data: requestsRaw } = await supabase
    .from("sponsorship_requests")
    .select("id, requester_id, sponsor_handle, sponsor_id, status, attempt_number, created_at, sponsor:profiles!sponsor_id(x_handle, full_name)")
    .order("created_at", { ascending: false });

  const latestRequestByRequester = new Map<string, SponsorshipRequestSummary>();
  const sponsorshipRequests = (requestsRaw ?? []) as SponsorshipRequestSummary[];

  for (const request of sponsorshipRequests) {
    if (!latestRequestByRequester.has(request.requester_id)) {
      latestRequestByRequester.set(request.requester_id, request);
    }
  }

  const profiles = ((profilesRaw ?? []) as AdminProfile[]).filter((profile) =>
    shouldIncludeProfile(
      profile,
      latestRequestByRequester.get(profile.id) ?? null,
      activeFilter,
    ),
  );

  const filterLinks = FILTERS.map((filter) => {
    const isActive = filter.value === activeFilter;
    const href = filter.value === "all" ? "/admin/users" : `/admin/users?filter=${filter.value}`;
    const className = isActive
      ? "rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700"
      : "rounded-md px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-bg-elevated";

    return (
      <Link key={filter.value} href={href} className={className}>
        {filter.label}
      </Link>
    );
  });

  const rows = profiles.map((profile) => (
    <AdminUserRow
      key={profile.id}
      profile={profile}
      latestRequest={latestRequestByRequester.get(profile.id) ?? null}
    />
  ));

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Gestion des utilisateurs
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Admission finale après parrainage confirmé
        </p>
      </div>

      <div className="flex flex-wrap gap-2">{filterLinks}</div>

      <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-elevated/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-default text-xs text-text-muted">
              <th className="px-[16px] py-[12px] font-medium">Utilisateur</th>
              <th className="py-[12px] pr-[16px] font-medium">Admission</th>
              <th className="py-[12px] pr-[16px] font-medium">Onboarding</th>
              <th className="py-[12px] pr-[16px] font-medium">Admin</th>
              <th className="py-[12px] pr-[16px] font-medium">Parrain</th>
              <th className="py-[12px] pr-[16px] font-medium">Parrainage</th>
              <th className="py-[12px] pr-[16px] font-medium">Dernière demande</th>
              <th className="py-[12px] pr-[16px] font-medium">Action</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      {profiles.length === 0 ? (
        <p className="text-sm text-text-muted">Aucun profil pour ce filtre.</p>
      ) : null}
    </div>
  );
}
