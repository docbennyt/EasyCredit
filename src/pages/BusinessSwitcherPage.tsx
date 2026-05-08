import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { getAllBusinesses, createBusiness } from '../services/businessService';
import { getSettings, updateSettings } from '../services/settingsService';
import type { Business } from '../types';
import { Building2, Check, Plus } from 'lucide-react';

export function BusinessSwitcherPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessCurrency, setNewBusinessCurrency] = useState('USD');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setIsLoading(true);
    try {
      const allBusinesses = await getAllBusinesses();
      setBusinesses(allBusinesses);

      const settings = await getSettings();
      if (settings.selectedBusinessId) {
        setSelectedBusinessId(settings.selectedBusinessId);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBusiness = async (businessId: string) => {
    try {
      await updateSettings({ selectedBusinessId: businessId });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to select business:', error);
      alert('Failed to switch business. Please try again.');
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBusinessName.trim()) {
      alert('Please enter a business name');
      return;
    }

    setIsCreating(true);
    try {
      const newBusiness = await createBusiness(
        newBusinessName.trim(),
        newBusinessCurrency
      );

      await updateSettings({ selectedBusinessId: newBusiness.id });
      setShowNewBusinessModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create business:', error);
      alert('Failed to create business. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell hideNav>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <TopBar
        title="Switch Business"
        showBackButton
        onBackClick={() => navigate('/dashboard')}
      />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Info Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900">
            Each business has separate customers, records, and totals. 
            Switch between your businesses anytime.
          </p>
        </div>

        {/* Business List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Your Businesses</h2>
          <div className="space-y-2">
            {businesses.map(business => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  business.id === selectedBusinessId
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building2 size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{business.name}</div>
                      <div className="text-sm text-gray-600">Currency: {business.currency}</div>
                    </div>
                  </div>
                  {business.id === selectedBusinessId && (
                    <Check size={24} className="text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add New Business */}
        <Button
          onClick={() => setShowNewBusinessModal(true)}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add New Business
        </Button>
      </div>

      {/* Create Business Modal */}
      <Modal
        isOpen={showNewBusinessModal}
        onClose={() => {
          if (!isCreating) {
            setShowNewBusinessModal(false);
            setNewBusinessName('');
            setNewBusinessCurrency('USD');
          }
        }}
        title="Create New Business"
      >
        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <Input
            label="Business Name"
            value={newBusinessName}
            onChange={(e) => setNewBusinessName(e.target.value)}
            placeholder="e.g. Floor Polish"
            disabled={isCreating}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={newBusinessCurrency}
              onChange={(e) => setNewBusinessCurrency(e.target.value)}
              disabled={isCreating}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="ZWL">ZWL - Zimbabwe Dollar</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Business'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
