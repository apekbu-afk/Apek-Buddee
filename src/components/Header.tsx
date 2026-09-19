import React from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Plus, Wallet } from 'lucide-react';
import { formatThaiMonthYear } from '../utils/date';

interface HeaderProps {
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  totalTransactionsInMonth: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onOpenAddModal,
  onOpenExportModal,
  totalTransactionsInMonth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Top brand row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-stone-900 tracking-tight leading-tight">
                สมุดรายรับรายจ่าย
              </h1>
              <p className="text-xs text-stone-500 font-normal">
                บันทึกง่าย สรุปยอดอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Top action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="export-excel-btn"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200/80 rounded-xl transition-colors cursor-pointer"
              title="ส่งออกไฟล์ Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">ส่งออก</span> Excel
            </button>

            <button
              id="header-quick-add-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึก</span>
            </button>
          </div>
        </div>

        {/* Month selector navigation */}
        <div className="mt-3 flex items-center justify-between bg-stone-100/90 rounded-2xl p-1 border border-stone-200/70">
          <button
            id="prev-month-btn"
            onClick={onPrevMonth}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-800">
              {formatThaiMonthYear(currentYear, currentMonth)}
            </span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200">
              {totalTransactionsInMonth} รายการ
            </span>
          </div>

          <button
            id="next-month-btn"
            onClick={onNextMonth}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label="เดือนถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
