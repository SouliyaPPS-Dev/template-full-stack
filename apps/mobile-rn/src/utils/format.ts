export function formatMoney(amount: number): string {
  const value = Math.round(Number(amount) || 0);
  const digits = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₭${digits}`;
}

export function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
