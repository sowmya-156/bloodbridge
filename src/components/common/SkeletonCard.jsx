// src/components/common/SkeletonCard.jsx
export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 skeleton rounded-full" />
          <div className="space-y-2">
            <div className="w-32 h-4 skeleton rounded" />
            <div className="w-20 h-3 skeleton rounded" />
          </div>
        </div>
        <div className="w-12 h-6 skeleton rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-24 h-3 skeleton rounded" />
        <div className="w-32 h-3 skeleton rounded" />
        <div className="w-36 h-3 skeleton rounded" />
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
        <div className="w-28 h-4 skeleton rounded" />
        <div className="w-16 h-6 skeleton rounded-lg" />
      </div>
    </div>
  );
}
