import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
}

export function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {currentStep && totalSteps && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < currentStep
                      ? 'w-8 bg-purple-600'
                      : i === currentStep
                      ? 'w-12 bg-purple-600'
                      : 'w-6 bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
