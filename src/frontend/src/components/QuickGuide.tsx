import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Save, Search, Plus, Shield } from 'lucide-react';

export default function QuickGuide() {
  const navigate = useNavigate();

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
            Quick Guide 📖
          </h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">Secure Authentication</h2>
                  <p className="text-foreground/80">
                    Log in using Internet Identity for password-less authentication. Your notes are protected by blockchain technology and accessible only to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">Create Notes</h2>
                  <p className="text-foreground/80">
                    Click the "New" button to create a new note. Write your thoughts, ideas, or sensitive information in the secure text area.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
                  <Save className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">Save to Blockchain</h2>
                  <p className="text-foreground/80">
                    Click the "Save Note" button to store your note permanently on the blockchain. Your data is encrypted and cannot be accessed by anyone else.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">Search & Organize</h2>
                  <p className="text-foreground/80">
                    Use the search bar to quickly find notes by title or content. All your notes are listed on the left panel for easy access.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">Privacy Guaranteed</h2>
                  <p className="text-foreground/80">
                    Your notes are end-to-end encrypted and stored on the decentralized Internet Computer blockchain. Not even the developers can access your data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gold/5 border border-gold/30 rounded-lg p-6 mt-8">
            <p className="text-center text-foreground/90">
              <span className="text-gold font-semibold">Pro Tip:</span> Your vault automatically locks when you close or refresh the page. Simply unlock it again to access your notes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
