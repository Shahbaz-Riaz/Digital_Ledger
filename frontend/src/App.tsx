import { useEffect, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import LedgerBook from './components/LedgerBook';
import { api } from './api/client';
import type { Account, DrCr, Entry, NewEntryInput } from './types';
import './styles/ledger.css';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.listAccounts();
      setAccounts(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0]._id);
    } catch (err: any) {
      setError(err.message);
    }
  }, [selectedId]);

  const loadEntries = useCallback(async (accountId: string) => {
    try {
      const data = await api.listEntries(accountId);
      setEntries(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadEntries(selectedId);
    else setEntries([]);
  }, [selectedId, loadEntries]);

  const handleCreateAccount = async (data: { name: string; openingBalance: number; openingType: DrCr }) => {
    setError(null);
    try {
      const account = await api.createAccount(data);
      setAccounts((prev) => [...prev, account]);
      setSelectedId(account._id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setError(null);
    try {
      await api.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a._id !== id));
      if (selectedId === id) {
        const remaining = accounts.filter((a) => a._id !== id);
        setSelectedId(remaining.length ? remaining[0]._id : null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddEntry = async (data: NewEntryInput) => {
    if (!selectedId) return;
    setError(null);
    try {
      const entry = await api.createEntry(selectedId, data);
      setEntries((prev) => [...prev, entry]);
      // Balances above the new row may shift if it wasn't inserted at the end
      // chronologically, so re-sync from the server rather than trusting the
      // optimistic append alone.
      loadEntries(selectedId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateEntry = async (entryId: string, data: Partial<NewEntryInput>) => {
    if (!selectedId) return;
    setError(null);
    try {
      await api.updateEntry(selectedId, entryId, data);
      loadEntries(selectedId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedId) return;
    setError(null);
    try {
      await api.deleteEntry(selectedId, entryId);
      loadEntries(selectedId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedAccount = accounts.find((a) => a._id === selectedId) || null;
  const pageNo = selectedAccount ? accounts.findIndex((a) => a._id === selectedAccount._id) + 1 : 1;

  return (
    <div className="app-shell">
      <Sidebar
        accounts={accounts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreateAccount}
        onDelete={handleDeleteAccount}
      />
      <main className="ledger-main">
        <div style={{ width: '100%', maxWidth: 980 }}>
          {error && <div className="error-banner">{error}</div>}
          {selectedAccount ? (
            <LedgerBook
              account={selectedAccount}
              entries={entries}
              pageNo={pageNo}
              onAdd={handleAddEntry}
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
            />
          ) : (
            <div className="ledger-book">
              <p className="empty-state">Create an account from the sidebar to start a new ledger page.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
