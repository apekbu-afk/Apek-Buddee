import React, { useState, useMemo } from 'react';
import { Search, Edit3, Trash2, SlidersHorizontal, ReceiptText } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatBaht, formatThaiDate } from '../utils/date';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryById } from '../constants/categories';

interface TransactionListProps {
  transactions: Transaction[];
  currentYear: number;
  currentMonth: number;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentYear,
  currentMonth,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Filter by current month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const parts = t.date.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === currentYear && m === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  // 2. Filter by search & type
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCat = t.categoryName.toLowerCase().includes(q);
        const matchNote = t.note?.toLowerCase().includes(q);
        if (!matchCat && !matchNote) return false;
      }
      return true;
    });
  }, [monthTransactions, filterType, searchQuery]);

  // 3. Group by date descending
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const sorted = [...filteredTransactions].sort((a, b) => {
      return new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    });

    sorted.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });

    return groups;
  }, [filteredTransactions]);

  const dates = Object.keys(groupedByDate);

  return (
    <div id="transaction-history-section" className="space-y-3">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-stone-900">
            รายการบันทึกประจำเดือน ({filteredTransactions.length})
          </h3>
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              filterType === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            รายจ่าย
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            รายรับ
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="search-transactions-input"
          type="text"
          placeholder="ค้นหาตามหมวดหมู่ หรือ รายละเอียด..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            ล้าง
          </button>
        )}
      </div>

      {/* Transactions List */}
      {dates.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">ไม่พบรายการในเงื่อนไขที่เลือก</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {searchQuery ? 'ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง' : 'เริ่มบันทึกรายรับหรือรายจ่ายรายการแรกได้เลย'}
            </p>
          </div>
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
          >
            + บันทึกรายการใหม่
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((dateStr) => {
            const dayItems = groupedByDate[dateStr];
            const dayExpense = dayItems
              .filter((i) => i.type === 'expense')
              .reduce((sum, i) => sum + i.amount, 0);
            const dayIncome = dayItems
              .filter((i) => i.type === 'income')
              .reduce((sum, i) => sum + i.amount, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
                  <span>{formatThaiDate(dateStr, 'short')}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    {dayIncome > 0 && <span className="text-emerald-600">+฿{formatBaht(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-rose-600">-฿{formatBaht(dayExpense)}</span>}
                  </div>
                </div>

                {/* Items in this date */}
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs divide-y divide-stone-100 overflow-hidden">
                  {dayItems.map((item) => {
                    const cat = getCategoryById(item.categoryId);
                    const isExpense = item.type === 'expense';

                    return (
                      <div
                        key={item.id}
                        onClick={() => onEdit(item)}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 active:bg-stone-100 transition-colors cursor-pointer group"
                      >
                        {/* Left: Icon & Title */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: cat.bgColor,
                              color: cat.color,
                            }}
                          >
                            <CategoryIcon name={cat.icon} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-stone-900 truncate">
                                {item.categoryName}
                              </span>
                              {item.time && (
                                <span className="text-[10px] text-stone-400 shrink-0 font-normal">
                                  {item.time}
                                </span>
                              )}
                            </div>
                            {item.note ? (
                              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                                {item.note}
                              </p>
                            ) : (
                              <p className="text-[11px] text-stone-400 italic mt-0.5">
                                ไม่ได้ระบุบันทึก
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Quick Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-sm sm:text-base font-bold tracking-tight ${
                              isExpense ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isExpense ? '-' : '+'}฿{formatBaht(item.amount)}
                          </span>

                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                              }}
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                                  onDelete(item.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
