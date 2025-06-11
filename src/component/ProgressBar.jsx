import React from 'react';

const ProgressBar = ({ progress }) => {
  // Pastikan progress tidak melebihi 100%
  const clampedProgress = Math.min(progress, 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
      <div 
        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
