import { useState } from 'react';
import type { NewEntryInput } from '../types';

interface Props {
  onAdd: (data: NewEntryInput) => Promise<void>;
}

const empty: NewEntryInput = {
  date: new Date().toISOString().slice(0, 10),
  particulars: '',
  folio: '',
  debit: 0,
  credit: 0,
};

export default function NewEntryRow({ onAdd }: Props) {
  const [draft, setDraft] = useState<NewEntryInput>(empty);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!draft.particulars.trim()) return;
    setSaving(true);
    try {
      await onAdd(draft);
      setDraft({ ...empty, date: draft.date });
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="entry-form-row">
      <td>
        <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
      </td>
      <td>
        <input
          placeholder="New entry particulars"
          value={draft.particulars}
          onChange={(e) => setDraft({ ...draft, particulars: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </td>
      <td>
        <input placeholder="-" value={draft.folio} onChange={(e) => setDraft({ ...draft, folio: e.target.value })} />
      </td>
      <td>
        <input
          type="number"
          placeholder="0.00"
          value={draft.debit || ''}
          onChange={(e) => setDraft({ ...draft, debit: Number(e.target.value) || 0, credit: 0 })}
        />
      </td>
      <td>
        <input
          type="number"
          placeholder="0.00"
          value={draft.credit || ''}
          onChange={(e) => setDraft({ ...draft, credit: Number(e.target.value) || 0, debit: 0 })}
        />
      </td>
      <td className="num">—</td>
      <td>
        <button className="row-delete" style={{ visibility: 'visible' }} onClick={submit} disabled={saving} title="Add entry">
          ＋
        </button>
      </td>
    </tr>
  );
}
