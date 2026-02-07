import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface Step {
  label: string;
  icon: React.ReactNode;
  tooltip: string;
}

interface BookingStepperProps {
  steps: Step[];
  currentStep: number;
}

const BookingStepper: React.FC<BookingStepperProps> = ({ steps, currentStep }) => {
  return (
    <TooltipProvider>
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={step.label} className="flex flex-col items-center z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md
                        ${isActive ? 'border-health-teal bg-white text-health-teal scale-110' :
                          isCompleted ? 'border-health-teal bg-health-teal text-white' :
                            'border-gray-300 bg-gray-100 text-gray-400'}`}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={step.label}
                      tabIndex={0}
                    >
                      {step.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{step.tooltip}</TooltipContent>
                </Tooltip>
                <span className={`mt-2 text-xs font-medium ${isActive ? 'text-health-teal' : 'text-gray-500'}`}>{step.label}</span>
              </div>
            );
          })}
          {/* Progress line */}
          <div className="absolute top-5 left-0 h-[2px] bg-gray-200 w-full -z-10" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-health-teal transition-all duration-500 -z-10"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        {/* Animated progress bar (placeholder for Lottie) */}
        <div className="mt-4">
          <Progress value={((currentStep + 1) / steps.length) * 100} />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BookingStepper; 