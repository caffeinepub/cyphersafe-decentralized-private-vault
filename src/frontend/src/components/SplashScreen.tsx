import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsZooming(true);
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-midnight-blue">
      <div
        className={`flex flex-col items-center justify-between h-full w-full py-8 px-4 transition-all duration-700 ${
          isZooming ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Spacer to push content to center */}
        <div className="flex-1" />

        {/* Centered Logo */}
        <div className="flex-shrink-0 flex items-center justify-center w-full">
          <img
            src="/assets/1768239424536.jpg"
            alt="CypherSafe Logo"
            className="w-[60%] max-w-md h-auto object-contain"
          />
        </div>

        {/* Spacer to push text to bottom */}
        <div className="flex-1" />

        {/* Bottom Text */}
        <p className="text-gold text-sm md:text-base tracking-wide font-light text-center pb-4">
          Powered by Internet Computer
        </p>
      </div>
    </div>
  );
}
