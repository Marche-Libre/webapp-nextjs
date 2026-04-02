import { Skeleton } from "@/components/ui/skeleton";

export default function MemberProfileLoading() {
  return (
    <div className="space-y-[24px]">
      {/* Profile header */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] shadow-card">
        <div className="flex items-start gap-[16px]">
          <Skeleton className="h-[64px] w-[64px] rounded-xl shrink-0" />
          <div className="flex-1 space-y-[8px]">
            <Skeleton className="h-[20px] w-[160px]" />
            <Skeleton className="h-[14px] w-[100px]" />
            <div className="flex gap-[8px] mt-[4px]">
              <Skeleton className="h-[24px] w-[80px] rounded-md" />
              <Skeleton className="h-[24px] w-[100px] rounded-md" />
            </div>
          </div>
          <div className="flex gap-[6px]">
            <Skeleton className="h-[36px] w-[120px] rounded-lg" />
            <Skeleton className="h-[36px] w-[36px] rounded-lg" />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-[16px] pt-[16px] border-t border-border-subtle space-y-[8px]">
          <Skeleton className="h-[14px] w-full" />
          <Skeleton className="h-[14px] w-3/4" />
        </div>
      </div>

      {/* Recent posts */}
      <div className="space-y-[8px]">
        <Skeleton className="h-[16px] w-[140px]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
