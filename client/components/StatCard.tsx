interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode | string;
  color?: 'green' | 'yellow' | 'red' | 'gray';
}

export default function StatCard({ label, title, value, change, icon, color = 'green' }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  const displayLabel = label || title || '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{displayLabel}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p
              className={`mt-1 text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? '+' : ''}{change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]} text-2xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
