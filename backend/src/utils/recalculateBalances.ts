import Entry from '../models/Entry';
import Account from '../models/Account';
import type { DrCr } from '../types';

/**
 * A ledger's running balance depends on every entry before it, so whenever an
 * entry is added, edited, or removed we recompute the whole account in one
 * pass. This keeps the read path trivial (just return stored balances) at the
 * cost of a cheap O(n) rewrite on every write - the right trade-off for a
 * ledger, where entry counts per account are small and reads vastly
 * outnumber writes.
 */
export async function recalculateAccountBalances(accountId: string): Promise<void> {
  const account = await Account.findById(accountId);
  if (!account) return;

  const entries = await Entry.find({ account: accountId }).sort({ date: 1, order: 1 });

  // Positive = Dr balance, negative = Cr balance (standard signed-ledger convention).
  let signedBalance = account.openingType === 'Dr' ? account.openingBalance : -account.openingBalance;

  const bulkOps = entries.map((entry) => {
    signedBalance = signedBalance + entry.debit - entry.credit;
    const drOrCr: DrCr = signedBalance >= 0 ? 'Dr' : 'Cr';
    const balance = Math.abs(signedBalance);
    return {
      updateOne: {
        filter: { _id: entry._id },
        update: { $set: { drOrCr, balance } },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Entry.bulkWrite(bulkOps);
  }
}
