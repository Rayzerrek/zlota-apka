import { SkeletonLine } from "@cloudflare/kumo";

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-none">
      <div className="flex items-end justify-between gap-4 mb-9 pb-4 border-b border-rule">
        <div className="flex flex-col gap-3 w-full">
          <SkeletonLine minWidth={40} maxWidth={60} blockHeight="0.75rem" />
          <SkeletonLine minWidth={55} maxWidth={80} blockHeight="2.5rem" />
        </div>
        <SkeletonLine
          minWidth={60}
          maxWidth={80}
          blockHeight="1rem"
          className="shrink-0"
        />
      </div>

      <div className="flex flex-col gap-3">
        <SkeletonLine minWidth={70} maxWidth={95} blockHeight="1rem" />
        <SkeletonLine minWidth={50} maxWidth={80} blockHeight="1rem" />
        <SkeletonLine minWidth={60} maxWidth={90} blockHeight="1rem" />
      </div>

      <div className="mt-8 grid grid-cols-7 gap-2">
        {["sk-d0", "sk-d1", "sk-d2", "sk-d3", "sk-d4", "sk-d5", "sk-d6"].map(
          (id) => (
            <SkeletonLine
              key={id}
              minWidth={100}
              maxWidth={100}
              blockHeight="6rem"
            />
          ),
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {["sk-s0", "sk-s1", "sk-s2", "sk-s3"].map((id) => (
          <SkeletonLine
            key={id}
            minWidth={60}
            maxWidth={100}
            blockHeight="3.5rem"
          />
        ))}
      </div>
    </div>
  );
}
