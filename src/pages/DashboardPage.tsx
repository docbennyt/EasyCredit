import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { MetricCard } from '../components/MetricCard';
import { LedgerEntryRow } from '../components/LedgerEntryRow';
import { EmptyState } from '../components/EmptyState';
import { InsightCard, InterpretationText } from '../components/InsightCard';
import { CashflowChart } from '../components/CashflowChart';
import { ActionListCard } from '../components/ActionListCard';
import { Button } from '../components/Button';
import { getSettings, updateSettings } from '../services/settingsService';
import { getAllBusinesses } from '../services/businessService';
import { syncService } from '../services/syncService';
import { getCustomersByBusiness } from '../services/customerService';
import { getLedgerEntriesByBusiness } from '../services/ledgerService';
import { calculateBusinessTotals, addBalanceToCustomers } from '../lib/calculations';
import {
  calculateCashflowInsights,
  generateCashflowData,
  calculateCustomerRisk,
  generateActionItems,
} from '../lib/analytics';
import { formatCurrency } from '../lib/currency';
import type { Business, Customer, LedgerEntry } from '../types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Clock,
  Database,
  BarChart3,
  Activity,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30>(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const settings = await getSettings();
      let allBusinesses = await getAllBusinesses();

      // If a selectedBusinessId exists and matches a local business, use it.
      if (settings.selectedBusinessId) {
        const business = allBusinesses.find((b) => b.id === settings.selectedBusinessId);
        if (business) {
          setSelectedBusiness(business);
          const businessCustomers = await getCustomersByBusiness(business.id);
          const businessEntries = await getLedgerEntriesByBusiness(business.id);
          setCustomers(businessCustomers);
          setEntries(businessEntries);
          return;
        }
      }

      // No valid selected business found locally. If we have local businesses,
      // pick the first and persist it to settings.
      const firstLocal = allBusinesses.find((b) => !b.deletedAt);
      if (firstLocal) {
        await updateSettings({ selectedBusinessId: firstLocal.id });
        setSelectedBusiness(firstLocal);
        const businessCustomers = await getCustomersByBusiness(firstLocal.id);
        const businessEntries = await getLedgerEntriesByBusiness(firstLocal.id);
        setCustomers(businessCustomers);
        setEntries(businessEntries);
        return;
      }

      // No local businesses. If online, trigger a sync/pull from remote and retry.
      if (navigator.onLine) {
        try {
          await syncService.syncAll();
          allBusinesses = await getAllBusinesses();
          const firstAfterPull = allBusinesses.find((b) => !b.deletedAt);
          if (firstAfterPull) {
            await updateSettings({ selectedBusinessId: firstAfterPull.id });
            setSelectedBusiness(firstAfterPull);
            const businessCustomers = await getCustomersByBusiness(firstAfterPull.id);
            const businessEntries = await getLedgerEntriesByBusiness(firstAfterPull.id);
            setCustomers(businessCustomers);
            setEntries(businessEntries);
            return;
          }
        } catch (err) {
          console.error('Failed to pull businesses from remote:', err);
        }
      }

      // No businesses found locally and either offline or remote empty.
      // Leave selectedBusiness null so the recovery UI is shown.
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!selectedBusiness) {
    const handleCreateBusiness = () => navigate('/onboarding');
    const handleRetry = async () => {
      setIsLoading(true);
      try {
        if (navigator.onLine) {
          await syncService.syncAll();
          await loadData();
        }
      } catch (err) {
        console.error('Retry sync failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <AppShell hideNav>
        <div className="flex items-center justify-center min-h-screen p-4">
          <EmptyState
            title={navigator.onLine ? 'No business selected' : 'No business saved on this device'}
            description={
              navigator.onLine
                ? 'No businesses are available locally. Create one or retry syncing from the cloud.'
                : "EasyCredit can open offline after your business data has been saved on this device. Reconnect once to sync your businesses, or create a business offline."
            }
            action={{ label: 'Create business', onClick: handleCreateBusiness }}
          />

          <div className="mt-4 space-x-2">
            <Button onClick={handleRetry} variant="secondary">
              Retry sync
            </Button>
            <Button onClick={() => navigate('/settings')} variant="ghost">
              Sign out / settings
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const totals = calculateBusinessTotals(customers, entries);
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const needsAttentionEntries = entries.filter(e => {
    if (e.status !== 'active' || !e.dueDate) return false;
    const dueDate = new Date(e.dueDate);
    const today = new Date();
    return dueDate <= today;
  });

  // Analytics calculations
  const cashflowInsights = calculateCashflowInsights(entries, timeRange);
  const cashflowData = generateCashflowData(entries, timeRange);
  const customersWithBalance = addBalanceToCustomers(customers, entries);
  const customersWithRisk = customersWithBalance.map(c => calculateCustomerRisk(c, entries));
  const actionItems = generateActionItems(customersWithRisk, entries);

  return (
    <AppShell>
      <TopBar
        title="Dashboard"
        businessName={selectedBusiness.name}
        onBusinessClick={() => navigate('/business-switcher')}
      />

      <div className="max-w-lg mx-auto p-4 space-y-6 pb-24">
        {/* EXISTING: Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Owed To You"
            value={formatCurrency(totals.totalOwedToBusiness, selectedBusiness.currency)}
            icon={<TrendingUp size={20} />}
            trend="positive"
          />
          <MetricCard
            label="Change You Owe"
            value={formatCurrency(totals.totalChangeOwedToCustomers, selectedBusiness.currency)}
            icon={<TrendingDown size={20} />}
            trend="negative"
          />
          <MetricCard
            label="Net Position"
            value={formatCurrency(totals.netPosition, selectedBusiness.currency)}
            icon={<DollarSign size={20} />}
            trend={totals.netPosition >= 0 ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Active Customers"
            value={totals.activeCustomersCount}
            icon={<Database size={20} />}
            trend="neutral"
          />
          <MetricCard
            label="Due Today"
            value={totals.dueTodayCount}
            icon={<Clock size={20} />}
            trend={totals.dueTodayCount > 0 ? 'negative' : 'neutral'}
            onClick={() => navigate('/collections')}
          />
          <MetricCard
            label="Overdue"
            value={totals.overdueCount}
            icon={<AlertCircle size={20} />}
            trend={totals.overdueCount > 0 ? 'negative' : 'neutral'}
            onClick={() => navigate('/collections')}
          />
        </div>

        {/* EXISTING: Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate('/add-record')} className="w-full">
            <Plus size={20} className="inline mr-2" />
            Add Record
          </Button>
          <Button onClick={() => navigate('/customers')} variant="secondary" className="w-full">
            View Customers
          </Button>
        </div>

        {/* EXISTING: Needs Attention */}
        {needsAttentionEntries.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Needs Attention</h2>
            <div className="space-y-2">
              {needsAttentionEntries.map(entry => {
                const customer = customers.find(c => c.id === entry.customerId);
                return (
                  <LedgerEntryRow
                    key={entry.id}
                    entry={entry}
                    currency={selectedBusiness.currency}
                    showCustomer
                    customerName={customer?.name}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* EXISTING: Recent Activity */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h2>
          {recentEntries.length === 0 ? (
            <EmptyState
              title="No records yet"
              description="Add your first credit or change record to get started."
              action={{
                label: 'Add Record',
                onClick: () => navigate('/add-record'),
              }}
            />
          ) : (
            <div className="space-y-2">
              {recentEntries.map(entry => {
                const customer = customers.find(c => c.id === entry.customerId);
                return (
                  <LedgerEntryRow
                    key={entry.id}
                    entry={entry}
                    currency={selectedBusiness.currency}
                    showCustomer
                    customerName={customer?.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* NEW: Divider */}
        <div className="border-t-2 border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <BarChart3 size={24} className="text-purple-600" />
            Cashflow Insights
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Deeper analysis to help you make better business decisions
          </p>
        </div>

        {/* NEW: Today's Actions */}
        <ActionListCard actions={actionItems} currency={selectedBusiness.currency} />

        {/* NEW: Cashflow Pattern */}
        <InsightCard
          title="Cashflow Pattern"
          icon={<Activity size={20} />}
          action={{
            label: timeRange === 7 ? 'View 30 days' : 'View 7 days',
            onClick: () => setTimeRange(timeRange === 7 ? 30 : 7),
          }}
        >
          <div className="mb-4">
            <CashflowChart data={cashflowData} />
          </div>
          <div className="text-sm text-gray-600">
            Last {timeRange} days of credit, payments, and change activity
          </div>
        </InsightCard>

        {/* NEW: Credit vs Collections */}
        <InsightCard title="Credit Given vs Collected" icon={<TrendingUp size={20} />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Credit Given</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(cashflowInsights.creditGivenTotal, selectedBusiness.currency)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Collected</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(cashflowInsights.paymentsReceivedTotal, selectedBusiness.currency)}
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all"
                style={{
                  width: `${Math.min(cashflowInsights.collectionRate, 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Collection Rate</span>
              <span className="font-bold text-gray-900">
                {cashflowInsights.collectionRate.toFixed(1)}%
              </span>
            </div>

            {cashflowInsights.collectionRate < 80 && (
              <InterpretationText type="warning">
                Collection rate is below 80%. Consider following up with customers.
              </InterpretationText>
            )}
            {cashflowInsights.collectionRate >= 90 && (
              <InterpretationText type="positive">
                Excellent collection rate! Your cash flow is healthy.
              </InterpretationText>
            )}
          </div>
        </InsightCard>

        {/* NEW: Money Trapped */}
        <InsightCard title="Money Trapped in Credit" icon={<DollarSign size={20} />}>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(totals.totalOwedToBusiness, selectedBusiness.currency)}
            </div>
            <p className="text-sm text-gray-600">
              This is money outside your business. Focus on collections to improve cash flow.
            </p>
            {totals.overdueCount > 0 && (
              <InterpretationText type="negative">
                {totals.overdueCount} overdue {totals.overdueCount === 1 ? 'customer' : 'customers'}.
                Follow up today to recover funds.
              </InterpretationText>
            )}
          </div>
        </InsightCard>
      </div>
    </AppShell>
  );
}
