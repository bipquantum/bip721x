import { backendActor } from "../../actors/BackendActor";
import {
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";

import FavoriteHeartOutlineSvg from "../../../assets/favourite-heart-outline.svg";
import AIBotImg from "../../../assets/ai-bot.jpeg";

interface IPItemProps {
  intPropId: bigint;
}

const BipItem: React.FC<IPItemProps> = ({ intPropId }) => {
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  return (
    <>
      {intProp === undefined ? (
        <div
          className="text-center text-white"
          style={{
            padding: "100px",
          }}
        >
          Loading...
        </div>
      ) : "err" in intProp ? (
        <div>
          <h1>Error</h1>
          <p>{"Cannot find IP"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 justify-between gap-8 px-4">
          <div className="flex w-72 flex-col gap-y-1 rounded-xl bg-white p-4 text-base">
            <img
              src={AIBotImg}
              className="mb-2 h-[272px] w-[272px] rounded-xl object-cover"
              alt="Logo"
            />
            <div className="flex items-center justify-between font-bold">
              <div className="text-xl">{intProp.ok.title}</div>
              <div className="rounded-full bg-violet-600 px-2 text-sm text-white">
                Buy
              </div>
            </div>
            <div>Type: {intPropTypeToString(intProp.ok.intPropType)}</div>
            <div>
              license: {intPropLicenseToString(intProp.ok.intPropLicense)}
            </div>
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
      )}
    </>
  );
};

export default BipItem;
