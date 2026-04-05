let gameData = null;
let money = parseFloat(localStorage.getItem('ge_m')) || 0;
let levelIdx = parseInt(localStorage.getItem('ge_l')) || 0;

// 1. Завантаження даних
async function loadGame() {
    const res = await fetch('data.json');
    gameData = await res.json();
    setupUI();
    initBG();
    startRealOnline();
}

function setupUI() {
    document.getElementById('card-display').innerText = gameData.payment.card;
    document.getElementById('holder-display').innerText = gameData.payment.holder;
    updateStats();
}

// 2. Логіка кліку
function handleTap(e) {
    if (!gameData) return;
    const current = gameData.levels[levelIdx];
    money += current.reward;
    
    // Level Up
    if (money >= current.goal && levelIdx < gameData.levels.length - 1) {
        levelIdx++;
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    spawnText(e, current.reward);
    updateStats();
}

function updateStats() {
    const current = gameData.levels[levelIdx];
    document.getElementById('balance').innerText = '$' + Math.floor(money).toLocaleString();
    document.getElementById('status').innerText = "STATUS: " + current.rank;
    document.getElementById('clicker').innerText = current.icon;
    
    const progress = (money / current.goal) * 100;
    document.getElementById('progress-bar').style.width = Math.min(progress, 100) + '%';
    
    localStorage.setItem('ge_m', money);
    localStorage.setItem('ge_l', levelIdx);
}

// 3. Справжній онлайн (імітація для локалхоста, готова до Firebase)
function startRealOnline() {
    setInterval(() => {
        const count = 1200 + Math.floor(Math.random() * 50);
        document.getElementById('real-count').innerText = `${count} OPERATORS ONLINE`;
    }, 5000);
}

function spawnText(e, val) {
    const t = document.createElement('div');
    t.className = 'float-text';
    t.style.left = e.clientX + 'px';
    t.style.top = e.clientY + 'px';
    t.innerText = `+$${val}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 800);
}

// 4. Background Canvas
function initBG() {
    const c = document.getElementById('bg-canvas');
    const ctx = c.getContext('2d');
    let p = [];
    window.onresize = () => { c.width = innerWidth; c.height = innerHeight; };
    window.onresize();
    for(let i=0; i<40; i++) p.push({x: Math.random()*c.width, y: Math.random()*c.height, v: Math.random()*0.5});
    function draw() {
        ctx.clearRect(0,0,c.width, c.height);
        ctx.fillStyle = 'rgba(34,197,94,0.1)';
        p.forEach(i => {
            ctx.beginPath(); ctx.arc(i.x, i.y, 1, 0, 7); ctx.fill();
            i.y -= i.v; if(i.y < 0) i.y = c.height;
        });
        requestAnimationFrame(draw);
    }
    draw();
}

loadGame();
