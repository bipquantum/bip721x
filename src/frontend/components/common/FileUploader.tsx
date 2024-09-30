import React, { useCallback, useRef, useState } from "react";

import FilePreview from "./FilePreview";

interface FileUploaderProps {
  dataUri: string | null;
  setDataUri: React.Dispatch<string | null>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ dataUri, setDataUri }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB in bytes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          `File size exceeds the 1.5MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        );
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

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const item = e.dataTransfer.items?.[0];

    if (item && item.kind === "file") {
      const file = item.getAsFile();
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          `File size exceeds the 1.5MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        );
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
  }, []);

  return (
    <div>
      <input
        type="file"
        accept="image/*,audio/*,video/*,application/pdf,text/*"
        className="sr-only"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      {dataUri ? (
        FilePreview({ dataUri, className: "h-60 w-full object-cover " })
      ) : (
        <div
          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-none bg-tertiary p-4"
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onClick={() => {
            if (fileInputRef) fileInputRef.current?.click();
          }}
        >
          <p className="text-gray-500">
            Drag and drop or click to upload. You may change this after
            deploying your contract.
          </p>
        </div>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default FileUploader;
