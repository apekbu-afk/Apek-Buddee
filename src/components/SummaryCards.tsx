import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { formatBaht } from '../utils/date';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  year: number;
  month: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  balance,
  year,
  month,
}) => {
  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Calculate daily average expense
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
  const dailyAverageExpense = Math.round(totalExpense / daysElapsed);

  return (
    <section className="space-y-3" aria-label="สรุปยอดรายเดือน">
      {/* Net Balance Card */}
      <div
        id="balance-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-5 shadow-lg shadow-stone-900/10 border border-stone-700/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-300 tracking-wide">
              ยอดเงินคงเหลือสุทธิ
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
              balance >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {balance >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{balance >= 0 ? `ออมได้ ${Math.max(0, savingsRate)}%` : 'รายจ่ายเกินรายรับ'}</span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight">
            {balance >= 0 ? '+' : ''}฿{formatBaht(balance)}
          </span>
        </div>

        {/* Footer indicators inside balance card */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>เฉลี่ยใช้จ่ายต่อวัน:</span>
          </div>
          <span className="font-semibold text-stone-100">
            ฿{formatBaht(dailyAverageExpense)} / วัน
          </span>
        </div>
      </div>

      {/* Income & Expense Two-Column Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Income */}
        <div
          id="income-card"
          className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">รายรับรวม</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-950 tracking-tight">
            ฿{formatBaht(totalIncome)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 font-normal">
            เงินเข้าทั้งหมดในเดือนนี้
          </p>
        </div>

        {/* Total Expense */}
        <div
          id="expense-card"
          className="rounded-2xl bg-rose-50/80 border border-rose-200/90 p-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">รายจ่ายรวม</span>
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-950 tracking-tight">
            ฿{formatBaht(totalExpense)}
          </div>
          <p className="mt-1 text-[11px] text-rose-700 font-normal">
            ค่าใช้จ่ายทั้งหมดในเดือนนี้
          </p>
        </div>
      </div>
    </section>
  );
};
