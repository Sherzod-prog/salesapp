export function formatMoney(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
}

export function formatQuantity(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 3 }).format(n);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
