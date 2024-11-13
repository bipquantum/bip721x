import { useEffect, useState } from 'react';

interface SensitiveContentProps {
  sensitive: boolean;
  children: React.ReactNode;
};

const SensitiveContent : React.FC<SensitiveContentProps> = ({ sensitive, children }) => {
  
  const [isBlurred, setIsBlurred] = useState(sensitive);

  useEffect(() => {
    setIsBlurred(sensitive);
  }
  , [sensitive]);

  const handleReveal = () => {
    setIsBlurred(false);
  };

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className={isBlurred ? 'blur-lg' : ''}>
        {children}
      </div>

      {/* Overlay with Reveal Button */}
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <button 
            onClick={handleReveal} 
            className="px-4 py-2 text-white rounded bg-violet-700 hover:bg-violet-800 rounded-lg"
          >
            Reveal Sensitive Content
          </button>
        </div>
      )}
    </div>
  );
};

export default SensitiveContent;
