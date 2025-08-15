import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
  onTimeUpdate?: (remainingTime: number) => void;
}

const Timer: React.FC<TimerProps> = ({ totalMinutes, onTimeUp, isActive, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(totalMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 600) { // 10 minutes warning
          setIsWarning(true);
        }
        
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((totalMinutes * 60 - timeLeft) / (totalMinutes * 60)) * 100;

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 rounded-lg ${
      isWarning ? 'bg-red-50 border-2 border-red-200' : 'bg-blue-50 border-2 border-blue-200'
    }`}>
      {isWarning ? (
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
      ) : (
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
      )}
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <span className={`font-mono text-sm sm:text-lg font-semibold ${
          isWarning ? 'text-red-600' : 'text-blue-600'
        }`}>
          {formatTime(timeLeft)}
        </span>
        
        <div className="w-16 sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              isWarning ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {isWarning && (
        <span className="hidden sm:inline text-sm text-red-600 font-medium">
          {timeLeft <= 60 ? 'Last minute!' : `${Math.floor(timeLeft / 60)} min left`}
        </span>
      )}
    </div>
  );
};

export default Timer;