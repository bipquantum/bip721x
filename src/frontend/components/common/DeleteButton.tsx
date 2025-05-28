import { useState } from "react";
import { useDeleteIntProp } from "../hooks/useDeleteIntProp";
import { ModalPopup } from "./ModalPopup";
import { TbTrash } from "react-icons/tb";

interface DeleteButtonProps {
  intPropId: bigint;
  onSuccess?: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ intPropId, onSuccess }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { loading, call: deleteIntProp } = useDeleteIntProp({
    onSuccess: () => {
      setIsModalOpen(false);
      onSuccess?.();
    },
  });

  return (
    <div className="w-full">
      <div
        className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-500/20 backdrop-blur-sm hover:bg-neutral-500/30 cursor-pointer"
        onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsModalOpen(true);
        }}
        >
            <TbTrash size={24} />
        </div>
      <ModalPopup
        onConfirm={() => deleteIntProp(intPropId)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={loading}
      >
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold text-black dark:text-white">
                Are you sure you want to delete this IP? 
                <span className="text-red-500"> This action is irreversible.</span>
            </h2>
        </div>
      </ModalPopup>
    </div>
  );
};

export default DeleteButton;