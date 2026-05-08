import { createBusiness } from './businessService';
import { createCustomer } from './customerService';
import { createLedgerEntry } from './ledgerService';
import { getTodayISO } from '../lib/dates';

/**
 * Seed demo data for first-time users
 */
export async function seedDemoData(): Promise<string> {
  // Create three sample businesses
  const floorPolish = await createBusiness('Floor Polish', 'USD');
  const greenMealies = await createBusiness('Green Mealies', 'USD');
  const freshFish = await createBusiness('Fresh Fish', 'USD');

  // Floor Polish - customers and entries
  const maiT = await createCustomer(floorPolish.id, {
    name: 'Mai T',
    phone: '+263 77 123 4567',
  });
  
  const rudo = await createCustomer(floorPolish.id, {
    name: 'Rudo',
  });

  // Mai T took goods on credit: $8
  await createLedgerEntry({
    businessId: floorPolish.id,
    customerId: maiT.id,
    type: 'credit_given',
    amount: 8,
    note: '2 bottles of floor polish',
  });

  // Mai T paid: $3
  await createLedgerEntry({
    businessId: floorPolish.id,
    customerId: maiT.id,
    type: 'payment_received',
    amount: 3,
    note: 'Partial payment',
  });

  // Rudo took goods on credit: $12 due tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await createLedgerEntry({
    businessId: floorPolish.id,
    customerId: rudo.id,
    type: 'credit_given',
    amount: 12,
    note: '3 bottles',
    dueDate: tomorrow.toISOString().split('T')[0],
  });

  // Fresh Fish - customers and entries
  const tawanda = await createCustomer(freshFish.id, {
    name: 'Tawanda',
    phone: '+263 77 234 5678',
  });

  const mrMoyo = await createCustomer(freshFish.id, {
    name: 'Mr Moyo',
    phone: '+263 77 345 6789',
  });

  // Tawanda is owed change: $2
  await createLedgerEntry({
    businessId: freshFish.id,
    customerId: tawanda.id,
    type: 'change_owed',
    amount: 2,
    note: 'Paid $10 for $8 fish',
  });

  // Mr Moyo took fish on credit: $15 due yesterday (overdue)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await createLedgerEntry({
    businessId: freshFish.id,
    customerId: mrMoyo.id,
    type: 'credit_given',
    amount: 15,
    note: 'Fresh fish order',
    dueDate: yesterday.toISOString().split('T')[0],
  });

  // Mr Moyo paid: $5
  await createLedgerEntry({
    businessId: freshFish.id,
    customerId: mrMoyo.id,
    type: 'payment_received',
    amount: 5,
    note: 'Partial payment',
  });

  // Green Mealies - customers and entries
  const uncleJoe = await createCustomer(greenMealies.id, {
    name: 'Uncle Joe',
  });

  // Uncle Joe took goods on credit: $6
  await createLedgerEntry({
    businessId: greenMealies.id,
    customerId: uncleJoe.id,
    type: 'credit_given',
    amount: 6,
    note: 'Green mealies',
    dueDate: getTodayISO(),
  });

  // Uncle Joe paid: $6 (settled)
  await createLedgerEntry({
    businessId: greenMealies.id,
    customerId: uncleJoe.id,
    type: 'payment_received',
    amount: 6,
    note: 'Full payment',
  });

  // Return the first business ID as selected
  return floorPolish.id;
}
