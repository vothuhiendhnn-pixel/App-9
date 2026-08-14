// Web Speech API wrapper with clean controls

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer natural British / English voices
    this.voice =
      voices.find(v => (v.lang === 'en-GB' || v.lang.startsWith('en_GB')) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('George') || v.name.includes('Serena'))) ||
      voices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en_GB')) ||
      voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
      voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB') ||
      voices.find(v => v.lang.startsWith('en')) ||
      null;
  }

  public speak(text: string, rate: number = 0.88, onEnd?: () => void, lang: string = 'en-GB'): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (!this.voice) {
      this.initVoice();
    }
    
    // Find best voice for requested lang
    const voices = this.synth.getVoices();
    const specificVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase());
    if (specificVoice) {
      utterance.voice = specificVoice;
    } else if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.lang = lang;
    utterance.rate = rate; // slightly slower for educational clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public getSpeakingState(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const audioService = new AudioService();
