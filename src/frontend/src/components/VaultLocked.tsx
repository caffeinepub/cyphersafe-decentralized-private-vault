import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function VaultLocked() {
  const { login, loginStatus } = useInternetIdentity();
  const disabled = loginStatus === 'logging-in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="absolute inset-0 backdrop-blur-xl bg-black/80"></div>
      <div className="relative z-10 text-center">
        <div className="relative w-48 h-48 mx-auto mb-8">
          <img
            src="/assets/generated/lock-icon-glowing-blue.dim_200x200.png"
            alt="Vault Locked"
            className="w-full h-full object-contain animate-pulse neon-glow"
          />
        </div>
        <h1 className="text-5xl font-bold text-primary mb-4 cyber-font neon-text">
          Vault Locked
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Your private notes are secured. Authenticate to unlock your vault.
        </p>
        <Button 
          onClick={login} 
          disabled={disabled} 
          size="lg" 
          className="px-10 py-6 text-lg rounded-full bg-primary hover:bg-primary/90 neon-glow-button pulse-on-hover cyber-font"
        >
          {disabled ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              Authenticating...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" />
              Unlock Vault
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-6">
          Supports Fingerprint, FaceID, and other WebAuthn devices
        </p>
      </div>
    </div>
  );
}
