import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen';
import { VentureSetupScreen } from '../components/onboarding/VentureSetupScreen';
import { CustomerSetupScreen } from '../components/onboarding/CustomerSetupScreen';
import { CustomerFocusScreen } from '../components/onboarding/CustomerFocusScreen';
import { createBusiness } from '../services/businessService';
import { createCustomer } from '../services/customerService';
import { updateSettings } from '../services/settingsService';

type OnboardingStep = 'welcome' | 'venture' | 'customer' | 'focus';

export function NewOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  // Data collected during onboarding
  const [ventureId, setVentureId] = useState<string>('');
  const [ventureName, setVentureName] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string | undefined>();

  const handleWelcomeContinue = () => {
    setCurrentStep('venture');
  };

  const handleVentureSetup = async (name: string) => {
    setIsLoading(true);
    try {
      // Create the venture/business
      const newBusiness = await createBusiness(name, 'USD');
      
      // Save venture info
      setVentureId(newBusiness.id);
      setVentureName(newBusiness.name);

      // Set as selected business
      await updateSettings({
        selectedBusinessId: newBusiness.id,
      });

      // Move to customer setup
      setCurrentStep('customer');
    } catch (error) {
      console.error('Failed to create venture:', error);
      alert('Could not create venture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSetup = async (name: string, phone?: string) => {
    setIsLoading(true);
    try {
      // Create the customer
      const newCustomer = await createCustomer(ventureId, {
        name,
        phone,
      });

      // Save customer info
      setCustomerId(newCustomer.id);
      setCustomerName(newCustomer.name);
      setCustomerPhone(newCustomer.phone);

      // Mark onboarding as completed
      await updateSettings({
        hasCompletedOnboarding: true,
      });

      // Move to focus screen
      setCurrentStep('focus');
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Could not add customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordCredit = () => {
    // Navigate to add record page with preselected customer and credit type
    navigate(`/add-record?customerId=${customerId}&type=credit_given`);
  };

  const handleKeepChange = () => {
    // Navigate to add record page with preselected customer and change type
    navigate(`/add-record?customerId=${customerId}&type=change_owed`);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const getStepNumber = (): number => {
    const steps: OnboardingStep[] = ['welcome', 'venture', 'customer', 'focus'];
    return steps.indexOf(currentStep);
  };

  return (
    <OnboardingLayout currentStep={getStepNumber()} totalSteps={4}>
      {currentStep === 'welcome' && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}

      {currentStep === 'venture' && (
        <VentureSetupScreen
          onContinue={handleVentureSetup}
          isLoading={isLoading}
        />
      )}

      {currentStep === 'customer' && (
        <CustomerSetupScreen
          ventureName={ventureName}
          onContinue={handleCustomerSetup}
          isLoading={isLoading}
        />
      )}

      {currentStep === 'focus' && (
        <CustomerFocusScreen
          customerName={customerName}
          customerPhone={customerPhone}
          ventureName={ventureName}
          onRecordCredit={handleRecordCredit}
          onKeepChange={handleKeepChange}
          onGoToDashboard={handleGoToDashboard}
        />
      )}
    </OnboardingLayout>
  );
}
