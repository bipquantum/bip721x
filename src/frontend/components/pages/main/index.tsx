import { Link } from "react-router-dom";

import Logo from "../../../assets/logo.png";
import Profile from "../../../assets/profile.png";

const Main = () => {
  return (
    <div className="h-full w-full overflow-auto bg-white text-base font-bold text-black dark:bg-blue-400 dark:text-white">
      <div className="flex items-center justify-between p-16">
        <img src={Logo} className="h-10 dark:invert" alt="Logo" />
        <div className="flex items-center justify-center gap-x-16">
          <Link to={"/about"}>About</Link>
          <Link to={"/new"}>Add bIP</Link>
          <Link to={"/store"}>Store</Link>
        </div>
        <Link to={"profile"}>
          <img src={Profile} className="h-10 rounded-full" alt="Logo" />
        </Link>
      </div>
      <div className="m-auto mt-48 w-[320px] font-bold text-white">
        <button className="w-full rounded-full bg-blue-700 py-2 text-center">
          AI Assisted
        </button>
        <Link to={"/dashboard"}>
          <button className="mt-8 w-full rounded-full bg-blue-700 py-2 text-center">
            Manual
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Main;
