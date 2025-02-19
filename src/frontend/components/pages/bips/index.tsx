import { Principal } from "@dfinity/principal";

import Balance from "../../common/Balance";

import SortUp from "../../../assets/sort-up.svg";
import SortDown from "../../../assets/sort-down.svg";
import BipsHeader from "./BipsHeader";
import BipList from "./BipList";
import { backendActor } from "../../actors/BackendActor";
import { toNullable } from "@dfinity/utils";
import { useState } from "react";
import { QueryDirection } from "../../../../declarations/backend/backend.did";
import { EQueryDirection } from "../../../utils/conversions";
import { BIP_ITEMS_PER_QUERY } from "../../constants";
import BipMarketplace from "./BipMarketplace";
import { ModalPopup } from "../../common/ModalPopup";

interface BipsProps {
  principal: Principal ; // TODO: it does not need to be optional, apparently principal is always defined but anonymous if not logged in
}

const Bips: React.FC<BipsProps> = ({ principal }) => {
  const [queryDirection, setQueryDirection] = useState<EQueryDirection>(
    EQueryDirection.Forward,
  );

  const { call: getListedIntProps } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
  });

  const fetchBips = async (
    prev: bigint | undefined,
    direction: QueryDirection,
  ) => {
    return await getListedIntProps([
      {
        prev: toNullable(prev),
        take: toNullable(BIP_ITEMS_PER_QUERY),
        direction,
      },
    ]);
  };

  const changeQueryDirection = () => {
    setQueryDirection(
      queryDirection === EQueryDirection.Forward
        ? EQueryDirection.Backward
        : EQueryDirection.Forward,
    );
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnlistingModalOpen, setIsUnlistingModalOpen] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [selectedBipId, setSelectedBipId] = useState<bigint | null>(null);

  const handleListClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsModalOpen(true);
  };

  const handleUnlistingClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsUnlistingModalOpen(true);
  };

  const handleEditingClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsEditingModalOpen(true);
  };

  return (
    <div className="flex h-[89vh] w-full flex-1 flex-col items-center justify-start gap-y-2 overflow-y-auto pt-2 text-black dark:text-white sm:items-start sm:gap-y-4">
      <BipsHeader
        sort={queryDirection}
        changeQueryDirection={changeQueryDirection}
      />
      <div className="ml-auto flex w-fit flex-col items-center justify-between gap-2 px-2 sm:flex-row sm:px-8">
        {/* <button className="hidden sm:flex" onClick={() => changeQueryDirection()}>
          <img 
            src={queryDirection === EQueryDirection.Forward ? SortUp : SortDown} 
            alt="Logo"
            className="h-10 invert" 
          />
        </button> */}
        {principal !== undefined && !principal.isAnonymous() && (
          <Balance principal={principal} />
        )}
      </div>
      <div className="w-full">
        <BipList
          scrollableClassName="grid w-full lg:grid-cols-2 xl:grid-cols-4 gap-[20px]"
          principal={principal}
          fetchBips={fetchBips}
          queryDirection={queryDirection}
          onListClick={handleListClick}
          onUnlistingClick={handleUnlistingClick}
          onEditingClick={handleEditingClick}
          isGrid={true}

        />
      </div>
      <ModalPopup onConfirm={() => {console.log('confirmed')}} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black">BipItem ID</h2>
          <p className="text-lg text-black">{selectedBipId?.toString()}</p>{" "}
          List
        </div>
      </ModalPopup>
      <ModalPopup onConfirm={() => {console.log('confirmed')}} isOpen={isUnlistingModalOpen} onClose={() => setIsUnlistingModalOpen(false)}>
        <div className="w-full text-center">
          <p>Do you want to Delete your IP?</p>
        </div>
      </ModalPopup>
      <ModalPopup onConfirm={() => {console.log('confirmed')}} isOpen={isEditingModalOpen} onClose={() => setIsEditingModalOpen(false)}>
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black">BipItem ID</h2>
          <p className="text-lg text-black">{selectedBipId?.toString()}</p>{" "}
          Edit
        </div>
      </ModalPopup>
    </div>
  );
};

export default Bips;
