type PageSkeletonProps = {
  blocks?: number; // number of list items
  hasHero?: boolean;
};

export default function PageSkeleton({ 
  blocks = 3, 
  hasHero = true 
}: PageSkeletonProps) {
  return (
    <>
      <main className="container py-8">
        <div className="mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {hasHero && (
              <div className="bg-card rounded-xl border p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-muted rounded mb-4" />
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-5/6 bg-muted rounded mb-2" />
                <div className="h-4 w-4/5 bg-muted rounded" />
              </div>
            )}

            <div className="space-y-4">
              {[...Array(blocks)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}