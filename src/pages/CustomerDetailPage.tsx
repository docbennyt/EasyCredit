import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { StatusBadge } from '../components/StatusBadge';
import { LedgerEntryRow } from '../components/LedgerEntryRow';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { getCustomerById } from '../services/customerService';
import { getLedgerEntriesByCustomer } from '../services/ledgerService';
import { getBusinessById } from '../services/businessService';
import { calculateCustomerBalance, getCustomerStatus } from '../lib/calculations';
import { formatCurrency } from '../lib/currency';
import type { Customer, LedgerEntry, Business } from '../types';
import { Phone, FileText, Plus } from 'lucide-react';

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      loadCustomerData(customerId);
    }
  }, [customerId]);

  const loadCustomerData = async (id: string) => {
    setIsLoading(true);
    try {
      const customerData = await getCustomerById(id);
      if (!customerData) {
        navigate('/customers');
        return;
      }

      const businessData = await getBusinessById(customerData.businessId);
      if (!businessData) {
        navigate('/customers');
        return;
      }

      setCustomer(customerData);
      setBusiness(businessData);
      
      const customerEntries = await getLedgerEntriesByCustomer(id);
      const sortedEntries = customerEntries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !customer || !business) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppShell>
    );
  }

  const balance = calculateCustomerBalance(entries);
  const status = getCustomerStatus(balance);

  const statusMessages = {
    owes_you: `This customer owes you ${formatCurrency(balance, business.currency)}`,
    you_owe: `You owe this customer ${formatCurrency(Math.abs(balance), business.currency)} in change`,
    settled: 'This customer is settled',
  };

  return (
    <AppShell>
      <TopBar
        title={customer.name}
        showBackButton
        onBackClick={() => navigate('/customers')}
      />

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Balance Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Current Balance</h2>
            <StatusBadge status={status} />
          </div>
          
          <div className={`text-3xl font-bold mb-2 ${
            balance > 0 ? 'text-green-600' : 
            balance < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {formatCurrency(balance, business.currency)}
          </div>

          <p className="text-gray-600 mb-4">{statusMessages[status]}</p>

          {customer.phone && (
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Phone size={16} />
              <span>{customer.phone}</span>
            </div>
          )}

          {customer.notes && (
            <div className="flex items-start gap-2 text-gray-700">
              <FileText size={16} className="mt-0.5" />
              <span>{customer.notes}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Button
          onClick={() => navigate(`/add-record?customerId=${customer.id}`)}
          className="w-full"
        >
          <Plus size={20} className="inline mr-2" />
          Add Transaction
        </Button>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Transaction History</h2>
          {entries.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add a transaction to start tracking this customer's balance."
            />
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <LedgerEntryRow
                  key={entry.id}
                  entry={entry}
                  currency={business.currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
