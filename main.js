// main.js — mountain selection, world travel, flower scenes, music

// =============================================
// AUDIO
// =============================================
let audioContext=null, isPlaying=false;
let oscillators=[], gainNodes=[], musicLoopId=null, chordIndex=0;
const notes={C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,E5:659.25,G5:783.99};
const chords=[[notes.C4,notes.E4,notes.G4],[notes.A3,notes.C4,notes.E4],[notes.F3,notes.A3,notes.C4],[notes.G3,notes.D4,notes.G4],[notes.E3,notes.G3,notes.C4],[notes.D3,notes.F3,notes.A3]];

function initAudio(){ if(!audioContext) audioContext=new(window.AudioContext||window.webkitAudioContext)(); }
function createOsc(frequency,type='sine'){
    const osc=audioContext.createOscillator(), gain=audioContext.createGain();
    osc.type=type; osc.frequency.value=frequency;
    osc.detune.value=(Math.random()-0.5)*8; gain.gain.value=0;
    osc.connect(gain); gain.connect(audioContext.destination); osc.start();
    return{osc,gain};
}
function playChord(chord,duration,startTime){
    chord.forEach((freq,i)=>{
        const{osc,gain}=createOsc(freq,'triangle'); const nd=i*0.1;
        gain.gain.setValueAtTime(0,startTime+nd);
        gain.gain.linearRampToValueAtTime(0.07,startTime+nd+0.5);
        gain.gain.exponentialRampToValueAtTime(0.02,startTime+duration-0.5);
        gain.gain.linearRampToValueAtTime(0,startTime+duration);
        oscillators.push(osc); gainNodes.push(gain);
        setTimeout(()=>{try{osc.stop();osc.disconnect();gain.disconnect();}catch(e){}},
            (duration+startTime-audioContext.currentTime)*1000+500);
    });
}
function playArpeggio(startTime){
    [notes.C5,notes.E5,notes.G5,notes.C5,notes.G4,notes.E4].forEach((freq,i)=>{
        const{osc,gain}=createOsc(freq,'sine'); const t=startTime+i*0.28;
        gain.gain.setValueAtTime(0,t);
        gain.gain.linearRampToValueAtTime(0.04,t+0.05);
        gain.gain.exponentialRampToValueAtTime(0.01,t+0.4);
        gain.gain.linearRampToValueAtTime(0,t+0.5);
        oscillators.push(osc); gainNodes.push(gain);
        setTimeout(()=>{try{osc.stop();osc.disconnect();gain.disconnect();}catch(e){}},
            (t-audioContext.currentTime+0.6)*1000);
    });
}
function playBass(freq,duration,startTime){
    const{osc,gain}=createOsc(freq,'sine');
    gain.gain.setValueAtTime(0,startTime);
    gain.gain.linearRampToValueAtTime(0.09,startTime+0.3);
    gain.gain.exponentialRampToValueAtTime(0.04,startTime+duration-0.5);
    gain.gain.linearRampToValueAtTime(0,startTime+duration);
    oscillators.push(osc); gainNodes.push(gain);
    setTimeout(()=>{try{osc.stop();osc.disconnect();gain.disconnect();}catch(e){}},
        (duration+startTime-audioContext.currentTime)*1000+500);
}
function startMusic(){
    if(isPlaying) return;
    initAudio(); isPlaying=true;
    const bass=[notes.C3,notes.A3,notes.F3,notes.G3,notes.E3,notes.D3];
    function loop(){
        if(!isPlaying) return;
        const now=audioContext.currentTime;
        playBass(bass[chordIndex],3,now);
        playChord(chords[chordIndex],3.5,now+0.2);
        if(chordIndex%2===0) playArpeggio(now+2);
        chordIndex=(chordIndex+1)%chords.length;
        musicLoopId=setTimeout(loop,4000);
    }
    loop();
}

// =============================================
// FIRST MESSAGE
// =============================================
function animateMessage(){
    const container=document.getElementById('message-container');
    const tapHint=document.getElementById('tap-hint');
    setTimeout(()=>{
        container.style.opacity='1';
        const message="hi kim amo ini an surprise ko kanina if mag gana dapat may flower na magpakita";
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
    generateStars('stars');
    generateParticles();
    setTimeout(showMountainMessage, 800);
}

// =============================================
// WORLD TRAVEL
// =============================================
let activeWorld=null;

function travelToWorld(worldId, setupFn, messageFn){
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
    const world=document.getElementById(activeWorld);
    const scene=document.getElementById('scene');

    // Reset world
    world.classList.remove('entering');

    // Clean up active world content
    setTimeout(()=>{
        resetWorld(activeWorld);
        activeWorld=null;

        // Bring scene back
        scene.style.display='';
        scene.style.opacity='0';
        setTimeout(()=>{ scene.style.transition='opacity 0.8s ease'; scene.style.opacity='1'; }, 50);
    }, 500);
}

function resetWorld(worldId){
    if(worldId==='world-night'){
        // Reset night flower animations
        ['flower--1','flower--2','flower--3'].forEach(cls=>{
            const el=document.querySelector('#world-night .'+cls);
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
    // Restart night flower animations
    ['flower--1','flower--2','flower--3'].forEach(cls=>{
        const el=document.querySelector('#world-night .'+cls);
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
        'Night Bloom 🌸 — flowers that glow under the moonlight, reflected in the still pond below'
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
        'Sunflower Field 🌻 — a warm sunrise field, where sunflowers bloom and sway in the breeze'
    );
}

// =============================================
// MOON PHOTO LIGHTBOX
// =============================================
function initMoonPhoto(){
    const overlay=document.getElementById('photo-overlay');
    const closeBtn=document.getElementById('photo-close');

    // Attach to all moon-containers
    document.querySelectorAll('.moon-container, .moon-container--world').forEach(moon=>{
        moon.style.cursor='pointer';
        moon.addEventListener('click',()=>overlay.classList.add('visible'));
    });
    closeBtn.addEventListener('click',e=>{ e.stopPropagation(); overlay.classList.remove('visible'); });
    overlay.addEventListener('click',()=>overlay.classList.remove('visible'));
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
    animateMessage();

    // First message → tap to begin
    document.getElementById('message-screen').addEventListener('click',startExperience,{once:true});
    document.getElementById('tap-hint').addEventListener('click',e=>{
        e.stopPropagation(); startExperience();
    },{once:true});

    // Mountain taps
    document.getElementById('mountain-1').addEventListener('click',()=>{
        travelToWorld('world-night', setupNightWorld, showNightWorldMessage);
    });
    document.getElementById('mountain-2').addEventListener('click',()=>{
        travelToWorld('world-sunflower', setupSunflowerWorld, showSunflowerWorldMessage);
    });

    // Back buttons
    document.getElementById('back-night').addEventListener('click',exitWorld);
    document.getElementById('back-sunflower').addEventListener('click',exitWorld);

    // Moon photo
    initMoonPhoto();
});
