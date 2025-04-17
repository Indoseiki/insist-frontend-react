export const formatThousand = (
  n: string,
  decimalPlaces: number = 0
): string => {
  const num = Number(n);
  if (num === 0 || isNaN(num)) return "";

  const options: Intl.NumberFormatOptions = {
    style: "decimal",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  };

  return num.toLocaleString("id-ID", options);
};
