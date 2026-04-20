import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm block animate-pulse">
      {/* Subject label placeholder */}
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
      </div>

      {/* Title placeholder */}
      <div className="h-7 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-md mb-2"></div>
      <div className="h-7 w-1/2 bg-gray-200 dark:bg-slate-700 rounded-md mb-4"></div>

      {/* Topic placeholder */}
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-slate-700 rounded-md mb-6"></div>

      {/* Footer placeholder */}
      <div className="flex items-center mt-auto pt-4 border-t border-gray-50 dark:border-slate-700">
        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-slate-700"></div>
        <div className="ml-2 h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        <div className="ml-auto h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
