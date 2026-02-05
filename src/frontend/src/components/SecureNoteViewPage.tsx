import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Shield, AlertTriangle } from 'lucide-react';
import { useOpenShareLink } from '../hooks/useQueries';
import { decryptNote } from '../utils/shareCrypto';
import { getSecretFromHash } from '../utils/urlParams';

export default function SecureNoteViewPage() {
  const { shareId } = useParams({ strict: false }) as { shareId: string };
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);

  const { data: encryptedData, isLoading, error: fetchError } = useOpenShareLink(shareId);

  useEffect(() => {
    const decryptContent = async () => {
      if (!encryptedData) return;

      try {
        // Extract decryption key from URL hash
        const key = getSecretFromHash('k');
        
        if (!key) {
          setError('Invalid link: Missing decryption key');
          setIsDecrypting(false);
          return;
        }

        // Decrypt the note content
        const [encryptedNote, nonce] = encryptedData;
        const decrypted = await decryptNote(encryptedNote, nonce, key);
        setDecryptedContent(decrypted);
        setIsDecrypting(false);
      } catch (err) {
        console.error('Decryption error:', err);
        setError('Failed to decrypt note. The link may be invalid or corrupted.');
        setIsDecrypting(false);
      }
    };

    decryptContent();
  }, [encryptedData]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      const errorMessage = fetchError.message || 'Unknown error';
      if (errorMessage.includes('expired')) {
        setError('This link has expired and is no longer available.');
      } else if (errorMessage.includes('not found')) {
        setError('This link is invalid or has already been used.');
      } else if (errorMessage.includes('view-once')) {
        setError('This was a view-once link and has already been accessed.');
      } else {
        setError('Failed to load the shared note. The link may be invalid.');
      }
      setIsDecrypting(false);
    }
  }, [fetchError]);

  return (
    <div className="secure-view-page">
      <div className="secure-view-container">
        {/* Header */}
        <div className="secure-view-header">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-gold" />
            <h1 className="secure-view-title">CypherSafe Secure View</h1>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="secure-view-warning">
          <AlertTriangle className="w-5 h-5 text-gold" />
          <p className="secure-view-warning-text">
            This note is encrypted and will self-destruct after viewing.
          </p>
        </div>

        {/* Content Area */}
        <div className="secure-view-content">
          {isLoading || isDecrypting ? (
            <div className="secure-view-loading">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
              <p className="mt-4 text-gold">Decrypting secure note...</p>
            </div>
          ) : error ? (
            <div className="secure-view-error">
              <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-destructive mb-2">Access Denied</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : decryptedContent ? (
            <div className="secure-view-note">
              <div className="secure-view-note-content">
                {decryptedContent}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="secure-view-footer">
          <p className="text-sm text-muted-foreground">
            Secured by CypherSafe • End-to-End Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
