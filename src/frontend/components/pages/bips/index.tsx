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
import { dateToTime, EQueryDirection } from "../../../utils/conversions";
import { BIP_ITEMS_PER_QUERY } from "../../constants";
import { ModalPopup } from "../../common/ModalPopup";
import { bip721LedgerActor } from "../../actors/Bip721LedgerActor";
import { RevokeTokenApprovalArg } from "../../../../declarations/bip721_ledger/bip721_ledger.did";
import { canisterId } from "../../../../declarations/backend";
import { toast } from "react-toastify";

interface BipsProps {
  principal: Principal; // TODO: it does not need to be optional, apparently principal is always defined but anonymous if not logged in
}

const Bips: React.FC<BipsProps> = ({ principal }) => {
  const [queryDirection, setQueryDirection] = useState<EQueryDirection>(
    EQueryDirection.Forward,
  );

  const { call: getListedIntProps } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
  });

  const { call: revokeBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_revoke_token_approvals",
  });

  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
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

  const [isLoading, setIsLoading] = useState(false);
  const [triggered, setTriggered] = useState(true)

  const triggerUnlist = (intPropId: bigint) => {
    setIsLoading(true);

    const info: RevokeTokenApprovalArg = {
      token_id: intPropId,
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: [
        {
          owner: Principal.fromText(canisterId),
          subaccount: [],
        },
      ],
    };

    revokeBip721Transfer([[info]])
      .then((result) => {
        if (!result || "Err" in result) {
          setIsLoading(false);
          toast.warn("Failed to revoke IP transfer");
          console.error(result ? result["Err"] : "No result");
        } else {
          unlistIntProp([{ token_id: intPropId }]).then((result) => {
            setIsLoading(false);
            if (!result || "err" in result) {
              toast.warn("Failed to unlist");
              console.error(result ? result["err"] : "No result");
            } else {
              toast.success("Success");
              // TODO : Find a way to integrate this here and on the wallet component
              // getE8sPrice().finally(() => {
              //   updateBipDetails();
              // });
              setTriggered(!triggered)
              setIsUnlistModalOpen(false);
            }
          });
        }
      })
      .catch((e) => {
        setIsLoading(false);
        console.error(e);
        toast.warn("Failed to unlist");
      });
  };

  const changeQueryDirection = () => {
    setQueryDirection(
      queryDirection === EQueryDirection.Forward
        ? EQueryDirection.Backward
        : EQueryDirection.Forward,
    );
  };

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isUnlistModalOpen, setIsUnlistModalOpen] = useState(false);
  const [selectedBipId, setSelectedBipId] = useState<bigint>(BigInt(0));
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  const handleListClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsListModalOpen(true);
  };

  const handleUnlistClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsUnlistModalOpen(true);
  };

  const handleEditingClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsEditingModalOpen(true);
  };

  return (
    <div className="flex md:h-[89dvh] h-[calc(100dvh-140px)] w-full flex-1 flex-col items-center justify-start gap-y-2 overflow-y-auto pt-2 pb-[20px] text-black dark:text-white sm:items-start sm:gap-y-4">
      <BipsHeader
        sort={queryDirection}
        changeQueryDirection={changeQueryDirection}
      />
      <div className="ml-auto flex w-full md:w-fit flex-col items-center justify-between gap-2 px-2 sm:flex-row sm:px-8">
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
          isGrid={true}
          handleListClick={handleListClick}
          handleUnlistClick={handleUnlistClick}
          triggered={triggered}
        />
      </div>
      <ModalPopup
        onConfirm={() => {
          triggerUnlist(selectedBipId);
        }}
        isOpen={isUnlistModalOpen}
        onClose={() => setIsUnlistModalOpen(false)}
      >
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Do you want to UnList your IP?
          </h2>
        </div>
      </ModalPopup>
    </div>
  );
};

export default Bips;
