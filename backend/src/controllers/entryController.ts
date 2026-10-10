import { Request, Response } from 'express';
import Entry from '../models/Entry';
import Account from '../models/Account';
import { recalculateAccountBalances } from '../utils/recalculateBalances';

export async function listEntries(req: Request, res: Response) {
  const { accountId } = req.params;
  const entries = await Entry.find({ account: accountId }).sort({ date: 1, order: 1 });
  res.json(entries);
}

export async function createEntry(req: Request, res: Response) {
  const { accountId } = req.params;
  const { date, particulars, folio = '', debit = 0, credit = 0 } = req.body;

  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: 'Account not found.' });
  if (!particulars || !particulars.trim()) {
    return res.status(400).json({ message: 'Particulars are required.' });
  }
  if (Number(debit) > 0 && Number(credit) > 0) {
    return res.status(400).json({ message: 'An entry cannot have both a debit and a credit amount.' });
  }

  const lastEntry = await Entry.findOne({ account: accountId }).sort({ order: -1 });
  const order = lastEntry ? lastEntry.order + 1 : 1;

  const entry = await Entry.create({
    account: accountId,
    date: date,
    particulars: particulars.trim(),
    folio,
    debit: Number(debit) || 0,
    credit: Number(credit) || 0,
    order,
  });

  await recalculateAccountBalances(accountId);
  const fresh = await Entry.findById(entry._id);
  res.status(201).json(fresh);
}

export async function updateEntry(req: Request, res: Response) {
  const { accountId, entryId } = req.params;
  const { date, particulars, folio, debit, credit } = req.body;

  if (debit !== undefined && credit !== undefined && Number(debit) > 0 && Number(credit) > 0) {
    return res.status(400).json({ message: 'An entry cannot have both a debit and a credit amount.' });
  }

  const entry = await Entry.findOneAndUpdate(
    { _id: entryId, account: accountId },
    {
      ...(date !== undefined && { date }),
      ...(particulars !== undefined && { particulars: particulars.trim() }),
      ...(folio !== undefined && { folio }),
      ...(debit !== undefined && { debit: Number(debit) || 0 }),
      ...(credit !== undefined && { credit: Number(credit) || 0 }),
    },
    { new: true, runValidators: true }
  );
  if (!entry) return res.status(404).json({ message: 'Entry not found.' });

  await recalculateAccountBalances(accountId);
  const fresh = await Entry.findById(entry._id);
  res.json(fresh);
}

export async function deleteEntry(req: Request, res: Response) {
  const { accountId, entryId } = req.params;
  const entry = await Entry.findOneAndDelete({ _id: entryId, account: accountId });
  if (!entry) return res.status(404).json({ message: 'Entry not found.' });
  await recalculateAccountBalances(accountId);
  res.status(204).send();
}

export async function exportCsv(req: Request, res: Response) {
  const { accountId } = req.params;
  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: 'Account not found.' });

  const entries = await Entry.find({ account: accountId }).sort({ date: 1, order: 1 });

  const header = ['Date', 'Particulars', 'Folio', 'Debit', 'Credit', 'Balance'];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = entries.map((e) => [
    new Date(e.date).toLocaleDateString('en-GB'),
    escape(e.particulars),
    e.folio || '-',
    e.debit ? e.debit.toFixed(2) : '',
    e.credit ? e.credit.toFixed(2) : '',
    `${e.balance.toFixed(2)} ${e.drOrCr}`,
  ]);

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `${account.name.replace(/[^a-z0-9]+/gi, '_')}_ledger.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
