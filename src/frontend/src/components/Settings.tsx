import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Volume2, VolumeX, FileText, ChevronRight } from 'lucide-react';
import { useGetCallerUserProfile, useSetMuteGreetingPreference } from '../hooks/useQueries';

export default function Settings() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const setMuteGreeting = useSetMuteGreetingPreference();

  const handleToggleGreeting = (checked: boolean) => {
    // checked = true means switch is ON (greeting enabled)
    // so we need to set mute to false
    setMuteGreeting.mutate(!checked);
  };

  return (
    <main className="flex-1 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="ghost"
            className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/10 neon-glow-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Button>
        </div>

        <div className="glass-card neon-border rounded-lg p-8 md:p-12 space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary cyber-font neon-text text-center mb-8">
            Settings ⚙️
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent neon-glow"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-black/30 border border-primary/30 rounded-lg p-6 neon-border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center neon-border-gold">
                      {userProfile?.muteGreeting ? (
                        <VolumeX className="w-6 h-6 text-gold" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-gold" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="greeting-toggle" className="text-lg font-semibold text-foreground cursor-pointer">
                        AI Voice Greeting
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Play a calm voice greeting when you access your notes dashboard. The greeting will address you by name and confirm your secure notes are ready.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="greeting-toggle"
                    checked={!userProfile?.muteGreeting}
                    onCheckedChange={handleToggleGreeting}
                    disabled={setMuteGreeting.isPending}
                    className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  />
                </div>
              </div>

              <div className="bg-black/30 border border-gold/30 rounded-lg p-6 neon-border-gold hover:bg-black/40 transition-colors cursor-pointer"
                onClick={() => navigate({ to: '/data-ownership-terms' })}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center neon-border-gold">
                      <FileText className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        Data Ownership & Terms
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Learn about your data rights, privacy, and terms of use
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gold flex-shrink-0" />
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/30 rounded-lg p-6">
                <p className="text-sm text-foreground/80 text-center">
                  <span className="text-primary font-semibold">Note:</span> The voice greeting uses your browser's speech synthesis feature and will play once per session when enabled.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
