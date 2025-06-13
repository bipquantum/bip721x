export function LegalDeclaration() {

    return (
        <div className="p-2 sm:p-4 bg-background border border-gray-400 dark:bg-white/10 rounded">
            <p className="font-semibold mb-2">Legal Declaration of Authorship and Ownership</p>
            <p>I hereby declare, under penalty of perjury, that I am the original author and rightful owner of the intellectual property submitted through this platform.</p>
            <p className="mt-2">I affirm that:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
                <li>The content does not infringe upon the rights intellectual, moral, or proprietary of any third party.</li>
                <li>The submission does not contain prohibited or unlawful material.</li>
                <li>I understand that by minting and certifying this asset on the blockchain, all related data will be permanently recorded and immutable.</li>
            </ul>
            <p className="mt-2">I accept full legal responsibility for the authenticity, accuracy, and lawfulness of the certified content, and consent to the platform’s terms of use.</p>
        </div>
    );
}
