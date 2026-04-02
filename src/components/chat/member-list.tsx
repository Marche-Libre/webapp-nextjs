import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types/database";

interface MemberListProps {
  members: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-[20px] h-[64px] border-b border-border-subtle shrink-0">
        <h2 className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
          Membres — {members.length}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-[8px] py-[8px] space-y-[2px]">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-md"
          >
            <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-text-primary truncate">
                @{member.x_handle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
