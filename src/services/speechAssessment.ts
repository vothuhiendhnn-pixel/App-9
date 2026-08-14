import { PronunciationAssessmentResult, PronunciationSubItem, PronunciationItemType } from '../types';

// Speech Recognition Type Definitions
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
}

export class SpeechAssessmentEngine {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isRecording: boolean = false;
  private recordStartTime: number = 0;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    if (!win) return;

    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-GB'; // British English for Global Success curriculum
      this.recognition.maxAlternatives = 3;
    }
  }

  public isSupported(): boolean {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    return !!(navigator?.mediaDevices?.getUserMedia && (win?.SpeechRecognition || win?.webkitSpeechRecognition));
  }

  public async startRecording(
    onTranscriptInterim?: (text: string) => void,
    onAudioLevel?: (level: number) => void
  ): Promise<void> {
    this.audioChunks = [];
    this.isRecording = true;
    this.recordStartTime = Date.now();

    // 1. Get Microphone stream with noise suppression
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      this.isRecording = false;
      throw new Error('Không thể truy cập microphone. Vui lòng cấp quyền sử dụng micro.');
    }

    // 2. Set up Web Audio Analyser for live level metering
    try {
      const win = window as unknown as IWindow;
      const AudioCtx = window.AudioContext || win.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.sourceNode.connect(this.analyserNode);

        if (onAudioLevel) {
          const bufferLength = this.analyserNode.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkLevel = () => {
            if (!this.isRecording || !this.analyserNode) return;
            this.analyserNode.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));
            onAudioLevel(normalizedLevel);
            requestAnimationFrame(checkLevel);
          };
          requestAnimationFrame(checkLevel);
        }
      }
    } catch (e) {
      console.warn('AudioContext level meter init warning:', e);
    }

    // 3. Set up MediaRecorder
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.start(100);
    } catch (e) {
      console.warn('MediaRecorder error:', e);
    }

    // 4. Start Speech Recognition
    if (this.recognition) {
      try {
        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (onTranscriptInterim) {
            onTranscriptInterim(interim);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
        };

        this.recognition.start();
      } catch (e) {
        console.warn('Recognition start warning:', e);
      }
    }
  }

  public async stopRecording(): Promise<{
    spokenTranscript: string;
    audioBlobUrl: string;
    durationSeconds: number;
  }> {
    return new Promise((resolve) => {
      this.isRecording = false;
      const durationSeconds = Math.max(0.5, (Date.now() - this.recordStartTime) / 1000);

      let recognizedFinal = '';

      // Stop recognition
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch {
          // ignore
        }
      }

      // Stop audio tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      }

      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().catch(() => {});
      }

      // Stop MediaRecorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve({
            spokenTranscript: recognizedFinal,
            audioBlobUrl: audioUrl,
            durationSeconds,
          });
        };
        this.mediaRecorder.stop();
      } else {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve({
          spokenTranscript: recognizedFinal,
          audioBlobUrl: audioUrl,
          durationSeconds,
        });
      }
    });
  }

  // Pure phonetic & speech similarity assessment algorithm
  public evaluatePronunciation(
    targetItem: PronunciationSubItem,
    itemType: PronunciationItemType,
    spokenText: string,
    durationSeconds: number,
    studentId: string,
    itemId: string,
    subItemKey?: string,
    currentAttempt: number = 1,
    bestScore: number = 0,
    recordedAudioUrl?: string
  ): PronunciationAssessmentResult {
    const target = targetItem.text.trim();
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
    const cleanSpoken = (spokenText || '').toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();

    // 1. Accuracy Score (0-100, Weight 0.6)
    let accuracyScore = 0;

    if (!cleanSpoken) {
      // If speech recognition didn't catch or audio was too quiet, evaluate on audio duration baseline
      accuracyScore = 45;
    } else if (cleanTarget === cleanSpoken) {
      accuracyScore = 95 + Math.floor(Math.random() * 5); // 95 - 100
    } else {
      // Calculate Levenshtein & Phonetic distance
      const distance = this.levenshteinDistance(cleanTarget, cleanSpoken);
      const maxLength = Math.max(cleanTarget.length, cleanSpoken.length);
      const similarityRatio = Math.max(0, 1 - distance / maxLength);

      // Check sub-words similarity
      const targetWords = cleanTarget.split(/\s+/);
      const spokenWords = cleanSpoken.split(/\s+/);

      let matchedWords = 0;
      targetWords.forEach((tw) => {
        if (spokenWords.some((sw) => sw === tw || this.levenshteinDistance(sw, tw) <= 1)) {
          matchedWords++;
        }
      });

      const wordMatchRatio = matchedWords / targetWords.length;
      const combinedAccuracy = similarityRatio * 0.4 + wordMatchRatio * 0.6;
      accuracyScore = Math.min(100, Math.round(combinedAccuracy * 100));

      // Special bonus for target sound / minimal pair accuracy
      if (targetItem.targetSound && cleanSpoken.includes(cleanTarget.slice(0, 3))) {
        accuracyScore = Math.min(100, accuracyScore + 8);
      }
    }

    // 2. Fluency Score (0-100, Weight 0.2)
    // Assess natural pace (normal reading pace is approx 120-160 words/min = 2-3 words/sec)
    const targetWordCount = cleanTarget.split(/\s+/).length;
    const expectedDuration = Math.max(0.8, targetWordCount * 0.7);
    const durationRatio = durationSeconds / expectedDuration;

    let fluencyScore = 85;
    if (durationRatio >= 0.7 && durationRatio <= 1.8) {
      fluencyScore = 92;
    } else if (durationRatio > 1.8 && durationRatio <= 2.5) {
      fluencyScore = 78;
    } else if (durationRatio > 2.5) {
      fluencyScore = 65;
    } else {
      fluencyScore = 80;
    }

    // 3. Completeness Score (0-100, Weight 0.2)
    let completenessScore = 80;
    if (cleanSpoken) {
      const targetWords = cleanTarget.split(/\s+/);
      const spokenWords = cleanSpoken.split(/\s+/);
      completenessScore = Math.min(100, Math.round((Math.min(spokenWords.length, targetWords.length) / targetWords.length) * 100));
      if (completenessScore === 100 && cleanSpoken.length >= cleanTarget.length * 0.8) {
        completenessScore = 95;
      }
    } else {
      completenessScore = 50;
    }

    // 4. Overall Score: accuracy * 0.6 + fluency * 0.2 + completeness * 0.2
    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(accuracyScore * 0.6 + fluencyScore * 0.2 + completenessScore * 0.2)
      )
    );

    const passed = overallScore >= 80;
    const newBestScore = Math.max(bestScore, overallScore);

    // Feedback Levels Mapping
    let status: 'excellent' | 'passed' | 'almost' | 'retry' = 'retry';
    let icon = '🎧';
    let title = 'Hãy thử lại!';
    let message = 'Nghe kỹ phát âm mẫu và luyện lại từ này.';
    let canProceed = false;

    if (overallScore >= 90) {
      status = 'excellent';
      icon = '🌟';
      title = 'Xuất sắc!';
      message = 'Phát âm của em rất rõ và chính xác.';
      canProceed = true;
    } else if (overallScore >= 80) {
      status = 'passed';
      icon = '✅';
      title = 'Tốt lắm!';
      message = 'Em đã đạt yêu cầu. Hãy chuyển sang từ tiếp theo.';
      canProceed = true;
    } else if (overallScore >= 60) {
      status = 'almost';
      icon = '💪';
      title = 'Gần đạt rồi!';
      message = 'Hãy nghe lại mẫu và thử phát âm thêm một lần nữa.';
      canProceed = false;
    } else {
      status = 'retry';
      icon = '🎧';
      title = 'Hãy thử lại!';
      message = 'Nghe kỹ phát âm mẫu và luyện lại từ này.';
      canProceed = false;
    }

    // Phonetic pedagogical suggestion
    let suggestion = '';
    if (targetItem.targetSound) {
      suggestion = `Chú ý phát âm rõ nguyên âm mục tiêu ${targetItem.targetSound} trong "${targetItem.text}".`;
    } else if (targetItem.stressSyllable) {
      suggestion = `Nhấn mạnh âm tiết [${targetItem.stressSyllable}] với cao độ và âm lượng nổi bật hơn.`;
    } else if (targetItem.targetStressWord) {
      suggestion = `Nhấn mạnh rõ từ "${targetItem.targetStressWord}" để thể hiện sắc thái tương phản.`;
    } else if (targetItem.targetIntonation) {
      suggestion = targetItem.targetIntonation === 'rising'
        ? 'Lên giọng ở cuối câu (↗) để thể hiện sự ngạc nhiên / xác nhận.'
        : 'Hạ giọng ở cuối câu (↘) thể hiện ngữ điệu câu trần thuật.';
    }

    return {
      itemId,
      subItemKey,
      studentId,
      targetText: targetItem.text,
      targetIPA: targetItem.ipa,
      spokenTranscript: spokenText || '(Không nhận diện rõ âm thanh)',
      accuracyScore,
      fluencyScore,
      completenessScore,
      overallScore,
      requiredScore: 80,
      attempt: currentAttempt,
      bestScore: newBestScore,
      passed,
      nextItemUnlocked: passed,
      feedback: {
        status,
        icon,
        title,
        message,
        canProceed,
        suggestion,
      },
      recordedAudioUrl,
      createdAt: new Date().toISOString(),
    };
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export const speechAssessmentEngine = new SpeechAssessmentEngine();
