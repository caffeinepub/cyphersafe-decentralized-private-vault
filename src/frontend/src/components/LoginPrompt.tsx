import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Database, Eye } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const disabled = loginStatus === 'logging-in';

  return (
    <div className="w-full max-w-4xl">
      <Card className="glass-card neon-border border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center neon-glow">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2 cyber-font neon-text">Your Private Vault Awaits</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Secure, decentralized note storage on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg glass-card-hover neon-border border-primary/20">
              <Lock className="w-8 h-8 text-primary mx-auto mb-2 neon-glow" />
              <h3 className="font-semibold mb-1 text-foreground">End-to-End Encrypted</h3>
              <p className="text-sm text-muted-foreground">Your notes are completely private</p>
            </div>
            <div className="text-center p-4 rounded-lg glass-card-hover neon-border border-primary/20">
              <Database className="w-8 h-8 text-primary mx-auto mb-2 neon-glow" />
              <h3 className="font-semibold mb-1 text-foreground">Blockchain Storage</h3>
              <p className="text-sm text-muted-foreground">Data lives forever on-chain</p>
            </div>
            <div className="text-center p-4 rounded-lg glass-card-hover neon-border border-primary/20">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2 neon-glow" />
              <h3 className="font-semibold mb-1 text-foreground">Zero Knowledge</h3>
              <p className="text-sm text-muted-foreground">Not even we can see your data</p>
            </div>
          </div>
          <div className="text-center">
            <Button 
              onClick={login} 
              disabled={disabled} 
              size="lg" 
              className="px-8 rounded-full bg-primary hover:bg-primary/90 neon-glow-button pulse-on-hover"
            >
              {disabled ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  Connecting...
                </>
              ) : (
                'Login to Access Your Vault'
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Powered by Internet Identity - No passwords required
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
