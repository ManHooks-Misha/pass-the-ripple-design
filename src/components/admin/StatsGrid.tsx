import { LucideIcon } from 'lucide-react';
import { StatCard } from './StatCard';

export interface StatItem {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'yellow' | 'indigo';
}

interface StatsGridProps {
  stats: StatItem[];
  loading?: boolean;
  grid_count: number;
}

export default function StatsGrid({ stats, loading, grid_count }: StatsGridProps) {
  // Map grid_count to Tailwind classes
  const gridClass = grid_count === 2 
    ? 'md:grid-cols-2' 
    : grid_count === 3 
    ? 'md:grid-cols-2 lg:grid-cols-3' 
    : grid_count === 4 
    ? 'md:grid-cols-2 lg:grid-cols-4' 
    : grid_count === 5
    ? 'md:grid-cols-2 lg:grid-cols-5'
    : 'md:grid-cols-2 lg:grid-cols-6';
  
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${gridClass}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
        />
      ))}
    </div>
  );
}

export { StatsGrid }