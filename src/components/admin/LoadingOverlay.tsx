import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center text-blue-700">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export { LoadingOverlay }