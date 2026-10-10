import { Schema, model, Document, Types } from 'mongoose';
import type { DrCr } from '../types';

export interface IEntry extends Document {
  account: Types.ObjectId;
  date: Date;
  particulars: string;
  folio: string;
  debit: number;
  credit: number;
  // Computed & persisted on every write so reads never need recalculation:
  drOrCr: DrCr;
  balance: number;
  order: number; // insertion sequence, used as the tie-breaker for same-day entries
}

const entrySchema = new Schema<IEntry>({
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  date: { type: Date, default: Date.now, required: true },
  particulars: { type: String, required: true, trim: true },
  folio: { type: String, default: '', trim: true },
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },
  drOrCr: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' },
  balance: { type: Number, default: 0 },
  order: { type: Number, required: true },
});

entrySchema.index({ account: 1, date: 1, order: 1 });

export default model<IEntry>('Entry', entrySchema);
