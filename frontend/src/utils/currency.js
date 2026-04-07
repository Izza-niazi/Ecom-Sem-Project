/** Format amounts as Pakistani Rupees (PKR). */
export function formatRs(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "PKR 0";
  return `PKR ${n.toLocaleString("en-PK")}`;
}
