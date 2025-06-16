import React, { useCallback, useRef, useState } from "react";

import { MAX_IP_SIZE_MB } from "../constants";
import imageCompression from "browser-image-compression";

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

  const max_size_bytes = MAX_IP_SIZE_MB * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = event.target.files?.[0];
    if (!file) {
      setErrorMessage("No file selected.");
      setDataUri(null);
      return;
    }
    setErrorMessage(null); // Clear any previous error messages
    setFileName(file.name);
    setFileType(file.type);
    setDragOver(false); // Reset drag over state
    setDataUri(null); // Clear previous data URI
    await processFile(file);
  };

  const processFile = async (file: File) => {

    // Compress if it's an image and exceeds the limit
    if ((file.type === "image/png" || file.type === "image/jpeg") && file.size > max_size_bytes) {
      try {
        const options = {
          maxSizeMB: MAX_IP_SIZE_MB,
          useWebWorker: true,
        };
        file = await imageCompression(file, options);
      } catch (error) {
        console.error("Compression failed:", error);
        setErrorMessage("Image compression failed. Please try another file.");
        setDataUri(null);
        return;
      }
    }

    if (file.size > max_size_bytes) {
      setErrorMessage(
        `File size exceeds the ${MAX_IP_SIZE_MB}MB limit. Compressed file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
      );
      setDataUri(null);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setDataUri(reader.result as string);
      setFileName(file.name);
      setFileType(file.type);
      setErrorMessage(null);
    };

    reader.readAsDataURL(file);
  }

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
      setFileName(file.name);
      setFileType(file.type);
      setDataUri(null); // Clear previous data URI
      setErrorMessage(null); // Clear any previous error messages
      processFile(file);
    }
  }, []);

  return (
    <div className="">
      <input
        type="file"
        accept={acceptedFiles}
        className="absolute w-[1px] h-[1px] p-0 m-[-1] overflow-hidden whitespace-nowrap border-0"
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
