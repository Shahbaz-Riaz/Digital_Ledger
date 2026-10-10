export type DrCr = 'Dr' | 'Cr';

export interface EntryDTO {
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

export interface AccountDTO {
  _id: string;
  name: string;
  openingBalance: number;
  openingType: DrCr;
  createdAt: string;
}
