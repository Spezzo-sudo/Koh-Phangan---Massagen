
import React from 'react';

export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-light border-t-brand-teal rounded-full animate-spin"></div>
        <span className="text-brand-teal font-medium text-sm animate-pulse">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center w-full">
            {spinner}
        </div>
    );
  }

  return spinner;
}
