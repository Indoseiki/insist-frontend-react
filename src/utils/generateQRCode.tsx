import QRCode from "qrcode";

const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    return "";
  }
};

export { generateQRCode };
