/**
 * Unified Production Formatters for Vegnar ERP
 * Single Source of Truth for Data Formatting across the app
 */

/**
 * Format number as Indian Rupee (INR) currency
 */
export const money = (amount: number | string = 0, fractionDigits: number = 0): string => {
  const num = Number(amount || 0);
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(num);
};

/**
 * Format large numbers in compact Indian notation (K, L, Cr)
 */
export const compactMoney = (amount: number | string = 0): string => {
  const num = Number(amount || 0);
  if (isNaN(num)) return "₹0";
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

/**
 * Format ISO Date string to short Indian date format
 */
export const fmtDate = (isoDate?: string | Date | null): string => {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

/**
 * Format ISO Date string to date + time
 */
export const fmtDateTime = (isoDate?: string | Date | null): string => {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
};

/**
 * Format percentage
 */
export const fmtPercent = (val: number | string = 0, decimals: number = 1): string => {
  const num = Number(val || 0);
  return `${num.toFixed(decimals).replace(/\.0+$/, "")}%`;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string = ""): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Clean status string for display (e.g. "in_progress" -> "In Progress")
 */
export const fmtStatus = (status: string = ""): string => {
  if (!status) return "—";
  return status
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
