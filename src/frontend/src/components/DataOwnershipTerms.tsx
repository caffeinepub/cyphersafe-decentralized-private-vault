import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Mic, Eye, AlertTriangle } from 'lucide-react';

export default function DataOwnershipTerms() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate({ to: '/settings' })}
            variant="ghost"
            className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/10 neon-glow-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Button>
        </div>

        <div className="glass-card neon-border-gold rounded-lg p-8 md:p-12 space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gold cyber-font neon-text-gold text-center mb-8">
            Data Ownership & Terms
          </h1>

          <div className="space-y-8">
            {/* Data Ownership Section */}
            <section className="bg-black/30 border border-gold/30 rounded-lg p-6 neon-border-gold space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center neon-border-gold">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gold mb-3 cyber-font">Data Ownership</h2>
                  <p className="text-foreground/90 leading-relaxed">
                    All notes you create are stored directly on the <span className="text-gold font-semibold">ICP Blockchain</span>. 
                    CypherSafe has <span className="text-gold font-semibold">zero access</span> to your private keys or the content of your notes. 
                    Your data belongs to you and you alone. We cannot read, modify, or delete your notes under any circumstances.
                  </p>
                </div>
              </div>
            </section>

            {/* Voice Data Section */}
            <section className="bg-black/30 border border-gold/30 rounded-lg p-6 neon-border-gold space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center neon-border-gold">
                  <Mic className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gold mb-3 cyber-font">Voice Data</h2>
                  <p className="text-foreground/90 leading-relaxed">
                    Voice-to-text transcription is processed <span className="text-gold font-semibold">locally in your browser</span> using 
                    the Web Speech API. We do <span className="text-gold font-semibold">not store, listen to, or share</span> any audio files. 
                    Your voice data never leaves your device during the transcription process.
                  </p>
                </div>
              </div>
            </section>

            {/* No Tracking Section */}
            <section className="bg-black/30 border border-gold/30 rounded-lg p-6 neon-border-gold space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center neon-border-gold">
                  <Eye className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gold mb-3 cyber-font">No Tracking</h2>
                  <p className="text-foreground/90 leading-relaxed">
                    CypherSafe does <span className="text-gold font-semibold">not use third-party trackers</span> or analytics tools. 
                    We do not sell your data to advertisers or any third parties. Your privacy is our top priority, and we are committed 
                    to keeping your information completely confidential.
                  </p>
                </div>
              </div>
            </section>

            {/* Terms of Use Section */}
            <section className="bg-black/30 border border-gold/30 rounded-lg p-6 neon-border-gold space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center neon-border-gold">
                  <AlertTriangle className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gold mb-3 cyber-font">Terms of Use</h2>
                  <div className="space-y-4 text-foreground/90 leading-relaxed">
                    <div>
                      <h3 className="text-lg font-semibold text-gold mb-2">Responsibility</h3>
                      <p>
                        You are responsible for securing your <span className="text-gold font-semibold">Internet Identity</span>. 
                        If you lose access to your Internet Identity, you will lose access to your notes. CypherSafe cannot recover 
                        lost credentials or restore access to your account.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gold mb-2">Lawful Use</h3>
                      <p>
                        You agree to use CypherSafe only for <span className="text-gold font-semibold">lawful purposes</span>. 
                        Storing illegal content is strictly prohibited and may result in account termination and legal action.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gold mb-2">Service Provision</h3>
                      <p>
                        CypherSafe is provided <span className="text-gold font-semibold">"as is"</span> using decentralized blockchain technology. 
                        While we strive for reliability, we cannot guarantee uninterrupted service or absolute security against all threats.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <div className="bg-primary/5 border border-primary/30 rounded-lg p-6 text-center">
              <p className="text-sm text-foreground/80">
                By using CypherSafe, you acknowledge that you have read and agree to these terms. 
                Your trust in our commitment to privacy and security is what drives us forward.
              </p>
              <p className="text-xs text-gold/60 mt-3 cyber-font">
                — Team CypherSafe
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
