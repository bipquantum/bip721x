import { useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { backend } from "../../declarations/backend/index.js";
import Login from "./Login";
import Header from "./Header";
import Footer from "./Footer";
import IpModal from "./IpModal";
import UserModal from "./UserModal";
import IPList from "./IPList.js";

function App() {

  const { authenticated } = useAuth({});

  const [entries, setEntries] = useState([]);

  const [loading, setLoading] = useState(true); // Loader state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [bipActor, setbipActor] = useState<typeof backend | null>(null);

  const fetchEntries = () => {
    return 0
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleUserModal = () => {
    setIsUserModalOpen(!isUserModalOpen);
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 h-auto ">
      <Header
        toggleModal={toggleModal}
        toggleUserModal={toggleUserModal}
      />
      <IpModal
        isModalOpen={isModalOpen}
        toggleModal={toggleModal}
        bipActor={bipActor}
        fetchEntries={fetchEntries}
      />
      <UserModal
        isModalOpen={isUserModalOpen}
        toggleModal={toggleUserModal}
        bipActor={bipActor}
        fetchEntries={fetchEntries}
      />
      <main>
        <section className="bg-gray-100 dark:bg-gray-900 overflow-y-auto mx-auto max-w-7xl min-h-screen">
          {  
            authenticated ? <IPList entries={entries} loading={loading} /> : <Login/>
          }
        </section>
      </main>
      { authenticated && <Footer/>}
    </div>
  );
}

export default App;
