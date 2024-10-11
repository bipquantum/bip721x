import Logo from "../../../assets/logo.png";
import SearchSvg from "../../../assets/search-button.svg";

const BipsHeader = () => {
  return (
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
    </div>
  )
}

export default BipsHeader;