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
  ) {
    if (this.isMuted || !this.initialized || !this.audioCtx) return;

    // Resume context if suspended (browser policy)
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;

    switch (type) {
      case "click":
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case "pop":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case "turn": // Alert sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case "vote": // Tension
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case "success": // Win / Correct
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "tick":
        // Short high-pitch tick like a clock
        osc.type = "square";
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case "timeout":
        // Descending low tone (Time's up!)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case "reveal": // Dramatic reveal
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
        osc.start(now);
        osc.stop(now + 2);
        break;
    }
  }
}

export const audioManager = new AudioManager();
