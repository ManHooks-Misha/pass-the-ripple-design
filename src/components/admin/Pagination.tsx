import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  loading
}: PaginationProps) {
  if (lastPage <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const delta = 2; // how many pages to show on each side of current
    const range = [];

    // Always include first page
    range.push(1);

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(lastPage - 1, currentPage + delta);

    if (left > 2) {
      range.push('ellipsis');
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < lastPage - 1) {
      range.push('ellipsis');
    }

    // Always include last page (if not already included)
    if (lastPage !== 1) {
      range.push(lastPage);
    }

    // Deduplicate while preserving order
    return Array.from(new Set(range));
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="text-muted-foreground px-1">
                ...
              </span>
            ) : (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={loading}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="w-9 h-9 p-0"
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage || loading}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * perPage) + 1} to{' '}
          {Math.min(currentPage * perPage, total)} of {total} results
        </span>
      </div>
    </div>
  );
}