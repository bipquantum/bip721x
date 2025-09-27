
interface LegalDeclarationProps {
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (accepted: boolean) => void;
}

export const LegalDeclaration = ({
  disclaimerAccepted,
  setDisclaimerAccepted,
}: LegalDeclarationProps) => {

  return (
    <div className="flex flex-grow flex-col items-center w-full lg:w-10/12 xl:w-8/12 gap-[30px] sm:flex-grow-0">
      <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
        <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
          Step 3 : Legal declaration
        </p>
        <div className="flex w-fit w-full flex-row items-center gap-1">
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
        </div>
      </div>
      <div className="flex h-full w-full flex-col items-center space-y-4 rounded-lg py-4 text-sm text-black dark:text-white sm:text-lg">
        <div className="rounded border border-gray-400 bg-background px-2 dark:bg-white/10 sm:px-4">
          <p className="mb-2 font-semibold">
            Legal Declaration of Authorship and Ownership
          </p>
          <p>
            I hereby declare, under penalty of perjury, that I am the original
            author and rightful owner of the intellectual property submitted through
            this platform.
          </p>
          <p className="mt-2">I affirm that:</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>
              The content does not infringe upon the rights intellectual, moral, or
              proprietary of any third party.
            </li>
            <li>
              The submission does not contain prohibited or unlawful material.
            </li>
            <li>
              I understand that by minting and certifying this asset on the
              blockchain, all related data will be permanently recorded and
              immutable.
            </li>
          </ul>
          <p className="mt-2">
            I accept full legal responsibility for the authenticity, accuracy, and
            lawfulness of the certified content, and consent to the platform’s terms
            of use.
          </p>
        </div>
        <label className="flex flex-row items-center space-x-2 px-2">
          <input
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={(e) => setDisclaimerAccepted(e.target.checked)}
          />
          <span>
            I have read and agree to the legal declaration above.
          </span>
        </label>
      </div>
    </div>
  );
}
