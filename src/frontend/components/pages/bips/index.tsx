import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";

import BipItem from "./BipItem";
import { backendActor } from "../../actors/BackendActor";
import Balance from "../../common/Balance";
import ToggleSwitch from "../../common/ToggleSwitch";

import Logo from "../../../assets/logo.png";
import FilterSvg from "../../../assets/filter.svg";
import ProfileSvg from "../../../assets/profile.png";
import SearchSvg from "../../../assets/search-button.svg";

export enum FilterType {
  LISTED,
  OWNED,
}

interface BipsProps {
  principal: Principal | undefined;
}

const prev: [] | [bigint] = [];
const take: [] | [bigint] = [BigInt(10)];

const Bips: React.FC<BipsProps> = ({ principal }) => {
  const [isListedIPs, setIsListedIPs] = useState(true);
  const [filterBy, setFilterBy] = useState<FilterType>(FilterType.LISTED);

  if (!principal) return <></>;

  const { data: entries, call: fetchEntries } = backendActor.useQueryCall({
    functionName:
      filterBy === FilterType.OWNED
        ? "get_int_props_of"
        : "get_listed_int_props",
    args:
      principal && filterBy === FilterType.OWNED
        ? [{ owner: principal, prev, take }]
        : [{ prev, take }],
  });

  useEffect(() => {
    fetchEntries();
  }, [principal, filterBy]);

  useEffect(() => {
    if (isListedIPs) setFilterBy(FilterType.LISTED);
    else setFilterBy(FilterType.OWNED);
  }, [isListedIPs]);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-y-4 overflow-auto bg-primary py-4 text-white sm:items-start sm:p-0">
      <div className="hidden w-full items-center justify-between border-b-[1px] border-white p-4 pr-8 sm:flex">
        <img src={Logo} className="h-14 invert" alt="Logo" />
        <div className="flex w-[428px] items-center justify-start rounded-[69px] border-2 border-secondary border-opacity-40 p-2">
          <div className="mx-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <img src={SearchSvg} className="h-4" alt="Logo" />
          </div>
          <input
            className="w-full flex-1 bg-transparent text-base font-medium leading-10 placeholder-slate-300"
            placeholder="Search Here"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold leading-[26px]">Bessie Cooper</p>
          <img src={ProfileSvg} className={`h-10 rounded-full`} />
        </div>
      </div>
      <div className="flex w-full items-center justify-between px-2 sm:px-8">
        <button>
          <img src={FilterSvg} className="h-8 invert" alt="Logo" />
        </button>
        <div className="flex items-center justify-center gap-3">
          <Balance principal={principal}/>
          <p className="">{isListedIPs ? "Listed IPs" : "My IPs"}</p>
          <ToggleSwitch vaule={isListedIPs} setValue={setIsListedIPs} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:m-0 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {entries?.map((intPropId, index) => (
          <BipItem intPropId={intPropId} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Bips;
