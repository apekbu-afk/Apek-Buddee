import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Check, AlertCircle, Trash2 } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { getCurrentTime, getTodayISO } from '../utils/date';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
}

const QUICK_AMOUNTS = [50, 100, 300, 500, 1000];
const QUICK_EXPENSE_TAGS = ['ข้าวเที่ยง', 'กาแฟ', 'เซเว่น', 'ค่าน้ำมัน', 'ค่ารถ', 'ของใช้'];
const QUICK_INCOME_TAGS = ['เงินเดือน', 'ขายของ', 'เบี้ยเลี้ยง', 'โบนัส', 'เงินโอน'];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState<string>(getTodayISO());
  const [time, setTime] = useState<string>(getCurrentTime());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset or initialize state when opening / editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getCurrentTime());
      setNote(editingTransaction.note || '');

      const cats = editingTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      const found = cats.find((c) => c.id === editingTransaction.categoryId) || cats[0];
      setSelectedCategory(found);
    } else {
      setType('expense');
      setAmountStr('');
      setSelectedCategory(EXPENSE_CATEGORIES[0]);
      setDate(getTodayISO());
      setTime(getCurrentTime());
      setNote('');
    }
    setError('');
  }, [editingTransaction, isOpen]);

  // When type toggles, switch default category to that type's first category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const catList = newType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setSelectedCategory(catList[0]);
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addValue));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }

    if (!selectedCategory) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        date,
        time,
        note: note.trim() || undefined,
      },
      editingTransaction ? editingTransaction.id : undefined
    );

    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const quickTags = type === 'expense' ? QUICK_EXPENSE_TAGS : QUICK_INCOME_TAGS;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity">
      <div
        id="quick-add-modal-container"
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-stone-900">
              {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {editingTransaction && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                    onDelete(editingTransaction.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                title="ลบรายการ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-add-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl gap-1">
            <button
              type="button"
              id="type-expense-btn"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              id="type-income-btn"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="amount-input" className="block text-xs font-medium text-stone-500">
              จำนวนเงิน (บาท)
            </label>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold ${
                  type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                ฿
              </span>
              <input
                id="amount-input"
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-4 py-3.5 text-3xl font-bold rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <span className="text-[11px] text-stone-400 shrink-0">บวกเพิ่ม:</span>
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-500">
              หมวดหมู่ ({selectedCategory.name})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {currentCategories.map((cat) => {
                const isSelected = selectedCategory.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                        : 'border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform"
                      style={{
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight line-clamp-1 w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="tx-date-input" className="flex items-center gap-1 text-xs font-medium text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>วันที่</span>
              </label>
              <input
                id="tx-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tx-time-input" className="flex items-center gap-1 text-xs font-medium text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                <span>เวลา</span>
              </label>
              <input
                id="tx-time-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Note / Remarks with Quick Suggestions */}
          <div className="space-y-2">
            <label htmlFor="tx-note-input" className="flex items-center gap-1 text-xs font-medium text-stone-500">
              <FileText className="w-3.5 h-3.5" />
              <span>บันทึกช่วยจำ (ไม่บังคับ)</span>
            </label>
            <input
              id="tx-note-input"
              type="text"
              placeholder="เช่น กาแฟอเมซอน, ก๋วยเตี๋ยวเรือ, ค่าส่วนกลาง..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-normal rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden focus:border-emerald-600"
            />

            {/* Quick tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[11px] text-stone-400 shrink-0">คำยอดนิยม:</span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNote((prev) => (prev ? `${prev} ${tag}` : tag))}
                  className="px-2 py-0.5 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md shrink-0 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              id="save-transaction-btn"
              type="submit"
              className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
