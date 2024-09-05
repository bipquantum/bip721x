import { useAuth } from "@ic-reactor/react";
import { Navigate } from "react-router-dom";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

const Login = () => {
  const { login, authenticated } = useAuth({});

  if (authenticated) return <Navigate to="/" />;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 min-h-screen">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 ">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            100% on-chain governance
          </h1>
          <h3 className="text-md font-bold leading-tight tracking-tight text-gray-900 md:text-lg dark:text-white">
            Manage your IPs within the BipQuantum — hosted 100% on the Internet
            Computer blockchain.
          </h3>
          <form className="space-y-4 md:space-y-6" action="#">
            <button
              onClick={() => {
                login();
              }}
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Sign in with Internet Identity
            </button>
            <button
              onClick={() => {
                login({
                  identityProvider: `https://nfid.one/authenticate${CONFIG_QUERY}`,
                });
              }}
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Sign in with NFID
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
