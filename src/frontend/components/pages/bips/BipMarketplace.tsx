import React from "react";
import { Link } from "react-router-dom";
import FilePreview from "../../common/FilePreview";
import {
  TbCheck,
  TbEye,
  TbPencil,
  TbShare,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { IoIosPricetags } from "react-icons/io";
import AiBot from "../../../assets/ai-bot.png";

const dummyData = {
  "Discover": [
    {
      id: 3,
      title: "Monkey Ape",
      user: "@JSmith",
      image: AiBot,
      views: 211,
      price: "10.00 BQC",
      type: "Copyright",
      license: "SaaS",
      auction: false,
    },
    {
      id: 4,
      title: "Monkey Ape",
      user: "@JSmith",
      image: AiBot,
      views: 211,
      price: "10.00 BQC",
      type: "Copyright",
      license: "SaaS",
      auction: false,
    },
  ],
  "Live Auction": [
    {
      id: 1,
      title: "Monkey Ape",
      user: "@JSmith",
      image: AiBot,
      views: 211,
      price: "10.00 BQC",
      type: "Copyright",
      license: "SaaS",
      auction: true,
    },
    {
      id: 2,
      title: "Monkey Ape",
      user: "@JSmith",
      image: AiBot,
      views: 211,
      price: "10.00 BQC",
      type: "Copyright",
      license: "SaaS",
      listed: true,
    },
  ],
};

const BipMarketplace = () => {
  return (
    <div className="flex flex-col gap-[10px] md:gap-[30px] px-[10px] md:px-[30px] w-full">
      {Object.entries(dummyData).map(([category, items]) => (
        <div key={category} className="flex flex-col gap-[10px]">
          <p className="text-lg font-momentum font-extrabold uppercase text-black dark:text-white">
            {category}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-[20px] md:mx-0 mx-auto">
            {items.map((item) => (
              <Link
                key={item.id}
                className="md:min-h-[450px] min-h-[350px] w-[300px] md:w-[400px] rounded-2xl border-2 border-primary/10 dark:border-white/50 bg-white dark:bg-white/10 backdrop-blur-[10px]"
                to={`/bip/${item.id}`}
              >
                <div className="flex h-full flex-col gap-y-1 p-2 text-base text-black dark:text-white">
                  <div className="relative h-[260px] w-full rounded-lg">
                    <img
                      src={item.image}
                      alt=""
                      className="flex h-[260px] w-[390px] flex-col items-center justify-center overflow-hidden rounded-2xl object-cover"
                    />
                    <div className="absolute right-0 top-0 flex h-[60px] w-[100px] items-center justify-center rounded-bl-3xl rounded-tr-lg bg-neutral-600/40 backdrop-blur-md">
                      <p className="flex flex-row items-center gap-1 text-sm">
                        <TbEye size={18} /> {item.views}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-full flex-col justify-between pt-3">
                    <div className="flex flex-row items-start justify-between">
                      <div className="flex flex-row gap-2 w-full">
                        <div className="h-[40px] w-[40px] overflow-hidden rounded-full bg-blue-500">
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="w-full flex flex-row items-center justify-between">
                          <div>
                            <p className="text-2xl leading-none">
                              {item.title}
                            </p>
                            <p className="text-xs">By {item.user}</p>
                          </div>
                          <div>
                            <p className="text-sm font-light text-neutral-400">
                              Type: {item.type}
                            </p>
                            <p className="text-sm font-light text-neutral-400">
                              License: {item.license}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-row items-center justify-between gap-8 px-2 pb-2 pt-4">
                      <div className="flex flex-row items-center gap-1 text-black dark:text-white">
                        <IoIosPricetags size={22} />
                        <p className="text-nowrap text-[22px]">{item.price}</p>
                      </div>
                      {!item.auction ? (
                        <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] border-2 border-primary py-2 font-semibold uppercase">
                          BUY
                        </button>
                      ) : (
                        <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] border-2 border-red-600 py-2 font-semibold uppercase">
                          BID
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BipMarketplace;
