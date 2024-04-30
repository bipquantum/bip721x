import ii from "../assets/dfinity.svg";
// import nfid from "../assets/nfid-logo.svg";

export const AuthButton = ({
  onAuthSuccess,
  reset,
  signoutHandler,
  authenticate,
  isAuthenticated,
  identity,
}) => {
  return (
    <div className="flex items-center mr-12 px-8 py-8 w-full bg-slate-800">
      {!isAuthenticated && (
        <a onClick={authenticate} className="flex items-center justify-start">
          <span className="hover:text-white hover:font-bold">
            Connect using Internet Identity
          </span>
          <img src={ii} alt="ii-img" width={"30px"} className="ml-2" />
        </a>
      )}
    </div>
  );
};
