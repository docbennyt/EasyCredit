import { ChevronDown, Wifi, WifiOff, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  businessName?: string;
  onBusinessClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showSettings?: boolean;
}

export function TopBar({ 
  title, 
  businessName, 
  onBusinessClick,
  showBackButton,
  onBackClick,
  showSettings = true 
}: TopBarProps) {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            {showBackButton && onBackClick ? (
              <button
                onClick={onBackClick}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                ← Back
              </button>
            ) : (
              <>
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                {businessName && (
                  <button
                    onClick={onBusinessClick}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors mt-0.5"
                  >
                    <span>{businessName}</span>
                    <ChevronDown size={16} />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi size={20} className="text-green-600" />
            ) : (
              <WifiOff size={20} className="text-gray-400" />
            )}
            {showSettings && (
              <button
                onClick={() => navigate('/settings')}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <Settings size={20} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
