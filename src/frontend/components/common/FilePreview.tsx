import React from 'react';

interface FilePreviewProps {
  dataUri: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ dataUri }) => {
  // Extract the MIME type from the data URI
  const mimeType = dataUri.split(',')[0].split(':')[1].split(';')[0];

  // Extract the file name from the data URI if available
  const fileName = "Uploaded File";

  return (
    <div>
      <div className="p-4 border border-gray-300 rounded-lg shadow-md">
        {mimeType.startsWith("image/") && (
          <img src={dataUri} alt={fileName} className="mt-4 max-w-full h-auto" />
        )}
        {mimeType.startsWith("audio/") && (
          <audio controls src={dataUri} className="mt-4 w-full">
          Your browser does not support the audio element.
          </audio>
        )}
        {mimeType.startsWith("video/") && (
          <video controls src={dataUri} className="mt-4 w-full h-auto">
          Your browser does not support the video element.
          </video>
        )}
        {mimeType === "application/pdf" && (
          <embed src={dataUri} type="application/pdf" className="mt-4 w-full h-[600px]" />
        )}
      </div>
      <p className="text-sm text-gray-600">Type: {mimeType}</p>
    </div>
  );
};

export default FilePreview;
