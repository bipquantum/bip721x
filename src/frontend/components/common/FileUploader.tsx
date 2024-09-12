import React, { useState } from "react";
import FilePreview from "./FilePreview";

interface FileUploaderProps {
  dataUri: string | null;
  setDataUri: React.Dispatch<string | null>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ dataUri, setDataUri }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB in bytes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`File size exceeds the 1.5MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
        setDataUri(null); // Clear previous file data if any
        return;
      }

      const reader = new FileReader();
      
      reader.onloadend = () => {
        setDataUri(reader.result as string); // Use setDataUri from the parent
        setFileName(file.name);
        setFileType(file.type);
        setErrorMessage(null); // Clear any previous error messages
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,audio/*,video/*,application/pdf,text/*"
        onChange={handleFileChange}
      />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {dataUri && FilePreview({ dataUri })}
    </div>
  );
};

export default FileUploader;
