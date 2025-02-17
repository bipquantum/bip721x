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

interface BipsProps {
  principal: Principal | undefined; // TODO: it does not need to be optional, apparently principal is always defined but anonymous if not logged in
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
    <div className="flex h-[80vh] w-full flex-1 flex-col items-center justify-start gap-y-2 overflow-y-auto pt-2 text-black dark:text-white sm:items-start sm:gap-y-4">
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
      {/* <BipList 
        scrollableClassName="grid grid-cols-1 gap-2 sm:m-0 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 pb-2"
        principal={principal}
        fetchBips={fetchBips}
        queryDirection={queryDirection}
      /> */}
      <BipMarketplace/>
    </div>
  );
};

export default Bips;
