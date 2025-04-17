export const formatDiameter = (n: string): string => {
  const num = Number(n);
  if (num === 0 || isNaN(num)) return "";

  const floored = Math.floor(num);
  const padded = floored.toString().padStart(3, "0");
  const len = padded.length;

  const integerPart = padded.slice(0, len - 2);
  const decimalPart = padded.slice(len - 2);

  const formattedInteger = Number(integerPart).toLocaleString("id-ID");

  const formatted = `∅${formattedInteger},${decimalPart} mm`;
  return formatted;
};
