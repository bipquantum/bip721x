import { useState } from "react";
import Logo from "../../../assets/logo.png";
import AIBotImg from "../../../assets/ai-bot.jpeg";
import FilterSvg from "../../../assets/filter.svg";
import FavoriteHeartFilledSvg from "../../../assets/favourite-heart-filled.svg";
import FavoriteHeartOutlineSvg from "../../../assets/favourite-heart-outline.svg";
import BipDetails from "./BipDetails";

function Bips() {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col items-start justify-start gap-4 gap-y-8 bg-blue-400 py-4">
      <img src={Logo} className="h-12 invert" alt="Logo" />
      <div className="flex w-full items-center justify-between px-4">
        <button>
          <img src={FilterSvg} className="h-8 invert" alt="Logo" />
        </button>
        <input className="rounded-xl border-[2px] border-white border-opacity-45 bg-blue-400 px-4 text-white outline-none" />
      </div>
      {!showDetails ? (
        <div
          className="grid grid-cols-4 justify-between gap-8 px-4"
          onClick={() => setShowDetails(true)}
        >
          <div className="flex w-72 flex-col gap-y-1 rounded-xl bg-white p-4 text-base">
            <img
              src={AIBotImg}
              className="mb-2 h-[272px] w-[272px] rounded-xl object-cover"
              alt="Logo"
            />
            <div className="flex items-center justify-between font-bold">
              <div className="text-xl">Ovni Car</div>
              <div className="rounded-full bg-violet-600 px-2 text-sm text-white">
                Buy
              </div>
            </div>
            <div>Type: Pre-Patent</div>
            <div>license: Reproduction</div>
            <div className="flex items-center justify-between">
              <div className="font-bold text-blue-600">$200 000,00</div>
              <button>
                <img
                  src={FavoriteHeartOutlineSvg}
                  className="h-4 w-4"
                  alt="Logo"
                />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <BipDetails />
      )}
    </div>
  );
}

export default Bips;
