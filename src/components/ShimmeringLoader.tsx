import { useSynchronizedAnimation } from '@/hooks/ui/useSynchronizedAnimation';
import { cn } from '@/lib/utils';

export interface ShimmeringLoader {
  className?: string;
  delayIndex?: number;
  animationDelay?: number;
}

export const ShimmeringLoader = ({ className, delayIndex = 0, animationDelay = 150 }: ShimmeringLoader) => {
  const ref = useSynchronizedAnimation<HTMLDivElement>('shimmer');

  return (
    <div
      ref={ref}
      className={cn('shimmering-loader rounded py-3', className)}
      style={{
        animationFillMode: 'backwards',
        animationDelay: `${delayIndex * animationDelay}ms`
      }}
    />
  );
};

export const GenericSkeletonLoader = () => (
  <div className="space-y-2">
    <ShimmeringLoader />
    <ShimmeringLoader className="w-3/4" delayIndex={1} />
    <ShimmeringLoader className="w-1/2" delayIndex={2} />
  </div>
);
