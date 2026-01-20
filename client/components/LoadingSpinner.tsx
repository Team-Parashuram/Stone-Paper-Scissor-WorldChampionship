interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'indigo' | 'white' | 'slate';
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color = 'indigo' 
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    indigo: 'text-indigo-600',
    white: 'text-white',
    slate: 'text-slate-400'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <LoadingSpinner size="lg" color="indigo" />
      <p className="mt-4 text-sm font-semibold text-slate-500 tracking-wide uppercase">
        Loading Data
      </p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
      
      {/* Abstract Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full mix-blend-overlay blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Animated Brand Logo/Icon */}
        <div className="mb-8 relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-2xl transform rotate-3"></div>
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-2xl transform -rotate-3"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <LoadingSpinner size="lg" color="indigo" />
          </div>
        </div>
        
        {/* Typography */}
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          ThrowDown
        </h1>
        <p className="text-slate-400 font-medium text-sm tracking-wide uppercase mb-8">
          Initializing Arena
        </p>
        
        {/* 3-Color Pulse (Matching Ranking Colors) */}
        <div className="flex justify-center gap-3">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}