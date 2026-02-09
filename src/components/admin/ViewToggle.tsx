import { Button } from '@/components/ui/button';
import { Grid3x3, List } from 'lucide-react';

interface ViewToggleProps {
  viewType: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  disabled?: boolean;
}

function ViewToggle({ viewType, onViewChange, disabled }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewType === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('list')}
        disabled={disabled}
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
      <Button
        variant={viewType === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
        disabled={disabled}
      >
        <Grid3x3 className="h-4 w-4 mr-1" />
        Grid
      </Button>
    </div>
  );
}

export { ViewToggle }