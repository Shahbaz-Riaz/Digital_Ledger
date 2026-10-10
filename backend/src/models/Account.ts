import { Schema, model, Document } from 'mongoose';
import type { DrCr } from '../types';

export interface IAccount extends Document {
  name: string;
  openingBalance: number;
  openingType: DrCr;
  createdAt: Date;
}

const accountSchema = new Schema<IAccount>({
  name: { type: String, required: true, trim: true },
  openingBalance: { type: Number, default: 0, min: 0 },
  openingType: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' },
  createdAt: { type: Date, default: Date.now },
});

export default model<IAccount>('Account', accountSchema);
