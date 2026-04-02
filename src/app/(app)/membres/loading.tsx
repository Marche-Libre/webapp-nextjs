import { Skeleton } from "@/components/ui/skeleton";

export default function MembresLoading() {
  return (
    <div className="space-y-[16px]">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-[8px] flex-wrap">
        <Skeleton className="h-[36px] w-[120px] rounded-lg" />
        <Skeleton className="h-[36px] w-[100px] rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-[12px] w-[80px]" />
        <Skeleton className="h-[32px] w-[90px] rounded-lg" />
        <Skeleton className="h-[32px] w-[70px] rounded-lg" />
      </div>

      {/* Member list skeleton */}
      <div className="space-y-[4px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-[14px] px-[14px] py-[12px] rounded-xl"
          >
            <Skeleton className="h-[40px] w-[40px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-[6px]">
              <Skeleton className="h-[14px] w-[160px]" />
              <Skeleton className="h-[12px] w-[100px]" />
            </div>
            <Skeleton className="h-[32px] w-[90px] rounded-lg hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
