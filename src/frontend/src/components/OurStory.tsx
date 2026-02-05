import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function OurStory() {
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

        <div className="glass-card neon-border-gold rounded-lg p-8 md:p-12 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gold cyber-font neon-text-gold text-center mb-8">
            The CypherSafe Story 🛡️
          </h1>

          <div className="space-y-6 text-foreground/90 text-lg leading-relaxed">
            <p>
              CypherSafe was born out of a simple question: <span className="text-gold font-semibold">"In a world full of hackers and data-hungry corporations, where can we truly keep our private thoughts safe?"</span>
            </p>

            <p>
              We believe that your ideas, passwords, and personal reflections are your most valuable assets. They shouldn't be stored on a server where a company can scan them or a hacker can steal them.
            </p>

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-6 my-8">
              <p className="text-xl font-semibold text-primary mb-2">Our Mission:</p>
              <p className="text-foreground/90">
                To hand back the <span className="text-gold font-semibold">'Keys to Privacy'</span> to the user. By using Blockchain and Internet Computer Protocol (ICP), we have built a vault that even we cannot open.
              </p>
            </div>

            <p className="text-2xl font-bold text-primary text-center my-8 cyber-font neon-text">
              Zero Knowledge. Total Freedom.
            </p>

            <p className="text-center text-foreground/80">
              Thank you for being part of this privacy revolution.
            </p>

            <p className="text-right text-gold font-semibold italic mt-8">
              — Team CypherSafe
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
