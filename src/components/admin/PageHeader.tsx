import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}
 
function PageHeader({ title, description, onRefresh, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span>Refresh</span>
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

export { PageHeader }