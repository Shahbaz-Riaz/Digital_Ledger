export type DrCr = 'Dr' | 'Cr';

export interface Account {
  _id: string;
  name: string;
  openingBalance: number;
  openingType: DrCr;
  createdAt: string;
}

export interface Entry {
  _id: string;
  account: string;
  date: string;
  particulars: string;
  folio: string;
  debit: number;
  credit: number;
  drOrCr: DrCr;
  balance: number;
  order: number;
}

export interface NewEntryInput {
  date: string;
  particulars: string;
  folio: string;
  debit: number;
  credit: number;
}
