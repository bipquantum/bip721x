import React from "react";

interface FilePreviewProps {
  dataUri: string;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ dataUri, className }) => {
  // Extract the MIME type from the data URI
  const mimeType = dataUri.split(",")[0].split(":")[1].split(";")[0];

  // Extract the file name from the data URI if available
  const fileName = "Uploaded File";

  return (
    <div>
      <div className="flex items-center overflow-hidden">
        {mimeType.startsWith("image/") && (
          <img
            src={dataUri}
            alt={fileName}
            className={
              className ??
              "max-w-full rounded-lg border border-gray-300 shadow-md"
            }
          />
        )}
        {mimeType.startsWith("audio/") && (
          <audio
            controls
            src={dataUri}
            className={
              className ??
              "max-w-full rounded-lg border border-gray-300 shadow-md"
            }
          >
            Your browser does not support the audio element.
          </audio>
        )}
        {mimeType.startsWith("video/") && (
          <video
            controls
            src={dataUri}
            className={
              className ??
              "max-w-full rounded-lg border border-gray-300 shadow-md"
            }
          >
            Your browser does not support the video element.
          </video>
        )}
        {mimeType === "application/pdf" && (
          <embed
            src={dataUri}
            type="application/pdf"
            className={
              className ??
              "max-w-full rounded-lg border border-gray-300 shadow-md"
            }
          />
        )}
      </div>
    </div>
  );
};

export default FilePreview;
