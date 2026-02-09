import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  loading?: boolean;
  loadingMessage?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  dataAttribute?: string;
}

function DataCard({
  title,
  description,
  icon: Icon,
  loading,
  loadingMessage,
  actions,
  children,
  dataAttribute
}: DataCardProps) {
  return (
    <Card className="shadow-sm" {...(dataAttribute ? { [dataAttribute]: true } : {})}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
          <CardTitle className="flex items-center text-base sm:text-lg">
            {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />}
            {title}
            {loading && (
              <span className="ml-2 flex items-center text-xs sm:text-sm font-normal text-muted-foreground">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                {loadingMessage || "Loading..."}
              </span>
            )}
          </CardTitle>
          {actions}
        </div>
        {description && <CardDescription className="text-xs sm:text-sm mt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`p-4 sm:p-6 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        {children}
      </CardContent>
    </Card>
  );
}

export { DataCard }