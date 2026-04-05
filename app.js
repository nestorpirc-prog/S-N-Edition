import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// ТВІЙ РЕАЛЬНИЙ КОНФІГ
const firebaseConfig = {
    apiKey: "AIzaSyBn7mwTIJaICFCKHZQJwAvHRKsF8lHUDZ8",
    authDomain: "buiznesimperia.firebaseapp.com",
    databaseURL: "https://buiznesimperia-default-rtdb.firebaseio.com",
    projectId: "buiznesimperia",
    storageBucket: "buiznesimperia.firebasestorage.app",
    messagingSenderId: "1045081555968",
    appId: "1:1045081555968:web:e413ec99eb7dee630cc4e5"
};

// Ініціалізація
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let state = {
    money: 0, click: 1, pps: 0, lvl: 1, exp: 0,
    items: { i1: 0, i2: 0, i3: 0, i4: 0, i5: 0 },
    uid: null, user: ''
};

const MARKET = [
    { id: 'i1', name: 'Street Hustle', price: 15, val: 1, type: 'pps', mult: 1.15 },
    { id: 'i2', name: 'Inferno GPU', price: 200, val: 12, type: 'pps', mult: 1.2 },
    { id: 'i3', name: 'Shadow Bank', price: 1000, val: 2, type: 'click', mult: 2.5 },
    { id: 'i4', name: 'Neural Bot', price: 5000, val: 140, type: 'pps', mult: 1.25 },
    { id: 'i5', name: 'Void Corp', price: 50000, val: 1200, type: 'pps', mult: 1.3 }
];

// ЛОГІКА ВХОДУ
document.getElementById('auth-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const status = document.getElementById('auth-status');

    status.innerText = "INITIALIZING SECURE LINK...";
    signInWithEmailAndPassword(auth, email, pass)
        .catch(() => createUserWithEmailAndPassword(auth, email, pass))
        .catch(e => status.innerText = "ERROR: " + e.message);
};

onAuthStateChanged(auth, user => {
    if (user) {
        state.uid = user.uid;
        state.user = user.email.split('@')[0];
        launch();
    }
});

function launch() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'flex';

    // Завантаження даних
    onValue(ref(db, 'users/' + state.uid), snap => {
        if (snap.exists()) {
            state = { ...state, ...snap.val() };
            updateUI();
        }
    });

    renderMarket();
    setInterval(gameLoop, 100);
    setInterval(autoSave, 10000);
}

// ГЕЙМПЛЕЙ
document.getElementById('clicker-core').onclick = (e) => {
    state.money += state.click;
    state.exp += 1;
    if (state.exp >= state.lvl * 500) { state.lvl++; state.exp = 0; }
    
    spawnFx(e);
    updateUI();
};

function gameLoop() {
    if (state.pps > 0) {
        state.money += (state.pps / 10);
        updateUI();
    }
}

function renderMarket() {
    const cont = document.getElementById('items-grid');
    cont.innerHTML = '';
    MARKET.forEach(it => {
        const count = state.items[it.id] || 0;
        const cost = Math.floor(it.price * Math.pow(it.mult, count));
        cont.innerHTML += `
            <div class="item-card">
                <div class="info">
                    <strong>${it.name} [x${count}]</strong><br>
                    <small>+${it.val}${it.type === 'pps' ? '/s' : ' Click'}</small>
                </div>
                <button class="buy-btn" id="btn-${it.id}" onclick="window.buy('${it.id}')">$${cost}</button>
            </div>
        `;
    });
}

window.buy = (id) => {
    const it = MARKET.find(x => x.id === id);
    const count = state.items[id] || 0;
    const cost = Math.floor(it.price * Math.pow(it.mult, count));

    if (state.money >= cost) {
        state.money -= cost;
        state.items[id] = count + 1;
        if (it.type === 'pps') state.pps += it.val;
        else state.click *= it.val;
        renderMarket();
        updateUI();
    }
};

function updateUI() {
    document.getElementById('money').innerText = Math.floor(state.money).toLocaleString();
    document.getElementById('pps').innerText = '$' + state.pps;
    document.getElementById('lvl').innerText = state.lvl;
    
    let r = "NEOPHYTE";
    if (state.money > 10000) r = "STREET LORD";
    if (state.money > 1000000) r = "OLIGARCH";
    document.getElementById('rank-display').innerText = r;
}

function spawnFx(e) {
    const fx = document.createElement('div');
    fx.className = 'tap-fx';
    fx.style.left = e.pageX + 'px';
    fx.style.top = e.pageY + 'px';
    fx.innerText = `+$${state.click}`;
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 800);
}

function autoSave() {
    if (state.uid) update(ref(db, 'users/' + state.uid), state);
}

// Навігація
window.showTab = (id) => {
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    document.getElementById('view-home').style.display = id === 'home' ? 'flex' : 'none'; // Потрібно додати id до MAIN блоку
    document.getElementById(id + '-view').style.display = 'block';
};
