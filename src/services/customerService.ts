import { db } from './db';
import type { Customer } from '../types';
import { generateId } from '../lib/ids';
import { getCurrentTimestamp } from '../lib/dates';

export async function getCustomersByBusiness(businessId: string): Promise<Customer[]> {
  return await db.customers.where('businessId').equals(businessId).toArray();
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return await db.customers.get(id);
}

export async function createCustomer(
  businessId: string,
  data: { name: string; phone?: string; notes?: string }
): Promise<Customer> {
  const now = getCurrentTimestamp();
  const customer: Customer = {
    id: generateId(),
    businessId,
    name: data.name,
    phone: data.phone,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.customers.add(customer);
  return customer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
  await db.customers.update(id, {
    ...updates,
    updatedAt: getCurrentTimestamp(),
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  // Delete all related ledger entries
  await db.ledgerEntries.where('customerId').equals(id).delete();
  await db.customers.delete(id);
}

export async function searchCustomers(businessId: string, query: string): Promise<Customer[]> {
  const allCustomers = await getCustomersByBusiness(businessId);
  const lowerQuery = query.toLowerCase();
  
  return allCustomers.filter(customer => 
    customer.name.toLowerCase().includes(lowerQuery) ||
    customer.phone?.toLowerCase().includes(lowerQuery)
  );
}
