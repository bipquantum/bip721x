import { useState } from "react";

import LayoutCollapseLeftSvg from "../../assets/layout-collapse-left.svg";
import LayoutCollapseRightSvg from "../../assets/layout-collapse-right.svg";
import EditSvg from "../../assets/edit.svg";
import TrashSvg from "../../assets/trash.svg";
import AddPlusSvg from "../../assets/add-plus.svg";
import LogoSvg from "../../assets/logo.png";

import { Link, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Modal from "../common/Modal";

interface ListInterface {
  id: string;
  name: string;
}

const SideBar = () => {
  const location = useLocation();
  const { pathname } = location;
  const [list, setList] = useState<ListInterface[]>([
    // { id: uuidv4(), name: "Nft ai" },
    // { id: uuidv4(), name: "Nft ai" },
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string>();

  const deleteItem = (uuid: string) => {
    setList(list.filter((item) => item.id !== uuid));
  };

  const addItem = (name: string) => {
    setList([...list, { id: uuidv4(), name }]);
  };

  return (
    <div
      className={`hidden h-full w-64 overflow-auto bg-primary text-white transition-all duration-200 ${pathname.includes("/bip") || pathname === "/about" ? "sm:hidden" : "sm:block"}`}
    >
      <div className="flex flex-col justify-between">
        <div className="h-[90vh] overflow-auto px-2 py-4">
          <div className="flex cursor-pointer items-center justify-center">
            <Link to={"/"}>
              <img src={LogoSvg} className="h-14 invert" alt="Logo" />
            </Link>
          </div>
          {list.map((item, index) => (
            <div
              className="mt-4 flex items-center justify-between px-4"
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
                  onClick={() => {
                    setIsVisible(true);
                    setDeleteItemId(item.id);
                  }}
                />
              </div>
            </div>
          ))}
          <Modal
            isVisible={isVisible}
            onClose={() => {
              setIsVisible(false);
              if (deleteItemId) setDeleteItemId("");
            }}
          >
            <p className="pb-5">Do you really want to quit IP creation?</p>
            <div className="flex w-full justify-center gap-4">
              <button
                className="w-1/3 rounded-xl bg-gray-600 text-white"
                onClick={() => {
                  setIsVisible(false);
                  if (deleteItemId) setDeleteItemId("");
                }}
              >
                No
              </button>
              <button
                className="w-1/3 rounded-xl bg-secondary text-white"
                onClick={() => {
                  setIsVisible(false);
                  if (deleteItemId) {
                    deleteItem(deleteItemId);
                    setDeleteItemId("");
                  }
                }}
              >
                Yes
              </button>
            </div>
          </Modal>
        </div>
        <div
          className="flex h-[10vh] w-full cursor-pointer items-center justify-center gap-4"
          onClick={() => {}}
        >
          <img
            src={AddPlusSvg}
            className="h-5 cursor-pointer invert"
            alt="Edit"
          />
          Add new
        </div>
      </div>
    </div>
  );
};

export default SideBar;
