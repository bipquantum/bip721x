import { useAuth } from "@ic-reactor/react";
import { Navigate } from "react-router-dom";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

const Login = () => {
  const { login, authenticated } = useAuth({});

  if (authenticated) return <Navigate to="/" />;

  return (
    <div className="mx-auto flex h-full flex-col items-center justify-center overflow-auto px-6 py-8 lg:py-0">
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            100% on-chain governance
          </h1>
          <h3 className="text-md font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-lg">
            Manage your IPs within the BipQuantum — hosted 100% on the Internet
            Computer blockchain.
          </h3>
          <form className="space-y-4 md:space-y-6" action="#">
            <button
              onClick={() => {
                login();
              }}
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
