export function formatRs(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "Rs 0";
  return `Rs ${n.toLocaleString("en-PK")}`;
}
