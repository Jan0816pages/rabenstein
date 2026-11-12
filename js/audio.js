// Web Audio API 32-Bit Retro Sound Effect Synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicScene = 'castle';
    this.musicGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && this.enabled && !this.musicTimer) {
      this.startMusic();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.enabled ? 0.28 : 0.0, this.ctx.currentTime, 0.15);
    }
    if (!this.enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.enabled) {
      this.init();
    }
    return this.enabled;
  }

  setMusicScene(sceneName) {
    this.musicScene = sceneName === 'world' ? 'world' : 'castle';
  }

  startMusic() {
    if (this.musicTimer || !this.ctx) return;
    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.enabled ? 0.28 : 0.0;
      this.musicGain.connect(this.ctx.destination);
    }
    this.playMusicStep();
    this.musicTimer = setInterval(() => this.playMusicStep(), 950);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playPadNote(freq, duration = 1.8, type = 'sine', vol = 0.06, cutoff = 720) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.28;
      this.musicGain.connect(this.ctx.destination);
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + Math.min(0.25, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playMusicStep() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const step = this.musicStep % 16;
    this.musicStep++;

    if (this.musicScene === 'castle') {
      // Warm, calm medieval sanctuary progression (D Dorian / D Minor)
      const bassRoots = [146.83, 146.83, 130.81, 130.81, 116.54, 116.54, 130.81, 110.00];
      const arpNotes = [
        293.66, 349.23, 440.00, 349.23,
        261.63, 329.63, 392.00, 329.63,
        233.08, 293.66, 349.23, 293.66,
        261.63, 329.63, 440.00, 392.00
      ];
      if (step % 2 === 0) {
        this.playPadNote(bassRoots[Math.floor(step / 2)], 2.2, 'sine', 0.09, 420);
      }
      this.playPadNote(arpNotes[step], 1.15, 'triangle', 0.055, 680);
      if (step % 4 === 0) {
        this.playPadNote(arpNotes[step] * 1.5, 1.6, 'sine', 0.03, 900);
      }
    } else {
      // Atmospheric, mysterious wilderness theme (Die Düstermark)
      const droneRoots = [110.00, 110.00, 98.00, 98.00, 87.31, 87.31, 103.83, 98.00];
      const melodyNotes = [
        220.00, 261.63, 329.63, 293.66,
        196.00, 246.94, 293.66, 261.63,
        174.61, 220.00, 261.63, 246.94,
        207.65, 246.94, 329.63, 293.66
      ];
      if (step % 2 === 0) {
        this.playPadNote(droneRoots[Math.floor(step / 2)], 2.4, 'triangle', 0.08, 340);
      }
      if (step % 2 === 1 || step % 4 === 0) {
        this.playPadNote(melodyNotes[step], 1.4, 'sine', 0.05, 620);
      }
    }
  }

  playTone(freq, endFreq, duration, type = 'sawtooth', vol = 0.12) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playNoise(duration, filterFreq = 800, vol = 0.14) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }

  swing() {
    this.playNoise(0.11, 1200, 0.12);
    this.playTone(260, 90, 0.11, 'triangle', 0.08);
  }

  whirlwind() {
    this.playNoise(0.22, 950, 0.16);
    this.playTone(180, 360, 0.18, 'sawtooth', 0.09);
  }

  hit() {
    this.playNoise(0.09, 500, 0.18);
    this.playTone(150, 45, 0.09, 'square', 0.12);
  }

  crit() {
    this.playNoise(0.14, 1500, 0.22);
    this.playTone(420, 90, 0.16, 'sawtooth', 0.16);
  }

  fireball() {
    this.playNoise(0.24, 650, 0.18);
    this.playTone(320, 80, 0.22, 'sawtooth', 0.11);
  }

  frostNova() {
    this.playNoise(0.28, 2400, 0.18);
    this.playTone(880, 280, 0.28, 'sine', 0.14);
  }

  gold() {
    this.playTone(1450, 1950, 0.07, 'sine', 0.12);
    setTimeout(() => this.playTone(1950, 2350, 0.11, 'sine', 0.11), 50);
  }

  itemDrop(rarity) {
    if (rarity === 'unique') {
      // Resonant dark-fantasy unique artifact drop chord
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((n, i) => {
        setTimeout(() => this.playTone(n, n * 1.01, 0.45, 'triangle', 0.15), i * 70);
      });
    } else if (rarity === 'rare') {
      this.playTone(587, 880, 0.2, 'triangle', 0.13);
      setTimeout(() => this.playTone(880, 1174, 0.25, 'triangle', 0.13), 80);
    } else {
      this.playTone(420, 620, 0.12, 'sine', 0.1);
    }
  }

  potion() {
    this.playTone(320, 580, 0.12, 'sine', 0.13);
    setTimeout(() => this.playTone(480, 760, 0.14, 'sine', 0.13), 90);
  }

  levelUp() {
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
    chord.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, freq, 0.35, 'square', 0.11), idx * 80);
    });
  }

  monsterDeath() {
    this.playNoise(0.18, 350, 0.16);
    this.playTone(130, 38, 0.2, 'sawtooth', 0.12);
  }

  playerDeath() {
    // Deep dramatic impact + tragic descending minor death toll
    this.playNoise(0.55, 260, 0.24);
    this.playTone(110, 32, 0.85, 'sawtooth', 0.18);
    const toll = [293.66, 261.63, 233.08, 220.00, 146.83];
    toll.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq * 0.96, idx === toll.length - 1 ? 1.4 : 0.48, 'triangle', 0.14);
      }, 120 + idx * 290);
    });
  }

  npcGreet(npcId) {
    if (npcId === 'thorgar') {
      // Blacksmith anvil clink
      this.playTone(920, 880, 0.12, 'triangle', 0.12);
      setTimeout(() => this.playTone(1380, 1340, 0.22, 'sine', 0.10), 75);
    } else if (npcId === 'seraphina') {
      // Healer serene bell triad
      this.playTone(523.25, 523.25, 0.25, 'sine', 0.10);
      setTimeout(() => this.playTone(659.25, 659.25, 0.30, 'sine', 0.10), 85);
      setTimeout(() => this.playTone(783.99, 783.99, 0.40, 'sine', 0.09), 170);
    } else {
      // Elder / Aldric warm parchment & harp chime
      this.playTone(349.23, 349.23, 0.22, 'triangle', 0.11);
      setTimeout(() => this.playTone(440.00, 440.00, 0.34, 'triangle', 0.11), 95);
    }
  }

  pickEnglishVoice(npcId) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !window.speechSynthesis.getVoices) {
      return null;
    }
    const voices = window.speechSynthesis.getVoices() || [];
    const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (enVoices.length === 0) return null;

    const wantFemale = npcId === 'seraphina';
    const femaleRx = /google uk english female|google us english|aria|jenny|libby|sonia|emma|clara|zira|hazel|samantha|victoria|karen|susan|female/;
    const maleRx = /google uk english male|guy|ryan|davis|tony|christopher|steffan|george|daniel|david|mark|alex|oliver|male/;

    const scoreVoice = (v, targetNpcId) => {
      const name = (v.name || '').toLowerCase();
      const isFemaleVoice = femaleRx.test(name);
      const isMaleVoice = maleRx.test(name);
      const wantF = targetNpcId === 'seraphina';
      let score = 0;

      // Strict gender match: Seraphina = young female, Thorgar & Aldric = male
      if (wantF) {
        if (isFemaleVoice) score += 300;
        else if (isMaleVoice) score -= 300;
      } else {
        if (isMaleVoice) score += 300;
        else if (isFemaleVoice) score -= 300;
      }

      if (name.includes('natural') || name.includes('neural')) score += 130;
      if (name.includes('google')) score += 110;
      if (name.includes('online')) score += 80;
      if (v.localService === false) score += 20;

      // Character-specific voice flavor (keep Aldric & Thorgar distinct!)
      if (targetNpcId === 'seraphina' && /google uk english female|libby|aria|jenny|sonia|emma/.test(name)) score += 25;
      if (targetNpcId === 'thorgar' && /google uk english male|davis|tony|ryan|daniel/.test(name)) score += 30;
      if (targetNpcId === 'aldric') {
        if (/george|christopher|steffan|oliver|thomas|guy|mark|david/.test(name)) score += 45;
        if (/google uk english male/.test(name)) score -= 50;
      }

      if (v.lang.toLowerCase() === 'en-gb') score += 12;
      else if (v.lang.toLowerCase() === 'en-us') score += 8;
      return score;
    };

    const sorted = enVoices.slice().sort((a, b) => scoreVoice(b, npcId) - scoreVoice(a, npcId));
    if (npcId === 'aldric' && sorted.length > 1) {
      const thorgarBest = enVoices.slice().sort((a, b) => scoreVoice(b, 'thorgar') - scoreVoice(a, 'thorgar'))[0];
      if (thorgarBest && sorted[0].name === thorgarBest.name) {
        const altMale = sorted.find((v) => v.name !== thorgarBest.name && !femaleRx.test((v.name || '').toLowerCase()));
        if (altMale) return altMale;
      }
    }
    return sorted[0];
  }

  npcSpeak(npcId, text) {
    this.npcGreet(npcId);
    if (!this.enabled || !text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utt = new window.SpeechSynthesisUtterance(text);
      const bestVoice = this.pickEnglishVoice(npcId);
      utt.lang = (bestVoice && bestVoice.lang) ? bestVoice.lang : 'en-GB';
      utt.volume = 0.8;
      if (bestVoice) utt.voice = bestVoice;

      // Character-specific pacing & pitch:
      // Seraphina = young priestess, Thorgar = gruff blacksmith, Aldric = old sage
      if (npcId === 'seraphina') {
        utt.pitch = 1.12;
        utt.rate = 0.99;
      } else if (npcId === 'thorgar') {
        utt.pitch = 0.88;
        utt.rate = 0.96;
      } else {
        utt.pitch = 0.86;
        utt.rate = 0.86;
      }
      window.speechSynthesis.speak(utt);
    } catch (_) {
      // Ignore speech synthesis errors in restricted environments
    }
  }

  questAccept() {
    const notes = [293.66, 440.00, 587.33];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, f * 1.01, 0.32, 'triangle', 0.13), idx * 90);
    });
  }

  portalTravel() {
    this.playNoise(0.32, 1800, 0.14);
    this.playTone(320, 740, 0.32, 'sine', 0.12);
    setTimeout(() => this.playTone(540, 960, 0.28, 'triangle', 0.09), 90);
  }

  dodge() {
    this.playNoise(0.14, 1400, 0.13);
    this.playTone(240, 110, 0.12, 'sine', 0.07);
  }

  chestOpen() {
    this.playTone(180, 260, 0.12, 'triangle', 0.12);
    setTimeout(() => this.playTone(660, 990, 0.24, 'sine', 0.11), 90);
  }
}

window.SFX = new SoundEngine();

