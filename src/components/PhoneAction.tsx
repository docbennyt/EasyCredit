import { Phone, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PhoneActionProps {
  phone: string;
  customerName: string;
  compact?: boolean;
}

export function PhoneAction({ phone, customerName, compact = false }: PhoneActionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy phone number:', error);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`tel:${phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          <Phone size={14} />
          <span>{phone}</span>
        </a>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Copy number"
        >
          {copied ? (
            <Check size={14} className="text-green-600" />
          ) : (
            <Copy size={14} className="text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <a
        href={`tel:${phone}`}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        <Phone size={16} />
        Call {customerName.split(' ')[0]}
      </a>
      <button
        onClick={handleCopy}
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Copy number"
      >
        {copied ? (
          <Check size={16} className="text-green-600" />
        ) : (
          <Copy size={16} className="text-gray-600" />
        )}
      </button>
    </div>
  );
}

interface NoPhoneProps {
  compact?: boolean;
}

export function NoPhone({ compact = false }: NoPhoneProps) {
  if (compact) {
    return (
      <span className="text-xs text-gray-400 italic">No phone saved</span>
    );
  }

  return (
    <div className="text-sm text-gray-500 italic">
      No phone number saved
    </div>
  );
}
