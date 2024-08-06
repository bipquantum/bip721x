import { useState, useEffect, useCallback } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/backend/backend.did.js";
import Header from "./components/Header";
import Footer from "./components/Footer";
import IpModal from "./components/IpModal";
import UserModal from "./components/UserModal";

export { idlFactory };

const host = "http://127.0.0.1:4943/";
const canisterId = process.env.CANISTER_ID_BIP_QUANTUM_BACKEND;

async function getActor(identity) {
  const agent = new HttpAgent({ identity });
  await agent.fetchRootKey();
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    agentOptions: { host: host },
    verifyQuerySignatures: false,
  });

  return actor;
}

function App() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authClient, setAuthClient] = useState(null);
  const [userPrincipal, setUserPrincipal] = useState(null);

  const [loading, setLoading] = useState(true); // Loader state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [bipActor, setbipActor] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const identity = await client.getIdentity();
        setUserPrincipal(identity.getPrincipal().toString());
        const actor = await getActor(identity);
        setbipActor(actor);
      }
    };

    initAuth();
  }, []);


  const fetchEntries = useCallback(async () => {
    if (bipActor) {
      setLoading(true);
      const entries = await bipActor.getEntries();
      setEntries(entries);
      setLoading(false);
    }
  }, [bipActor]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [fetchEntries, isAuthenticated]);



  

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleUserModal = () => {
    setIsUserModalOpen(!isUserModalOpen);
  };

  const handleLogin = async (loginProvider="identity") => {
    const APP_NAME = "BIP QUANTUM";
    const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
    const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;
  
    let identityProvider;
  
    switch (loginProvider) {
      case "nfid":
        identityProvider = `https://nfid.one/authenticate${CONFIG_QUERY}`;
        break;

      default:
        identityProvider =
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/#authorize`;
        
    }
  
    await authClient.login({
      identityProvider,
      windowOpenerFeatures: `
      left=${window.screen.width / 2 - 525 / 2},
      top=${window.screen.height / 2 - 705 / 2},
      toolbar=0,location=0,menubar=0,width=525,height=705
    `,
      onSuccess: async () => {
        setIsAuthenticated(true);
        const identity = authClient.getIdentity();
        setUserPrincipal(identity.getPrincipal().toString());
        const actor = await getActor(identity);
        setbipActor(actor);
      },
    });
  };

  const handleLogout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setUserPrincipal(null);
    setbipActor(null);
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 h-auto ">
      <Header
        isAuthenticated={isAuthenticated}
        userPrincipal={userPrincipal}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        toggleModal={toggleModal}
        toggleUserModal={toggleUserModal}
      />

      <IpModal
        isModalOpen={isModalOpen}
        toggleModal={toggleModal}
        bipActor={bipActor}
        userPrincipal={userPrincipal}
         fetchEntries={fetchEntries}
      />
       <UserModal
        isModalOpen={isUserModalOpen}
        toggleModal={toggleUserModal}
        bipActor={bipActor}
        userPrincipal={userPrincipal}
         fetchEntries={fetchEntries}
      />
      <main className="">
        <section className="bg-gray-100  dark:bg-gray-900 overflow-y-auto  mx-auto  max-w-7xl  min-h-screen">

            {isAuthenticated ? (
              <>
              {
                  loading ? (
                    <div className="text-center text-white" style={{ 
                      padding: "100px"
                     }}>Loading...</div>
                  ) : entries.length > 0 ? (
                    entries.map((entry, index) => ( 
<div
                    id="order_container"
                    class="w-full  m-12 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg max-w-8xl my-4  mx-auto"
                  >

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-200">
                      <div>
                        <div class="text-sm font-semibold text-black dark:text-white">
                          CATEGORY
                        </div>
                        <div class="text-lg font-bold text-black dark:text-white">
                          {entry.category}{" "}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-black dark:text-white">
                          PRICE
                        </div>
                        <div class="text-lg font-bold text-green-400">
                          ${entry.price}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-black dark:text-white">
                          IP License
                        </div>
                        <div class="text-lg font-bold text-black dark:text-white">
                          {" "}
                          {entry.ipLicense}{" "}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-black dark:text-white">
                          Publishing date
                        </div>
                        <div class="text-lg font-bold text-black dark:text-white">
                          {" "}
                          {entry.publishingDate}{" "}
                        </div>
                      </div>
                    </div>
                    <div class="pt-4">
                      <div
                        id="product_details"
                        class="  p-6 rounded-lg flex justify-between items-center"
                      >
                        <div class="flex flex-row items-center">
                          <div>
                            <h1 class="font-bold text-black dark:text-white text-2xl ">
                              {entry.title}{" "}
                            </h1>
                            <h3 class="text-xs  mt-1text-black dark:text-white ml-4 ">
                              {entry.description}{" "}
                            </h3>
                          </div>
                        </div>
                     
                      </div>                      
                      
                
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">Author Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</div>
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.authorName}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Family Name</div>
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.familyName}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Speciality</div>
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.authorSpeciality}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Address</div>
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.authorAddress}</div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="text-lg font-semibold  text-black text-left ">
                            Creation date<br/>
                            {entry.creationDate}{" "}
                          </div>
                       
                          <div class="text-lg font-semibold  text-blue-500 text-right ">
                            Owner<br/>
                            {entry.owner.toText()}{" "}
                          </div>
                       </div>
                     
                
                    </div>
                  </div>
                    ))
                  ) : (
                    <div className="text-center text-black dark:text-white" style={{ 
                      padding: "100px"
                     }}>
                      Please add your First IP.
                    </div>
                  )
              }
              
              </>
            ) : (

          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 min-h-screen">
              <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 ">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    100% on-chain governance
                  </h1>
                  <h3 className="text-md font-bold leading-tight tracking-tight text-gray-900 md:text-lg dark:text-white">
                    Manage your IPs within the BipQuantum — hosted 100% on
                    the Internet Computer blockchain.
                  </h3>
                  <form className="space-y-4 md:space-y-6" action="#">
                    <button
                      onClick={handleLogin}
                      type="submit"
                      className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Sign in with Internet Identity
                    </button>
                    <button
                      onClick={() => handleLogin("nfid")}
                      type="submit"
                      className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Sign in with NFID
                    </button>

                  </form>
                </div>
              </div>
              </div>
            )}
       
        </section>
      </main>
{ isAuthenticated && <Footer/>}
    </div>
  );
}

export default App;
