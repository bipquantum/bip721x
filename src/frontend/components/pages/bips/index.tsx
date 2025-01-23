import Balance from "../../common/Balance.js";
import SortUp from "../../../assets/sort-up.svg";
import SortDown from "../../../assets/sort-down.svg";
import BipsHeader from "./BipsHeader.js";
import BipList from "./BipList.js";
import { toNullable } from "@dfinity/utils";
import { useState } from "react";
import { QueryDirection } from "../../../../declarations/backend/backend.did.js";
import { EQueryDirection } from "../../../utils/conversions.js";
import { BIP_ITEMS_PER_QUERY } from "../../constants.js";
import { useIdentity } from "@nfid/identitykit/react";
import { useActors } from "../../common/ActorsContext.js";

const Bips = () => {

  const identity = useIdentity();

  const { unauthenticated } = useActors();

  const [queryDirection, setQueryDirection] = useState<EQueryDirection>(EQueryDirection.Forward);

  const fetchBips = async (prev: bigint | undefined, direction: QueryDirection) => {
    console.log("Fetching bips...");
    if (unauthenticated) {
      return await unauthenticated.backend.get_listed_int_props({ prev: toNullable(prev), take: toNullable(BIP_ITEMS_PER_QUERY), direction });
    } else {
      console.error("Unauthenticated actors not available");
      return [];
    }
  }

  const changeQueryDirection = () => {
    setQueryDirection(queryDirection === EQueryDirection.Forward ? EQueryDirection.Backward : EQueryDirection.Forward);
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-y-2 overflow-y-auto bg-primary text-white sm:items-start sm:gap-y-4 pt-2">
      <BipsHeader/>
      <div className="flex w-full flex-col items-center justify-between gap-2 px-2 sm:flex-row sm:px-8">
        <button className="hidden sm:flex" onClick={() => changeQueryDirection()}>
          <img 
            src={queryDirection === EQueryDirection.Forward ? SortUp : SortDown} 
            alt="Logo"
            className="h-10 invert" 
          />
        </button>
        { identity && <Balance principal={identity.getPrincipal()} /> }
      </div>
      <BipList 
        scrollableClassName="grid grid-cols-1 gap-2 sm:m-0 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 pb-2"
        fetchBips={fetchBips}
        queryDirection={queryDirection}
      />
    </div>
  );
};

export default Bips;
