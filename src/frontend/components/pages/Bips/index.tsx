import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";

import BipItem from "./BipItem";
import { backendActor } from "../../actors/BackendActor";

import Logo from "../../../assets/logo.png";
import FilterSvg from "../../../assets/filter.svg";

export enum FilterType {
  LISTED,
  OWNED,
}

interface BipsProps {
  principal: Principal | undefined;
  filterBy: FilterType;
}

const Bips: React.FC<BipsProps> = ({ principal, filterBy }) => {
  // TODO sardariuss 2024-SEP-09: be able to scroll through the list
  var prev: [] | [bigint] = [];
  var take: [] | [bigint] = [BigInt(10)];

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
  }, [principal]);

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col items-start justify-start gap-4 gap-y-8 bg-blue-400 py-4">
      <img src={Logo} className="h-12 invert" alt="Logo" />
      <div className="flex w-full items-center justify-between px-4">
        <button>
          <img src={FilterSvg} className="h-8 invert" alt="Logo" />
        </button>
        <input className="rounded-xl border-[2px] border-white border-opacity-45 bg-blue-400 px-4 text-white outline-none" />
      </div>
      {entries?.map((intPropId, index) => (
        <BipItem intPropId={intPropId} key={index} />
      ))}
    </div>
  );
};

export default Bips;
