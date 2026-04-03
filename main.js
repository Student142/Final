// main.js — message animation, stars, particles, music, flower reveal

// =============================================
// WEB AUDIO — ROMANTIC MUSIC
// =============================================
let audioContext = null, isPlaying = false, isMuted = false;
let oscillators = [], gainNodes = [], musicLoopId = null, chordIndex = 0;

const notes = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, E5:659.25, G5:783.99
};

const chords = [
    [notes.C4, notes.E4, notes.G4],
    [notes.A3, notes.C4, notes.E4],
    [notes.F3, notes.A3, notes.C4],
    [notes.G3, notes.D4, notes.G4],
    [notes.E3, notes.G3, notes.C4],
    [notes.D3, notes.F3, notes.A3],
];

function initAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function createOscillator(frequency, type = 'sine') {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = (Math.random() - 0.5) * 8;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    return { osc, gain };
}

function playChord(chord, duration, startTime) {
    chord.forEach((freq, i) => {
        const { osc, gain } = createOscillator(freq, 'triangle');
        const nd = i * 0.1;
        gain.gain.setValueAtTime(0, startTime + nd);
        gain.gain.linearRampToValueAtTime(0.07, startTime + nd + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.02, startTime + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        oscillators.push(osc); gainNodes.push(gain);
        setTimeout(() => { try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){} },
            (duration + startTime - audioContext.currentTime) * 1000 + 500);
    });
}

function playArpeggio(startTime) {
    [notes.C5, notes.E5, notes.G5, notes.C5, notes.G4, notes.E4].forEach((freq, i) => {
        const { osc, gain } = createOscillator(freq, 'sine');
        const t = startTime + i * 0.28;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        gain.gain.linearRampToValueAtTime(0, t + 0.5);
        oscillators.push(osc); gainNodes.push(gain);
        setTimeout(() => { try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){} },
            (t - audioContext.currentTime + 0.6) * 1000);
    });
}

function playBass(freq, duration, startTime) {
    const { osc, gain } = createOscillator(freq, 'sine');
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.09, startTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.04, startTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    oscillators.push(osc); gainNodes.push(gain);
    setTimeout(() => { try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){} },
        (duration + startTime - audioContext.currentTime) * 1000 + 500);
}

function startMusic() {
    if (isPlaying) return;
    initAudio(); isPlaying = true;
    const bassNotes = [notes.C3, notes.A3, notes.F3, notes.G3, notes.E3, notes.D3];
    function loop() {
        if (!isPlaying || isMuted) return;
        const now = audioContext.currentTime;
        playBass(bassNotes[chordIndex], 3, now);
        playChord(chords[chordIndex], 3.5, now + 0.2);
        if (chordIndex % 2 === 0) playArpeggio(now + 2);
        chordIndex = (chordIndex + 1) % chords.length;
        musicLoopId = setTimeout(loop, 4000);
    }
    loop();
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('music-toggle');
    const icon = document.getElementById('sound-icon');
    if (isMuted) {
        btn.classList.add('muted');
        icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        gainNodes.forEach(g => { try { g.gain.setTargetAtTime(0, audioContext.currentTime, 0.1); } catch(e){} });
    } else {
        btn.classList.remove('muted');
        icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        if (!musicLoopId) startMusic();
    }
}

// =============================================
// MESSAGE ANIMATION
// =============================================
function animateMessage() {
    const container = document.getElementById('message-container');
    const tapHint   = document.getElementById('tap-hint');

    const messageStartDelay = 1500; // pause before words begin

    setTimeout(() => {
        // Fade in the container
        container.style.opacity = '1';

        const message = "hi kim amo ini an surprise ko kanina if mag gana dapat may flower na magpakita";
        const words = message.split(' ');
        words.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'message-word';
            span.textContent = word;
            span.style.animationDelay = `${i * 0.4}s`;
            container.appendChild(span);
        });

        // Show tap hint only after the last word finishes appearing
        const hintDelay = ((words.length - 1) * 0.4 + 0.8) * 1000;
        setTimeout(() => {
            tapHint.style.opacity = '1';
            tapHint.style.pointerEvents = 'auto';
        }, hintDelay);

    }, messageStartDelay);
}

// =============================================
// GENERATE STARS
// =============================================
function generateStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star' + (Math.random() < 0.1 ? ' bright' : '');
        const size = Math.random() * 2.5 + 0.5;
        star.style.cssText = `
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            width:${size}px; height:${size}px;
            --duration:${Math.random()*3+2}s;
            --delay:${Math.random()*5}s;
        `;
        container.appendChild(star);
    }
}

// =============================================
// GENERATE PARTICLES
// =============================================
function generateParticles() {
    const container = document.getElementById('particles');
    const types = ['particle-gold','particle-pink','particle-white'];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = `particle ${types[Math.floor(Math.random()*3)]}`;
        const tx = (Math.random()-0.5)*80;
        p.style.cssText = `
            left:${20+Math.random()*60}%;
            bottom:${10+Math.random()*40}%;
            --tx:${tx}px;
            --tx2:${tx+(Math.random()-0.5)*40}px;
            --duration:${5+Math.random()*5}s;
            --delay:${Math.random()*8}s;
        `;
        container.appendChild(p);
    }
}

// =============================================
// REVEAL FLOWERS ONE BY ONE
// The reliable approach: use visibility + force
// animation restart by briefly toggling display.
// =============================================
function revealFlowers() {
    const delays = [0, 2200, 4400];
    ['flower--1', 'flower--2', 'flower--3'].forEach((cls, idx) => {
        setTimeout(() => {
            const flower = document.querySelector('.' + cls);
            if (!flower) return;

            // Collect every animated element inside this flower
            const allEls = [flower, ...flower.querySelectorAll('*')];

            // Step 1: clone animation names so we can re-apply them fresh
            allEls.forEach(el => {
                const style = getComputedStyle(el);
                const name = style.animationName;
                if (name && name !== 'none') {
                    // Remove animation entirely so the browser forgets progress
                    el.style.animationName = 'none';
                }
            });

            // Step 2: make visible
            flower.style.visibility = 'visible';

            // Step 3: force reflow so the removal registers
            void flower.offsetWidth;

            // Step 4: restore animations (browser restarts from delay=0)
            allEls.forEach(el => {
                el.style.animationName = '';
            });

            // Step 5: unpause
            flower.classList.add('revealed');

        }, delays[idx]);
    });
}

// =============================================
// START EXPERIENCE ON TAP
// =============================================
function startExperience() {
    // Fade out message screen
    document.getElementById('message-screen').classList.add('fade-out');

    // Bring in the main scene
    document.getElementById('scene').classList.add('visible');

    // Start music
    startMusic();

    // Reveal flowers staggered
    revealFlowers();
}

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
    animateMessage();
    generateStars();
    generateParticles();

    document.getElementById('message-screen').addEventListener('click', startExperience, { once: true });
    document.getElementById('tap-hint').addEventListener('click', startExperience, { once: true });
    document.getElementById('music-toggle').addEventListener('click', e => {
        e.stopPropagation();
        toggleMute();
    });
});
