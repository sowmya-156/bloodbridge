// src/components/common/LoadingSpinner.jsx
import { FiDroplet } from 'react-icons/fi';

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} border-4 border-red-200 border-t-red-600 rounded-full animate-spin`} />
      </div>
      {size === 'lg' && (
        <div className="flex items-center gap-2 text-red-600 font-medium">
          <FiDroplet className="animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinner}
    </div>
  );
}
