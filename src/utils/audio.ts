class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private intervalId: number | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 440, type: OscillatorType = 'sine', duration = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  startBGM(theme: 'action' | 'ambient' | 'tense' | 'none' = 'action') {
    if (this.isMuted || theme === 'none') return;
    this.init();
    this.stopBGM();

    if (!this.ctx) return;

    let notes: number[] = [];
    let intervalMs = 250;
    let waveType: OscillatorType = 'square';
    let duration = 0.15;

    if (theme === 'action') {
      notes = [130.81, 130.81, 155.56, 130.81, 196.00, 174.61]; // C3, C3, Eb3, C3, G3, F3
      intervalMs = 220;
      waveType = 'square';
      duration = 0.12;
    } else if (theme === 'ambient') {
      notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Arpeggio)
      intervalMs = 400;
      waveType = 'sine';
      duration = 0.3;
    } else if (theme === 'tense') {
      notes = [65.41, 69.30]; // C2, Db2 (Jaws-like tension)
      intervalMs = 600;
      waveType = 'sawtooth';
      duration = 0.4;
    }

    let step = 0;
    this.intervalId = window.setInterval(() => {
      this.playBeep(notes[step], waveType, duration);
      step = (step + 1) % notes.length;
    }, intervalMs);
  }

  stopBGM() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
