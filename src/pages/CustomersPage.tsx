import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { Input } from '../components/Input';
import { EnhancedCustomerCard } from '../components/EnhancedCustomerCard';
import { EmptyState } from '../components/EmptyState';
import { getSettings } from '../services/settingsService';
import { getBusinessById } from '../services/businessService';
import { getCustomersByBusiness } from '../services/customerService';
import { getLedgerEntriesByBusiness } from '../services/ledgerService';
import { addBalanceToCustomers } from '../lib/calculations';
import { calculateCustomerRisk, sortCustomersByActionPriority } from '../lib/analytics';
import type { Business, CustomerWithRisk } from '../types';
import { Search, Users } from 'lucide-react';

export function CustomersPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<CustomerWithRisk[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithRisk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
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
      const businessCustomers = await getCustomersByBusiness(selectedBusiness.id);
      const entries = await getLedgerEntriesByBusiness(selectedBusiness.id);
      
      // Add balance and risk scoring
      const customersWithBalance = addBalanceToCustomers(businessCustomers, entries);
      const customersWithRisk = customersWithBalance.map(c => 
        calculateCustomerRisk(c, entries)
      );
      const sortedCustomers = sortCustomersByActionPriority(customersWithRisk);
      
      setCustomers(sortedCustomers);
      setFilteredCustomers(sortedCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <AppShell>
      <TopBar
        title="Customers"
        businessName={business.name}
        onBusinessClick={() => navigate('/business-switcher')}
      />

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title={searchQuery ? 'No customers found' : 'No customers yet'}
            description={
              searchQuery
                ? 'Try a different search term.'
                : 'Add a customer when creating your first record.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map(customer => (
              <EnhancedCustomerCard
                key={customer.id}
                customer={customer}
                currency={business.currency}
                onClick={() => navigate(`/customer/${customer.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
