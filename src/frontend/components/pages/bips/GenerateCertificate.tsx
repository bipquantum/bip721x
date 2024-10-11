import { PDFDocument } from "pdf-lib";
import BipCertificateTemplate from "../../../assets/bIP_certificate_editable.pdf";

// TODO: apparently @types/qrcode doesn't exist for the qrcode package
// @ts-ignore: 
import { toDataURL } from 'qrcode';
import { backendActor } from "../../actors/BackendActor";
import { IntProp, User } from "../../../../declarations/backend/backend.did";
import { formatDate, intPropLicenseToString, intPropTypeToString, timeToDate } from "../../../utils/conversions";
import { fromNullable } from "@dfinity/utils";

const getAssetAsArrayBuffer = async (assetUrl: string) : Promise<ArrayBuffer> => {
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
}

const generatePdf = async (intPropId: string, intProp: IntProp, author: User) : Promise<Uint8Array> => {

  // Load the PDF template
  const template = await getAssetAsArrayBuffer(BipCertificateTemplate);

  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(template);

  // Get the form within the document
  const form = pdfDoc.getForm();

  var publicationDate = 'N/A';
  let optDate = fromNullable(intProp.publishingDate);
  if (optDate){
    publicationDate = formatDate(timeToDate(optDate));
  }
  // TODO: what to use for the country?

  // Define the field names and values to fill
  const fieldValues : Record<string, string> = {
    'title': intProp.title,
    'ip_type': intPropTypeToString(intProp.intPropType),
    'ip_license': intPropLicenseToString(intProp.intPropLicense),
    'registration_date': formatDate(timeToDate(intProp.creationDate)),
    'publication_date_and_country': publicationDate,
    'author': `${author.firstName} ${author.lastName}`,
  };

  // Fill in each field with the corresponding value
  Object.keys(fieldValues).forEach((fieldName) => {
    const field = form.getTextField(fieldName);
    field.setText(fieldValues[fieldName]);
  });

  // Flatten the form to prevent further editing
  form.flatten();

  // Generate QR code for the bIP
  const qrCodeData = `https://${process.env.CANISTER_ID_FRONTEND}.icp0.io/bips/${intPropId}`;
  const qrCodeDataUrl = await toDataURL(qrCodeData, {
    width: 150,
    margin: 1,
  });
  const qrImageBytes = await fetch(qrCodeDataUrl).then((res) => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  // Set the position and size for the QR code in the PDF
  const qrCodeDimensions = qrImage.scale(0.45); // Scale as necessary
  const xPosition = 122; // X position in PDF
  const yPosition = 185; // Y position in PDF

  // Draw the QR code image on the first page at the specified position
  pdfDoc.getPages()[0].drawImage(qrImage, {
    x: xPosition,
    y: yPosition,
    width: qrCodeDimensions.width,
    height: qrCodeDimensions.height,
  });

  // Generate the PDF
  return await pdfDoc.save();
}

const download = async (data: Uint8Array, filename: string) => {
  try {
    // Convert Uint8Array to Blob
    const blob = new Blob([data], { type: 'application/octet-stream' });

    // Create a link to initiate download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.id = '_download_link';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke object URL after download
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

interface GenerateCertificateProps {
  intPropId: string;
  intProp: IntProp;
}

const GenerateCertificate: React.FC<GenerateCertificateProps> = ({ intPropId, intProp }) => {

  const { data: author } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [intProp.author],
  });

  return (
    (author === undefined || author.length === 0) ? <></> : (
      <button 
        className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={async () => { generatePdf(intPropId, intProp, author[0]).then((data) => download(data, `bIP${intPropId}_certificate.pdf`)); }}
      >
        Generate Certificate
      </button>
    )
  );
}

export default GenerateCertificate;