import { Link } from "react-router-dom";

const WhoAreYou = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-primary">
      <div className="w-96">
        <p className="p-2 px-10 text-white">Who are you?</p>
        <Link to={"/"} className="flex w-full flex-col gap-4">
          <div className="flex cursor-pointer items-center justify-start gap-4 rounded-full bg-white px-2 text-secondary">
            <div className="h-4 w-4 rounded-full border-2 border-secondary"></div>
            <p className="w-full flex-1 text-start">Legal expert</p>
          </div>
          <div className="flex cursor-pointer items-center justify-start gap-4 rounded-full bg-white px-2 text-secondary">
            <div className="h-4 w-4 rounded-full border-2 border-secondary"></div>
            <p className="w-full flex-1 text-start">Creator</p>
          </div>
          <div className="flex cursor-pointer items-center justify-start gap-4 rounded-full bg-white px-2 text-secondary">
            <div className="h-4 w-4 rounded-full border-2 border-secondary"></div>
            <p className="w-full flex-1 text-start">Collector</p>
          </div>
          <div className="flex cursor-pointer items-center justify-start gap-4 rounded-full bg-white px-2 text-secondary">
            <div className="h-4 w-4 rounded-full border-2 border-secondary"></div>
            <p className="w-full flex-1 text-start">Other</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WhoAreYou;
