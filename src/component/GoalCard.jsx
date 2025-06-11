import React from 'react';
import ProgressBar from './ProgressBar';

const GoalCard = ({ goal, onAddFunds }) => {
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-6">
      <div className="flex-grow">
        <h4 className="text-lg font-semibold text-gray-800">{goal.name}</h4>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-medium text-gray-700">{formatRupiah(goal.currentAmount)}</span> / {formatRupiah(goal.targetAmount)}
        </p>
        <ProgressBar progress={percentage} />
        <p className="text-xs text-gray-500 mt-1.5">{Math.round(percentage)}% Tercapai</p>
      </div>
      <button 
        onClick={() => onAddFunds(goal)} 
        className="bg-gray-800 text-white font-semibold px-5 py-2 rounded-lg hover:bg-gray-900 transition-colors flex-shrink-0"
      >
        Tambah Dana
      </button>
    </div>
  );
};

export default GoalCard;
