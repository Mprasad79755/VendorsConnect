let alertLoopInterval = null;
let alertAudioContext = null;

export const playStatusSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const playPulse = (freq, waveType, duration) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = waveType || "sine";
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  if (type === "online") {
    playPulse(1200, "sine", 0.15);
    setTimeout(() => playPulse(1600, "sine", 0.2), 100);
  } else if (type === "offline") {
    playPulse(600, "sine", 0.1);
    setTimeout(() => playPulse(400, "sine", 0.3), 80);
  } else if (type === "click") {
    playPulse(1000, "square", 0.05);
  }
};

// Looping alert tone for incoming orders
export const playAlertLoop = () => {
  if (alertLoopInterval) return; // already playing

  const playChime = () => {
    try {
      alertAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = alertAudioContext;

      const playNote = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Uplifting 3-note chime: G5 → B5 → D6
      playNote(784, 0.0, 0.35);
      playNote(988, 0.2, 0.35);
      playNote(1175, 0.4, 0.5);
    } catch (e) {
      // Silently skip if audio context fails
    }
  };

  playChime();
  alertLoopInterval = setInterval(playChime, 2000);
};

export const stopAlertLoop = () => {
  if (alertLoopInterval) {
    clearInterval(alertLoopInterval);
    alertLoopInterval = null;
  }
  if (alertAudioContext) {
    alertAudioContext.close().catch(() => {});
    alertAudioContext = null;
  }
};
