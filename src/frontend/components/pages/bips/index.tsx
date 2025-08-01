import { Principal } from "@dfinity/principal";

import Balance from "../../common/Balance";

import BipsHeader from "./BipsHeader";
import BipList from "./BipList";
import { backendActor } from "../../actors/BackendActor";
import { toNullable } from "@dfinity/utils";
import { useState } from "react";
import { QueryDirection } from "../../../../declarations/backend/backend.did";
import { EQueryDirection } from "../../../utils/conversions";
import { BIP_ITEMS_PER_QUERY } from "../../constants";

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
      <div className="flex w-full flex-col items-center gap-2 px-2 sm:flex-row sm:px-8 md:w-fit">
        {principal !== undefined && !principal.isAnonymous() && (
          <Balance principal={principal} />
        )}
      </div>
      <div className="w-full px-4">
        <BipList
          scrollableClassName="grid w-full flex-grow lg:grid-cols-2 xl:grid-cols-4 gap-[20px]"
          principal={principal}
          fetchBips={fetchBips}
          queryDirection={queryDirection}
          isGrid={true}
          triggered={false}
          hideUnlisted={true}
        />
      </div>
    </div>
  );
};

export default Bips;
