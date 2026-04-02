import { Skeleton } from "@/components/ui/skeleton";

export default function ParametresLoading() {
  return (
    <div className="space-y-[24px]">
      {/* Theme */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] space-y-[12px]">
        <Skeleton className="h-[16px] w-[100px]" />
        <div className="flex gap-[12px]">
          <Skeleton className="h-[80px] w-[120px] rounded-xl" />
          <Skeleton className="h-[80px] w-[120px] rounded-xl" />
        </div>
      </div>

      {/* Privacy toggles */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] space-y-[16px]">
        <Skeleton className="h-[16px] w-[160px]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-[14px] w-[140px]" />
            <Skeleton className="h-[20px] w-[40px] rounded-full" />
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] space-y-[12px]">
        <Skeleton className="h-[16px] w-[120px]" />
        <Skeleton className="h-[40px] w-[160px] rounded-lg" />
      </div>
    </div>
  );
}
