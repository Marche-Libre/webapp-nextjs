import { Skeleton } from "@/components/ui/skeleton";

export default function ForumLoading() {
  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-end">
        <Skeleton className="h-[40px] w-[140px] rounded-lg" />
      </div>

      {/* Recent posts skeleton */}
      <section>
        <Skeleton className="h-[20px] w-[180px] mb-[12px]" />
        <div className="space-y-[8px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-[14px] p-[16px] rounded-xl border border-border-default bg-bg-base"
            >
              <Skeleton className="h-[40px] w-[40px] rounded-xl shrink-0" />
              <div className="flex-1 space-y-[8px]">
                <Skeleton className="h-[16px] w-3/4" />
                <Skeleton className="h-[14px] w-full" />
                <Skeleton className="h-[12px] w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories skeleton */}
      <section>
        <Skeleton className="h-[20px] w-[120px] mb-[12px]" />
        <div className="grid sm:grid-cols-2 gap-[12px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
