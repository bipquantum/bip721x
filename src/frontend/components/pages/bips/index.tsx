import { Principal } from "@dfinity/principal";

import Balance from "../../common/Balance";

import FilterSvg from "../../../assets/filter.svg";
import BipsHeader from "./BipsHeader";
import BipList from "./BipList";
import { backendActor } from "../../actors/BackendActor";
import { toNullable } from "@dfinity/utils";

interface BipsProps {
  principal: Principal | undefined;
}

const Bips: React.FC<BipsProps> = ({ principal }) => {

  if (!principal) return <></>;

  const { call: getListedIntProps } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
  });

  const fetchBips = async (prev: bigint | undefined) => {
    return await getListedIntProps([{ prev: toNullable(prev), take: toNullable(5n) }]);
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-y-4 overflow-y-auto bg-primary py-4 text-white sm:items-start sm:p-0">
      <BipsHeader/>
      <div className="flex w-full flex-col items-center justify-between gap-2 px-2 sm:flex-row sm:px-8">
        <button className="hidden sm:flex">
          <img src={FilterSvg} className="h-8 invert" alt="Logo" />
        </button>
        <Balance principal={principal} />
      </div>
      <BipList 
        scrollableClassName="grid grid-cols-2 gap-2 sm:m-0 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        principal={principal}
        fetchBips={fetchBips}
      />
    </div>
  );
};

export default Bips;
