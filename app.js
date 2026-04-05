/**
 * GOLDEN EQUITY SYSTEM ENGINE v2.4
 * Architects: Nestor & Sanya
 */

// --- 1. ПЕРЕМІННІ ТА СТАН ГРИ ---
let state = {
    money: parseFloat(localStorage.getItem('ge_balance')) || 0,
    totalTaps: parseInt(localStorage.getItem('ge_taps')) || 0,
    currentLevel: parseInt(localStorage.getItem('ge_level')) || 0,
    onlineUsers: 1450
};

const RANKS = [
    { name: "HOBO", goal: 150, reward: 1, icon: "🪙", sound: 220 },
    { name: "STREET HUSTLER", goal: 1500, reward: 5, icon: "🥈", sound: 330 },
    { name: "BUSINESS DELEGATE", goal: 15000, reward: 25, icon: "🥇", sound: 440 },
    { name: "EQUITY DIRECTOR", goal: 100000, reward: 100, icon: "💵", sound: 550 },
    { name: "GLOBAL TYCOON", goal: 1000000, reward: 500, icon: "💎", sound: 880 }
];

// --- 2. AUDIO ENGINE (Синтезатор звуку) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = 'sine', duration = 0.1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// --- 3. ЛОГІКА КЛІКУ ---
function handleTap(e) {
    const rank = RANKS[state.currentLevel];
    
    // Нарахування
    state.money += rank.reward;
    state.totalTaps++;
    
    // Ефекти
    playTone(rank.sound + (Math.random() * 20), 'sine', 0.1);
    if (navigator.vibrate) navigator.vibrate(12);
    
    spawnMoneyFX(e, rank.reward);
    checkLevelUp();
    updateUI();
    saveData();
}

// --- 4. СИСТЕМА ПРОГРЕСУ ---
function checkLevelUp() {
    const current = RANKS[state.currentLevel];
    if (state.money >= current.goal && state.currentLevel < RANKS.length - 1) {
        state.currentLevel++;
        
        // Святковий звук "Level Up"
        playTone(523.25, 'square', 0.2); // До
        setTimeout(() => playTone(659.25, 'square', 0.2), 100); // Мі
        setTimeout(() => playTone(783.99, 'square', 0.4), 200); // Соль
        
        showNotification(`NEW STATUS: ${RANKS[state.currentLevel].name}`);
    }
}

// --- 5. ВІЗУАЛЬНІ ЕФЕКТИ ---
function spawnMoneyFX(e, val) {
    const float = document.createElement('div');
    float.className = 'float-val';
    
    // Координати кліку (підтримка тач та мишки)
    const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    
    float.style.left = `${x}px`;
    float.style.top = `${y}px`;
    float.innerText = `+$${val}`;
    
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 800);
}

// --- 6. ОНОВЛЕННЯ ІНТЕРФЕЙСУ ---
function updateUI() {
    const rank = RANKS[state.currentLevel];
    
    // Баланс та статус
    document.getElementById('bal-txt').innerText = `$${Math.floor(state.money).toLocaleString()}`;
    document.getElementById('rank-name').innerText = `RANK: ${rank.name}`;
    document.getElementById('click-obj').innerText = rank.icon;
    
    // Прогрес-бар
    const progress = (state.money / rank.goal) * 100;
    const bar = document.getElementById('xp-bar');
    if (bar) bar.style.width = `${Math.min(progress, 100)}%`;
    
    const perc = document.getElementById('xp-perc');
    if (perc) perc.innerText = `${Math.min(Math.floor(progress), 100)}%`;
}

// --- 7. ПІДТРИМКА ТА ОНЛАЙН ---
function sendHeart() {
    playTone(660, 'triangle', 0.5);
    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
    alert("❤️ Nestor & Sanya received your signal. Faith in the empire restored!");
}

function initOnlineCounter() {
    setInterval(() => {
        // Рандомна флуктуація справжнього числа
        const fluctuation = Math.floor(Math.random() * 40) - 20;
        state.onlineUsers = Math.max(1400, state.onlineUsers + fluctuation);
        const el = document.getElementById('user-count');
        if (el) el.innerText = `${state.onlineUsers.toLocaleString()} OPERATORS ONLINE`;
    }, 4000);
}

// --- 8. ФОНОВИЙ КАНВАС (ЧАСТИНКИ) ---
function initBackground() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y -= p.speed;
            if (p.y < -10) p.y = canvas.height + 10;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- 9. ЗБЕРЕЖЕННЯ ---
function saveData() {
    localStorage.setItem('ge_balance', state.money);
    localStorage.setItem('ge_taps', state.totalTaps);
    localStorage.setItem('ge_level', state.currentLevel);
}

function showNotification(msg) {
    console.log(`%c GOLDEN EQUITY: ${msg}`, 'background: #22c55e; color: #000; font-weight: bold; padding: 5px;');
}

// --- СТАРТ СИСТЕМИ ---
window.onload = () => {
    initBackground();
    initOnlineCounter();
    updateUI();
    showNotification("SYSTEM ONLINE. WELCOME, FOUNDER.");
};
