type Listener = (muted: boolean) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted = false;
  private intervalId: number | null = null;
  private listeners: Set<Listener> = new Set();
  private currentTheme: 'action' | 'ambient' | 'tense' | 'hub' | 'none' = 'none';

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.listeners.forEach(l => l(this.isMuted));
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM(this.currentTheme);
    }
  }

  playBeep(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Soft envelope to make it sound pleasant (Attack, Decay)
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  startBGM(theme: 'action' | 'ambient' | 'tense' | 'hub' | 'none' = 'hub') {
    this.currentTheme = theme;
    if (this.isMuted || theme === 'none') return;
    this.init();
    this.stopBGM();

    if (!this.ctx) return;

    let notes: number[] = [];
    let intervalMs = 250;
    let waveType: OscillatorType = 'triangle';
    let duration = 0.3;
    let volume = 0.05;

    if (theme === 'action') {
      notes = [130.81, 130.81, 155.56, 130.81, 196.00, 174.61]; 
      intervalMs = 250;
      waveType = 'triangle';
      duration = 0.2;
      volume = 0.08;
    } else if (theme === 'ambient') {
      notes = [261.63, 329.63, 392.00, 523.25]; 
      intervalMs = 450;
      waveType = 'sine';
      duration = 0.6;
      volume = 0.06;
    } else if (theme === 'tense') {
      notes = [65.41, 69.30]; 
      intervalMs = 800;
      waveType = 'triangle';
      duration = 0.6;
      volume = 0.08;
    } else if (theme === 'hub') {
      notes = [196.00, 261.63, 329.63, 261.63, 392.00, 329.63]; // Happy/chill arpeggio
      intervalMs = 350;
      waveType = 'sine';
      duration = 0.5;
      volume = 0.04;
    }

    let step = 0;
    this.intervalId = window.setInterval(() => {
      this.playBeep(notes[step], waveType, duration, volume);
      step = (step + 1) % notes.length;
    }, intervalMs);
  }

  stopBGM() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const soundManager = new SoundManager();
