import Logo from "../assets/logo.png";

import { useAuth, useQueryCall } from "@ic-reactor/react";
import LoggedIn from "../LoggedIn";

type HeaderProps = {
  toggleModal: () => void;
  toggleUserModal: () => void;
};

function Header({ toggleModal, toggleUserModal }: HeaderProps) {
  const { login, authenticated, identity } = useAuth({});

  return (
    <nav className="start-0 top-0 z-20 w-full border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={Logo} className="h-12" alt=" Logo" />
        </a>
        <div className="flex space-x-3 md:order-2 md:space-x-4 rtl:space-x-reverse">
          {authenticated && identity?.getPrincipal() ? (
            <LoggedIn
              toggleModal={toggleModal}
              toggleUserModal={toggleUserModal}
              principal={identity?.getPrincipal()}
            />
          ) : (
            <button
              onClick={() => {
                login();
              }}
              type="button"
              className="rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
