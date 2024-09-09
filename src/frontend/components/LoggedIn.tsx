import { useAuth } from "@ic-reactor/react";
import { Principal } from "@dfinity/principal";
import { Link } from "react-router-dom";

import { backendActor } from "./actors/BackendActor";

import Balance from "./Balance";

type LoggedInProps = {
  toggleModal: () => void;
  toggleUserModal: () => void;
  principal: Principal;
};

function LoggedIn({ toggleModal, toggleUserModal, principal }: LoggedInProps) {
  // TODO sardariuss 2024-SEP-03: remove log
  // console.log(principal.toText());

  const { logout } = useAuth({});

  const { data: user_account } = backendActor.useQueryCall({
    functionName: "get_user_account",
    args: [{ user: principal }],
  });

  return (
    <div className="flex flex-row gap-x-3">
      <button
        onClick={toggleModal}
        className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Create New IP
      </button>
      <Link
        className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        to="/myip"
      >
        My Ip
      </Link>
      {user_account ? <Balance account={user_account} /> : <></>}
      <button
        onClick={toggleUserModal}
        type="button"
        className="flex items-center rounded-full bg-gray-800 px-2 text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 md:me-0"
        id="user-menu-button"
        aria-expanded="false"
        data-dropdown-toggle="user-dropdown"
        data-dropdown-placement="bottom"
      >
        <span className="sr-only">Open user menu</span>
        <svg
          className="h-6 w-6 text-white dark:text-gray-800"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        onClick={() => {
          logout();
        }}
        type="button"
        className="rounded-lg bg-red-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
      >
        <svg
          className="h-6 w-6 text-white dark:text-gray-800"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
          />
        </svg>
      </button>
    </div>
  );
}

export default LoggedIn;
