import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-[24px]">
      {/* Heading */}
      <div>
        <Skeleton className="h-[28px] w-[240px] mb-[6px]" />
        <Skeleton className="h-[16px] w-[160px]" />
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-base rounded-xl border border-border-default p-[20px] shadow-card"
          >
            <div className="flex items-center gap-[16px]">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="space-y-[6px]">
                <Skeleton className="h-[28px] w-[60px]" />
                <Skeleton className="h-[14px] w-[120px]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-bg-base rounded-xl border border-border-default shadow-card p-[20px]">
        <Skeleton className="h-[20px] w-[200px] mb-[16px]" />
        <div className="space-y-[4px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-[12px]">
              <div className="space-y-[6px]">
                <Skeleton className="h-[14px] w-[200px]" />
                <Skeleton className="h-[12px] w-[140px]" />
              </div>
              <Skeleton className="h-[24px] w-[60px] rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
