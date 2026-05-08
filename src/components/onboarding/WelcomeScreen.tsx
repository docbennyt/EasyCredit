import { Button } from '../Button';
import { BookOpen, Banknote } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="p-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <BookOpen size={40} className="text-white" />
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Know who owes you. Know who you owe.
      </h1>

      {/* Supporting text */}
      <p className="text-lg text-gray-600 mb-8">
        EasyCredit helps you track customer credit and customer change for every venture you manage.
      </p>

      {/* Visual cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BookOpen size={20} className="text-green-600" />
          </div>
          <div className="text-sm font-semibold text-green-900">Credit Book</div>
          <div className="text-xs text-green-700 mt-1">Who owes you</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Banknote size={20} className="text-red-600" />
          </div>
          <div className="text-sm font-semibold text-red-900">Change Book</div>
          <div className="text-xs text-red-700 mt-1">Who you owe</div>
        </div>
      </div>

      {/* CTA */}
      <Button onClick={onContinue} size="lg" className="w-full">
        Set up my first venture
      </Button>

      <p className="text-xs text-gray-500 mt-6">
        No paperwork • Works offline • Free to use
      </p>
    </div>
  );
}
