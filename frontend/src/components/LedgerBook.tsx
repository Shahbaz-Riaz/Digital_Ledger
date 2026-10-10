import type { Account, Entry, NewEntryInput } from '../types';
import EntryRow from './EntryRow';
import NewEntryRow from './NewEntryRow';
import { exportLedgerPdf } from '../utils/exportPdf';
import { api } from '../api/client';

interface Props {
  account: Account;
  entries: Entry[];
  pageNo: number;
  onAdd: (data: NewEntryInput) => Promise<void>;
  onUpdate: (id: string, data: Partial<NewEntryInput>) => Promise<void>;
  onDelete: (id: string) => void;
}

export default function LedgerBook({ account, entries, pageNo, onAdd, onUpdate, onDelete }: Props) {
  const last = entries[entries.length - 1];

  return (
    <div className="ledger-book">
      <div className="ledger-topbar">
        <div>
          <div className="ledger-brand">Ledger</div>
        </div>
        <div className="ledger-toolbar">
          <button className="toolbar-btn" onClick={() => window.print()}>
            Print
          </button>
          <button className="toolbar-btn" onClick={() => exportLedgerPdf(account, entries)}>
            Export PDF
          </button>
          <a className="toolbar-btn" href={api.csvExportUrl(account._id)} style={{ textDecoration: 'none' }}>
            Export CSV
          </a>
        </div>
        <div className="ledger-page-no">{pageNo}</div>
      </div>

      <div className="account-heading">
        <span className="label">Account of</span>
        <span className="name">{account.name}</span>
      </div>

      <div className="ledger-table-wrap">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Particulars</th>
              <th>Folio</th>
              <th className="num">Debit</th>
              <th className="num">Credit</th>
              <th className="num">Balance</th>
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  No entries yet — add the first transaction below.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <EntryRow key={entry._id} entry={entry} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
            <NewEntryRow onAdd={onAdd} />
          </tbody>
        </table>
      </div>

      <div className="ledger-footer">
        <span className="label">Total Balance Carried Forward</span>
        <span className="value">
          {last ? `${last.balance.toFixed(2)} ${last.drOrCr}` : `${account.openingBalance.toFixed(2)} ${account.openingType}`}
        </span>
      </div>
    </div>
  );
}
