import { useState } from 'react';
import type { Account, DrCr } from '../types';

interface Props {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (data: { name: string; openingBalance: number; openingType: DrCr }) => Promise<void>;
  onDelete: (id: string) => void;
}

export default function Sidebar({ accounts, selectedId, onSelect, onCreate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingType, setOpeningType] = useState<DrCr>('Dr');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate({ name: name.trim(), openingBalance: Number(openingBalance) || 0, openingType });
      setName('');
      setOpeningBalance('');
      setOpeningType('Dr');
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Ledger</h1>
      <ul className="account-list">
        {accounts.map((acc) => (
          <li
            key={acc._id}
            className={`account-item ${acc._id === selectedId ? 'active' : ''}`}
            onClick={() => onSelect(acc._id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="account-dot" />
              {acc.name}
            </span>
            <button
              className="account-delete"
              title="Delete account"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete the account "${acc.name}" and all its entries?`)) onDelete(acc._id);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {!showForm && (
        <button className="new-account-btn" onClick={() => setShowForm(true)}>
          + New account
        </button>
      )}

      {showForm && (
        <div className="new-account-form">
          <input
            autoFocus
            placeholder="Account name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="form-row">
            <input
              type="number"
              placeholder="Opening balance"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
            <select value={openingType} onChange={(e) => setOpeningType(e.target.value as DrCr)}>
              <option value="Dr">Dr</option>
              <option value="Cr">Cr</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : 'Create'}
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
