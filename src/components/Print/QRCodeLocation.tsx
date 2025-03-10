import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { generateQRCode } from "../../utils/generateQRCode";
import { Location } from "../../types/location";

const styles = StyleSheet.create({
  page: { flexDirection: "column", padding: 10 },
  section: { marginBottom: 10 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  text: { fontSize: 6, fontWeight: "bold", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 10 },
  box: {
    width: 100,
    height: 130,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 2,
    borderColor: "black",
    borderStyle: "solid",
    padding: 2,
    paddingTop: 10,
    backgroundColor: "white",
  },
  image: {
    width: 95,
    height: 95,
  },
});

interface QRCodeLocationProps {
  qrDataArray: Location[];
}

interface LocationWithQR extends Location {
  qrCode: string;
}

const QRCodeLocation: React.FC<QRCodeLocationProps> = ({ qrDataArray }) => {
  const [qrCodes, setQrCodes] = useState<LocationWithQR[]>([]);

  useEffect(() => {
    const generateQRCodes = async () => {
      const qrCodeData: LocationWithQR[] = await Promise.all(
        qrDataArray.map(async (item) => ({
          ...item,
          qrCode: await generateQRCode(
            `${item.warehouse?.description ?? ""}~${item.location ?? ""}`
          ),
        }))
      );
      setQrCodes(qrCodeData);
    };

    generateQRCodes();
  }, [qrDataArray]);

  return (
    <Document>
      {qrCodes.length > 0 &&
        qrCodes
          .reduce((pages: LocationWithQR[][], qr, index) => {
            if (index % 25 === 0) pages.push([]);
            pages[pages.length - 1].push(qr);
            return pages;
          }, [])
          .map((page, pageIndex) => (
            <Page key={pageIndex} size="A4" style={styles.page}>
              {page
                .reduce((rows: LocationWithQR[][], qr, index) => {
                  if (index % 5 === 0) rows.push([]);
                  rows[rows.length - 1].push(qr);
                  return rows;
                }, [])
                .map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((qr, qrIndex) => {
                      const nameWarehouse =
                        qr.warehouse?.description
                          ?.split(" ")
                          .slice(1)
                          .join(" ") ?? "";
                      return (
                        <View key={qrIndex} style={styles.box}>
                          <Text style={styles.text}>GUDANG</Text>
                          <Text style={styles.text}>{nameWarehouse}</Text>
                          <Text style={styles.text}>{qr.location}</Text>
                          {qr.qrCode && (
                            <Image src={qr.qrCode} style={styles.image} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
            </Page>
          ))}
    </Document>
  );
};

export default QRCodeLocation;
