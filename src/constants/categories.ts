import { Category } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'อาหารและเครื่องดื่ม',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316', // Orange
    bgColor: '#ffedd5',
  },
  {
    id: 'transport',
    name: 'การเดินทาง / น้ำมัน',
    type: 'expense',
    icon: 'Car',
    color: '#0284c7', // Sky
    bgColor: '#e0f2fe',
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง / ของใช้',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899', // Pink
    bgColor: '#fce7f3',
  },
  {
    id: 'bills',
    name: 'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต',
    type: 'expense',
    icon: 'Receipt',
    color: '#eab308', // Yellow
    bgColor: '#fef9c3',
  },
  {
    id: 'housing',
    name: 'ค่าที่พัก / ค่าเช่า',
    type: 'expense',
    icon: 'Home',
    color: '#6366f1', // Indigo
    bgColor: '#e0e7ff',
  },
  {
    id: 'entertainment',
    name: 'บันเทิง / ท่องเที่ยว',
    type: 'expense',
    icon: 'Film',
    color: '#8b5cf6', // Purple
    bgColor: '#ede9fe',
  },
  {
    id: 'health',
    name: 'สุขภาพ / ยารักษาโรค',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ef4444', // Red
    bgColor: '#fee2e2',
  },
  {
    id: 'education',
    name: 'การศึกษา / หนังสือ',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#14b8a6', // Teal
    bgColor: '#ccfbf1',
  },
  {
    id: 'other_expense',
    name: 'ค่าใช้จ่ายอื่นๆ',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b', // Slate
    bgColor: '#f1f5f9',
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: 'เงินเดือนประจำ',
    type: 'income',
    icon: 'Banknote',
    color: '#10b981', // Emerald
    bgColor: '#d1fae5',
  },
  {
    id: 'business',
    name: 'ธุรกิจ / ค้าขาย',
    type: 'income',
    icon: 'Store',
    color: '#059669', // Dark Emerald
    bgColor: '#a7f3d0',
  },
  {
    id: 'freelance',
    name: 'งานพิเศษ / ฟรีแลนซ์',
    type: 'income',
    icon: 'Briefcase',
    color: '#06b6d4', // Cyan
    bgColor: '#cffafe',
  },
  {
    id: 'investment',
    name: 'ผลตอบแทน / ปันผล',
    type: 'income',
    icon: 'TrendingUp',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
  },
  {
    id: 'bonus',
    name: 'โบนัส / ค่าคอมมิชชัน',
    type: 'income',
    icon: 'Award',
    color: '#f59e0b', // Amber
    bgColor: '#fef3c7',
  },
  {
    id: 'gift',
    name: 'ของขวัญ / ช่วยเหลือ',
    type: 'income',
    icon: 'Gift',
    color: '#a855f7', // Purple
    bgColor: '#f3e8ff',
  },
  {
    id: 'other_income',
    name: 'รายรับอื่นๆ',
    type: 'income',
    icon: 'PlusCircle',
    color: '#64748b', // Slate
    bgColor: '#f1f5f9',
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category {
  const found = ALL_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return {
    id,
    name: 'อื่นๆ',
    type: 'expense',
    icon: 'HelpCircle',
    color: '#94a3b8',
    bgColor: '#f1f5f9',
  };
}
