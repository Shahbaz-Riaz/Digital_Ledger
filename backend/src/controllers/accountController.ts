import { Request, Response } from 'express';
import Account from '../models/Account';
import Entry from '../models/Entry';
import { recalculateAccountBalances } from '../utils/recalculateBalances';

export async function listAccounts(_req: Request, res: Response) {
  const accounts = await Account.find().sort({ createdAt: 1 });
  res.json(accounts);
}

export async function createAccount(req: Request, res: Response) {
  const { name, openingBalance = 0, openingType = 'Dr' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Account name is required.' });
  }
  const account = await Account.create({ name: name.trim(), openingBalance, openingType });
  res.status(201).json(account);
}

export async function updateAccount(req: Request, res: Response) {
  const { id } = req.params;
  const { name, openingBalance, openingType } = req.body;
  const account = await Account.findByIdAndUpdate(
    id,
    { ...(name !== undefined && { name }), ...(openingBalance !== undefined && { openingBalance }), ...(openingType !== undefined && { openingType }) },
    { new: true, runValidators: true }
  );
  if (!account) return res.status(404).json({ message: 'Account not found.' });
  if (openingBalance !== undefined || openingType !== undefined) {
    await recalculateAccountBalances(id);
  }
  res.json(account);
}

export async function deleteAccount(req: Request, res: Response) {
  const { id } = req.params;
  const account = await Account.findByIdAndDelete(id);
  if (!account) return res.status(404).json({ message: 'Account not found.' });
  await Entry.deleteMany({ account: id });
  res.status(204).send();
}
