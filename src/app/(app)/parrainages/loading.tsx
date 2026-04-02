import { Skeleton } from "@/components/ui/skeleton";

export default function ParrainagesLoading() {
  return (
    <div className="space-y-[24px]">
      <div className="bg-bg-base rounded-xl shadow-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border-subtle">
          <Skeleton className="h-[44px] w-[120px] m-[4px] rounded-lg" />
          <Skeleton className="h-[44px] w-[140px] m-[4px] rounded-lg" />
          <Skeleton className="h-[44px] w-[100px] m-[4px] rounded-lg" />
        </div>

        <div className="p-[24px] space-y-[16px]">
          {/* Referral link */}
          <Skeleton className="h-[120px] w-full rounded-xl" />

          {/* Invite form */}
          <div className="flex items-start gap-[16px]">
            <Skeleton className="h-[48px] w-[48px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-[8px]">
              <Skeleton className="h-[16px] w-[200px]" />
              <Skeleton className="h-[12px] w-[300px]" />
            </div>
          </div>
          <Skeleton className="h-[44px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
