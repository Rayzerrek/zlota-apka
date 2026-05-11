import { SkeletonLine } from "@cloudflare/kumo/components/loader";

export function TodayHeroSkeleton() {
  return (
    <div className="rounded-sm border border-rule bg-paper p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <SkeletonLine minWidth={20} maxWidth={28} blockHeight="0.75rem" />
        <SkeletonLine minWidth={70} maxWidth={92} blockHeight="2.25rem" />
        <SkeletonLine minWidth={80} maxWidth={100} blockHeight="0.875rem" />
        <SkeletonLine minWidth={50} maxWidth={70} blockHeight="0.875rem" />
        <div className="mt-3 flex gap-2.5">
          <SkeletonLine minWidth={32} maxWidth={42} blockHeight="3rem" />
          <SkeletonLine minWidth={28} maxWidth={36} blockHeight="3rem" />
        </div>
      </div>
    </div>
  );
}
