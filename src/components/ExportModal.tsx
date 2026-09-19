import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';
import { exportToExcel } from '../utils/excelExport';
import { formatBaht, formatThaiMonthYear } from '../utils/date';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentYear: number;
  currentMonth: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentYear,
  currentMonth,
}) => {
  const [exportScope, setExportScope] = useState<'currentMonth' | 'all'>('currentMonth');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter current month transactions
  const currentMonthTransactions = transactions.filter((t) => {
    const parts = t.date.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === currentYear && m === currentMonth;
  });

  const selectedTxs = exportScope === 'currentMonth' ? currentMonthTransactions : transactions;

  const totalIncome = selectedTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = selectedTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleExport = () => {
    exportToExcel({
      transactions: selectedTxs,
      year: currentYear,
      month: currentMonth,
      isAllTime: exportScope === 'all',
    });

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity">
      <div
        id="export-modal-container"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">ส่งออกเป็นไฟล์ Excel</h2>
              <p className="text-[11px] text-stone-500">ดาวน์โหลดข้อมูลไปวิเคราะห์ต่อใน Excel / Sheets</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">เลือกช่วงข้อมูลที่ต้องการส่งออก</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('currentMonth')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  exportScope === 'currentMonth'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                    : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:bg-stone-100/70'
                }`}
              >
                <div className="text-xs font-semibold">เฉพาะเดือนนี้</div>
                <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                  {formatThaiMonthYear(currentYear, currentMonth)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  exportScope === 'all'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                    : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:bg-stone-100/70'
                }`}
              >
                <div className="text-xs font-semibold">ข้อมูลทั้งหมด</div>
                <div className="text-[11px] text-stone-500 mt-0.5">ทุกเดือนที่มีการบันทึก</div>
              </button>
            </div>
          </div>

          {/* Preview Details Box */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-2 text-xs">
            <div className="font-semibold text-stone-800 pb-1.5 border-b border-stone-200/60 flex items-center justify-between">
              <span>สรุปข้อมูลที่จะส่งออก</span>
              <span className="font-normal text-stone-500">{selectedTxs.length} รายการ</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 bg-white rounded-xl border border-stone-200/60">
                <span className="text-[10px] text-emerald-700 block">รายรับ</span>
                <span className="font-semibold text-stone-900 text-xs">฿{formatBaht(totalIncome)}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-stone-200/60">
                <span className="text-[10px] text-rose-700 block">รายจ่าย</span>
                <span className="font-semibold text-stone-900 text-xs">฿{formatBaht(totalExpense)}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-stone-200/60">
                <span className="text-[10px] text-stone-500 block">คงเหลือ</span>
                <span className={`font-semibold text-xs ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ฿{formatBaht(balance)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 pt-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>แผ่นงานที่ 1: รายการธุรกรรม วันที่ ประเภท หมวดหมู่ ยอดเงิน บันทึก</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>แผ่นงานที่ 2: สรุปสัดส่วนยอดรวมตามหมวดหมู่</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              id="confirm-excel-download-btn"
              type="button"
              onClick={handleExport}
              disabled={selectedTxs.length === 0}
              className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-700'
                  : selectedTxs.length === 0
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/30'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์ Excel สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์ Excel (.xlsx)</span>
                </>
              )}
            </button>
            {selectedTxs.length === 0 && (
              <p className="text-center text-[11px] text-rose-500 mt-1.5">
                ยังไม่มีข้อมูลให้ส่งออกในเงื่อนไขนี้
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
