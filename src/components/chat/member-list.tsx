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
    >-
      <div className="flex w-full items-center gap-[8px] px-[8px] py-[6px] rounded-md cursor-pointer transition-colors hover:bg-bg-surface">
        <Avatar src={member.avatar_url} name={member.full_name || member.x_handle} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-text-primary truncate">
            @{member.x_handle} oudou
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
      <div className="flex items-center px-[20px] h-[64px] border-b border-border-subtle shrink-0">
        <h2 className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
          Membres — {members.length}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-[8px] py-[8px] space-y-[2px]">
        {memberItems}
      </div>
    </div>
  );
}
