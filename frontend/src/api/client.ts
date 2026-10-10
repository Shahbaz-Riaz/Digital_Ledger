import type { Account, Entry, NewEntryInput } from '../types';

// Relative by default: the Vite dev server proxies /api to the backend (see
// vite.config.ts), and in Docker, nginx does the same in front of the
// built frontend — so the same code works unmodified in both setups.
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listAccounts: () => request<Account[]>('/accounts'),
  createAccount: (data: { name: string; openingBalance: number; openingType: 'Dr' | 'Cr' }) =>
    request<Account>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, data: Partial<Pick<Account, 'name' | 'openingBalance' | 'openingType'>>) =>
    request<Account>(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: (id: string) => request<void>(`/accounts/${id}`, { method: 'DELETE' }),

  listEntries: (accountId: string) => request<Entry[]>(`/accounts/${accountId}/entries`),
  createEntry: (accountId: string, data: NewEntryInput) =>
    request<Entry>(`/accounts/${accountId}/entries`, { method: 'POST', body: JSON.stringify(data) }),
  updateEntry: (accountId: string, entryId: string, data: Partial<NewEntryInput>) =>
    request<Entry>(`/accounts/${accountId}/entries/${entryId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEntry: (accountId: string, entryId: string) =>
    request<void>(`/accounts/${accountId}/entries/${entryId}`, { method: 'DELETE' }),

  csvExportUrl: (accountId: string) => `${API_URL}/accounts/${accountId}/entries/export/csv`,
};
