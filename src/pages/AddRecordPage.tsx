import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getSettings } from '../services/settingsService';
import { getBusinessById } from '../services/businessService';
import { getCustomersByBusiness, createCustomer } from '../services/customerService';
import { createLedgerEntry } from '../services/ledgerService';
import type { Business, Customer, LedgerEntryType } from '../types';
import { cn } from '../utils/cn';

const recordTypes: { value: LedgerEntryType; label: string; description: string }[] = [
  {
    value: 'credit_given',
    label: 'Credit Given',
    description: 'Customer took goods on credit',
  },
  {
    value: 'payment_received',
    label: 'Payment Received',
    description: 'Customer paid',
  },
  {
    value: 'change_owed',
    label: 'Change Owed',
    description: 'I owe customer change',
  },
  {
    value: 'change_returned',
    label: 'Change Returned',
    description: 'I returned customer change',
  },
  {
    value: 'adjustment',
    label: 'Adjustment',
    description: 'Correction / adjustment',
  },
];

export function AddRecordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  const preselectedType = searchParams.get('type') as LedgerEntryType | null;

  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [recordType, setRecordType] = useState<LedgerEntryType>(
    preselectedType || 'credit_given'
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      setCustomers(businessCustomers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!showNewCustomer && !selectedCustomerId) {
      newErrors.customer = 'Please select a customer';
    }

    if (showNewCustomer && !newCustomerName.trim()) {
      newErrors.newCustomerName = 'Customer name is required';
    }

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !business) return;

    setIsSaving(true);
    try {
      let customerId = selectedCustomerId;

      // Create new customer if needed
      if (showNewCustomer) {
        const newCustomer = await createCustomer(business.id, {
          name: newCustomerName.trim(),
          phone: newCustomerPhone.trim() || undefined,
        });
        customerId = newCustomer.id;
      }

      // Create ledger entry
      await createLedgerEntry({
        businessId: business.id,
        customerId,
        type: recordType,
        amount: parseFloat(amount),
        note: note.trim() || undefined,
        dueDate: dueDate || undefined,
      });

      // Navigate to customer detail
      navigate(`/customer/${customerId}`);
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('Failed to save record. Please try again.');
    } finally {
      setIsSaving(false);
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
        title="Add Record"
        showBackButton
        onBackClick={() => navigate('/dashboard')}
      />

      <div className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            
            {!showNewCustomer ? (
              <>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCustomer(true)}
                  className="mt-2"
                >
                  + Add New Customer
                </Button>
              </>
            ) : (
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <Input
                  label="Customer Name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  error={errors.newCustomerName}
                  placeholder="Enter customer name"
                />
                <Input
                  label="Phone (optional)"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewCustomer(false);
                    setNewCustomerName('');
                    setNewCustomerPhone('');
                  }}
                >
                  Use Existing Customer
                </Button>
              </div>
            )}
          </div>

          {/* Record Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {recordTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setRecordType(type.value)}
                  className={cn(
                    'text-left px-4 py-3 rounded-lg border-2 transition-all',
                    recordType === type.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            placeholder="0.00"
            className="text-2xl font-bold"
          />

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none"
            />
          </div>

          {/* Due Date */}
          <Input
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSaving}
            size="lg"
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Record'}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
