import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Account, Entry } from '../types';

const formatAmount = (n: number) => (n ? n.toFixed(2) : '');

export function exportLedgerPdf(account: Account, entries: Entry[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('LEDGER', 40, 40);

  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.text(`Account of ${account.name}`, 40, 62);

  const rows = entries.map((e) => [
    new Date(e.date).toLocaleDateString('en-GB'),
    e.particulars,
    e.folio || '-',
    formatAmount(e.debit),
    formatAmount(e.credit),
    `${e.balance.toFixed(2)} ${e.drOrCr}`,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['Date', 'Particulars', 'Folio', 'Debit', 'Credit', 'Balance']],
    body: rows,
    styles: { font: 'times', fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [31, 66, 53], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    alternateRowStyles: { fillColor: [247, 240, 220] },
  });

  const finalBalance = entries.length ? entries[entries.length - 1] : null;
  if (finalBalance) {
    // @ts-expect-error - lastAutoTable is attached by the autotable plugin at runtime
    const finalY = doc.lastAutoTable.finalY || 90;
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(11);
    doc.text(
      `Total Balance Carried Forward: ${finalBalance.balance.toFixed(2)} ${finalBalance.drOrCr}`,
      40,
      finalY + 24
    );
  }

  doc.save(`${account.name.replace(/[^a-z0-9]+/gi, '_')}_ledger.pdf`);
}
