import { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Building2 } from 'lucide-react';

interface VentureSetupScreenProps {
  onContinue: (ventureName: string) => void;
  isLoading?: boolean;
}

export function VentureSetupScreen({ onContinue, isLoading }: VentureSetupScreenProps) {
  const [ventureName, setVentureName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ventureName.trim()) {
      setError('Enter a venture name to continue.');
      return;
    }

    setError('');
    onContinue(ventureName.trim());
  };

  return (
    <div className="p-8">
      {/* Icon */}
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Building2 size={32} className="text-purple-600" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        What venture are we tracking first?
      </h2>

      {/* Support text */}
      <p className="text-gray-600 mb-6 text-center">
        This keeps each business separate, with its own customers, Credit Book, and Change Book.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Venture Name"
          value={ventureName}
          onChange={(e) => {
            setVentureName(e.target.value);
            setError('');
          }}
          placeholder="Fresh Fish, Floor Polish, Green Mealies..."
          error={error}
          autoFocus
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Continue'}
        </Button>
      </form>

      {/* Helper examples */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {['Fresh Fish', 'Floor Polish', 'Tuckshop', 'Salon'].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setVentureName(example)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
