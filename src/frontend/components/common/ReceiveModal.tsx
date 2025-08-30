import { MdCallReceived } from "react-icons/md";
import Modal from "./Modal";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSymbol: string;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose, tokenSymbol }) => {
  return (
    <Modal isVisible={isOpen} onClose={onClose} title={`Receive ${tokenSymbol}`}>
      {/* Content */}
      <div className="flex flex-col items-center justify-center py-8">
        <MdCallReceived size={48} className="mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">Receive functionality coming soon...</p>
      </div>
    </Modal>
  );
};

export default ReceiveModal;