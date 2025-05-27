import { ReactNode, MouseEvent } from "react";
import ReactDOM from "react-dom";

interface Props {
  isVisible: boolean;
  children: ReactNode;
  onClose: () => void;
}

const Modal = ({ isVisible, children, onClose }: Props) => {
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
      className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 text-black"
      onClick={handleOverlayClick}
    >
      <div className="rounded-xl dark:bg-background-dark bg-background p-4" onClick={handleModalClick}>
        <div className="flex w-full justify-end">
          <button onClick={onClose} className="text-black dark:text-white">X</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
