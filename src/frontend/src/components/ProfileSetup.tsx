import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile({ 
        name: name.trim(), 
        isFirstTimeUser: true,
        muteGreeting: false
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="glass-card neon-border border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center neon-glow">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl cyber-font neon-text">Welcome to CypherSafe</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please enter your name to complete setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="bg-black/30 border-primary/30 focus:border-primary neon-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="w-full rounded-full bg-primary hover:bg-primary/90 neon-glow-button pulse-on-hover"
            >
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  Saving...
                </>
              ) : (
                'Continue to Vault'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
