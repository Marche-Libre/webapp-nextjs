import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-[24px]">
      <div>
        <Skeleton className="h-[28px] w-[280px] mb-[6px]" />
        <Skeleton className="h-[16px] w-[220px]" />
      </div>

      {/* Pending users card */}
      <div className="bg-bg-base rounded-xl border border-border-default shadow-card p-[20px]">
        <Skeleton className="h-[20px] w-[200px] mb-[16px]" />
        <div className="space-y-[12px]">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-[16px] p-[16px] rounded-lg border border-border-default">
              <Skeleton className="h-[48px] w-[48px] rounded-xl shrink-0" />
              <div className="flex-1 space-y-[6px]">
                <Skeleton className="h-[16px] w-[140px]" />
                <Skeleton className="h-[12px] w-[100px]" />
                <Skeleton className="h-[12px] w-[180px]" />
              </div>
              <Skeleton className="h-[36px] w-[120px] rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* All users table */}
      <div className="bg-bg-base rounded-xl border border-border-default shadow-card p-[20px]">
        <Skeleton className="h-[20px] w-[180px] mb-[16px]" />
        <div className="space-y-[12px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-[12px] py-[12px] border-b border-border-default">
              <Skeleton className="h-[32px] w-[32px] rounded-xl shrink-0" />
              <Skeleton className="h-[14px] w-[120px] flex-1" />
              <Skeleton className="h-[14px] w-[80px] hidden sm:block" />
              <Skeleton className="h-[24px] w-[60px] rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
