export const formatRupiah = (angka: number | undefined): string => {
  if (angka === undefined) return "Rp0,00";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(angka);
};
