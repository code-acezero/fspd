import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Lightweight, reusable skeleton blocks for page sections. Use these while
 * data loads so users see structure immediately instead of a blank flash.
 */
export const SectionSkeleton = ({
  className,
  rows = 3,
  withTitle = true,
}: {
  className?: string;
  rows?: number;
  withTitle?: boolean;
}) => (
  <div className={cn("space-y-3 py-8", className)}>
    {withTitle && <Skeleton className="h-8 w-1/3 rounded-full" />}
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full rounded-full" />
    ))}
  </div>
);

/** Grid of card skeletons (members, posts, courses, events). */
export const CardGridSkeleton = ({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 p-4 rounded-3xl border border-border bg-card">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-5 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>
    ))}
  </div>
);

/** Hero banner skeleton — tall, single block. */
export const HeroSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4 py-12", className)}>
    <Skeleton className="h-12 w-2/3 rounded-full mx-auto" />
    <Skeleton className="h-6 w-1/2 rounded-full mx-auto" />
    <Skeleton className="h-64 w-full rounded-3xl mt-6" />
  </div>
);
