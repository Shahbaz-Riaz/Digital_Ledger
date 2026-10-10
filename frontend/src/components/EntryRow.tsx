import { useState } from 'react';
import type { Entry, NewEntryInput } from '../types';

interface Props {
  entry: Entry;
  onUpdate: (id: string, data: Partial<NewEntryInput>) => Promise<void>;
  onDelete: (id: string) => void;
}

const fmt = (n: number) => (n ? n.toFixed(2) : '');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB');

export default function EntryRow({ entry, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<NewEntryInput>({
    date: entry.date.slice(0, 10),
    particulars: entry.particulars,
    folio: entry.folio,
    debit: entry.debit,
    credit: entry.credit,
  });

  const save = async () => {
    await onUpdate(entry._id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <tr className="entry-form-row">
        <td>
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </td>
        <td>
          <input value={draft.particulars} onChange={(e) => setDraft({ ...draft, particulars: e.target.value })} />
        </td>
        <td>
          <input value={draft.folio} onChange={(e) => setDraft({ ...draft, folio: e.target.value })} />
        </td>
        <td>
          <input
            type="number"
            value={draft.debit || ''}
            onChange={(e) => setDraft({ ...draft, debit: Number(e.target.value) || 0, credit: 0 })}
          />
        </td>
        <td>
          <input
            type="number"
            value={draft.credit || ''}
            onChange={(e) => setDraft({ ...draft, credit: Number(e.target.value) || 0, debit: 0 })}
          />
        </td>
        <td className="num balance-cell">
          {entry.balance.toFixed(2)} <span className="drcr-tag">{entry.drOrCr}</span>
        </td>
        <td>
          <button className="row-delete" style={{ visibility: 'visible' }} onClick={save} title="Save">
            ✓
          </button>
          <button className="row-delete" style={{ visibility: 'visible' }} onClick={() => setEditing(false)} title="Cancel">
            ✕
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr onDoubleClick={() => setEditing(true)}>
      <td>{fmtDate(entry.date)}</td>
      <td>{entry.particulars}</td>
      <td>{entry.folio || '-'}</td>
      <td className="num">{fmt(entry.debit)}</td>
      <td className="num credit-amt">{fmt(entry.credit)}</td>
      <td className="num balance-cell">
        {entry.balance.toFixed(2)} <span className="drcr-tag">{entry.drOrCr}</span>
      </td>
      <td>
        <button className="row-delete" onClick={() => onDelete(entry._id)} title="Delete entry">
          ✕
        </button>
      </td>
    </tr>
  );
}
