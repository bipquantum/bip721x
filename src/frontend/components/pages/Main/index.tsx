import Logo from "../../../assets/logo.png";
import Profile from "../../../assets/profile.png";

function Main() {
  return (
    <div className="min-h-screen w-full bg-blue-400">
      <div className="flex items-center justify-between p-16 text-base text-white">
        <img src={Logo} className="h-10 invert" alt="Logo" />
        <div className="flex items-center justify-center gap-x-16">
          <div>About</div>
          <div>Add bIP</div>
          <div>Store</div>
        </div>
        <img src={Profile} className="h-10 rounded-full" alt="Logo" />
      </div>
      <div className="m-auto mt-48 w-[320px] text-base font-bold text-white">
        <div className="w-full rounded-full bg-blue-700 py-2 text-center">
          AI Assisted
        </div>
        <div className="mt-8 w-full rounded-full bg-blue-700 py-2 text-center">
          Manual
        </div>
      </div>
    </div>
  );
}

export default Main;
