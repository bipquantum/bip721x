import { Link } from "react-router-dom";

const Dashboard = () => {

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-4 text-primary-text sm:px-16">
      <div className="flex flex-col items-center gap-2 py-4 text-center text-2xl font-bold tracking-wider sm:py-16 sm:text-start sm:text-[32px]">
        Meet bIPQuantum Your Intellectual Property Guardian.
        <div className="h-1 w-32 bg-primary sm:w-96"></div>
      </div>
      <div className="grid grid-cols-2 items-start justify-start gap-8 text-center text-lg font-bold leading-6 text-white">
        <Link className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" to={`/chat`}>
          IP Education/
          <br />
          Consultation
        </Link>
        <Link className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" to={`/chat`}>
          Generate a bIP Certificate
        </Link>
        <Link className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" to={`/chat`}>
          Organize IP Assets
        </Link>
        <Link className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" to={`/chat`}>
          Sell IP Assets on the bIPQuantum Store
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
