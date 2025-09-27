import { useNavigate } from "react-router-dom";
import FilePreview from "../../common/FilePreview";
import {
  IntPropInput,
} from "../../../../declarations/backend/backend.did";
import { ListButton } from "../../common/ListingDetails";

interface IpCreatedProps {
  intPropInput: IntPropInput;
  ipId: bigint;
  dataUri: string | undefined;
}

const IpCreated: React.FC<IpCreatedProps> = ({ intPropInput, ipId, dataUri }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-grow flex-col items-center w-full lg:w-10/12 xl:w-8/12 gap-[30px] sm:flex-grow-0">
      <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
        <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
          Step 4 : Success
        </p>
        <div className="flex w-fit w-full flex-row items-center gap-1">
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-[15px] pt-[10px] sm:gap-[25px] sm:pt-[15px]">
          <div className="flex flex-col items-center justify-center rounded-[40px] border-y-[2.5px] border-white/40 bg-white/10 px-3 py-2 sm:py-3">
            <div className="flex h-[140px] w-[140px] items-center justify-center rounded-[40px] bg-background sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px]">
              {dataUri && (
                <FilePreview
                  className="h-full w-full rounded-[40px] object-contain"
                  dataUri={dataUri}
                />
              )}
            </div>
            <p className="w-full py-[8px] text-center text-base text-black dark:text-white sm:py-[12px] sm:text-lg md:text-xl">
              {intPropInput.title}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-[4px] text-center text-base text-black dark:text-white sm:gap-[8px] sm:text-lg md:text-xl">
            <p>Congratulations! Your IP has been successfully created.</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-5 pt-[10px] md:w-fit md:flex-row">
          <button
            onClick={() => {
              navigate(`/bip/${ipId}`);
            }}
            className="rounded-xl border-2 border-primary dark:border-white bg-transparent px-6 py-3 text-xl text-primary dark:text-white"
          >
            Manage IP
          </button>
          <ListButton
            intPropId={ipId}
            onSuccess={() => {
              navigate(`/marketplace`);
            }}
            className="rounded-xl border-2 border-primary bg-gradient-to-t from-primary to-secondary px-6 py-3 text-xl text-white"
          >
            List On Marketplace
          </ListButton>
        </div>
      </div>
    </div>
  );
};

export default IpCreated;
