import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EnhancedCustomerCard } from '../components/EnhancedCustomerCard';
import { EmptyState } from '../components/EmptyState';
import { getSettings } from '../services/settingsService';
import { getBusinessById } from '../services/businessService';
import { createCustomer, getCustomersByBusiness } from '../services/customerService';
import { getLedgerEntriesByBusiness } from '../services/ledgerService';
import { addBalanceToCustomers } from '../lib/calculations';
import { calculateCustomerRisk, sortCustomersByActionPriority } from '../lib/analytics';
import type { Business, CustomerWithRisk } from '../types';
import { Plus, Search, Users } from 'lucide-react';

export function CustomersPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<CustomerWithRisk[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithRisk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerNotes, setNewCustomerNotes] = useState('');

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
          c.phone?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleCreateCustomer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!business || !newCustomerName.trim()) {
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const created = await createCustomer(business.id, {
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || undefined,
        notes: newCustomerNotes.trim() || undefined,
      });

      setShowAddCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerNotes('');
      await loadCustomers();
      navigate(`/customer/${created.id}`);
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Failed to save customer. Please try again.');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

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
            placeholder="Search by name, phone, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={() => setShowAddCustomer(true)} className="w-full">
          <Plus size={18} className="mr-2 inline" />
          Add Customer
        </Button>

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

      <Modal
        isOpen={showAddCustomer}
        onClose={() => {
          if (!isCreatingCustomer) {
            setShowAddCustomer(false);
          }
        }}
        title="Add Customer"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Name"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Customer name"
            disabled={isCreatingCustomer}
          />
          <Input
            label="Phone"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
            placeholder="Phone number"
            disabled={isCreatingCustomer}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={newCustomerNotes}
              onChange={(e) => setNewCustomerNotes(e.target.value)}
              placeholder="Notes"
              rows={3}
              disabled={isCreatingCustomer}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <Button type="submit" disabled={isCreatingCustomer || !newCustomerName.trim()} className="w-full">
            {isCreatingCustomer ? 'Saving...' : 'Save Customer'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
