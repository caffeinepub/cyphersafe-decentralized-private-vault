import { useEffect, useState } from 'react';

export default function ScanningAnimation() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade-out after a brief moment to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-full max-w-md h-64">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-primary text-2xl font-bold mb-4 cyber-font">
              SCANNING...
            </div>
            <div className="w-64 h-1 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary neon-glow animate-scan-line"></div>
            </div>
          </div>
        </div>
        <div className="scanning-lines"></div>
      </div>
    </div>
  );
}
