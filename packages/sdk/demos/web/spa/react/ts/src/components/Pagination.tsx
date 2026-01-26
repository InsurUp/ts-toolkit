import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  totalCount?: number | null;
  pageSize?: number;
  currentPage?: number;
}

export function Pagination({
  hasNextPage,
  hasPreviousPage,
  onNext,
  onPrevious,
  isLoading = false,
  totalCount,
  pageSize = 10,
  currentPage = 1,
}: PaginationProps) {
  const hasTotal = totalCount != null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = hasTotal ? Math.min(currentPage * pageSize, totalCount) : currentPage * pageSize;
  const totalPages = hasTotal ? Math.ceil(totalCount / pageSize) : null;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        {hasTotal
          ? `Showing ${start}-${end} of ${totalCount.toLocaleString()} items`
          : `Page ${currentPage}`}
        {totalPages && ` (Page ${currentPage} of ${totalPages})`}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
