// ============================================================
//  MATH MAYHEM — Sound Engine (Web Audio API, no files needed)
// ============================================================

const SoundFX = (() => {
    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    function playTone(freq, type, duration, volume = 0.4, startTime = 0) {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime + startTime);
        gain.gain.setValueAtTime(volume, ac.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + duration);
        osc.start(ac.currentTime + startTime);
        osc.stop(ac.currentTime + startTime + duration);
    }

    function correct() {
        playTone(523, 'sine', 0.12, 0.4, 0);
        playTone(659, 'sine', 0.12, 0.4, 0.12);
        playTone(784, 'sine', 0.25, 0.5, 0.24);
    }

    function wrong() {
        playTone(200, 'sawtooth', 0.15, 0.4, 0);
        playTone(150, 'sawtooth', 0.25, 0.4, 0.15);
    }

    function buzz() {
        playTone(880, 'sine', 0.08, 0.6, 0);
    }

    function tick() {
        playTone(1000, 'square', 0.04, 0.15, 0);
    }

    function urgentTick() {
        playTone(1200, 'square', 0.04, 0.25, 0);
    }

    function levelUp() {
        [523, 587, 659, 698, 784, 880].forEach((f, i) => {
            playTone(f, 'sine', 0.18, 0.5, i * 0.1);
        });
    }

    function powerUp() {
        playTone(440, 'sine', 0.08, 0.4, 0);
        playTone(660, 'sine', 0.08, 0.4, 0.08);
        playTone(880, 'sine', 0.15, 0.5, 0.16);
    }

    function countdown() {
        // Low "3, 2, 1" beeps
        playTone(400, 'sine', 0.2, 0.5, 0);
        playTone(400, 'sine', 0.2, 0.5, 1);
        playTone(400, 'sine', 0.2, 0.5, 2);
        playTone(600, 'sine', 0.35, 0.6, 3);
    }

    function rumble() {
        playTone(60, 'sawtooth', 0.5, 0.5, 0);
    }

    function wheelSpin() {
        for (let i = 0; i < 20; i++) {
            playTone(200 + Math.random() * 300, 'sine', 0.08, 0.2, i * 0.06);
        }
    }

    return { correct, wrong, buzz, tick, urgentTick, levelUp, powerUp, countdown, rumble, wheelSpin };
})();
