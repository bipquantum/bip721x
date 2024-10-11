import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../../actors/BackendActor";
import { useNavigate } from "react-router-dom";
import NewIPModal from "./NewIpModal";
import { useEffect, useState } from "react";

interface NewIPProps {
  principal: Principal | undefined;
  isOpen: boolean;
  onClose: (ipId: bigint | undefined) => void;
}

const NewIP: React.FC<NewIPProps> = ({ principal, isOpen, onClose }) => {

  const navigate = useNavigate();

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: (principal ? [principal] : []) as [Principal],
  });

  useEffect(() => {
    if (queriedUser === undefined || queriedUser?.length === 0) {
      navigate("/profile");
      toast.warn("Please add user");
      console.log("Please add user");
    }
  }, [queriedUser]);

  return (
    (queriedUser === undefined || queriedUser?.length === 0) ? 
    <></> : <NewIPModal user={queriedUser[0]} isOpen={isOpen} onClose={onClose} />
  );
};

export default NewIP;
