import { EQueryDirection } from "../../../utils/conversions";
import SortUp from "../../../assets/sort-up.svg";
import SortDown from "../../../assets/sort-down.svg";
import SearchIPInput from "../../common/SearchIPInput";

interface BipsHeaderProps {
  sort: EQueryDirection;
  changeQueryDirection: () => void;
}

const BipsHeader: React.FC<BipsHeaderProps> = ({
  sort,
  changeQueryDirection,
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-between space-y-2 p-4 sm:flex-row">
      <SearchIPInput />
      <button
        className="flex flex-row items-center gap-[10px] self-end rounded-lg bg-white/10 px-6 py-2"
        onClick={() => changeQueryDirection()}
      >
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
