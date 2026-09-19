import { Transaction } from '../types';

const STORAGE_KEY = 'thai_expense_tracker_records_v1';

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialData = generateInitialSampleData();
      saveTransactions(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initialData = generateInitialSampleData();
    saveTransactions(initialData);
    return initialData;
  } catch (err) {
    console.error('Failed to read from localStorage', err);
    return generateInitialSampleData();
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

/**
 * Generate realistic sample data for the current month and prior 2 months
 * to demonstrate auto monthly summaries and graphs.
 */
function generateInitialSampleData(): Transaction[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const todayDate = now.getDate();

  const transactions: Transaction[] = [];

  const addTx = (
    year: number,
    month: number,
    day: number,
    type: 'expense' | 'income',
    amount: number,
    categoryId: string,
    categoryName: string,
    note?: string,
    time = '12:30'
  ) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    transactions.push({
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      categoryId,
      categoryName,
      date: dateStr,
      time,
      note,
      createdAt: new Date(`${dateStr}T${time}:00`).getTime(),
    });
  };

  // 1. Current Month Sample Data (from 1st up to today)
  // Salary
  addTx(currentYear, currentMonth, 1, 'income', 38000, 'salary', 'เงินเดือนประจำ', 'เงินเดือนเข้าบัญชีหลัก', '09:00');
  // Freelance / Bonus
  if (todayDate >= 10) {
    addTx(currentYear, currentMonth, 10, 'income', 6500, 'freelance', 'งานพิเศษ / ฟรีแลนซ์', 'รับจ้างออกแบบกราฟิก', '14:20');
  }
  // Rent / Housing
  addTx(currentYear, currentMonth, 2, 'expense', 7500, 'housing', 'ค่าที่พัก / ค่าเช่า', 'ค่าเช่าคอนโด', '10:00');
  // Utilities
  addTx(currentYear, currentMonth, 3, 'expense', 1850, 'bills', 'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต', 'ค่าไฟ+เน็ตบ้าน', '11:15');
  // Food & Drink
  addTx(currentYear, currentMonth, 4, 'expense', 260, 'food', 'อาหารและเครื่องดื่ม', 'ข้าวแกง + กาแฟโบราณ', '08:30');
  addTx(currentYear, currentMonth, 5, 'expense', 450, 'food', 'อาหารและเครื่องดื่ม', 'อาหารเย็นชาบูกับเพื่อน', '18:45');
  // Transport
  addTx(currentYear, currentMonth, 6, 'expense', 900, 'transport', 'การเดินทาง / น้ำมัน', 'เติมน้ำมันรถยนต์ E20', '07:45');
  // Shopping
  addTx(currentYear, currentMonth, 8, 'expense', 1250, 'shopping', 'ช้อปปิ้ง / ของใช้', 'ซื้อของใช้ในบ้าน Big C', '16:00');
  
  if (todayDate >= 12) {
    addTx(currentYear, currentMonth, 12, 'expense', 380, 'food', 'อาหารและเครื่องดื่ม', 'กาแฟคาเฟ่ + ครัวซองต์', '13:00');
    addTx(currentYear, currentMonth, 13, 'expense', 150, 'transport', 'การเดินทาง / น้ำมัน', 'ค่ารถไฟฟ้า BTS', '08:15');
  }
  if (todayDate >= 15) {
    addTx(currentYear, currentMonth, 15, 'expense', 540, 'food', 'อาหารและเครื่องดื่ม', 'ก๋วยเตี๋ยวเนื้อ + ชานม', '12:30');
    addTx(currentYear, currentMonth, 16, 'expense', 320, 'health', 'สุขภาพ / ยารักษาโรค', 'วิตามินซีและยาแก้แพ้', '17:30');
  }
  if (todayDate >= 18) {
    addTx(currentYear, currentMonth, 18, 'expense', 350, 'entertainment', 'บันเทิง / ท่องเที่ยว', 'ตั๋วชมภาพยนตร์ SF', '19:00');
  }

  // 2. Previous Month Data (for comparison graphs)
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const pYear = prevMonthDate.getFullYear();
  const pMonth = prevMonthDate.getMonth();

  addTx(pYear, pMonth, 1, 'income', 38000, 'salary', 'เงินเดือนประจำ', 'เงินเดือนประจำเดือนก่อน', '09:00');
  addTx(pYear, pMonth, 15, 'income', 4500, 'business', 'ธุรกิจ / ค้าขาย', 'ขายเสื้อผ้ามือสองออนไลน์', '15:30');
  addTx(pYear, pMonth, 2, 'expense', 7500, 'housing', 'ค่าที่พัก / ค่าเช่า', 'ค่าเช่าคอนโด', '10:00');
  addTx(pYear, pMonth, 3, 'expense', 1920, 'bills', 'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต', 'ค่าไฟ+ค่าน้ำ', '11:00');
  addTx(pYear, pMonth, 7, 'expense', 1100, 'transport', 'การเดินทาง / น้ำมัน', 'เติมน้ำมันรถยนต์', '08:00');
  addTx(pYear, pMonth, 11, 'expense', 3400, 'shopping', 'ช้อปปิ้ง / ของใช้', 'เสื้อผ้าและรองเท้าทำงาน', '14:30');
  addTx(pYear, pMonth, 16, 'expense', 1800, 'food', 'อาหารและเครื่องดื่ม', 'ปาร์ตี้วันเกิด', '19:30');
  addTx(pYear, pMonth, 22, 'expense', 850, 'entertainment', 'บันเทิง / ท่องเที่ยว', 'ตั๋วคอนเสิร์ตและเครื่องดื่ม', '20:00');
  addTx(pYear, pMonth, 27, 'expense', 1200, 'education', 'การศึกษา / หนังสือ', 'คอร์สเรียนออนไลน์เสริมทักษะ', '16:00');

  // 3. Two Months Ago (for trend graph)
  const twoMonthsAgoDate = new Date(currentYear, currentMonth - 2, 1);
  const ppYear = twoMonthsAgoDate.getFullYear();
  const ppMonth = twoMonthsAgoDate.getMonth();

  addTx(ppYear, ppMonth, 1, 'income', 38000, 'salary', 'เงินเดือนประจำ', 'เงินเดือน', '09:00');
  addTx(ppYear, ppMonth, 2, 'expense', 7500, 'housing', 'ค่าที่พัก / ค่าเช่า', 'ค่าห้อง', '10:00');
  addTx(ppYear, ppMonth, 4, 'expense', 1780, 'bills', 'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต', 'ค่าไฟ', '11:00');
  addTx(ppYear, ppMonth, 12, 'expense', 4200, 'food', 'อาหารและเครื่องดื่ม', 'รวมค่าอาหารทั้งเดือน', '18:00');
  addTx(ppYear, ppMonth, 18, 'expense', 2100, 'transport', 'การเดินทาง / น้ำมัน', 'ค่าเดินทาง', '09:00');
  addTx(ppYear, ppMonth, 25, 'expense', 1500, 'shopping', 'ช้อปปิ้ง / ของใช้', 'ของใช้ทั่วไป', '15:00');

  return transactions;
}
