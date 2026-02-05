import { useEffect, useRef } from 'react';

interface UseVoiceGreetingProps {
  userName: string;
  muteGreeting: boolean;
  enabled: boolean;
}

// Helper function to play a soft chime before speech
const playChime = (): Promise<void> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a soft golden chime sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher frequency for a pleasant ding
    
    // Envelope for a soft chime
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // Gentle decay

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    setTimeout(() => {
      resolve();
    }, 300);
  });
};

// Helper function to get time-based greeting
const getTimeBasedGreeting = (userName: string): string => {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : 'evening';
  return `Good ${timeOfDay}, ${userName || 'Guest'}. Your CypherSafe vault is synchronized and ready for your thoughts.`;
};

// Helper function to speak with enhanced voice settings
const speakWithEnhancedVoice = async (text: string): Promise<void> => {
  // Check if speech synthesis is supported
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  try {
    // Play chime before speaking
    await playChime();

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create the utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice settings for warm, calm, natural female voice
    utterance.rate = 1.0; // Normal speed for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for friendly tone
    utterance.volume = 1.0;
    utterance.lang = 'en-GB'; // British English for premium feel

    // Wait for voices to load and select the best one
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize high-quality female voices
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Samantha') ||
        (voice.name.includes('Female') && voice.lang.startsWith('en'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Play the speech
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error playing voice:', error);
  }
};

export function useVoiceGreeting({ userName, muteGreeting, enabled }: UseVoiceGreetingProps) {
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Only play once per session
    if (!enabled || muteGreeting || hasPlayedRef.current) {
      return;
    }

    const playGreeting = async () => {
      // Wait for voices to load
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load
        await new Promise<void>((resolve) => {
          const handleVoicesChanged = () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            resolve();
          };
          window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
          
          // Timeout after 2 seconds
          setTimeout(() => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            resolve();
          }, 2000);
        });
      }

      // Get time-based greeting
      const greeting = getTimeBasedGreeting(userName);
      
      // Speak with enhanced voice
      await speakWithEnhancedVoice(greeting);
      
      hasPlayedRef.current = true;
    };

    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      playGreeting();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [userName, muteGreeting, enabled]);

  return null;
}

// Export the speak function for use in other components
export const speakFeedback = speakWithEnhancedVoice;
