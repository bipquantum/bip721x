import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { backendActor } from "../../actors/BackendActor";
import {
  fromE8s,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";

import FavoriteHeartOutlineSvg from "../../../assets/favourite-heart-outline.svg";
import AIBotImg from "../../../assets/ai-bot.jpeg";

interface IPItemProps {
  intPropId: bigint;
}

const BipItem: React.FC<IPItemProps> = ({ intPropId }) => {
  const [price, setPrice] = useState("");
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  const { data: e8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: intPropId }],
  });

  useEffect(() => {
    if (e8sPrice && "ok" in e8sPrice) {
      const price = fromE8s(e8sPrice.ok).toFixed(2);
      setPrice(price);
    } else setPrice("N/A");
  }, [e8sPrice]);

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
        <Link
          className="grid grid-cols-4 justify-between gap-8 px-4"
          to={`/bip/${intPropId}`}
        >
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
              <div className="font-bold text-blue-600">{price} ICP</div>
              <button>
                <img
                  src={FavoriteHeartOutlineSvg}
                  className="h-4 w-4"
                  alt="Logo"
                />
              </button>
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default BipItem;
