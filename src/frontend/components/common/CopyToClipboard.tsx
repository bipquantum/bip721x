import React, { useState } from "react";
import CopySvg from "../../assets/copy.svg";

interface ClipboardProps {
  copiedText: string;
}

const CopyToClipboard: React.FC<ClipboardProps> = ({ copiedText }) => {
  const [copySuccess, setCopySuccess] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(copiedText)
      .then(() => {
        setCopySuccess("Copied to clipboard!");
        setTimeout(() => {
          setCopySuccess("");
        }, 1000);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <img
        onClick={copyToClipboard}
        className="ml-4 h-4 w-4 cursor-pointer dark:invert sm:h-6 sm:w-6"
        src={CopySvg}
      />
      {copySuccess && <div className="absolute">{copySuccess}</div>}
    </div>
  );
};

export default CopyToClipboard;
