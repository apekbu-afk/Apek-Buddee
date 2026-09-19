import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { formatBaht, THAI_MONTHS_SHORT, toBuddhistYear } from '../utils/date';
import { CategoryIcon } from './CategoryIcon';
import { BarChart3, PieChart as PieIcon, CalendarDays } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currentYear: number;
  currentMonth: number;
}

type ChartTab = 'comparison' | 'category' | 'daily';

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  currentYear,
  currentMonth,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('comparison');

  // Filter transactions for currently selected month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const parts = t.date.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === currentYear && m === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  // 1. Multi-Month Comparison Data (Last 5 months including current)
  const monthlyComparisonData = useMemo(() => {
    const monthsData = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();

      const txs = transactions.filter((t) => {
        const parts = t.date.split('-');
        return parseInt(parts[0], 10) === y && parseInt(parts[1], 10) - 1 === m;
      });

      const income = txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      monthsData.push({
        label: `${THAI_MONTHS_SHORT[m]} ${String(toBuddhistYear(y)).slice(-2)}`,
        fullMonth: `${THAI_MONTHS_SHORT[m]} ${toBuddhistYear(y)}`,
        รายรับ: income,
        รายจ่าย: expense,
        คงเหลือ: income - expense,
        isCurrent: y === currentYear && m === currentMonth,
      });
    }
    return monthsData;
  }, [transactions, currentYear, currentMonth]);

  // 2. Category Breakdown Data for selected month
  const categoryBreakdownData = useMemo(() => {
    const expenseTxs = currentMonthTransactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

    const map: Record<string, { name: string; value: number; color: string; icon: string }> = {};

    expenseTxs.forEach((t) => {
      if (!map[t.categoryId]) {
        const catDef = EXPENSE_CATEGORIES.find((c) => c.id === t.categoryId);
        map[t.categoryId] = {
          name: t.categoryName,
          value: 0,
          color: catDef?.color || '#94a3b8',
          icon: catDef?.icon || 'HelpCircle',
        };
      }
      map[t.categoryId].value += t.amount;
    });

    const list = Object.values(map).sort((a, b) => b.value - a.value);

    return {
      list,
      totalExpense: totalExp,
    };
  }, [currentMonthTransactions]);

  // 3. Daily spending in current month
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const map: Record<number, { day: number; label: string; รายจ่าย: number; รายรับ: number }> = {};

    for (let i = 1; i <= daysInMonth; i++) {
      map[i] = {
        day: i,
        label: `${i}`,
        รายจ่าย: 0,
        รายรับ: 0,
      };
    }

    currentMonthTransactions.forEach((t) => {
      const parts = t.date.split('-');
      const day = parseInt(parts[2], 10);
      if (map[day]) {
        if (t.type === 'expense') {
          map[day].รายจ่าย += t.amount;
        } else {
          map[day].รายรับ += t.amount;
        }
      }
    });

    return Object.values(map);
  }, [currentMonthTransactions, currentYear, currentMonth]);

  return (
    <div id="analytics-section" className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">กราฟวิเคราะห์สรุปยอด</h2>
          <p className="text-xs text-stone-500">เปรียบเทียบสัดส่วนและแนวโน้มการใช้เงิน</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            id="tab-comparison"
            onClick={() => setActiveTab('comparison')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>เทียบรายเดือน</span>
          </button>

          <button
            type="button"
            id="tab-category"
            onClick={() => setActiveTab('category')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-rose-600" />
            <span>สัดส่วนค่าใช้จ่าย</span>
          </button>

          <button
            type="button"
            id="tab-daily"
            onClick={() => setActiveTab('daily')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
            <span>รายวัน</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Monthly Comparison Chart */}
      {activeTab === 'comparison' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>เปรียบเทียบรายรับ vs รายจ่าย ย้อนหลัง 5 เดือน</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                รายรับ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                รายจ่าย
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `฿${formatBaht(typeof value === 'number' ? value : Number(value) || 0)}`,
                    '',
                  ]}
                  labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="รายรับ" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="รายจ่าย" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Category Donut & Breakdown */}
      {activeTab === 'category' && (
        <div className="space-y-4 pt-2">
          {categoryBreakdownData.list.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              ยังไม่มีข้อมูลรายจ่ายในเดือนนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Donut Chart */}
              <div className="h-52 sm:col-span-6 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData.list}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryBreakdownData.list.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        `฿${formatBaht(typeof value === 'number' ? value : Number(value) || 0)}`,
                        '',
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Progress List */}
              <div className="sm:col-span-6 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {categoryBreakdownData.list.map((item) => {
                  const pct = Math.round((item.value / categoryBreakdownData.totalExpense) * 100) || 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-stone-800 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-semibold text-stone-900">
                          <span>฿{formatBaht(item.value)}</span>
                          <span className="text-[11px] text-stone-400 font-normal w-9 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Daily Spending Flow */}
      {activeTab === 'daily' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>แนวโน้มการใช้จ่ายประจำแต่ละวันในเดือนนี้</span>
            <span className="text-rose-600 font-medium">แท่งสีแดง = รายจ่าย</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `฿${formatBaht(typeof value === 'number' ? value : Number(value) || 0)}`,
                    'รายจ่าย',
                  ]}
                  labelFormatter={(day) => `วันที่ ${day}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
