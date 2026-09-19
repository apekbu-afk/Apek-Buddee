import * as XLSX from 'xlsx';
import { Transaction } from '../types';
import { formatThaiDate, formatThaiMonthYear, toBuddhistYear } from './date';

interface ExportOptions {
  transactions: Transaction[];
  year: number;
  month: number;
  isAllTime?: boolean;
}

export function exportToExcel({ transactions, year, month, isAllTime = false }: ExportOptions): void {
  const wb = XLSX.utils.book_new();

  // Sort transactions by date descending
  const sorted = [...transactions].sort((a, b) => {
    return new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
  });

  const totalIncome = sorted.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = sorted.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const monthLabel = isAllTime ? 'ประวัติทั้งหมด' : `ประจำเดือน ${formatThaiMonthYear(year, month)}`;

  // Sheet 1: รายการธุรกรรม
  const txSheetData: (string | number)[][] = [
    ['รายงานสรุปรายรับ - รายจ่าย', monthLabel],
    ['วันที่ส่งออกข้อมูล', formatThaiDate(new Date().toISOString().split('T')[0], 'full')],
    [],
    ['สรุปยอดรวม', ''],
    ['รายรับรวม (บาท)', totalIncome],
    ['รายจ่ายรวม (บาท)', totalExpense],
    ['คงเหลือสุทธิ (บาท)', balance],
    ['จำนวนรายการทั้งหมด', sorted.length],
    [],
    ['ลำดับ', 'วันที่', 'เวลา', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ'],
  ];

  sorted.forEach((t, index) => {
    txSheetData.push([
      index + 1,
      formatThaiDate(t.date, 'short'),
      t.time || '-',
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.categoryName,
      t.type === 'income' ? t.amount : -t.amount,
      t.note || '-',
    ]);
  });

  const wsTx = XLSX.utils.aoa_to_sheet(txSheetData);

  // Set column widths for readability
  wsTx['!cols'] = [
    { wch: 8 },  // ลำดับ
    { wch: 18 }, // วันที่
    { wch: 10 }, // เวลา
    { wch: 12 }, // ประเภท
    { wch: 26 }, // หมวดหมู่
    { wch: 18 }, // จำนวนเงิน
    { wch: 30 }, // หมายเหตุ
  ];

  XLSX.utils.book_append_sheet(wb, wsTx, 'รายการรายรับรายจ่าย');

  // Sheet 2: สรุปแยกตามหมวดหมู่ (Category Breakdown)
  const expenseByCategory: Record<string, { name: string; total: number; count: number }> = {};
  const incomeByCategory: Record<string, { name: string; total: number; count: number }> = {};

  sorted.forEach((t) => {
    const targetMap = t.type === 'expense' ? expenseByCategory : incomeByCategory;
    if (!targetMap[t.categoryName]) {
      targetMap[t.categoryName] = { name: t.categoryName, total: 0, count: 0 };
    }
    targetMap[t.categoryName].total += t.amount;
    targetMap[t.categoryName].count += 1;
  });

  const catSheetData: (string | number)[][] = [
    ['สรุปสัดส่วนตามหมวดหมู่', monthLabel],
    [],
    ['หมวดหมู่รายจ่าย', 'ยอดรวม (บาท)', 'สัดส่วน (%)', 'จำนวนครั้ง'],
  ];

  Object.values(expenseByCategory)
    .sort((a, b) => b.total - a.total)
    .forEach((item) => {
      const pct = totalExpense > 0 ? Number(((item.total / totalExpense) * 100).toFixed(1)) : 0;
      catSheetData.push([item.name, item.total, `${pct}%`, item.count]);
    });

  catSheetData.push([]);
  catSheetData.push(['หมวดหมู่รายรับ', 'ยอดรวม (บาท)', 'สัดส่วน (%)', 'จำนวนครั้ง']);

  Object.values(incomeByCategory)
    .sort((a, b) => b.total - a.total)
    .forEach((item) => {
      const pct = totalIncome > 0 ? Number(((item.total / totalIncome) * 100).toFixed(1)) : 0;
      catSheetData.push([item.name, item.total, `${pct}%`, item.count]);
    });

  const wsCat = XLSX.utils.aoa_to_sheet(catSheetData);
  wsCat['!cols'] = [
    { wch: 28 }, // หมวดหมู่
    { wch: 18 }, // ยอดรวม
    { wch: 14 }, // สัดส่วน
    { wch: 14 }, // จำนวนครั้ง
  ];

  XLSX.utils.book_append_sheet(wb, wsCat, 'สรุปแยกตามหมวดหมู่');

  // Generate file name
  const bYear = toBuddhistYear(year);
  const filename = isAllTime
    ? `รายงานรายรับรายจ่าย_ทั้งหมด_${new Date().toISOString().split('T')[0]}.xlsx`
    : `รายงานรายรับรายจ่าย_${year + 543}_${String(month + 1).padStart(2, '0')}.xlsx`;

  XLSX.writeFile(wb, filename);
}
