/**
 * Swiggy/Zomato style interaction sounds for the customer app.
 * Uses the Web Audio API to generate modern UI feedback tones.
 */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (type) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  switch (type) {
    case 'pop': // Light click/tap
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
      break;

    case 'chime': // Add to cart success
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
      break;

    case 'success': // Order placed / Heavy success
      const now = audioCtx.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500, now);
      oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      oscillator.start();
      oscillator.stop(now + 0.4);
      break;

    default:
      break;
  }
};

export const playCustomerSound = (type) => {
  try {
    playSound(type);
  } catch (e) {
    console.warn("Audio feedback blocked or failed:", e);
  }
};
