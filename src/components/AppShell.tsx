import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className={hideNav ? '' : 'pb-20'}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
