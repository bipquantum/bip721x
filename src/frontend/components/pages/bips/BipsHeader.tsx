import { EQueryDirection } from "../../../utils/conversions";
import SearchSvg from "../../../assets/search-button.svg";
import SortUp from "../../../assets/sort-up.svg";
import SortDown from "../../../assets/sort-down.svg";

interface BipsHeaderProps {
  sort: EQueryDirection;
  changeQueryDirection: () => void;
}

const BipsHeader: React.FC<BipsHeaderProps> = ({ sort, changeQueryDirection }) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between p-4 space-y-2">
      <div className="relative group flex w-full sm:w-[320px] items-center justify-start rounded-2xl border-opacity-40 bg-white p-2 dark:bg-white/10">
        <div className="mx-1 flex h-8 w-8 items-center justify-center rounded-full">
          <img src={SearchSvg} className="h-4" alt="Search" />
        </div>
        <input
          className="w-full flex-1 bg-transparent text-base font-medium leading-10 placeholder-slate-300"
          placeholder="Search by BIP#, author, license... "
          disabled={true}
        />
        <span className="absolute hidden w-max items-center rounded bg-black px-2 py-1 text-sm text-white opacity-75 group-hover:flex z-50">
          Coming Soon!
        </span>
      </div>
      <button className="flex flex-row gap-[10px] bg-white/10 rounded-lg px-6 py-2 items-center self-end" onClick={() => changeQueryDirection()}>
        <img
          src={sort === EQueryDirection.Forward ? SortUp : SortDown}
          alt="Logo"
          className="h-8 dark:invert"
        />
      </button>
    </div>
  );
};

export default BipsHeader;
