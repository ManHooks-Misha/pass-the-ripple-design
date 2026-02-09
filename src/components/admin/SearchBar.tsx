import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  loading, 
  disabled 
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <div className="flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-blue-500 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export { SearchBar }