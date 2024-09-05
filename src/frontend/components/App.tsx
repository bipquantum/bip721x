import { useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { BrowserRouter } from "react-router-dom";

import Login from "./Login";
import Header from "./Header";
import Footer from "./Footer";
import IpModal from "./IpModal";
import UserModal from "./UserModal";
import IPList from "./IPList.js";
import Router from "./Router";

function App() {
  const { authenticated } = useAuth({});

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleUserModal = () => {
    setIsUserModalOpen(!isUserModalOpen);
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 h-auto ">
      <BrowserRouter>
        <Header toggleModal={toggleModal} toggleUserModal={toggleUserModal} />
        <IpModal isModalOpen={isModalOpen} toggleModal={toggleModal} />
        <UserModal
          isModalOpen={isUserModalOpen}
          toggleModal={toggleUserModal}
        />
        <main>
          <section className="bg-gray-100 dark:bg-gray-900 overflow-y-auto mx-auto max-w-7xl min-h-screen">
            <Router />
          </section>
        </main>
        {authenticated && <Footer />}
      </BrowserRouter>
    </div>
  );
}

export default App;
