import { useState } from "react";

import LayoutCollapseLeftSvg from "../../../assets/layout-collapse-left.svg";
import LayoutCollapseRightSvg from "../../../assets/layout-collapse-right.svg";
import EditSvg from "../../../assets/edit.svg";
import TrashSvg from "../../../assets/trash.svg";

import Logo from "../../../assets/logo.png";
import { Link } from "react-router-dom";

function SideBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <div
      className={`${isCollapsed ? "w-64" : "w-12"} border-r-2 border-white bg-blue-400 px-2 py-4 transition-all duration-200`}
    >
      {!isCollapsed && (
        <img
          src={LayoutCollapseRightSvg}
          className="h-8 cursor-pointer invert"
          alt="LayoutCollapseRight"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      )}
      {isCollapsed && (
        <>
          <div className="flex cursor-pointer items-center justify-center">
            <Link to={"/"}>
              <img src={Logo} className="h-12 invert" alt="Logo" />
            </Link>
            <img
              src={LayoutCollapseLeftSvg}
              className="h-8 invert"
              alt="LayoutCollapseLeft"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
          <div className="mt-4 flex items-center justify-between px-4 text-white">
            Nft ai
            <div className="flex items-center gap-x-2">
              <img
                src={EditSvg}
                className="h-5 cursor-pointer invert"
                alt="Edit"
              />
              <img
                src={TrashSvg}
                className="h-5 cursor-pointer invert"
                alt="Trash"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SideBar;
