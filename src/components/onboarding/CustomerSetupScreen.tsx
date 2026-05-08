import { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { UserPlus } from 'lucide-react';

interface CustomerSetupScreenProps {
  ventureName: string;
  onContinue: (customerName: string, phone?: string) => void;
  isLoading?: boolean;
}

export function CustomerSetupScreen({ ventureName, onContinue, isLoading }: CustomerSetupScreenProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError('Enter the customer\'s name to continue.');
      return;
    }

    setError('');
    onContinue(customerName.trim(), phone.trim() || undefined);
  };

  return (
    <div className="p-8">
      {/* Icon */}
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <UserPlus size={32} className="text-purple-600" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Add your first customer
      </h2>

      {/* Support text */}
      <p className="text-gray-600 mb-2 text-center">
        Start with one person. You can add the rest later.
      </p>

      {/* Venture badge */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="text-sm text-gray-500">for</div>
        <div className="px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-900">
          {ventureName}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Customer Name"
          value={customerName}
          onChange={(e) => {
            setCustomerName(e.target.value);
            setError('');
          }}
          placeholder="Mai T, Tawanda, Mr Moyo..."
          error={error}
          autoFocus
          disabled={isLoading}
        />

        <Input
          label="Phone Number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="077..."
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add customer'}
        </Button>
      </form>
    </div>
  );
}
