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
    <div className="flex w-full flex-grow flex-col items-center gap-[30px] sm:flex-grow-0">
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
        <div className="flex w-full flex-col items-center justify-center gap-[40px] pt-[20px]">
          <div className="flex flex-col items-center justify-center rounded-[40px] border-y-[2.5px] border-white/40 bg-white/10 px-3 py-4">
            <div className="flex h-[240px] w-[240px] items-center justify-center rounded-[40px] bg-background md:h-[280px] md:w-[280px]">
              {dataUri && (
                <FilePreview
                  className="h-full w-full rounded-[40px] object-contain"
                  dataUri={dataUri}
                />
              )}
            </div>
            <p className="w-full py-[20px] text-center text-lg text-black dark:text-white md:text-2xl">
              {intPropInput.title}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-[10px] text-center text-xl text-black dark:text-white md:text-3xl">
            <p>Congratulations!</p>
            <p>Your IP has been successfully created.</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-5 pt-[10px] md:w-fit md:flex-row">
          <button
            onClick={() => {
              navigate(`/bip/${ipId}`);
            }}
            className="rounded-xl border-2 border-primary bg-transparent px-6 py-3 text-xl text-primary"
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
