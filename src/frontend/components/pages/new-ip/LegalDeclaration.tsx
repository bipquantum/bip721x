export function LegalDeclaration() {
  return (
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
  );
}
