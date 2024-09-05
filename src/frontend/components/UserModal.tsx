import { useAuth } from "@ic-reactor/react";
import { useEffect, useState } from "react";
import { fromNullable } from "@dfinity/utils";

import { backendActor } from "./actors/BackendActor";
import { UserArgs } from "../../declarations/backend/backend.did";

import CopySvg from "../assets/copy.svg";
import { toast } from "react-toastify";

const EMPTY_USER = {
  firstName: "",
  lastName: "",
  nickName: "",
  specialty: "",
  country: "",
};

type UserModalProps = {
  isModalOpen: boolean;
  toggleModal: () => void;
};

function UserModal({ isModalOpen, toggleModal }: UserModalProps) {
  const { authenticated, identity } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  // Form state initialization
  const [user, setUser] = useState<UserArgs>(EMPTY_USER);

  const { data: queriedUser, call: queryUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  const { call: updateUser } = backendActor.useUpdateCall({
    functionName: "set_user",
    args: [user],
  });

  useEffect(() => {
    queryUser();
  }, [isModalOpen]);

  useEffect(() => {
    setUser(fromNullable(queriedUser || []) || EMPTY_USER);
  }, [queriedUser]);

  const triggerUpdate = async () => {
    let result = await updateUser();
    console.log("User added/updated:", result);
    queryUser();
    toggleModal();
    alert("User information added/updated!");
  };

  return (
    <>
      <div
        id="crud-modal"
        tabIndex={-1}
        aria-hidden={!isModalOpen}
        className={`${
          isModalOpen ? "flex" : "hidden"
        } fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {identity?.getPrincipal().toString()}
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    identity?.getPrincipal().toString()
                  );
                  toast.success("Copied successfully!");
                }}
                className="mr-2"
              >
                <img src={CopySvg} />
              </button>
              <button
                type="button"
                onClick={toggleModal}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                triggerUpdate();
              }}
              className="p-4 md:p-5"
            >
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Enter firstName"
                    value={user.firstName}
                    onChange={(e) => {
                      setUser({ ...user, firstName: e.target.value });
                    }}
                    required={true}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Enter lastName"
                    value={user.lastName}
                    onChange={(e) => {
                      setUser({ ...user, lastName: e.target.value });
                    }}
                    required={true}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="nickName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Nickname
                  </label>
                  <input
                    type="text"
                    id="nickName"
                    name="nickName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Enter nickName"
                    value={user.nickName}
                    onChange={(e) => {
                      setUser({ ...user, nickName: e.target.value });
                    }}
                    required={true}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="specialty"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Specialty
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Enter specialty"
                    value={user.specialty}
                    onChange={(e) => {
                      setUser({ ...user, specialty: e.target.value });
                    }}
                    required={true}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="country"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Enter country"
                    value={user.country}
                    onChange={(e) => {
                      setUser({ ...user, country: e.target.value });
                    }}
                    required={true}
                  />
                </div>
                <button
                  type="submit"
                  className="col-span-2 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <svg
                    className="me-1 -ms-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Add/Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserModal;
