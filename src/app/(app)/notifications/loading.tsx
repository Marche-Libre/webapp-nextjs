import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="bg-bg-base rounded-xl shadow-card overflow-hidden">
      {/* Tabs skeleton */}
      <div className="flex border-b border-border-default bg-bg-elevated/50">
        <Skeleton className="h-[44px] w-[100px] mx-[12px]" />
        <Skeleton className="h-[44px] w-[80px] mx-[12px]" />
      </div>

      <div className="p-[24px] space-y-[8px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-[16px] rounded-lg border border-border-default"
          >
            <div className="flex items-start gap-[12px]">
              <Skeleton className="h-[24px] w-[24px] rounded shrink-0" />
              <div className="flex-1 space-y-[6px]">
                <Skeleton className="h-[14px] w-3/4" />
                <Skeleton className="h-[12px] w-1/2" />
                <Skeleton className="h-[11px] w-[120px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
