import { Button } from '../Button';
import { User, TrendingUp, Banknote, ArrowRight } from 'lucide-react';

interface CustomerFocusScreenProps {
  customerName: string;
  customerPhone?: string;
  ventureName: string;
  onRecordCredit: () => void;
  onKeepChange: () => void;
  onGoToDashboard: () => void;
}

export function CustomerFocusScreen({
  customerName,
  customerPhone,
  ventureName,
  onRecordCredit,
  onKeepChange,
  onGoToDashboard,
}: CustomerFocusScreenProps) {
  return (
    <div className="p-8">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {customerName} is ready
      </h2>

      <p className="text-gray-600 mb-8 text-center">
        Now choose what you want to record for this customer.
      </p>

      {/* Customer Focus Card with Background Stack */}
      <div className="relative mb-8">
        {/* Blurred background cards */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-48">
            {/* Card 1 - far left */}
            <div className="absolute -left-8 top-4 w-64 h-40 bg-gray-300 rounded-2xl opacity-20 blur-md transform -rotate-6" />
            {/* Card 2 - left */}
            <div className="absolute -left-4 top-2 w-72 h-44 bg-gray-300 rounded-2xl opacity-30 blur-sm transform -rotate-3" />
            {/* Card 3 - right */}
            <div className="absolute -right-4 top-2 w-72 h-44 bg-gray-300 rounded-2xl opacity-30 blur-sm transform rotate-3" />
            {/* Card 4 - far right */}
            <div className="absolute -right-8 top-4 w-64 h-40 bg-gray-300 rounded-2xl opacity-20 blur-md transform rotate-6" />
          </div>
        </div>

        {/* Main customer card */}
        <div className="relative z-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-2xl text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
              <User size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1">{customerName}</h3>
              {customerPhone && (
                <p className="text-purple-100 text-sm mb-2">{customerPhone}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <div className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur rounded-full text-xs font-medium">
                  {ventureName}
                </div>
                <div className="px-3 py-1 bg-green-500 bg-opacity-90 rounded-full text-xs font-medium">
                  Ready to track
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 mb-6">
        {/* Record Credit */}
        <button
          onClick={onRecordCredit}
          className="w-full bg-white border-2 border-green-200 hover:border-green-300 hover:bg-green-50 rounded-xl p-4 transition-all group text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-0.5">Record Credit</div>
                <div className="text-sm text-gray-600">Customer owes you</div>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </button>

        {/* Keep Change */}
        <button
          onClick={onKeepChange}
          className="w-full bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 rounded-xl p-4 transition-all group text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Banknote size={24} className="text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-0.5">Keep Change</div>
                <div className="text-sm text-gray-600">You owe customer change</div>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
          </div>
        </button>
      </div>

      {/* Secondary action */}
      <Button
        variant="ghost"
        onClick={onGoToDashboard}
        className="w-full text-gray-600"
      >
        Go to dashboard
      </Button>
    </div>
  );
}
