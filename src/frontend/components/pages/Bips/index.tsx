import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";

import BipItem from "./BipItem";
import { backendActor } from "../../actors/BackendActor";
import Balance from "../../common/Balance";

import Logo from "../../../assets/logo.png";
import FilterSvg from "../../../assets/filter.svg";
import ToggleSwitch from "../../common/ToggleSwitch";

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

  const { data: user_account } = backendActor.useQueryCall({
    functionName: "get_user_account",
    args: [{ user: principal }],
  });

  useEffect(() => {
    fetchEntries();
  }, [principal, filterBy]);

  useEffect(() => {
    if (isListedIPs) setFilterBy(FilterType.LISTED);
    else setFilterBy(FilterType.OWNED);
  }, [isListedIPs]);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-start justify-start gap-4 gap-y-8 overflow-auto bg-blue-400 py-4">
      <img src={Logo} className="h-12 invert" alt="Logo" />
      <div className="flex w-full items-center justify-between px-4">
        <button>
          <img src={FilterSvg} className="h-8 invert" alt="Logo" />
        </button>
        <div className="flex items-center justify-center gap-3 text-white">
          {user_account && <Balance account={user_account} />}
          <p className="">{isListedIPs ? "Listed IPs" : "My IPs"}</p>
          <ToggleSwitch vaule={isListedIPs} setValue={setIsListedIPs} />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 p-4">
        {entries?.map((intPropId, index) => (
          <BipItem intPropId={intPropId} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Bips;
