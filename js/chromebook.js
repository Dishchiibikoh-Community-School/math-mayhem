// ============================================================
//  MATH MAYHEM — Chromebook (Student) Logic
// ============================================================

const AVATARS = ['🧑', '👦', '👧', '🧒', '🦊', '🐯', '🦁', '🐼', '🐸', '🤖', '👾', '🦄', '🐉', '🦋', '⚡', '🌟'];

let player = null;
let questions = [];
let qIndex = 0;
let maxTime = 20;
let timerVal = 20;
let timerInterval = null;
let answered = false;
let activePowerup = null;
let allPlayers = [];  // simulated "class" for leaderboard
let selectedAvatar = AVATARS[0];

const CIRC = 239; // 2πr for r=38

/* ─────────────────────────────────────
   LOGIN SCREEN
───────────────────────────────────── */
function initLogin() {
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';
    AVATARS.forEach((av, i) => {
        const btn = document.createElement('button');
        btn.className = 'av-btn' + (i === 0 ? ' selected' : '');
        btn.textContent = av;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.av-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAvatar = av;
        });
        grid.appendChild(btn);
    });
}

function startCBGame() {
    const name = document.getElementById('player-name').value.trim() || 'Student';
    const topic = document.getElementById('cb-topic').value;
    const level = parseInt(document.getElementById('cb-level').value);
    const qcount = parseInt(document.getElementById('cb-qcount').value);
    maxTime = 20;

    player = Engine.newPlayer(name, selectedAvatar);
    player.avatar = selectedAvatar;

    // Build questions
    if (level === 4) questions = Engine.shuffle(getMayhemQuestions(qcount));
    else questions = Engine.shuffle(getQuestions(topic === 'all' ? 'all' : topic, level, qcount));

    // Simulate some AI classmates for the leaderboard
    allPlayers = [player, ...generateAIPlayers(5)];

    // Show game screen
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';

    // Set UI
    document.getElementById('cb-avatar').textContent = selectedAvatar;
    document.getElementById('cb-pname').textContent = name;
    updateHUD();
    buildPowerupBar();
    updateSidebar();

    qIndex = 0;
    loadQuestion();
}

/* ─────────────────────────────────────
   AI CLASSMATES (for leaderboard feel)
───────────────────────────────────── */
function generateAIPlayers(n) {
    const names = ['Alex', 'Jordan', 'Sam', 'Riley', 'Morgan', 'Taylor', 'Casey', 'Avery'];
    const shuffled = Engine.shuffle(names).slice(0, n);
    return shuffled.map(name => { const p = Engine.newPlayer(name, Engine.shuffle(AVATARS)[0]); p.score = 0; return p; });
}

function updateAIPlayers() {
    allPlayers.forEach(p => {
        if (p === player) return;
        if (Math.random() > 0.4) {
            const gain = Math.floor(Math.random() * 120) + 40;
            p.score += gain;
        }
    });
}

/* ─────────────────────────────────────
   QUESTION FLOW
───────────────────────────────────── */
function loadQuestion() {
    if (qIndex >= questions.length) { showResults(); return; }
    const q = questions[qIndex];
    answered = false;
    activePowerup = null;

    document.getElementById('cb-q-text').textContent = q.q;
    document.getElementById('cb-qnum').textContent = `Q ${qIndex + 1}/${questions.length}`;
    document.getElementById('cb-active-pu-bar').style.display = 'none';

    // Build answer buttons
    const container = document.getElementById('cb-answers');
    container.innerHTML = '';
    const choices = q.type === 'tf' ? ['True', 'False'] : q.choices;
    const letters = ['A', 'B', 'C', 'D'];
    choices.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `<strong style="color:var(--muted);min-width:24px;">${letters[i]}</strong> ${c}`;
        btn.setAttribute('data-val', c);
        btn.addEventListener('click', () => handleAnswer(c, btn, q));
        container.appendChild(btn);
    });
    // pad for tf
    if (q.type === 'tf') {
        for (let i = 2; i < 4; i++) {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.style.opacity = '0'; btn.style.pointerEvents = 'none';
            container.appendChild(btn);
        }
    }

    startTimer();
}

/* ─────────────────────────────────────
   TIMER
───────────────────────────────────── */
function startTimer() {
    clearInterval(timerInterval);
    timerVal = maxTime;
    updateTimerRing();
    timerInterval = setInterval(() => {
        timerVal--;
        updateTimerRing();
        if (timerVal <= 5) SoundFX.urgentTick();
        else if (timerVal % 5 === 0) SoundFX.tick();
        if (timerVal <= 0) { clearInterval(timerInterval); timeOut(); }
    }, 1000);
}

function updateTimerRing() {
    const num = document.getElementById('cb-timer-num');
    const circ = document.getElementById('cb-timer-circle');
    if (!num || !circ) return;
    num.textContent = timerVal;
    const offset = CIRC * (1 - timerVal / maxTime);
    circ.style.strokeDashoffset = offset;
    const urgent = timerVal <= 5;
    circ.style.stroke = urgent ? 'var(--red)' : 'var(--cyan)';
    num.style.color = urgent ? 'var(--red)' : 'var(--white)';
    if (urgent) num.style.animation = 'flamePulse 0.4s infinite alternate';
    else num.style.animation = '';
}

function timeOut() {
    if (answered) return;
    answered = true;
    handleAnswerResult(false, null, 0, questions[qIndex]);
    showToast("⏱️ Time's Up! Better luck next question.", 'error');
}

/* ─────────────────────────────────────
   ANSWER HANDLING
───────────────────────────────────── */
function handleAnswer(val, btnEl, q) {
    if (answered) return;
    clearInterval(timerInterval);
    answered = true;

    const isCorrect = (val === q.answer);
    const elapsed = maxTime - timerVal;

    // Bomb: if used, it already removed 2 wrong choices
    // Visual
    document.querySelectorAll('.answer-btn').forEach(b => {
        b.disabled = true;
        const bVal = b.getAttribute('data-val');
        if (bVal === q.answer) b.classList.add('correct');
        else if (bVal === val && !isCorrect) b.classList.add('wrong');
        else if (bVal && bVal !== q.answer) b.classList.add('disabled-neutral');
    });

    handleAnswerResult(isCorrect, btnEl, elapsed, q);
}

function handleAnswerResult(isCorrect, btnEl, elapsed, q) {
    const prevBadges = [...player.badges];
    const pts = Engine.applyAnswer(player, isCorrect, maxTime - elapsed, maxTime, activePowerup);
    const newBadges = player.badges.filter(b => !prevBadges.some(p => p.id === b.id));
    const didLevelUp = Engine.checkLevelUp(player);

    updateHUD();
    updateSidebar();
    updateAIPlayers();

    if (isCorrect) {
        SoundFX.correct();
        Confetti.burst(60);
        if (pts > 0) showPointsPopup('+' + pts);
        if (player.streak >= 3) showToast(`🔥 ${player.streak}-streak! ${Engine.multLabel(player.streak)}`, 'gold');
    } else {
        SoundFX.wrong();
        showToast(`❌ Correct answer: ${q.answer}`, 'error');
    }

    // New badges
    newBadges.forEach((b, i) => setTimeout(() => showBadgeNotif(b), i * 800));

    // Level up
    if (didLevelUp) setTimeout(() => { SoundFX.levelUp(); showToast(`🎉 LEVEL UP! You're now Level ${player.level}!`, 'gold'); Confetti.burst(100); }, 500);

    // Move to next question after delay
    setTimeout(() => {
        // Mid-game leaderboard every 5 questions
        if ((qIndex + 1) % 5 === 0 && qIndex + 1 < questions.length) {
            showMidLB(() => { qIndex++; loadQuestion(); });
        } else {
            qIndex++;
            loadQuestion();
        }
    }, isCorrect ? 1800 : 2200);
}

/* ─────────────────────────────────────
   HUD UPDATES
───────────────────────────────────── */
function updateHUD() {
    document.getElementById('cb-score').textContent = player.score.toLocaleString();
    const streakEl = document.getElementById('cb-streak-display');
    if (player.streak >= 3) {
        streakEl.textContent = `🔥 ${player.streak}`;
        streakEl.className = 'streak-flame hot';
    } else if (player.streak > 0) {
        streakEl.textContent = `⚡ ${player.streak}`;
        streakEl.className = 'streak-flame';
    } else {
        streakEl.textContent = '';
    }
    document.getElementById('cb-level-label').textContent = `Lv ${player.level}`;
    document.getElementById('cb-xp-label').textContent = `${player.xp} XP`;
    document.getElementById('cb-xp-fill').style.width = Engine.xpPercent(player) + '%';
}

/* ─────────────────────────────────────
   SIDEBAR LEADERBOARD
───────────────────────────────────── */
function updateSidebar() {
    const sorted = Engine.getLeaderboard(allPlayers);
    const container = document.getElementById('cb-lb-sidebar');
    container.innerHTML = '';
    sorted.slice(0, 8).forEach((p, i) => {
        const isMe = p === player;
        const row = document.createElement('div');
        row.className = `lb-row rank-${i + 1}`;
        if (isMe) row.style.borderColor = 'var(--cyan)';
        row.innerHTML = `
      <div class="lb-rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</div>
      <div style="font-size:1.1rem;">${p.avatar || '🧑'}</div>
      <div class="lb-name" style="${isMe ? 'color:var(--cyan)' : ''}">${p.name}${isMe ? ' (You)' : ''}</div>
      <div class="lb-score" style="font-size:1.1rem;">${p.score.toLocaleString()}</div>
    `;
        container.appendChild(row);
    });

    // Update badges
    const badgeContainer = document.getElementById('cb-badges-sidebar');
    badgeContainer.innerHTML = '';
    player.badges.forEach(b => {
        const pill = document.createElement('span');
        pill.className = 'badge-pill';
        pill.innerHTML = `${b.icon} ${b.name}`;
        badgeContainer.appendChild(pill);
    });
}

/* ─────────────────────────────────────
   POWER-UP BAR
───────────────────────────────────── */
function buildPowerupBar() {
    const bar = document.getElementById('cb-pu-bar');
    bar.innerHTML = '';
    const puDefs = [
        { id: 'shield', icon: '🛡️', label: 'Shield', desc: 'Absorb one wrong answer' },
        { id: 'double', icon: '⚡', label: '2× Pts', desc: 'Next correct = double points' },
        { id: 'freeze', icon: '❄️', label: 'Freeze', desc: 'Pause timer 5s' },
        { id: 'bomb', icon: '💣', label: 'Bomb', desc: 'Eliminate 2 wrong answers' },
    ];
    puDefs.forEach(pu => {
        const slot = document.createElement('div');
        slot.className = 'powerup-slot' + (player.powerups[pu.id] <= 0 ? ' empty' : '');
        slot.id = `pu-slot-${pu.id}`;
        slot.title = pu.desc;
        slot.innerHTML = `<span class="icon">${pu.icon}</span><span style="font-size:0.75rem;font-weight:700;">${pu.label}</span><span class="count">×${player.powerups[pu.id]}</span>`;
        if (player.powerups[pu.id] > 0) {
            slot.addEventListener('click', () => usePowerup(pu.id, slot, pu.label));
        }
        bar.appendChild(slot);
    });
}

function usePowerup(type, slotEl, label) {
    if (answered) return;
    if (!Engine.usePowerup(player, type)) return;
    activePowerup = type;

    slotEl.classList.add('active');
    slotEl.querySelector('.count').textContent = `×${player.powerups[type]}`;
    if (player.powerups[type] <= 0) slotEl.classList.add('empty');

    SoundFX.powerUp();

    const bar = document.getElementById('cb-active-pu-bar');
    const lbl = document.getElementById('cb-active-pu-label');
    bar.style.display = 'block';
    const msgs = { shield: '🛡️ Shield Active — mistakes forgiven this round!', double: '⚡ Double Points — answer correctly for 2× pts!', freeze: '❄️ Timer Frozen for 5 seconds!', bomb: '💣 Bomb Used — 2 wrong answers eliminated!' };
    lbl.textContent = msgs[type];

    if (type === 'freeze') {
        clearInterval(timerInterval);
        setTimeout(() => startTimerFromCurrent(), 5000);
    }
    if (type === 'bomb') eliminateTwoWrong();
}

function startTimerFromCurrent() {
    timerInterval = setInterval(() => {
        timerVal--;
        updateTimerRing();
        if (timerVal <= 5) SoundFX.urgentTick();
        if (timerVal <= 0) { clearInterval(timerInterval); timeOut(); }
    }, 1000);
}

function eliminateTwoWrong() {
    const q = questions[qIndex];
    const btns = [...document.querySelectorAll('.answer-btn')];
    let removed = 0;
    for (const b of btns) {
        if (removed >= 2) break;
        const val = b.getAttribute('data-val');
        if (val && val !== q.answer && !b.disabled) {
            b.classList.add('disabled-neutral'); b.disabled = true; removed++;
        }
    }
}

/* ─────────────────────────────────────
   MID-GAME LEADERBOARD
───────────────────────────────────── */
function showMidLB(onContinue) {
    const overlay = document.getElementById('lb-overlay');
    overlay.style.display = 'flex';
    const list = document.getElementById('lb-overlay-list');
    list.innerHTML = '';
    const sorted = Engine.getLeaderboard(allPlayers);
    sorted.forEach((p, i) => {
        const isMe = p === player;
        const row = document.createElement('div');
        row.className = `lb-row rank-${i + 1}`;
        if (isMe) row.style.borderColor = 'var(--cyan)';
        row.innerHTML = `
      <div class="lb-rank">${['🥇', '🥈', '🥉'][i] || (i + 1)}</div>
      <span style="font-size:1.1rem;">${p.avatar || '🧑'}</span>
      <div class="lb-name" style="${isMe ? 'color:var(--cyan)' : ''}">${p.name}${isMe ? ' (You)' : ''}</div>
      <div class="lb-score">${p.score.toLocaleString()}</div>
    `;
        list.appendChild(row);
    });
    window._onLBClose = onContinue;
}

function closeLB() {
    document.getElementById('lb-overlay').style.display = 'none';
    if (window._onLBClose) window._onLBClose();
    window._onLBClose = null;
}

/* ─────────────────────────────────────
   BADGE NOTIFICATION
───────────────────────────────────── */
function showBadgeNotif(badge) {
    const el = document.createElement('div');
    el.className = 'badge-notif';
    el.innerHTML = `
    <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">🎖️ Badge Unlocked!</div>
    <div class="b-icon">${badge.icon}</div>
    <div class="b-name">${badge.name}</div>
    <div class="b-desc">${badge.desc}</div>
  `;
    document.body.appendChild(el);
    SoundFX.powerUp();
    setTimeout(() => el.remove(), 3500);
}

/* ─────────────────────────────────────
   POINTS POPUP
───────────────────────────────────── */
function showPointsPopup(text) {
    const el = document.createElement('div');
    el.className = 'pts-popup';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
}

/* ─────────────────────────────────────
   RESULTS SCREEN
───────────────────────────────────── */
function showResults() {
    clearInterval(timerInterval);
    Engine.awardEndBadges(allPlayers);
    Engine.saveToLocalStorage({ name: player.name, score: player.score, mode: 'chromebook', avatar: player.avatar });

    const sorted = Engine.getLeaderboard(allPlayers);
    const myRank = sorted.findIndex(p => p === player) + 1;

    document.getElementById('screen-game').style.display = 'none';
    const endScreen = document.getElementById('screen-end');
    endScreen.style.display = 'flex';

    // Headline
    const headlines = { 1: '👑 YOU WIN! CHAMPION!', 2: '🥈 Amazing 2nd Place!', 3: '🥉 Great 3rd Place!' };
    document.getElementById('end-headline').textContent = headlines[myRank] || `🎉 ${myRank}th Place — Great Job!`;

    // Podium
    const podium = document.getElementById('end-podium');
    podium.innerHTML = '';
    [sorted[1], sorted[0], sorted[2]].forEach((p, pos) => {
        if (!p) return;
        const isMe = p === player;
        const rankNum = pos === 1 ? 1 : pos === 0 ? 2 : 3;
        const heights = ['120px', '160px', '90px'];
        const labels = ['2nd 🥈', '1st 🥇', '3rd 🥉'];
        const col = document.createElement('div');
        col.className = 'podium-col';
        col.innerHTML = `
      <div style="font-size:2.5rem;">${p.avatar || '🧑'}</div>
      <div class="podium-name" style="${isMe ? 'color:var(--cyan)' : ''}">${p.name}${isMe ? ' ✨' : ''}</div>
      <div class="podium-score">${p.score.toLocaleString()}</div>
      <div class="podium-block p${rankNum}" style="height:${heights[pos]};"><div class="podium-rank">${labels[pos]}</div></div>
    `;
        podium.appendChild(col);
    });

    // Player summary
    const acc = player.totalAnswered > 0 ? Math.round((player.totalCorrect / player.totalAnswered) * 100) : 0;
    document.getElementById('end-player-summary').innerHTML = `
    <div style="font-family:'Bangers',cursive;font-size:1.4rem;color:var(--cyan);margin-bottom:12px;">${player.avatar} ${player.name}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
      <div><div style="font-family:'Bangers',cursive;font-size:2rem;color:var(--gold);">${player.score.toLocaleString()}</div><div style="font-size:0.8rem;color:var(--muted);">POINTS</div></div>
      <div><div style="font-family:'Bangers',cursive;font-size:2rem;color:var(--green);">${acc}%</div><div style="font-size:0.8rem;color:var(--muted);">ACCURACY</div></div>
      <div><div style="font-family:'Bangers',cursive;font-size:2rem;color:var(--purple);">${player.maxStreak}</div><div style="font-size:0.8rem;color:var(--muted);">BEST STREAK</div></div>
    </div>
    <div style="margin-top:12px;font-size:0.9rem;color:var(--muted);">${player.totalCorrect}/${player.totalAnswered} correct &nbsp;·&nbsp; Level ${player.level} &nbsp;·&nbsp; Rank #${myRank}</div>
  `;

    // Badges
    const badgeContainer = document.getElementById('end-badges');
    badgeContainer.innerHTML = '';
    if (player.badges.length === 0) {
        badgeContainer.innerHTML = '<div style="color:var(--muted);font-size:0.9rem;">No badges earned this round — keep playing!</div>';
    } else {
        player.badges.forEach(b => {
            const pill = document.createElement('div');
            pill.className = 'card';
            pill.style.cssText = 'padding:14px 20px;text-align:center;border-color:var(--gold);flex-shrink:0;';
            pill.innerHTML = `<div style="font-size:2rem;">${b.icon}</div><div style="font-weight:700;color:var(--gold);">${b.name}</div><div style="font-size:0.75rem;color:var(--muted);">${b.desc}</div>`;
            badgeContainer.appendChild(pill);
        });
    }

    // Full leaderboard
    const lbContainer = document.getElementById('end-all-lb');
    lbContainer.innerHTML = '';
    sorted.forEach((p, i) => {
        const isMe = p === player;
        const row = document.createElement('div');
        row.className = `lb-row rank-${i + 1}`;
        if (isMe) row.style.borderColor = 'var(--cyan)';
        row.innerHTML = `
      <div class="lb-rank">${['🥇', '🥈', '🥉'][i] || i + 1}</div>
      <span style="font-size:1.1rem;">${p.avatar || '🧑'}</span>
      <div class="lb-name" style="${isMe ? 'color:var(--cyan)' : ''}">${p.name}${isMe ? ' (You)' : ''}</div>
      <div class="lb-score">${p.score.toLocaleString()}</div>
    `;
        lbContainer.appendChild(row);
        row.style.opacity = '0'; row.style.transition = 'opacity 0.4s';
        setTimeout(() => row.style.opacity = '1', i * 120);
    });

    SoundFX.levelUp();
    Confetti.burst(myRank === 1 ? 250 : 120);
}

/* ─────────────────────────────────────
   TOAST
───────────────────────────────────── */
function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3100);
}
