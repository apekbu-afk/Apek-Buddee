export const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/**
 * Convert year to Buddhist Era (พ.ศ.)
 */
export function toBuddhistYear(ceYear: number): number {
  return ceYear + 543;
}

/**
 * Format date string (YYYY-MM-DD) to Thai display e.g. "18 ก.ย. 2569"
 */
export function formatThaiDate(dateStr: string, format: 'short' | 'full' = 'short'): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const bYear = toBuddhistYear(year);
    const monthName = format === 'full' ? THAI_MONTHS_FULL[month] : THAI_MONTHS_SHORT[month];
    return `${day} ${monthName} ${bYear}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format Month & Year for Header e.g. "กันยายน 2569"
 */
export function formatThaiMonthYear(year: number, monthIndex: number): string {
  const bYear = toBuddhistYear(year);
  const monthName = THAI_MONTHS_FULL[monthIndex] || '';
  return `${monthName} ${bYear}`;
}

/**
 * Format currency to Thai Baht with comma e.g. 15,200.00 หรือ 15,200
 */
export function formatBaht(amount: number, showDecimal = false): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  }).format(amount);
}

/**
 * Get today's ISO date string (YYYY-MM-DD) in local time
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time string (HH:mm)
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
