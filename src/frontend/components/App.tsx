import React, { useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { BrowserRouter, useLocation } from "react-router-dom";

import Login from "./Login";
import Header from "./Header";
import Footer from "./Footer";
import IpModal from "./IpModal";
import UserModal from "./UserModal";
import IPList from "./IPList.js";
import Router from "./Router";
import { ToastContainer } from "react-toastify";

import NavBar from "./pages/Layout/NavBar";

function App() {
  const { authenticated } = useAuth({});

  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // const toggleModal = () => {
  //   setIsModalOpen(!isModalOpen);
  // };

  // const toggleUserModal = () => {
  //   setIsUserModalOpen(!isUserModalOpen);
  // };

  return (
    <div className="flex min-h-screen w-full">
      <BrowserRouter>
        <NavBar />
        <Router />
      </BrowserRouter>
    </div>

    // <div className="flex h-auto flex-col bg-gray-100 dark:bg-gray-900">
    //   <BrowserRouter>
    //     <Header toggleModal={toggleModal} toggleUserModal={toggleUserModal} />
    //     <IpModal isModalOpen={isModalOpen} toggleModal={toggleModal} />
    //     <UserModal
    //       isModalOpen={isUserModalOpen}
    //       toggleModal={toggleUserModal}
    //     />
    //     <ToastContainer />
    //     <main>
    //       <section className="mx-auto min-h-screen max-w-7xl overflow-y-auto bg-gray-100 dark:bg-gray-900">
    //         <Router />
    //       </section>
    //     </main>
    //     {authenticated && <Footer />}
    //   </BrowserRouter>
    // </div>
  );
}

export default App;
