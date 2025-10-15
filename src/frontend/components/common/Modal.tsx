import { ReactNode, MouseEvent } from "react";
import ReactDOM from "react-dom";
import { MdCancel } from "react-icons/md";

interface Props {
  isVisible: boolean;
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

const Modal = ({ isVisible, children, onClose, title }: Props) => {
  if (!isVisible) {
    return null;
  }

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  const handleModalClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      style={{ minHeight: '100dvh' }}
    >
      <div
        className="w-full max-w-md max-h-[80vh] max-h-[80dvh] overflow-y-auto rounded-xl bg-background px-4 pb-4 dark:bg-background-dark"
        onClick={handleModalClick}
      >
        {/* Header with title and close button on same line */}
        <div className="flex w-full justify-between items-center mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-black dark:text-white pt-4">
              {title}
            </h2>
          )}
          <button 
            onClick={onClose} 
            className={`text-black dark:text-white ${title ? '' : 'ml-auto'} self-start mt-4`}
          >
            <MdCancel size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
