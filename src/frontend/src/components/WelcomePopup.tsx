import { useState } from 'react';
import { useMarkWelcomePopupSeen } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
}

export default function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  const [open, setOpen] = useState(true);
  const { mutate: markSeen, isPending } = useMarkWelcomePopupSeen();

  const handleClose = () => {
    markSeen(undefined, {
      onSuccess: () => {
        setOpen(false);
        setTimeout(onClose, 300);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-card border-gold/50 neon-border-gold max-w-md animate-fade-in">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center neon-glow-gold">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          <DialogTitle className="text-2xl cyber-font text-gold neon-text-gold">
            Welcome to the Vault, {userName}! ✨
          </DialogTitle>
          <DialogDescription className="text-foreground/90 text-base leading-relaxed">
            You have just entered a 100% private space. Your notes are now shielded by blockchain encryption. No servers, no trackers, just your thoughts.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button
            onClick={handleClose}
            disabled={isPending}
            className="w-full rounded-full bg-gold hover:bg-gold/90 text-black font-semibold neon-glow-gold-button pulse-on-hover"
          >
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                Loading...
              </>
            ) : (
              'Start Writing Securely'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
