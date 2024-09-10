import React from "react";
import { useAuth } from "@ic-reactor/react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Router from "./Router";
import NavBar from "./pages/Layout/NavBar";

import "react-toastify/dist/ReactToastify.css";

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
        <ToastContainer />
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
