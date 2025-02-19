import React, { useCallback, useRef, useState } from "react";

import { MAX_IP_SIZE_BYTES } from "../constants";

interface FileUploaderProps {
  setDataUri: React.Dispatch<string | null>;
  acceptedFiles: string;
  children?: React.ReactNode;
}

const FileUploader: React.FC<FileUploaderProps> = ({ setDataUri, acceptedFiles, children }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > MAX_IP_SIZE_BYTES) {
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
      if (file.size > MAX_IP_SIZE_BYTES) {
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
    <div className="">
      <input
        type="file"
        accept={acceptedFiles}
        className="sr-only w-full"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
        <div
          className="flex w-full items-center justify-center cursor-pointer"
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onClick={() => {
            if (fileInputRef) fileInputRef.current?.click();
          }}
        >
          {children}
        </div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default FileUploader;
