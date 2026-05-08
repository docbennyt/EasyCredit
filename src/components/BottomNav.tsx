import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Bell, Banknote } from 'lucide-react';
import { cn } from '../utils/cn';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/add-record', label: 'Add', icon: Plus, primary: true },
    { path: '/collections', label: 'Credit', icon: Bell },
    { path: '/change', label: 'Change', icon: Banknote },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                  item.primary
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg'
                    : isActive
                    ? 'text-purple-600'
                    : 'text-gray-600'
                )}
              >
                <Icon size={item.primary ? 24 : 20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
