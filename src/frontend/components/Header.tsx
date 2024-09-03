import Logo from '../assets/logo.png'

import { useAuth, useQueryCall } from '@ic-reactor/react'
import LoggedIn from "./LoggedIn"

type HeaderProps = {
  toggleModal: () => void;
  toggleUserModal: () => void;
}

function Header({ toggleModal, toggleUserModal } : HeaderProps) {

  const { login, authenticated, identity } = useAuth({});

  return (
    <nav className="bg-white dark:bg-gray-900  w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 ">
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={Logo} className="h-12" alt=" Logo"/>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-4  rtl:space-x-reverse">
          {
            authenticated && identity?.getPrincipal() ? 
              <LoggedIn toggleModal={toggleModal} toggleUserModal={toggleUserModal} principal={identity?.getPrincipal()}/> :    
              <button onClick={() => { login() }}type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login</button> 
          }
        </div>
      </div>
    </nav>
  )
}

export default Header