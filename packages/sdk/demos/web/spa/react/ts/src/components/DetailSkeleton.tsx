import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DetailSkeletonProps {
  title?: boolean;
  cardCount?: number;
  rowsPerCard?: number;
}

export function DetailSkeleton({
  title = true,
  cardCount = 4,
  rowsPerCard = 4,
}: DetailSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {title && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: cardCount }).map((_, cardIndex) => (
          <Card key={cardIndex} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-40 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: rowsPerCard }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className={`h-4 ${rowIndex % 2 === 0 ? 'w-20' : 'w-28'}`} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
