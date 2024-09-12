import { useState } from "react";

import LayoutCollapseLeftSvg from "../../../assets/layout-collapse-left.svg";
import LayoutCollapseRightSvg from "../../../assets/layout-collapse-right.svg";
import EditSvg from "../../../assets/edit.svg";
import TrashSvg from "../../../assets/trash.svg";
import AddPlusSvg from "../../../assets/add-plus.svg";

import Logo from "../../../assets/logo.png";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface ListInterface {
  id: string;
  name: string;
}

function SideBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [list, setList] = useState<ListInterface[]>([
    { id: uuidv4(), name: "Nft ai" },
    { id: uuidv4(), name: "Nft ai" },
  ]);

  const deleteItem = (uuid: string) => {
    setList(list.filter((item) => item.id !== uuid));
  };

  const addItem = (name: string) => {
    setList([...list, { id: uuidv4(), name }]);
  };

  return (
    <div
      className={`${isCollapsed ? "w-64" : "w-12"} h-full overflow-auto border-r-2 border-white bg-blue-400 transition-all duration-200`}
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
        <div className="flex flex-col justify-between">
          <div className="h-[90vh] overflow-auto px-2 py-4">
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
            {list.map((item, index) => (
              <div
                className="mt-4 flex items-center justify-between px-4 text-white"
                key={index}
              >
                <p className="cursor-pointer text-xl">{item.name}</p>
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
                    onClick={() => deleteItem(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex h-[10vh] w-full cursor-pointer items-center justify-center gap-4 bg-black bg-opacity-10 text-white"
            onClick={() => addItem("Nft ai")}
          >
            <img
              src={AddPlusSvg}
              className="h-5 cursor-pointer invert"
              alt="Edit"
            />
            Add new
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBar;
