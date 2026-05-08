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
import { addBalanceToCustomers } from '../lib/calculations';
import { formatCurrency } from '../lib/currency';
import { formatDate } from '../lib/dates';
import type { Business, CustomerWithBalance } from '../types';
import { Banknote, ArrowUpRight, User } from 'lucide-react';

export function ChangePage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [customersOwedChange, setCustomersOwedChange] = useState<CustomerWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChangeData();
  }, []);

  const loadChangeData = async () => {
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

      const customersWithBalance = addBalanceToCustomers(customers, entries);
      
      // Filter only customers with negative balance (we owe them change)
      const owedChange = customersWithBalance
        .filter(c => c.balance < 0)
        .sort((a, b) => a.balance - b.balance); // Most negative first

      setCustomersOwedChange(owedChange);
    } catch (error) {
      console.error('Failed to load change data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalChangeOwed = customersOwedChange.reduce(
    (sum, customer) => sum + Math.abs(customer.balance),
    0
  );

  if (isLoading || !business) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar
        title="Change Book"
        businessName={business.name}
        onBusinessClick={() => navigate('/business-switcher')}
      />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Total Summary */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Banknote size={24} />
            <h2 className="text-lg font-semibold opacity-90">Total Change Owed</h2>
          </div>
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(totalChangeOwed, business.currency)}
          </div>
          <p className="text-purple-100 text-sm">
            {customersOwedChange.length} {customersOwedChange.length === 1 ? 'customer' : 'customers'} waiting for change
          </p>
        </div>

        {/* Change List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Banknote size={20} className="text-purple-600" />
            Customers Owed Change
          </h2>

          {customersOwedChange.length === 0 ? (
            <EmptyState
              icon={<Banknote size={48} />}
              title="No change owed"
              description="All clear! You don't owe any customers change at the moment."
            />
          ) : (
            <div className="space-y-3">
              {customersOwedChange.map(customer => (
                <div
                  key={customer.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/customer/${customer.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        {customer.phone && (
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ArrowUpRight size={16} />
                      <span className="text-xs font-medium">You owe</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Change to return</div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(Math.abs(customer.balance), business.currency)}
                      </div>
                    </div>
                    {customer.lastActivityDate && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Last activity</div>
                        <div className="text-xs text-gray-600">
                          {formatDate(customer.lastActivityDate)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/add-record?customerId=${customer.id}`);
                      }}
                      className="w-full"
                    >
                      Return Change
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">About Change Book</h3>
          <p className="text-sm text-purple-800">
            This is your changebook. It tracks all customers who paid more than their purchase 
            and are waiting for their change. Click "Return Change" when you give them their money back.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
