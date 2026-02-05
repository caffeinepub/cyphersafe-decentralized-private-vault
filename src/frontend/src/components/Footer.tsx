import { Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-primary/30 bg-black/50 backdrop-blur-md mt-auto neon-border-top">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-primary">
            <Lock className="w-5 h-5 neon-glow" />
            <span className="font-semibold cyber-font">End-to-End Encrypted</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Your data is encrypted and lives forever on the blockchain. Not even the developer can see your notes.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 CypherSafe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
