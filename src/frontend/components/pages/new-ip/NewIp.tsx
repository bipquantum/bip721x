import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../../actors/BackendActor";
import { useNavigate } from "react-router-dom";
import NewIPModal from "./NewIpModal";

interface NewIPProps {
  principal: Principal | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const NewIP: React.FC<NewIPProps> = ({ principal, isOpen, onClose }) => {

  const navigate = useNavigate();

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: (principal ? [principal] : []) as [Principal],
  });

  if (queriedUser === undefined || queriedUser?.length === 0) {
    toast.warn("Please add user");
    navigate("/profile");
    return;
  }

  return (
    <NewIPModal user={queriedUser[0]} isOpen={isOpen} onClose={onClose} />
  );
};

export default NewIP;
