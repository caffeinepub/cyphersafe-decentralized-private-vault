import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('cypherSafeInstallPromptDismissed');
    if (dismissed === 'true') {
      return;
    }

    // Check if desktop (screen width > 1024px)
    const checkDesktop = () => {
      const desktop = window.innerWidth > 1024;
      setIsDesktop(desktop);
      setIsVisible(desktop);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('cypherSafeInstallPromptDismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        handleDismiss();
      }
    }
  };

  if (!isVisible || !isDesktop) {
    return null;
  }

  return (
    <div className="install-prompt-banner">
      <div className="install-prompt-content">
        <Download className="w-5 h-5 text-gold" />
        <p className="install-prompt-text">
          Install CypherSafe on your Desktop for a larger writing canvas.
        </p>
        {deferredPrompt && (
          <Button
            onClick={handleInstall}
            variant="outline"
            size="sm"
            className="install-prompt-button"
          >
            Install
          </Button>
        )}
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="install-prompt-close"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
