import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { LucideIcon, Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'yellow' | 'indigo';
  loading?: boolean;
}

const colorMap = {
  blue: { border: 'border-l-blue-500', text: 'text-blue-600', icon: 'text-blue-500' },
  purple: { border: 'border-l-purple-500', text: 'text-purple-600', icon: 'text-purple-500' },
  green: { border: 'border-l-green-500', text: 'text-green-600', icon: 'text-green-500' },
  orange: { border: 'border-l-orange-500', text: 'text-orange-600', icon: 'text-orange-500' },
  red: { border: 'border-l-red-500', text: 'text-red-600', icon: 'text-red-500' },
  yellow: { border: 'border-l-yellow-500', text: 'text-yellow-600', icon: 'text-yellow-500' },
  indigo: { border: 'border-l-indigo-500', text: 'text-indigo-600', icon: 'text-indigo-500' },
};

function StatCard({ title, value, description, icon: Icon, color, loading }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${colors.border}`}>
      <CardHeader className="pb-2 sm:pb-3">
        <CardDescription className="flex items-center text-xs sm:text-sm">
          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${colors.icon}`} />
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>
          {loading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export { StatCard }