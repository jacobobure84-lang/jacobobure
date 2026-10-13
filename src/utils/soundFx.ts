// Web Audio API Sound Effects and Background Music Synthesizer

class AudioSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentLoopNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null;
  private currentTrackTheme: string | null = null;
  private intervalId: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopLoop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play crisp micro-interactions
  public playLikeSound() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore audio error
    }
  }

  public playDoubleTapHeart() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.08].forEach((delay, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 600 : 920, now + delay);
        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch {
      // Ignore
    }
  }

  public playSwipeSound() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  public playCommentPop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }

  // Music loop synth for background sound
  public playTrackLoop(theme: 'lofi' | 'techno' | 'funk' | 'ambient' | 'hiphop' = 'lofi') {
    if (this.isMuted) return;
    this.stopLoop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentTrackTheme = theme;
    const ctx = this.ctx;

    // Define musical sequences for each genre
    const chords: Record<string, number[][]> = {
      lofi: [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
      ],
      techno: [
        [130.81, 196.0, 261.63],
        [146.83, 220.0, 293.66],
        [110.0, 164.81, 220.0],
        [123.47, 185.0, 246.94],
      ],
      funk: [
        [146.83, 293.66, 369.99],
        [164.81, 329.63, 392.0],
        [196.0, 392.0, 493.88],
        [220.0, 440.0, 523.25],
      ],
      ambient: [
        [220.0, 329.63, 440.0, 659.25],
        [174.61, 261.63, 349.23, 523.25],
        [196.0, 293.66, 392.0, 587.33],
        [261.63, 329.63, 392.0, 523.25],
      ],
      hiphop: [
        [110.0, 220.0, 261.63],
        [98.0, 196.0, 246.94],
        [87.31, 174.61, 220.0],
        [98.0, 196.0, 233.08],
      ]
    };

    const progression = chords[theme] || chords.lofi;
    let step = 0;

    const playChordStep = () => {
      if (this.isMuted || !this.ctx) return;
      const curNotes = progression[step % progression.length];
      const now = ctx.currentTime;

      // Play soft pad/bell chord
      curNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = theme === 'techno' ? 'sawtooth' : theme === 'funk' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const baseGain = theme === 'techno' ? 0.04 : 0.06;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(baseGain / (idx + 1), now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.85);
      });

      // Subtle kick/bass pulse on beat 1
      if (theme === 'techno' || theme === 'hiphop' || theme === 'funk') {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(theme === 'techno' ? 120 : 90, now);
        kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
        kickGain.gain.setValueAtTime(0.18, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        kickOsc.connect(kickGain);
        kickGain.connect(ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.22);
      }

      step++;
    };

    // Trigger initial beat
    playChordStep();
    // Loop every 1.5 seconds
    this.intervalId = window.setInterval(playChordStep, 1500);
  }

  public stopLoop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.currentLoopNodes) {
      try {
        this.currentLoopNodes.oscs.forEach(o => o.stop());
      } catch {
        // ignore
      }
      this.currentLoopNodes = null;
    }
  }
}

export const soundFx = new AudioSystem();
