import { TbShare } from "react-icons/tb";
import { toast } from "react-toastify";

interface ShareButtonProps {
  intPropId: bigint;
}

const ShareButton: React.FC<ShareButtonProps> = ({ intPropId }) => {
  return (
    <div
      className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-neutral-500/20 backdrop-blur-sm hover:bg-neutral-500/30"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const bipUrl = `${window.location.origin}/bip/${intPropId}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Share BIP #" + intPropId.toString(),
              text: "Check out this BIP from the BIPQuantum marketplace!",
              url: bipUrl,
            });
          } catch (err) {
            // fallback if user cancels or an error occurs
            if (navigator.clipboard) {
              navigator.clipboard.writeText(bipUrl);
              toast.success("Link copied to clipboard!");
            } else {
              window.prompt("Copy this link:", bipUrl);
            }
          }
        } else {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(bipUrl);
            toast.success("Link copied to clipboard!");
          } else {
            window.prompt("Copy this link:", bipUrl);
          }
        }
      }}
    >
      <TbShare size={24} />
    </div>
  );
};

export default ShareButton;
