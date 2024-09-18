import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { backendActor } from "../../actors/BackendActor";
import {
  fromE8s,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";
import FilePreview from "../../common/FilePreview";

import FavoriteHeartOutlineSvg from "../../../assets/favourite-heart-outline.svg";
import AIBotImg from "../../../assets/ai-bot.png";

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
    } else setPrice("");
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
          className="grid justify-between gap-8 p-2"
          to={`/bip/${intPropId}`}
        >
          <div className="bg-tertiary flex w-72 flex-col gap-y-1 rounded-2xl p-4 text-base text-white">
            {intProp.ok.dataUri ? (
              <div className="w-full">
                <FilePreview
                  dataUri={intProp.ok.dataUri}
                  className="h-[184px] w-[272px] rounded-xl object-cover"
                />
              </div>
            ) : (
              <img
                src={AIBotImg}
                className="mb-2 h-[184px] w-[272px] rounded-xl border border-gray-300 object-cover shadow-md"
                alt="Logo"
              />
            )}
            <div className="flex items-center justify-between font-semibold">
              <p className="text-2xl">{intProp.ok.title}</p>
              <button className="rounded-full bg-[#6d15ff] px-4 py-1 text-sm">
                Buy
              </button>
            </div>
            <p className="text-base font-semibold">
              Type: {intPropTypeToString(intProp.ok.intPropType)}
            </p>
            <p className="text-base font-semibold">
              License: {intPropLicenseToString(intProp.ok.intPropLicense)}
            </p>
            <div className="flex items-center justify-between text-[22px] font-bold">
              {price !== "" ? (
                <div className="font-bold">{price} ICP</div>
              ) : (
                <div></div>
              )}
              <button>
                <img
                  src={FavoriteHeartOutlineSvg}
                  className="h-8 w-8"
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
