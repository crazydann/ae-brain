'use client';

type BadgeVariant = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  blue:    'bg-blue-100 text-blue-700',
  green:   'bg-green-100 text-green-700',
  yellow:  'bg-yellow-100 text-yellow-700',
  red:     'bg-red-100 text-red-700',
  purple:  'bg-purple-100 text-purple-700',
  gray:    'bg-gray-100 text-gray-500',
};

export function Badge({ label, variant = 'default' }: { label: string; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, BadgeVariant> = { high: 'red', medium: 'yellow', low: 'green' };
  return <Badge label={priority} variant={map[priority] || 'gray'} />;
}
