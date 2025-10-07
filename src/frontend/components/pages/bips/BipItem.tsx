import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { backendActor } from "../../actors/BackendActor";
import {
  fromNullableExt,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";
import FilePreview from "../../common/FilePreview";

import AIBotImg from "../../../assets/ai-bot.png";
import { Principal } from "@dfinity/principal";
import ListingDetails, { EListingType } from "../../common/ListingDetails";

import { TbEye } from "react-icons/tb";
import UserImage from "../../common/UserImage";
import ShareButton from "../../common/ShareButton";
import DeleteButton from "../../common/DeleteButton";

interface BipItemProps {
  principal: Principal | undefined;
  intPropId: bigint;
  hideUnlisted?: boolean;
}

const BipItem: React.FC<BipItemProps> = ({
  intPropId,
  principal,
  hideUnlisted = false,
}) => {
  const [owner, setOwner] = useState<Principal | undefined>(undefined);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [deleted, setDeleted] = useState(false);
  const [unlisted, setUnlisted] = useState(false);

  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  const authorPrincipal =
    intProp && !("err" in intProp) ? intProp.ok.intProp.V1.author : null;
  const { data: author } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [authorPrincipal ?? Principal.anonymous()],
  });

  const {} = backendActor.useQueryCall({
    functionName: "owner_of",
    args: [{ token_id: BigInt(intPropId) }],
    onSuccess(data) {
      setOwner(fromNullableExt(data));
    },
  });

  useEffect(() => {
    setCanDelete(
      principal !== undefined &&
        authorPrincipal !== undefined &&
        authorPrincipal?.compareTo(principal) === "eq" &&
        owner !== undefined &&
        owner?.compareTo(principal) === "eq",
    );
  }, [principal, authorPrincipal, owner]);

  if (deleted || (hideUnlisted && unlisted)) {
    return <></>;
  }

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
          <h1>❌ Error</h1>
          <p>{"Cannot find IP"}</p>
        </div>
      ) : (
        <div className="col-span-1 h-fit w-full rounded-2xl border-2 border-black/50 bg-white backdrop-blur-[10px] dark:border-white/50 dark:bg-white/10">
          <div className="flex h-full flex-col gap-y-1 p-2 text-sm text-white lg:text-base">
            <Link
              to={`/bip/${intPropId}`}
              className="relative w-full rounded-lg"
            >
              {intProp.ok.intProp.V1.dataUri ? (
                <FilePreview
                  dataUri={intProp.ok.intProp.V1.dataUri}
                  className="flex h-[260px] w-full flex-col items-center justify-center rounded-2xl object-cover"
                />
              ) : (
                <img
                  src={AIBotImg}
                  className="h-[260px] w-full rounded-lg border border-gray-300 object-cover shadow-md"
                  alt="Logo"
                />
              )}
              <div className="absolute right-0 top-0 flex h-[40px] w-[60px] items-center justify-center rounded-bl-3xl rounded-tr-lg bg-neutral-500/20 backdrop-blur-sm md:h-[60px] md:w-[80px] lg:h-[60px] lg:w-[100px]">
                <div>
                  <p className="flex cursor-pointer flex-row items-center gap-1 text-sm">
                    <TbEye size={18} /> 326
                  </p>
                </div>
              </div>
              <div className="absolute bottom-5 right-0 flex h-[75px] w-[40px] flex-col justify-between">
                {canDelete && (
                  <DeleteButton
                    intPropId={intPropId}
                    onSuccess={() => {
                      setDeleted(true);
                    }}
                  />
                )}
                <ShareButton intPropId={intPropId} />
              </div>
            </Link>

            <div className="flex h-full flex-col justify-between pt-3">
              <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:gap-0">
                <div className={`flex w-full flex-row gap-2`}>
                  <UserImage principal={intProp.ok.intProp.V1.author} />
                  <div className="flex w-fit flex-col">
                    <div className="pb-1">
                      <p className="break-all text-2xl leading-none text-black dark:text-white">
                        {intProp.ok.intProp.V1.title}
                      </p>
                      <p className="text-xs text-black dark:text-white items-baseline">
                        By @
                        {author === undefined ||
                        fromNullableExt(author) === undefined
                          ? "Anonymous"
                          : fromNullableExt(author)?.nickName}
                      </p>
                    </div>
                    <div className="w-fit pt-1">
                      <p className="text-sm font-light text-neutral-400">
                        Type:{" "}
                        <span className="text-sm font-light text-neutral-400">
                          {intPropTypeToString(intProp.ok.intProp.V1.intPropType)}
                        </span>
                      </p>
                      <p className="text-sm font-light text-neutral-400">
                        Licenses:{" "}
                        <span className="text-sm font-light text-neutral-400">
                          {intProp.ok.intProp.V1.intPropLicenses &&
                          intProp.ok.intProp.V1.intPropLicenses.length > 0
                            ? intProp.ok.intProp.V1.intPropLicenses
                                .map(intPropLicenseToString)
                                .join(", ")
                            : "None"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-2">
              {owner && (
                <ListingDetails
                  principal={principal}
                  owner={owner}
                  intPropId={intPropId}
                  onListingChange={(listingType) =>
                    setUnlisted(
                      listingType === EListingType.UNLIST ||
                        listingType === EListingType.BUY,
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BipItem;
