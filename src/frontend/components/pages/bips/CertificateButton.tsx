// @ts-ignore
import VioletButton from "../../common/VioletButton";

interface CertificateButtonProps {
  intPropId: string;
}

const CertificateButton: React.FC<CertificateButtonProps> = ({ intPropId }) => {
  const openCertificateInNewTab = () => {
    const certUrl = `/bip/${intPropId}/certificate`;
    window.open(certUrl, "_blank");
  };

  return (
    <VioletButton onClick={() => openCertificateInNewTab()} isLoading={false}>
      Open Certificate 📜
    </VioletButton>
  );
};

export default CertificateButton;
