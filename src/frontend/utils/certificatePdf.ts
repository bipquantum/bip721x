import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import BipCertificateTemplate from "../assets/bIP_certificate_editable.pdf";

// TODO: apparently @types/qrcode doesn't exist for the qrcode package
// @ts-ignore:
import { toDataURL } from "qrcode";
import { IntProp, User } from "../../declarations/backend/backend.did";
import {
  formatDate,
  intPropLicenseToString,
  intPropTypeToString,
  timeToDate,
} from "./conversions";
import { fromNullable } from "@dfinity/utils";

// @ts-ignore
import { getName } from "country-list";
import { Principal } from "@dfinity/principal";

export const getAssetAsArrayBuffer = async (
  assetUrl: string,
): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    // Convert the response to a Blob
    const assetBlob = await response.blob();

    // Convert the Blob to an ArrayBuffer
    const arrayBuffer = await assetBlob.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("Error fetching the asset as ArrayBuffer:", error);
    throw error;
  }
};

// TODO: Add the percentage royalties once the field has been added to the PDF template
export const generateCertificatePdf = async (
  intPropId: string,
  intProp: IntProp,
  author: User,
  owner: Principal | undefined,
): Promise<Uint8Array> => {
  // Load the PDF template
  const template = await getAssetAsArrayBuffer(BipCertificateTemplate);

  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(template);
  pdfDoc.registerFontkit(fontkit);

  // Get the form within the document
  const form = pdfDoc.getForm();

  // Fetch the font and embed it
  const fontBytes = await getAssetAsArrayBuffer("/fonts/Symbola.ttf");
  const customFont = await pdfDoc.embedFont(fontBytes);

  var publication_date = undefined;
  var publication_country = undefined;
  let optPublishing = fromNullable(intProp.publishing);
  if (optPublishing) {
    publication_date = formatDate(timeToDate(optPublishing.date));
    publication_country = getName(optPublishing.countryCode);
  }

  // Define the field names and values to fill
  const fieldValues: Record<string, string> = {
    registration_date: "Unavailable", // @todo: this shall be queried from icrc3
    title: intProp.title,
    ip_type: intPropTypeToString(intProp.intPropType),
    ip_licenses: intProp.intPropLicenses.map(intPropLicenseToString).join(", "),
    // 250 characters is the maximum that can fit in the description field
    ip_description:
      intProp.description.length > 250
        ? intProp.description.substring(0, 250).replace(/\s+\S*$/, "") + "[...]"
        : intProp.description,
    creation_date: formatDate(timeToDate(intProp.creationDate)),
    publication_date: publication_date ?? "N/A",
    publication_country: publication_country ?? "N/A",
    author_full_name: `${author.firstName} ${author.lastName}`,
    author_nickname: author.nickName,
    author_specialy: author.specialty,
    author_country: getName(author.countryCode) || "N/A",
    owner: owner?.toString() ?? "",
    royalties: fromNullable(intProp.percentageRoyalties)
      ? `${fromNullable(intProp.percentageRoyalties)}%`
      : "",
    first_listing_price: "Unknown", // @todo: shall the first listing price be saved in the marketplace?
    us_copyright: "Unavailable", // @todo: add US copyright when available
  };

  // Fill in each field with the corresponding value
  Object.keys(fieldValues).forEach((fieldName) => {
    const field = form.getTextField(fieldName);
    field.setText(fieldValues[fieldName]);
    field.updateAppearances(customFont);
  });

  // Flatten the form to prevent further editing
  form.flatten();

  // Generate QR code for the bIP
  const qrCodeData = `https://${process.env.CANISTER_ID_FRONTEND}.icp0.io/bip/${intPropId}/certificate`;
  const qrCodeDataUrl = await toDataURL(qrCodeData, {
    width: 150,
    margin: 1,
  });
  const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);

  // Set the position and size for the QR code in the PDF
  const qrCodeDimensions = qrImage.scale(0.45); // Scale as necessary
  const xPosition = 122; // X position in PDF
  const yPosition = 165; // Y position in PDF

  // Draw the QR code image on the first page at the specified position
  pdfDoc.getPages()[0].drawImage(qrImage, {
    x: xPosition,
    y: yPosition,
    width: qrCodeDimensions.width,
    height: qrCodeDimensions.height,
  });

  // Generate the PDF
  return await pdfDoc.save();
};

export const downloadCertificatePdf = (pdfBytes: Uint8Array, intPropId: string) => {
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `bip-certificate-${intPropId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(pdfUrl);
};
