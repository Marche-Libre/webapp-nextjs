import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types/database";
import { UserHoverCard } from "./user-hover-card";

interface MemberListProps {
  members: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">[];
}

type MemberListMember = MemberListProps["members"][number];

function renderMember(member: MemberListMember) {
  return (
    <UserHoverCard
      key={member.id}
      authorId={member.id}
      x_handle={member.x_handle}
      full_name={member.full_name}
      avatar_url={member.avatar_url}
      className="w-full"
    >
      <div className="flex w-full cursor-pointer items-center gap-[8px] rounded-full px-[10px] py-[8px] transition-colors hover:bg-bg-surface">
        <Avatar src={member.avatar_url} name={member.full_name || member.x_handle} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-text-primary truncate">
            @{member.x_handle}
          </p>
        </div>
      </div>
    </UserHoverCard>
  );
}

export function MemberList({ members }: MemberListProps) {
  const memberItems = members.map(renderMember);

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-[56px] shrink-0 items-center border-b border-border-subtle px-[18px]">
        <h2 className="font-display text-[16px] font-semibold text-text-primary">
          Membres — {members.length}
        </h2>
      </div>
      <div className="flex-1 space-y-[3px] overflow-y-auto px-[10px] py-[10px]">
        {memberItems}
      </div>
    </div>
  );
}
