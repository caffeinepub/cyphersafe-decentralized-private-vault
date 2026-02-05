import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { useCreateShareLink } from '../hooks/useQueries';
import { encryptNote } from '../utils/shareCrypto';
import { buildShareUrl } from '../utils/shareLink';
import type { Note } from '../backend';
import { toast } from 'sonner';

interface ShareLinkDialogProps {
  note: Note;
  onClose: () => void;
}

export default function ShareLinkDialog({ note, onClose }: ShareLinkDialogProps) {
  const [shareType, setShareType] = useState<'viewOnce' | 'timed'>('viewOnce');
  const [timedDuration, setTimedDuration] = useState<'1hour' | '24hours'>('1hour');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createShareLinkMutation = useCreateShareLink();

  const handleGenerateLink = async () => {
    try {
      // Encrypt the note content client-side
      const { encryptedData, nonce, key } = await encryptNote(note.content);

      // Calculate expiry time for timed links
      let expiresAt: bigint | null = null;
      if (shareType === 'timed') {
        const now = Date.now();
        const durationMs = timedDuration === '1hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        expiresAt = BigInt((now + durationMs) * 1_000_000); // Convert to nanoseconds
      }

      // Create share link in backend (stores encrypted data only)
      const shareId = await createShareLinkMutation.mutateAsync({
        encryptedNote: encryptedData,
        nonce,
        expiresAt,
        viewOnce: shareType === 'viewOnce',
      });

      // Build the full URL with decryption key in hash fragment
      const shareUrl = buildShareUrl(shareId, key);
      setGeneratedLink(shareUrl);

      // Attempt to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Secret Link Copied to Clipboard!', {
          duration: 3000,
          className: 'secret-link-copied-toast',
        });
        setTimeout(() => setCopied(false), 3000);
      } catch (clipboardError) {
        console.error('Clipboard copy failed:', clipboardError);
        toast.error('Could not copy to clipboard. Please copy the link manually.');
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast.error('Failed to generate share link. Please try again.');
    }
  };

  const handleManualCopy = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Secret Link Copied to Clipboard!', {
        duration: 3000,
        className: 'secret-link-copied-toast',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Manual copy failed:', error);
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="share-dialog-content">
        <DialogHeader>
          <DialogTitle className="share-dialog-title">
            Share as Secret Link
          </DialogTitle>
          <DialogDescription className="share-dialog-description">
            Generate an encrypted link to share this note securely.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-6 py-4">
            <RadioGroup value={shareType} onValueChange={(value) => setShareType(value as 'viewOnce' | 'timed')}>
              <div className="flex items-center space-x-3 share-option">
                <RadioGroupItem value="viewOnce" id="viewOnce" />
                <Label htmlFor="viewOnce" className="share-option-label">
                  <div className="font-semibold">View Once</div>
                  <div className="text-sm text-muted-foreground">
                    Link expires and deletes after the first open
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 share-option">
                <RadioGroupItem value="timed" id="timed" />
                <Label htmlFor="timed" className="share-option-label">
                  <div className="font-semibold">Timed Expiry</div>
                  <div className="text-sm text-muted-foreground">
                    Link expires after a set time period
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {shareType === 'timed' && (
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gold">Duration</Label>
                <Select value={timedDuration} onValueChange={(value) => setTimedDuration(value as '1hour' | '24hours')}>
                  <SelectTrigger id="duration" className="share-duration-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 Hour</SelectItem>
                    <SelectItem value="24hours">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleGenerateLink}
              disabled={createShareLinkMutation.isPending}
              className="w-full share-generate-button"
            >
              {createShareLinkMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-background border-r-transparent mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate Secret Link'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="share-link-generated">
              <p className="text-sm text-muted-foreground mb-2">Your secret link:</p>
              <div className="share-link-display">
                <code className="share-link-code">{generatedLink}</code>
              </div>
            </div>

            <Button
              onClick={handleManualCopy}
              className="w-full share-copy-button"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {shareType === 'viewOnce' 
                ? 'This link will self-destruct after one view.'
                : `This link will expire in ${timedDuration === '1hour' ? '1 hour' : '24 hours'}.`
              }
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
