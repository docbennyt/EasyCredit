import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { getSettings } from '../services/settingsService';
import { getBusinessById } from '../services/businessService';
import { getCustomersByBusiness } from '../services/customerService';
import { getLedgerEntriesByBusiness } from '../services/ledgerService';
import { getDueStatus } from '../lib/calculations';
import { formatCurrency } from '../lib/currency';
import { formatDate } from '../lib/dates';
import type { Business, Customer, LedgerEntry, DueStatus } from '../types';
import { AlertCircle, Clock, Calendar, Copy, Check } from 'lucide-react';

interface CollectionItem {
  entry: LedgerEntry;
  customer: Customer;
  dueStatus: DueStatus;
}

export function CollectionsPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const settings = await getSettings();
      if (!settings.selectedBusinessId) {
        navigate('/dashboard');
        return;
      }

      const selectedBusiness = await getBusinessById(settings.selectedBusinessId);
      if (!selectedBusiness) {
        navigate('/dashboard');
        return;
      }

      setBusiness(selectedBusiness);
      const customers = await getCustomersByBusiness(selectedBusiness.id);
      const entries = await getLedgerEntriesByBusiness(selectedBusiness.id);

      // Build collection items from active entries
      const items: CollectionItem[] = entries
        .filter(e => e.status === 'active')
        .map(entry => {
          const customer = customers.find(c => c.id === entry.customerId);
          const dueStatus = getDueStatus(entry);
          return customer ? { entry, customer, dueStatus } : null;
        })
        .filter((item): item is CollectionItem => item !== null)
        .sort((a, b) => {
          // Sort: overdue first, then due today, then upcoming
          const statusOrder = { overdue: 0, due_today: 1, upcoming: 2, no_due_date: 3 };
          return statusOrder[a.dueStatus] - statusOrder[b.dueStatus];
        });

      setCollections(items);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReminder = async (item: CollectionItem) => {
    const { entry, customer } = item;
    
    let message = '';
    if (entry.type === 'credit_given' || entry.type === 'payment_received') {
      message = `Hi ${customer.name}, friendly reminder for your ${formatCurrency(entry.amount, business?.currency || 'USD')} balance with ${business?.name}. Thank you.`;
    } else if (entry.type === 'change_owed' || entry.type === 'change_returned') {
      message = `Hi ${customer.name}, this is a reminder that we still have your ${formatCurrency(entry.amount, business?.currency || 'USD')} change/balance recorded with ${business?.name}. Thank you.`;
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy message');
    }
  };

  if (isLoading || !business) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppShell>
    );
  }

  const overdue = collections.filter(c => c.dueStatus === 'overdue');
  const dueToday = collections.filter(c => c.dueStatus === 'due_today');
  const upcoming = collections.filter(c => c.dueStatus === 'upcoming');
  const noDueDate = collections.filter(c => c.dueStatus === 'no_due_date');

  const CollectionCard = ({ item }: { item: CollectionItem }) => {
    const isCopied = copiedId === item.entry.id;
    
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{item.customer.name}</h3>
            {item.customer.phone && (
              <p className="text-sm text-gray-600">{item.customer.phone}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(item.entry.amount, business.currency)}
            </div>
            {item.entry.dueDate && (
              <div className="text-xs text-gray-600">
                Due {formatDate(item.entry.dueDate)}
              </div>
            )}
          </div>
        </div>

        {item.entry.note && (
          <p className="text-sm text-gray-600 mb-3">{item.entry.note}</p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/customer/${item.customer.id}`)}
            className="flex-1"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyReminder(item)}
            className="flex items-center gap-1"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <TopBar
        title="Credit Book"
        businessName={business.name}
        onBusinessClick={() => navigate('/business-switcher')}
      />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {collections.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="No collections"
            description="All clear! No overdue or upcoming payments."
          />
        ) : (
          <>
            {/* Overdue */}
            {overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">Overdue ({overdue.length})</h2>
                </div>
                <div className="space-y-2">
                  {overdue.map(item => (
                    <CollectionCard key={item.entry.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Due Today */}
            {dueToday.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={20} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-gray-900">Due Today ({dueToday.length})</h2>
                </div>
                <div className="space-y-2">
                  {dueToday.map(item => (
                    <CollectionCard key={item.entry.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={20} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Upcoming ({upcoming.length})</h2>
                </div>
                <div className="space-y-2">
                  {upcoming.map(item => (
                    <CollectionCard key={item.entry.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* No Due Date */}
            {noDueDate.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  No Due Date ({noDueDate.length})
                </h2>
                <div className="space-y-2">
                  {noDueDate.map(item => (
                    <CollectionCard key={item.entry.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
