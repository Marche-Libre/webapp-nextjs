import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilLoading() {
  return (
    <div className="space-y-[24px]">
      {/* Profile header card */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[16px]">
          <Skeleton className="h-[72px] w-[72px] rounded-xl shrink-0" />
          <div className="flex-1 space-y-[8px]">
            <Skeleton className="h-[20px] w-[180px]" />
            <Skeleton className="h-[14px] w-[120px]" />
            <Skeleton className="h-[12px] w-[200px]" />
          </div>
          <Skeleton className="h-[36px] w-[100px] rounded-lg" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-[8px]">
        <Skeleton className="h-[36px] w-[80px] rounded-lg" />
        <Skeleton className="h-[36px] w-[80px] rounded-lg" />
        <Skeleton className="h-[36px] w-[100px] rounded-lg" />
      </div>

      {/* Content */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] space-y-[16px]">
        <Skeleton className="h-[14px] w-full" />
        <Skeleton className="h-[14px] w-3/4" />
        <Skeleton className="h-[14px] w-1/2" />
      </div>
    </div>
  );
}
