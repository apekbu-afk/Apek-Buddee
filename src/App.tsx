/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, ReceiptText, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { Transaction } from './types';
import { getStoredTransactions, saveTransactions } from './utils/storage';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { QuickAddModal } from './components/QuickAddModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  
  // Date state defaults to current real-time month and year
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());

  // Navigation / Mobile view mode
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history'>('overview');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Synchronize to localStorage whenever transactions change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Calculations for current selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const parts = t.date.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === currentYear && m === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const balance = totalIncome - totalExpense;

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Add or Edit Transaction
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...data,
              }
            : item
        )
      );
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // If added transaction is in a different month, optionally switch to that month
      const [ty, tm] = data.date.split('-').map(Number);
      if (ty && tm && (ty !== currentYear || tm - 1 !== currentMonth)) {
        setCurrentYear(ty);
        setCurrentMonth(tm - 1);
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset sample data if user wants to refresh demo
  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างใหม่ใช่หรือไม่?')) {
      localStorage.removeItem('thai_expense_tracker_records_v1');
      setTransactions(getStoredTransactions());
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-24 sm:pb-12 text-stone-800">
      {/* Top Header */}
      <Header
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        totalTransactionsInMonth={monthTransactions.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-5">
        {/* Navigation Tabs (Mobile-Friendly Pill Switcher) */}
        <div className="grid grid-cols-3 p-1 bg-stone-200/80 rounded-2xl gap-1 text-xs font-semibold">
          <button
            type="button"
            id="nav-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-600" />
            <span>ภาพรวม</span>
          </button>

          <button
            type="button"
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-600" />
            <span>กราฟเปรียบเทียบ</span>
          </button>

          <button
            type="button"
            id="nav-tab-history"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>รายการ ({monthTransactions.length})</span>
          </button>
        </div>

        {/* Dynamic View Content */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Automatic Monthly Summary Cards */}
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              year={currentYear}
              month={currentMonth}
            />

            {/* Quick Chart Highlight */}
            <AnalyticsCharts
              transactions={transactions}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />

            {/* Recent Transactions in Month */}
            <TransactionList
              transactions={transactions}
              currentYear={currentYear}
              currentMonth={currentMonth}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {/* Summary Cards */}
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              year={currentYear}
              month={currentMonth}
            />

            {/* In-depth Analytics & Multi-month comparison */}
            <AnalyticsCharts
              transactions={transactions}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-5">
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              year={currentYear}
              month={currentMonth}
            />

            <TransactionList
              transactions={transactions}
              currentYear={currentYear}
              currentMonth={currentMonth}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Bottom Utility Tools & Data Info */}
        <div className="pt-4 pb-2 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>บันทึกในอุปกรณ์ (Local Storage)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-1 hover:text-stone-800 transition-colors cursor-pointer"
              title="คืนค่าข้อมูลตัวอย่าง"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูลตัวอย่าง</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating Mobile Bottom Action Bar (Thumb-friendly) */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="flex flex-col items-center justify-center p-1 text-stone-600 active:text-emerald-600 transition-colors"
        >
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-medium mt-0.5">ส่งออก Excel</span>
        </button>

        {/* Prominent Center Thumb Add Button */}
        <button
          id="mobile-center-add-btn"
          type="button"
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/35 hover:bg-emerald-700 active:scale-95 transition-all -translate-y-2 cursor-pointer"
          aria-label="เพิ่มรายการใหม่"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'analytics' ? 'overview' : 'analytics')}
          className="flex flex-col items-center justify-center p-1 text-stone-600 active:text-rose-600 transition-colors"
        >
          <BarChart3 className="w-5 h-5 text-stone-700" />
          <span className="text-[10px] font-medium mt-0.5">ดูกราฟ</span>
        </button>
      </div>

      {/* Quick Add / Edit Transaction Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Excel Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </div>
  );
}
