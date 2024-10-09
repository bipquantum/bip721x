const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');

async function fillPDF() {
  
  // Load the existing PDF document that has form fields
  const existingPdfBytes = fs.readFileSync('../../src/frontend/assets/bIP_certificate_editable.pdf');

  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Get the form within the document
  const form = pdfDoc.getForm();

  // Define the field names and values to fill
  const fieldValues = {
    'title': 'Intellectual Property Title',
    'ip_type': 'Patent',
    'ip_license': 'Exclusive License',
    'registration_date': '2023-12-01',
    'publication_date_and_country': '2023-12-15',
    'author': 'John Doe',
  };

  // Fill in each field with the corresponding value
  Object.keys(fieldValues).forEach((fieldName) => {
    const field = form.getTextField(fieldName);
    field.setText(fieldValues[fieldName]);
  });

  // Flatten the form to prevent further editing
  form.flatten();

  // Generate QR code
  const qrCodeData = 'https://example.com/certificate'; // URL or data to encode  
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
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

  // Save the filled PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('bIP_certificate_filled.pdf', pdfBytes);

  console.log('PDF filled successfully and saved as bIP_certificate_filled.pdf');
}

// Run the function
fillPDF();
