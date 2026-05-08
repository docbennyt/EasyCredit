import { db } from './db';
import type { Business } from '../types';
import { generateId } from '../lib/ids';
import { getCurrentTimestamp } from '../lib/dates';

export async function getAllBusinesses(): Promise<Business[]> {
  return await db.businesses.toArray();
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  return await db.businesses.get(id);
}

export async function createBusiness(name: string, currency: string = 'USD'): Promise<Business> {
  const now = getCurrentTimestamp();
  const business: Business = {
    id: generateId(),
    name,
    currency,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.businesses.add(business);
  return business;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<void> {
  await db.businesses.update(id, {
    ...updates,
    updatedAt: getCurrentTimestamp(),
  });
}

export async function deleteBusiness(id: string): Promise<void> {
  // Delete all related data
  await db.customers.where('businessId').equals(id).delete();
  await db.ledgerEntries.where('businessId').equals(id).delete();
  await db.businesses.delete(id);
}
