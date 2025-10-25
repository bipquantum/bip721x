import BipsHeader from "./BipsHeader";
import BipList from "./BipList";
import { backendActor } from "../../actors/BackendActor";
import { toNullable } from "@dfinity/utils";
import { useState } from "react";
import { QueryDirection } from "../../../../declarations/backend/backend.did";
import { EQueryDirection } from "../../../utils/conversions";
import { BIP_ITEMS_PER_QUERY } from "../../constants";

const Bips: React.FC = () => {
  const [queryDirection, setQueryDirection] = useState<EQueryDirection>(
    EQueryDirection.Backward,
  );

  const { call: getListedIntProps } = backendActor.unauthenticated.useQueryCall({
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

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start gap-y-2 overflow-y-auto py-2 text-black dark:text-white sm:items-start sm:gap-y-4">
      <BipsHeader
        sort={queryDirection}
        changeQueryDirection={changeQueryDirection}
      />
      <div className="w-full px-4">
        <BipList
          fetchBips={fetchBips}
          queryDirection={queryDirection}
          hideUnlisted={true}
        />
      </div>
    </div>
  );
};

export default Bips;
