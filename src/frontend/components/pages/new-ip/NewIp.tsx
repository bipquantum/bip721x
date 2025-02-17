import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../../actors/BackendActor";
import { useLocation, useNavigate } from "react-router-dom";
import NewIPModal from "./NewIpModal";
import { useEffect } from "react";

interface NewIPProps {
  principal: Principal | undefined;
  isOpen: boolean;
  onClose: (ipId: bigint | undefined) => void;
}

const NewIP: React.FC<NewIPProps> = ({ principal, isOpen, onClose }) => {

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: (principal ? [principal] : []) as [Principal],
  });

  useEffect(() => {
    if (isOpen && (queriedUser === undefined || queriedUser?.length === 0)) {
      navigate("/profile", { state: { redirect: pathname }});
      toast.warn("Please add user");
    }
  }, [isOpen, queriedUser, navigate, pathname]);

  if (!queriedUser || queriedUser.length === 0) return null;

  return <NewIPModal user={queriedUser[0]} isOpen={isOpen} onClose={onClose}/>
};

export default NewIP;
