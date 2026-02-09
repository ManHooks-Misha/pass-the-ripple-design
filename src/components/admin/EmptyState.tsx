import { Button } from '@/components/ui/button';
import { LucideIcon, RefreshCw, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const ActionIcon = action?.icon || RefreshCw;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="rounded-full bg-muted p-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          <ActionIcon className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState }