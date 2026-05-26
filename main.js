// main.js — mountain selection, world travel, flower scenes, music

// =============================================
// BACKGROUND MUSIC — HTML5 Audio
// =============================================
let bgMusic = null;
// audioContext kept for ambient sounds
let audioContext = null;

function initAudio(){
    if(!audioContext) audioContext = new(window.AudioContext||window.webkitAudioContext)();
}

function startMusic(){
    if(bgMusic) return;
    bgMusic = new Audio('background_music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(()=>{
        // Autoplay blocked — will play on next user interaction
        const resume = () => { bgMusic.play(); document.removeEventListener('touchstart', resume); };
        document.addEventListener('touchstart', resume, { once: true });
    });
}

// =============================================
// FIRST MESSAGE
// =============================================
function animateMessage(){
    const container=document.getElementById('message-container');
    const tapHint=document.getElementById('tap-hint');
    setTimeout(()=>{
        container.style.opacity='1';
        const message="hi kim 👋, Still in progress pa ini but feel free to look around and enjoy the view. sana ma enjoy mo 😊";
        message.split(' ').forEach((word,i)=>{
            const span=document.createElement('span');
            span.className='message-word'; span.textContent=word;
            span.style.animationDelay=`${i*0.4}s`;
            container.appendChild(span);
        });
        const hintDelay=((message.split(' ').length-1)*0.4+0.8)*1000;
        setTimeout(()=>{ tapHint.style.opacity='1'; tapHint.style.pointerEvents='auto'; },hintDelay);
    },1500);
}

// =============================================
// STARS & PARTICLES
// =============================================
function generateStars(containerId){
    const container=document.getElementById(containerId);
    if(!container) return;
    for(let i=0;i<120;i++){
        const star=document.createElement('div');
        star.className='star'+(Math.random()<0.1?' bright':'');
        const size=Math.random()*2.5+0.5;
        star.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;--duration:${Math.random()*3+2}s;--delay:${Math.random()*5}s;`;
        container.appendChild(star);
    }
}
function generateParticles(){
    const container=document.getElementById('particles');
    const types=['particle-gold','particle-pink','particle-white'];
    for(let i=0;i<25;i++){
        const p=document.createElement('div');
        p.className=`particle ${types[Math.floor(Math.random()*3)]}`;
        const tx=(Math.random()-0.5)*80;
        p.style.cssText=`left:${20+Math.random()*60}%;bottom:${10+Math.random()*40}%;--tx:${tx}px;--tx2:${tx+(Math.random()-0.5)*40}px;--duration:${5+Math.random()*5}s;--delay:${Math.random()*8}s;`;
        container.appendChild(p);
    }
}

// =============================================
// MOUNTAIN MESSAGE
// =============================================
function showMountainMessage(){
    const container=document.getElementById('mountain-message');
    const el=document.getElementById('mountain-message-text');
    const message="tap a glowing mountain to enter its world ✨";
    el.innerHTML='';
    message.split(' ').forEach((word,i)=>{
        const span=document.createElement('span');
        span.className='msg-word'; span.textContent=word;
        span.style.animationDelay=`${i*0.15}s`;
        el.appendChild(span);
    });
    setTimeout(()=>container.classList.add('visible'),500);
}

// =============================================
// MOUNTAIN SELECTION → SHOW SCENE
// =============================================
function showMountainScene(){
    const scene=document.getElementById('scene');
    scene.classList.add('visible');
    generateStarsCached('stars');
    generateParticles();
    setTimeout(showMountainMessage, 800);
    startShootingStars();
}

// =============================================
// WORLD TRAVEL
// =============================================
let activeWorld=null;

function travelToWorld(worldId, setupFn, messageFn){
    stopShootingStars();
    const scene=document.getElementById('scene');
    const world=document.getElementById(worldId);

    // Zoom out the scene
    scene.classList.add('travel-out');

    setTimeout(()=>{
        // Hide scene, show world
        scene.style.display='none';
        scene.classList.remove('travel-out');

        // Setup the world content
        if(setupFn) setupFn();

        // Zoom into the world
        world.classList.add('entering');
        activeWorld=worldId;

        // Show world message after flowers start blooming
        if(messageFn) setTimeout(messageFn, 2000);

    }, 1200);
}

function exitWorld(){
    if(!activeWorld) return;
    const worldToExit = activeWorld;
    exitWorldAnimated(worldToExit, () => {
        resetWorld(worldToExit);
        activeWorld = null;
        startShootingStars();
    });
}

function resetWorld(worldId){
    if(worldId==='world-night'){
        // Reset night flower animations
        ['flower--1','flower--2','flower--3'].forEach(cls=>{
            const el=document.querySelector('#night-flower-scene .'+cls);
            if(!el) return;
            const all=[el,...el.querySelectorAll('*')];
            all.forEach(e=>{ e.style.animationName='none'; });
            void el.offsetWidth;
            all.forEach(e=>{ e.style.animationName=''; });
        });
        // Reset message
        const msg=document.getElementById('world-message-night');
        const txt=document.getElementById('world-msg-night-text');
        msg.classList.remove('visible');
        txt.innerHTML='';
    }
    if(worldId==='world-cat'){
        const msg=document.getElementById('world-message-cat');
        const txt=document.getElementById('world-msg-cat-text');
        if(msg) msg.classList.remove('visible');
        if(txt) txt.innerHTML='';
    }
    if(worldId==='world-sunflower'){
        // Remove animate class from all flower containers
        document.querySelectorAll('#world-sunflower .flower-container').forEach(el=>{
            el.classList.remove('animate');
        });
        // Reset message
        const msg=document.getElementById('world-message-sunflower');
        const txt=document.getElementById('world-msg-sunflower-text');
        msg.classList.remove('visible');
        txt.innerHTML='';
    }
}

// =============================================
// WORLD MESSAGE
// =============================================
function showWorldMessage(textElId, containerElId, message){
    const container=document.getElementById(containerElId);
    const el=document.getElementById(textElId);
    el.innerHTML='';
    message.split(' ').forEach((word,i)=>{
        const span=document.createElement('span');
        span.className='world-msg-word'; span.textContent=word;
        span.style.animationDelay=`${i*0.18}s`;
        el.appendChild(span);
    });
    container.classList.add('visible');
}

// =============================================
// WORLD 1: NIGHT FLOWERS
// =============================================
function setupNightWorld(){
    stopAmbient();
    setTimeout(()=>playAmbientCrickets(), 1000);
    // Restart night flower animations
    ['flower--1','flower--2','flower--3'].forEach(cls=>{
        const el=document.querySelector('#night-flower-scene .'+cls);
        if(!el) return;
        const all=[el,...el.querySelectorAll('*')];
        all.forEach(e=>{ e.style.animationName='none'; });
        void el.offsetWidth;
        all.forEach(e=>{ e.style.animationName=''; });
    });
    // Generate stars in night world
    const starsEl=document.getElementById('stars-night');
    if(starsEl && starsEl.children.length===0) generateStars('stars-night');
}

function showNightWorldMessage(){
    showWorldMessage(
        'world-msg-night-text',
        'world-message-night',
        'hi kim wara ako didi san ma isipan na masabi sana ma enjoy mo 🌸'
    );
}

// =============================================
// WORLD 2: SUNFLOWERS
// =============================================
function buildSunflowers(){
    const flowerHTML=`
        <div class="flower-top">
            <div class="flower-petal flower-petal__1"></div>
            <div class="flower-petal flower-petal__2"></div>
            <div class="flower-petal flower-petal__3"></div>
            <div class="flower-petal flower-petal__4"></div>
            <div class="flower-petal flower-petal__5"></div>
            <div class="flower-petal flower-petal__6"></div>
            <div class="flower-petal flower-petal__7"></div>
            <div class="flower-petal flower-petal__8"></div>
            <div class="flower-circle"></div>
            <div class="flower-light flower-light__1"></div>
            <div class="flower-light flower-light__2"></div>
            <div class="flower-light flower-light__3"></div>
            <div class="flower-light flower-light__4"></div>
            <div class="flower-light flower-light__5"></div>
            <div class="flower-light flower-light__6"></div>
            <div class="flower-light flower-light__7"></div>
            <div class="flower-light flower-light__8"></div>
        </div>
        <div class="flower-bottom">
            <div class="flower-stem"></div>
            <div class="flower-leaf flower-leaf__1"></div>
            <div class="flower-leaf flower-leaf__2"></div>
            <div class="flower-leaf flower-leaf__3"></div>
            <div class="flower-leaf flower-leaf__4"></div>
            <div class="flower-leaf flower-leaf__5"></div>
            <div class="flower-leaf flower-leaf__6"></div>
            <div class="flower-grass flower-grass__1"></div>
            <div class="flower-grass flower-grass__2"></div>
            <div class="flower-grass flower-grass__3"></div>
            <div class="flower-grass flower-grass__4"></div>
        </div>`;
    document.querySelectorAll('#world-sunflower .flower-container').forEach(el=>{
        if(!el.children.length) el.innerHTML=flowerHTML;
    });
}

function setupSunflowerWorld(){
    stopAmbient();
    setTimeout(()=>playAmbientWind(), 500);
    buildSunflowers();
    const flowers=Array.from(document.querySelectorAll('#world-sunflower .flower-container'));
    flowers[0].classList.add('animate');
    setTimeout(()=>{
        for(let i=1;i<=2&&i<flowers.length;i++) flowers[i].classList.add('animate');
        let remaining=flowers.slice(3);
        const interval=setInterval(()=>{
            if(remaining.length===0){ clearInterval(interval); return; }
            const idx=Math.floor(Math.random()*remaining.length);
            remaining.splice(idx,1)[0].classList.add('animate');
        },500);
    },3000);
}

function showSunflowerWorldMessage(){
    showWorldMessage(
        'world-msg-sunflower-text',
        'world-message-sunflower',
        "remember when you told me na don't let anyone dim my light? napa isip ako mag simo san \"sanflower\" sorry sa corny joke 🌻"
    );
}

// =============================================
// MOON PHOTO LIGHTBOX
// =============================================
function initMoonPhoto(){
    const videoOverlay = document.getElementById('video-overlay');
    const video        = document.getElementById('kim-video');
    const videoClose   = document.getElementById('video-close');
    const photoOverlay = document.getElementById('photo-overlay');
    const photoClose   = document.getElementById('photo-close');
    const photoImg     = document.getElementById('photo-img');

    // Moon tap → show PHOTO first
    document.querySelectorAll('.moon-container, .moon-container--world').forEach(moon=>{
        moon.style.cursor='pointer';
        moon.addEventListener('click', ()=>{
            photoOverlay.classList.add('visible');
        });
    });

    // Tapping the PHOTO itself → close photo, play video
    photoImg.style.cursor = 'pointer';
    photoImg.addEventListener('click', e => {
        e.stopPropagation();
        photoOverlay.classList.remove('visible');
        setTimeout(() => {
            videoOverlay.classList.add('visible');
            video.currentTime = 0;
            video.play().catch(()=>{});
        }, 300);
    });

    // Also add a small hint label on the photo
    const hint = document.createElement('p');
    hint.id = 'photo-tap-hint';
    hint.textContent = 'tap the photo ▶';
    photoImg.parentNode.insertBefore(hint, photoImg.nextSibling);

    // Video close button
    videoClose.addEventListener('click', e=>{
        e.stopPropagation();
        video.pause();
        video.currentTime = 0;
        videoOverlay.classList.remove('visible');
    });

    // Video ends naturally → just close it
    video.addEventListener('ended', ()=>{
        videoOverlay.classList.remove('visible');
    });

    // Photo overlay close (tapping outside photo)
    photoClose.addEventListener('click', e=>{ e.stopPropagation(); photoOverlay.classList.remove('visible'); });
    photoOverlay.addEventListener('click', ()=> photoOverlay.classList.remove('visible'));
}

// =============================================
// START EXPERIENCE
// =============================================
function startExperience(){
    document.getElementById('message-screen').classList.add('fade-out');
    startMusic();
    setTimeout(showMountainScene, 500);
}

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded',()=>{
    initLoadingScreen();
    animateMessage();

    // First message → tap to begin
    document.getElementById('message-screen').addEventListener('click',startExperience,{once:true});
    document.getElementById('tap-hint').addEventListener('click',e=>{
        e.stopPropagation(); startExperience();
    },{once:true});

    // Mountain taps
    document.querySelector('#mountain-1 .mountain-light').addEventListener('click',()=>{
        travelToWorld('world-night', setupNightWorld, showNightWorldMessage);
    });
    document.querySelector('#mountain-2 .mountain-light').addEventListener('click',()=>{
        travelToWorld('world-cat', setupCatWorld, showCatWorldMessage);
    });
    document.querySelector('#mountain-3 .mountain-light').addEventListener('click',()=>{
        travelToWorld('world-sunflower', setupSunflowerWorld, showSunflowerWorldMessage);
    });

    // Back buttons
    document.getElementById('back-night').addEventListener('click',exitWorld);
    document.getElementById('back-cat').addEventListener('click',()=>{
        document.getElementById('cat-caption').classList.remove('visible');
        exitWorld();
    });
    document.getElementById('back-night').addEventListener('click', exitWorld);
    document.getElementById('back-sunflower').addEventListener('click',exitWorld);

    // Moon photo
    initMoonPhoto();
    initPondSplash();

});

// =============================================
// WORLD: CAT (mountain 2)
// =============================================
function generateFireflies() {
    const container = document.getElementById('cat-fireflies');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 18; i++) {
        const ff = document.createElement('div');
        ff.className = 'firefly';
        const x = 5 + Math.random() * 90;
        const y = 20 + Math.random() * 55;
        const dur = (3 + Math.random() * 4).toFixed(1);
        const delay = (-Math.random() * 5).toFixed(1);
        const rx = () => ((Math.random() - 0.5) * 60).toFixed(0) + 'px';
        const ry = () => ((Math.random() - 0.5) * 40).toFixed(0) + 'px';
        ff.style.cssText = `left:${x}%;top:${y}%;--ff-dur:${dur}s;--ff-delay:${delay}s;--fx1:${rx()};--fy1:${ry()};--fx2:${rx()};--fy2:${ry()};--fx3:${rx()};--fy3:${ry()};--fx4:${rx()};--fy4:${ry()};`;
        container.appendChild(ff);
    }
}

function setupCatWorld() {
    stopAmbient();
    setTimeout(()=>playAmbientNight(), 800);
    generateFireflies();
    generateStarsCached('stars-cat');
    // Scale cat container — portrait-first, use vw not vmin
    const container = document.querySelector('#world-cat .container');
    if (container) {
        const availW = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.55);
        const scale = Math.min(1, availW / 350);
        container.style.transform = `scale(${scale})`;
        const wrap = document.querySelector('#world-cat .cat-wrap');
        if (wrap) {
            wrap.style.height = (200 * scale) + 'px';
            wrap.style.width = (350 * scale) + 'px';
        }
    }
    setTimeout(() => {
        document.getElementById('cat-caption').classList.add('visible');
    }, 1500);
}

function showCatWorldMessage() {
    showWorldMessage(
        'world-msg-cat-text',
        'world-message-cat',
        'hi kim adi an miya, wara lng na isipan ko lng mag butang san nakitaan ko kanina an profile pic mo 🐱'
    );
}

// =============================================
// LOADING SCREEN
// =============================================
function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    // Hide after fonts/assets settle
    window.addEventListener('load', () => {
        setTimeout(() => {
            screen.classList.add('done');
            setTimeout(() => screen.remove(), 900);
        }, 1200);
    });
    // Fallback — remove after 4s regardless
    setTimeout(() => {
        screen.classList.add('done');
        setTimeout(() => { if (screen.parentNode) screen.remove(); }, 900);
    }, 4000);
}

// =============================================
// SHOOTING STARS
// =============================================
let shootingStarInterval = null;

function launchShootingStar() {
    const container = document.getElementById('shooting-stars');
    if (!container) return;
    const star = document.createElement('div');
    star.className = 'shooting-star';
    const startX = 10 + Math.random() * 70;
    const startY = 5  + Math.random() * 40;
    const angle  = 15 + Math.random() * 25;
    const dist   = 150 + Math.random() * 200;
    const rad    = angle * Math.PI / 180;
    const tx     = dist * Math.cos(rad);
    const ty     = dist * Math.sin(rad);
    const dur    = (0.6 + Math.random() * 0.5).toFixed(2);
    star.style.cssText = `left:${startX}%;top:${startY}%;--ss-angle:${angle}deg;--ss-tx:${tx}px;--ss-ty:${ty}px;--ss-dur:${dur}s;`;
    container.appendChild(star);
    void star.offsetWidth;
    star.classList.add('shoot');
    setTimeout(() => star.remove(), parseFloat(dur) * 1000 + 100);
}

function startShootingStars() {
    // Random interval 4-12 seconds between shooting stars
    function scheduleNext() {
        const delay = 4000 + Math.random() * 8000;
        shootingStarInterval = setTimeout(() => {
            launchShootingStar();
            scheduleNext();
        }, delay);
    }
    scheduleNext();
}

function stopShootingStars() {
    clearTimeout(shootingStarInterval);
    shootingStarInterval = null;
}

// =============================================
// AMBIENT SOUND PER WORLD
// =============================================
let ambientNodes = [];

function stopAmbient() {
    ambientNodes.forEach(n => {
        try { n.stop(); n.disconnect(); } catch(e) {}
    });
    ambientNodes = [];
}

function playAmbientCrickets() {
    if (!audioContext) return;
    // Simulate crickets with filtered noise bursts
    function chirp() {
        if (ambientNodes.length === 0) return; // stopped
        const buf = audioContext.createBuffer(1, audioContext.sampleRate * 0.04, audioContext.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*0.3;
        const src = audioContext.createBufferSource();
        src.buffer = buf;
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 4200; filter.Q.value = 8;
        const gain = audioContext.createGain();
        gain.gain.value = 0.18;
        src.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
        src.start();
        ambientNodes.push(src);
        // Schedule next chirp
        setTimeout(chirp, 180 + Math.random() * 120);
    }
    // Kick off multiple cricket voices
    ambientNodes.push({ stop: ()=>{}, disconnect: ()=>{} }); // sentinel
    for (let v = 0; v < 3; v++) {
        setTimeout(chirp, v * 60);
    }
}

function playAmbientWind() {
    if (!audioContext) return;
    const bufLen = audioContext.sampleRate * 4;
    const buf = audioContext.createBuffer(1, bufLen, audioContext.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src = audioContext.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 320;
    const gain = audioContext.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 2);
    src.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
    src.start();
    ambientNodes.push(src);
}

function playAmbientNight() {
    // Soft low hum + distant crickets for cat world
    playAmbientCrickets();
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine'; osc.frequency.value = 55;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 3);
    osc.connect(gain); gain.connect(audioContext.destination);
    osc.start();
    ambientNodes.push(osc);
}

// =============================================
// REVERSE ZOOM BACK TRANSITION
// =============================================
function exitWorldAnimated(worldId, onDone) {
    const world = document.getElementById(worldId);
    const scene = document.getElementById('scene');

    // Zoom world back out (reverse of travel-in)
    world.style.transition = 'transform 0.9s cubic-bezier(0.4,0,1,1), opacity 0.6s ease';
    world.style.transform = 'scale(0.15)';
    world.style.opacity = '0';

    stopAmbient();

    setTimeout(() => {
        world.classList.remove('entering');
        world.style.transition = '';
        world.style.transform = '';
        world.style.opacity = '';
        if (onDone) onDone();

        // Fade scene back in
        scene.style.display = '';
        scene.style.opacity = '0';
        scene.style.transition = 'opacity 0.7s ease';
        setTimeout(() => { scene.style.opacity = '1'; }, 30);
    }, 900);
}

// =============================================
// POND SPLASH EASTER EGG
// =============================================
function initPondSplash() {
    const container = document.getElementById('pond-splash-container');
    if (!container) return;
    container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createSplash(container, x, y);
    });
}

function createSplash(container, x, y) {
    // 3 staggered ripple rings — each slightly delayed
    for (let r = 0; r < 3; r++) {
        const ring = document.createElement('div');
        ring.className = 'splash-ring';
        ring.style.cssText = `left:${x}px;top:${y}px;animation-delay:${r * 0.18}s;`;
        container.appendChild(ring);
        setTimeout(() => ring.remove(), 1200 + r * 180);
    }
    // 8 droplets in a full circle
    for (let d = 0; d < 8; d++) {
        const drop = document.createElement('div');
        drop.className = 'splash-drop';
        const angle = (d / 8) * Math.PI * 2;
        const dist  = 22 + Math.random() * 28;
        const dx    = Math.cos(angle) * dist;
        const dy    = Math.sin(angle) * dist - 35;
        const dur   = (0.45 + Math.random() * 0.35).toFixed(2);
        drop.style.cssText = `left:${x}px;top:${y}px;--sdx:${dx}px;--sdy:${dy}px;--sd-dur:${dur}s;animation-delay:${(Math.random()*0.08).toFixed(2)}s;`;
        container.appendChild(drop);
        setTimeout(() => drop.remove(), parseFloat(dur) * 1000 + 200);
    }
    // Layered water plop sound
    if (audioContext) {
        [800, 500, 300].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            const t = audioContext.currentTime + i * 0.05;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.25, t + 0.28);
            gain.gain.setValueAtTime(0.12 - i * 0.03, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
            osc.connect(gain); gain.connect(audioContext.destination);
            osc.start(t); osc.stop(t + 0.33);
        });
    }
}

// =============================================
// STAR CACHING
// =============================================
const starsGenerated = new Set();

function generateStarsCached(containerId) {
    if (starsGenerated.has(containerId)) return;
    generateStars(containerId);
    starsGenerated.add(containerId);
}

// =============================================
// INLINE MESSAGE INBOX
// Uses Formspree — sign up free at formspree.io
// Replace YOUR_FORM_ID below with your actual form ID
// =============================================
function initInbox() {
    const textarea  = document.getElementById('inbox-text');
    const sendBtn   = document.getElementById('inbox-send');
    const status    = document.getElementById('inbox-status');
    const charCount = document.getElementById('inbox-char');
    if (!textarea) return;

    // Character counter
    textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length}/500`;
    });

    sendBtn.addEventListener('click', () => {
        const msg = textarea.value.trim();
        if (!msg) {
            status.textContent = 'write something first 🌸';
            setTimeout(() => { status.textContent = ''; }, 2500);
            return;
        }
        // Open Messenger with message pre-filled
        const encoded = encodeURIComponent(msg);
        window.open(`https://m.me/william.you.888332?text=${encoded}`, '_blank');
        status.textContent = 'opening Messenger... 💙';
        textarea.value = '';
        charCount.textContent = '0/500';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    // Append initInbox call (won't duplicate since DOMContentLoaded fires once)
    initInbox();
});
