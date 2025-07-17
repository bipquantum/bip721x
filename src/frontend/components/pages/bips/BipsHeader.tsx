import { EQueryDirection } from "../../../utils/conversions";
import SearchSvg from "../../../assets/search-button.svg";
import SortUp from "../../../assets/sort-up.svg";
import SortDown from "../../../assets/sort-down.svg";
import SearchIPInput from "../../common/SearchIPInput";

interface BipsHeaderProps {
  sort: EQueryDirection;
  changeQueryDirection: () => void;
}

const BipsHeader: React.FC<BipsHeaderProps> = ({ sort, changeQueryDirection }) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between p-4 space-y-2">
      <SearchIPInput />
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
