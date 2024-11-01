import { useState } from "react";
import { Principal } from "@dfinity/principal";

import NewIP from "./NewIp";
import { useNavigate } from "react-router-dom";

interface NewIPButtonProps {
  principal: Principal | undefined;
}

const NewIPButton: React.FC<NewIPButtonProps> = ({ principal }) => {

  const navigate = useNavigate();
  
  const [createIp, setCreateIp] = useState<boolean>(false);

  const onIpCreated = (ipId: bigint | undefined) => {
    setCreateIp(false);
    if (ipId) {
      navigate(`/bip/${ipId}`);
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-white sm:justify-start`}
    >
      { !createIp ? (
        <div className="flex h-full flex-col items-center justify-center gap-6 text-primary-text">
          <p className="mx-3 min-w-24 text-center text-2xl font-semibold leading-10">
            Unlock the full potential of your intellectual property by listing
            it on bIPQuantum, where innovation meets opportunity.
          </p>
          <button
            className="rounded-2xl bg-secondary py-2 px-4 text-xl font-semibold text-white"
            onClick={() => setCreateIp(true)}
          >
            Create New IP
          </button>
        </div>
        ) : <NewIP principal={principal} isOpen={createIp} onClose={onIpCreated}/>
      }
    </div>
  );
};

export default NewIPButton;
