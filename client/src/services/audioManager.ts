class AudioManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Load mute state
    const savedMute = localStorage.getItem("impostor_muted");
    this.isMuted = savedMute === "true";
  }

  // Initialize on first interaction
  init() {
    if (this.initialized) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("impostor_muted", String(this.isMuted));
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  vibrate(pattern: number | number[]) {
    // if (this.isMuted) return; // Allow vibration even if muted for testing
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const success = navigator.vibrate(pattern);
      console.log(
        `[Vibration] Intentando vibrar: ${pattern}. Éxito: ${success}`
      );
    } else {
      console.warn("[Vibration] API no soportada en este navegador");
    }
  }

  play(
    type:
      | "click"
      | "pop"
      | "turn"
      | "vote"
      | "success"
      | "failure"
      | "reveal"
      | "tick"
      | "timeout"
      | "win_civilians"
      | "win_impostors"
  ) {
    if (this.isMuted || !this.initialized || !this.audioCtx) return;

    // Resume context if suspended (browser policy)
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    // Common setup helper
    const createOsc = (
      type: OscillatorType,
      freq: number,
      start: number,
      dur: number,
      vol: number = 0.1
    ) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.start(start);
      osc.stop(start + dur);
    };

    switch (type) {
      case "click":
        createOsc("sine", 800, now, 0.1);
        break;

      case "pop":
        createOsc("triangle", 400, now, 0.1);
        break;

      case "turn": {
        // Alert sound
        // Custom logic for alert slide
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case "vote": // Tension
        createOsc("sawtooth", 100, now, 0.5, 0.05);
        break;

      case "success": // Win / Correct
        createOsc("sine", 600, now, 0.3, 0.1); // Simplified for refactoring sake
        break;

      case "tick":
        createOsc("square", 1000, now, 0.05, 0.05);
        break;

      case "timeout": {
        const oscTO = this.audioCtx.createOscillator();
        const gainTO = this.audioCtx.createGain();
        oscTO.connect(gainTO);
        gainTO.connect(this.audioCtx.destination);
        oscTO.type = "sawtooth";
        // Slide down
        oscTO.frequency.setValueAtTime(300, now);
        oscTO.frequency.linearRampToValueAtTime(50, now + 0.5);
        gainTO.gain.setValueAtTime(0.2, now);
        gainTO.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscTO.start(now);
        oscTO.stop(now + 0.5);
        break;
      }

      case "reveal": {
        // Dramatic reveal
        const oscRev = this.audioCtx.createOscillator();
        const gainRev = this.audioCtx.createGain();
        oscRev.connect(gainRev);
        gainRev.connect(this.audioCtx.destination);
        oscRev.type = "sawtooth";
        oscRev.frequency.setValueAtTime(200, now);
        oscRev.frequency.exponentialRampToValueAtTime(50, now + 2);
        gainRev.gain.setValueAtTime(0.2, now);
        gainRev.gain.exponentialRampToValueAtTime(0.01, now + 2);
        oscRev.start(now);
        oscRev.stop(now + 2);
        break;
      }

      case "win_civilians": {
        // Fanfare (G major arpeggio) - Trumpet style (sawtooth + filter eventually but keep simple)
        // Sol (G4) - Do (C5) - Mi (E5) - Sol (G5)
        const G4 = 392.0;
        const C5 = 523.25;
        const E5 = 659.25;
        const G5 = 783.99;

        createOsc("sawtooth", G4, now, 0.2, 0.15);
        createOsc("sawtooth", C5, now + 0.15, 0.2, 0.15);
        createOsc("sawtooth", E5, now + 0.3, 0.2, 0.15);
        createOsc("sawtooth", G5, now + 0.45, 0.8, 0.2); // Long final note

        // Harmony
        createOsc("triangle", C5, now + 0.45, 0.8, 0.15);
        break;
      }

      case "win_impostors": {
        // Disturbing / Horror
        // Low dissonant drone
        const oscImp1 = this.audioCtx.createOscillator();
        const oscImp2 = this.audioCtx.createOscillator();
        const gainImp = this.audioCtx.createGain();

        oscImp1.connect(gainImp);
        oscImp2.connect(gainImp);
        gainImp.connect(this.audioCtx.destination);

        oscImp1.type = "sawtooth";
        oscImp2.type = "square";

        // Tritone distance low (E2 and Bb2 approx)
        oscImp1.frequency.setValueAtTime(82.41, now); // E2
        oscImp2.frequency.setValueAtTime(116.54, now); // Bb2

        // Detune slightly for wobbling horror
        oscImp2.detune.setValueAtTime(10, now);
        oscImp1.frequency.linearRampToValueAtTime(60, now + 3); // Slide down to abyss

        gainImp.gain.setValueAtTime(0.2, now);
        gainImp.gain.linearRampToValueAtTime(0.25, now + 1); // Swell
        gainImp.gain.exponentialRampToValueAtTime(0.001, now + 3);

        oscImp1.start(now);
        oscImp2.start(now);
        oscImp1.stop(now + 3);
        oscImp2.stop(now + 3);
        break;
      }
    }
  }
}

export const audioManager = new AudioManager();
