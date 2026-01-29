import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";
import SpinnerSvg from "../../../assets/spinner.svg";
import { fromNullable } from "@dfinity/utils";
import { toast } from "react-toastify";
import { useIntProp } from "./useIntProp";
import { generateCertificatePdf } from "../../../utils/certificatePdf";

const CertificatePage = () => {
  const { intPropId } = useParams();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const intPropResult = useIntProp(intPropId ? BigInt(intPropId) : undefined);

  const intProp = useMemo(() => {
    return intPropResult && "ok" in intPropResult ? intPropResult.ok.intProp.V1 : undefined;
  }, [intPropResult]);

  const { data: authorResult } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_user",
    args: intProp ? [intProp.author] : undefined,
  });

  const author = authorResult ? fromNullable(authorResult) : undefined;

  const { data: ownerResult } = backendActor.unauthenticated.useQueryCall({
    functionName: "owner_of",
    args: intPropId ? [{ token_id: BigInt(intPropId) }] : undefined,
  });

  const owner = ownerResult ? fromNullable(ownerResult) : undefined;

  useEffect(() => {
    if (!intPropId || !intProp || !author || !owner) {
      return;
    }

    // Fetch or generate the PDF
    generateCertificatePdf(intPropId, intProp, author, owner)
      .then((data) => {
        const pdfData = new Blob([new Uint8Array(data)], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(pdfData));
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        toast.error("Error generating the certificate PDF: " + error.message);
        setPdfUrl(null);
      });
  }, [intPropId, intProp, author, owner]);

  const handleDownload = () => {
    if (pdfUrl && intPropId) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `certificate-${intPropId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4 dark:bg-background-dark">
      {!pdfUrl ? (
        <img src={SpinnerSvg} alt="Loading certificate..." />
      ) : (
        <div className="relative h-[calc(100vh-2rem)] w-full max-w-4xl">
          <iframe
            src={pdfUrl}
            className="h-full w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700"
            title="IP Certificate"
          />
          <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-600 active:bg-blue-700 sm:hidden"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
