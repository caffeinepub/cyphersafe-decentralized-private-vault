import { useEffect, useState } from 'react';

export default function LockAnimation() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const frames = [1, 2, 3, 2, 1];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % frames.length;
      setFrame(frames[currentIndex]);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <img
            src={`/assets/generated/lock-animation-frame${frame}.dim_400x400.png`}
            alt="Lock Animation"
            className="w-full h-full object-contain animate-pulse neon-glow"
          />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2 cyber-font neon-text">CypherSafe</h1>
        <p className="text-muted-foreground">Securing your vault...</p>
      </div>
    </div>
  );
}
