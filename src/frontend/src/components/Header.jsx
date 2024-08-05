import React,{useState} from 'react'
import Logo from "/src/logo.png"
function Header({ isAuthenticated,userPrincipal,handleLogin,handleLogout,toggleModal,toggleUserModal}) {


  const [isMenuOpen, setisMenuOpen] = useState(false);

  return (
  

<nav class="bg-white dark:bg-gray-900  w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 ">
  <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
      <img src={Logo} class="h-12" alt=" Logo"/>

  </a>

  <div class="flex md:order-2 space-x-3 md:space-x-4  rtl:space-x-reverse">

  {isAuthenticated ? (<>
    <button
        onClick={toggleModal}
        className="block text-white dark:text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
   Create New IP
      </button>

      <button onClick={toggleUserModal} type="button" class="flex text-sm bg-gray-800  px-2 items-center rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
        <span class="sr-only">Open user menu</span>
        <svg class="w-6 h-6 text-white dark:text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/>
</svg>

      </button>

    <button        onClick={handleLogout}  type="button" class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
      <svg className="w-6 h-6 text-white dark:text-gray-800 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
</svg>
</button>


 

   
   

   
  </>
     
  ) : (   
    <button         onClick={handleLogin}type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login</button> 
    
  ) } 
    
  </div>
  
  </div>
</nav>

  )
}

export default Header