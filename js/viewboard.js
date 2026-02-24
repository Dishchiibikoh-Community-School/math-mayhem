// ============================================================
//  MATH MAYHEM — ViewBoard Logic
// ============================================================

const TEAM_COLORS = ['#a855f7', '#06b6d4', '#fbbf24', '#22c55e', '#f97316', '#ec4899'];
const BONUS_TYPES = ['lightning', 'duel', 'wheel', 'mystery'];

let teams = [];
let questions = [];
let qIndex = 0;
let maxTime = 20;
let timerVal = 20;
let timerInterval = null;
let activeTeamIdx = -1; // which team buzzed in
let buzzLocked = false;
let answerRevealed = false;
let roundNum = 1;
let activePowerup = null; // active powerup for current question

/* ─────────────────────────────────────
   SETUP SCREEN
───────────────────────────────────── */
function updateTeamFields() {
    const count = parseInt(document.getElementById('setup-teams').value);
    const container = document.getElementById('team-name-fields');
    container.innerHTML = '';
    const defaultNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'team-entry';
        div.innerHTML = `
      <div class="team-color-dot" style="background:${TEAM_COLORS[i]};"></div>
      <input class="input-field team-input" id="team-name-${i}"
        placeholder="Team ${defaultNames[i]}" value="Team ${defaultNames[i]}">
    `;
        container.appendChild(div);
    }
}

function startGame() {
    // Read settings
    const topic = document.getElementById('setup-topic').value;
    const level = parseInt(document.getElementById('setup-level').value);
    const qcount = parseInt(document.getElementById('setup-qcount').value);
    maxTime = parseInt(document.getElementById('setup-time').value);
    const teamCnt = parseInt(document.getElementById('setup-teams').value);

    // Build teams
    teams = [];
    for (let i = 0; i < teamCnt; i++) {
        const name = document.getElementById(`team-name-${i}`).value.trim() || `Team ${i + 1}`;
        const t = Engine.newTeam(name, TEAM_COLORS[i]);
        teams.push(t);
    }

    // Select questions
    if (level === 4) {
        questions = Engine.shuffle(getMayhemQuestions(qcount));
    } else {
        questions = Engine.shuffle(getQuestions(topic === 'all' ? 'all' : topic, level, qcount));
    }

    // Update UI labels
    document.getElementById('vb-qnum').textContent = `Q 1/${questions.length}`;
    document.getElementById('vb-round-badge').textContent = `Round ${roundNum}`;
    const topicMap = { all: 'All Topics', addition: 'Addition/Sub', multiplication: 'Mult/Div', fractions: 'Fractions', decimals: 'Decimals', algebra: 'Algebra', geometry: 'Geometry', word_problems: 'Word Problems' };
    document.getElementById('vb-topic-badge').textContent = topicMap[topic] || 'Mixed';

    // Build sidebar and buzzers
    buildSidebar();
    buildBuzzers();
    buildPowerupPanel();

    // Show game screen
    document.getElementById('screen-setup').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';

    qIndex = 0;
    loadQuestion();
}

/* ─────────────────────────────────────
   SIDEBAR & BUZZERS
───────────────────────────────────── */
function buildSidebar() {
    const container = document.getElementById('vb-teams-sidebar');
    container.innerHTML = '';
    teams.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'vb-team-card';
        div.id = `vb-team-card-${i}`;
        div.style.borderColor = t.color + '55';
        div.innerHTML = `
      <div class="vb-team-header">
        <div class="vb-team-dot" style="background:${t.color};box-shadow:0 0 8px ${t.color};"></div>
        <div class="vb-team-name">${t.name}</div>
      </div>
      <div class="vb-team-score" id="vb-score-${i}" style="color:${t.color};">0</div>
      <div class="vb-team-streak" id="vb-streak-${i}"></div>
    `;
        container.appendChild(div);
    });
}

function buildBuzzers() {
    const grid = document.getElementById('team-buzz-grid');
    const cols = Math.min(teams.length, 6);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.innerHTML = '';
    teams.forEach((t, i) => {
        const btn = document.createElement('button');
        btn.className = 'buzz-btn';
        btn.id = `buzz-btn-${i}`;
        btn.style.background = `linear-gradient(135deg, ${t.color}cc, ${t.color}66)`;
        btn.style.boxShadow = `0 0 20px ${t.color}55`;
        btn.innerHTML = `<span style="font-size:2rem;">🔔</span><span>${t.name}</span>`;
        btn.addEventListener('click', () => buzzIn(i));
        grid.appendChild(btn);
    });
}

function buildPowerupPanel() {
    const panel = document.getElementById('vb-powerup-panel');
    panel.innerHTML = '';
    const puDefs = [
        { id: 'shield', icon: '🛡️', label: 'Shield' },
        { id: 'double', icon: '⚡', label: '2× Pts' },
        { id: 'freeze', icon: '❄️', label: 'Freeze' },
        { id: 'bomb', icon: '💣', label: 'Bomb' },
        { id: 'chaos', icon: '🌀', label: 'Chaos' },
    ];
    teams.forEach((t, ti) => {
        const section = document.createElement('div');
        section.innerHTML = `<div style="font-size:0.8rem;font-weight:700;color:${t.color};margin-bottom:4px;">${t.name}</div>`;
        const row = document.createElement('div');
        row.className = 'pu-row';
        puDefs.forEach(pu => {
            if (t.powerups[pu.id] <= 0) return;
            const chip = document.createElement('button');
            chip.className = 'pu-chip';
            chip.textContent = pu.icon + ' ' + pu.label;
            chip.title = `${t.name} uses ${pu.label}`;
            chip.addEventListener('click', () => activatePowerup(ti, pu.id, chip));
            row.appendChild(chip);
        });
        section.appendChild(row);
        panel.appendChild(section);
    });
}

/* ─────────────────────────────────────
   QUESTION FLOW
───────────────────────────────────── */
function loadQuestion() {
    if (qIndex >= questions.length) { endGame(); return; }
    const q = questions[qIndex];
    buzzLocked = false;
    answerRevealed = false;
    activeTeamIdx = -1;
    activePowerup = null;

    document.getElementById('vb-q-text').textContent = q.q;
    document.getElementById('vb-qnum').textContent = `Q ${qIndex + 1}/${questions.length}`;
    document.getElementById('vb-active-team-bar').style.display = 'none';

    // Render answer buttons
    const container = document.getElementById('vb-answers');
    container.innerHTML = '';
    const choices = q.type === 'tf' ? ['True', 'False'] : q.choices;
    const letters = ['A', 'B', 'C', 'D'];
    choices.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'vb-ans-btn';
        btn.id = `vb-ans-${i}`;
        btn.innerHTML = `<span class="letter">${letters[i]}</span><span>${c}</span>`;
        btn.setAttribute('data-val', c);
        btn.addEventListener('click', () => selectAnswer(c, i));
        container.appendChild(btn);
    });
    // pad to 4 if tf
    if (q.type === 'tf') {
        for (let i = 2; i < 4; i++) {
            const btn = document.createElement('button');
            btn.className = 'vb-ans-btn disabled-q';
            btn.style.opacity = '0'; btn.style.pointerEvents = 'none';
            container.appendChild(btn);
        }
    }

    document.getElementById('btn-reveal').disabled = true;
    document.getElementById('btn-next').disabled = true;

    startTimer();
}

/* ─────────────────────────────────────
   TIMER
───────────────────────────────────── */
function startTimer() {
    clearInterval(timerInterval);
    timerVal = maxTime;
    updateTimerUI();
    timerInterval = setInterval(() => {
        timerVal--;
        updateTimerUI();
        if (timerVal <= 3) SoundFX.urgentTick();
        else if (timerVal % 5 === 0) SoundFX.tick();
        if (timerVal <= 0) { clearInterval(timerInterval); timerOut(); }
    }, 1000);
}

function updateTimerUI() {
    const el = document.getElementById('vb-timer');
    el.textContent = timerVal;
    el.className = 'vb-timer-num' + (timerVal <= 5 ? ' urgent' : '');
    const bar = document.getElementById('vb-timer-bar');
    bar.style.width = ((timerVal / maxTime) * 100) + '%';
    bar.style.background = timerVal <= 5 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,var(--purple),var(--cyan))';
}

function timerOut() {
    // Time's up — unlock reveal
    document.getElementById('btn-reveal').disabled = false;
    document.getElementById('btn-next').disabled = false;
    BuzzLock(true);
    showToast("⏱️ Time's Up!", 'error');
    SoundFX.wrong();
}

/* ─────────────────────────────────────
   BUZZ IN
───────────────────────────────────── */
function buzzIn(teamIdx) {
    if (buzzLocked || answerRevealed) return;
    clearInterval(timerInterval);
    buzzLocked = true;
    activeTeamIdx = teamIdx;
    const t = teams[teamIdx];

    // Flash team indicator
    const ind = document.getElementById('buzz-indicator');
    document.getElementById('buzz-team-name').textContent = t.name;
    document.getElementById('buzz-team-name').style.color = t.color;
    ind.className = 'buzz-indicator show';
    SoundFX.buzz();

    // Highlight active team card
    teams.forEach((_, i) => document.getElementById(`vb-team-card-${i}`).classList.remove('active'));
    document.getElementById(`vb-team-card-${teamIdx}`).classList.add('active');

    // Active bar
    const bar = document.getElementById('vb-active-team-bar');
    bar.style.display = 'block';
    bar.style.background = t.color + '22';
    bar.style.border = `2px solid ${t.color}`;
    document.getElementById('vb-active-team-name').textContent = t.name;

    // Highlight buzz button winner
    document.getElementById(`buzz-btn-${teamIdx}`).classList.add('buzzed');

    setTimeout(() => { ind.className = 'buzz-indicator'; }, 2000);

    // Enable reveal and answers
    document.getElementById('btn-reveal').disabled = false;
}

function BuzzLock(v) { buzzLocked = v; }

/* ─────────────────────────────────────
   ANSWER SELECTION
───────────────────────────────────── */
function selectAnswer(val, idx) {
    if (answerRevealed) return;
    if (activeTeamIdx < 0) { showToast('A team must buzz in first!', 'info'); return; }
    clearInterval(timerInterval);
    answerRevealed = true;
    BuzzLock(true);

    const q = questions[qIndex];
    const isCorrect = (val === q.answer);

    // Visual feedback on buttons
    const btns = document.querySelectorAll('.vb-ans-btn');
    btns.forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-val') === q.answer) b.classList.add('revealed-correct');
        else if (b.getAttribute('data-val') === val && !isCorrect) b.classList.add('revealed-wrong');
        else b.classList.add('disabled-q');
    });

    // Score update
    const t = teams[activeTeamIdx];
    const pts = Engine.applyTeamAnswer(t, isCorrect, timerVal, maxTime, activePowerup);

    // Update sidebar score
    document.getElementById(`vb-score-${activeTeamIdx}`).textContent = t.score.toLocaleString();
    const streakEl = document.getElementById(`vb-streak-${activeTeamIdx}`);
    streakEl.textContent = t.streak >= 3 ? `🔥 ${t.streak}-streak (${Engine.multLabel(t.streak - 1)})` : (t.streak > 0 ? `Streak: ${t.streak}` : '');

    // Full-screen flash
    const flash = document.getElementById('answer-flash');
    flash.className = 'answer-flash ' + (isCorrect ? 'correct' : 'wrong');
    setTimeout(() => flash.className = 'answer-flash', 600);

    if (isCorrect) {
        SoundFX.correct();
        Confetti.burst(60);
        if (pts > 0) showToast(`+${pts} pts for ${t.name}! ${Engine.multLabel(t.streak - 1)}`, 'success');
        if (t.streak === 5) { SoundFX.levelUp(); showToast(`🔥 ON FIRE! ${t.name} is on a 5-streak!`, 'gold'); }
    } else {
        SoundFX.wrong();
        showToast(`❌ Wrong answer! Correct: ${q.answer}`, 'error');
        // let other teams still buzz in
        buzzLocked = false;
        activeTeamIdx = -1;
        document.getElementById('vb-active-team-bar').style.display = 'none';
        // Restart timer shortened
        timerVal = Math.max(5, Math.floor(timerVal * 0.6));
        startTimer();
        answerRevealed = false;
        return;
    }

    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-reveal').disabled = true;
}

/* ─────────────────────────────────────
   REVEAL & NEXT
───────────────────────────────────── */
function revealAnswer() {
    if (answerRevealed) return;
    clearInterval(timerInterval);
    answerRevealed = true;
    BuzzLock(true);
    const q = questions[qIndex];
    document.querySelectorAll('.vb-ans-btn').forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-val') === q.answer) b.classList.add('revealed-correct');
        else b.classList.add('disabled-q');
    });
    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-reveal').disabled = true;
    showToast(`✅ Answer: ${q.answer}`, 'info');
}

function nextQuestion() {
    clearInterval(timerInterval);
    Confetti.stop();
    qIndex++;
    // Reset buzzer buttons
    teams.forEach((_, i) => {
        const b = document.getElementById(`buzz-btn-${i}`);
        if (b) b.classList.remove('buzzed');
        const c = document.getElementById(`vb-team-card-${i}`);
        if (c) c.classList.remove('active');
    });
    loadQuestion();
}

/* ─────────────────────────────────────
   POWER-UPS
───────────────────────────────────── */
function activatePowerup(teamIdx, type, chipEl) {
    const t = teams[teamIdx];
    if (!Engine.usePowerup(t, type)) return;
    activePowerup = type;
    chipEl.classList.add('used');
    chipEl.disabled = true;
    SoundFX.powerUp();

    const labels = { shield: '🛡️ Shield activated!', double: '⚡ Double points next!', freeze: '❄️ Timer frozen!', bomb: '💣 Two choices eliminated!', chaos: '🌀 50 pts stolen from top team!' };
    showToast(labels[type], 'gold');

    if (type === 'freeze') {
        clearInterval(timerInterval);
        setTimeout(() => startTimer(), 5000);
    }
    if (type === 'bomb') eliminateTwoWrong();
    if (type === 'chaos') {
        // steal from top team
        const sorted = Engine.getLeaderboard(teams);
        const top = sorted[0];
        if (top && top.name !== t.name) {
            const steal = 50;
            top.score = Math.max(0, top.score - steal);
            t.score += steal;
            rebuildScores();
        }
    }
}

function eliminateTwoWrong() {
    const q = questions[qIndex];
    const btns = [...document.querySelectorAll('.vb-ans-btn')];
    let removed = 0;
    for (const b of btns) {
        if (removed >= 2) break;
        if (b.getAttribute('data-val') !== q.answer && !b.disabled) {
            b.classList.add('disabled-q'); b.disabled = true; removed++;
        }
    }
}

function rebuildScores() {
    teams.forEach((t, i) => {
        const el = document.getElementById(`vb-score-${i}`);
        if (el) el.textContent = t.score.toLocaleString();
    });
}

/* ─────────────────────────────────────
   BONUS ROUND
───────────────────────────────────── */
function showBonusRound() {
    clearInterval(timerInterval);
    const type = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];
    document.getElementById('screen-game').style.display = 'none';
    const bonusScreen = document.getElementById('screen-bonus');
    bonusScreen.style.display = 'flex';

    const titles = { lightning: '⚡ LIGHTNING ROUND!', duel: '⚔️ MATH DUEL!', wheel: '🎡 SPIN THE WHEEL!', mystery: '🎭 MYSTERY MATH!' };
    const subs = {
        lightning: '10 rapid-fire questions — 5 seconds each! First buzz wins!',
        duel: 'Two teams face off head-to-head! Choose your champions!',
        wheel: 'Spin the wheel to pick a random topic!',
        mystery: 'The question type is hidden — reveal and answer fast!'
    };
    document.getElementById('bonus-title').textContent = titles[type];
    document.getElementById('bonus-sub').textContent = subs[type];
    SoundFX.countdown();

    if (type === 'wheel') renderSpinWheel();
    else if (type === 'lightning') renderLightningRound();
    else if (type === 'duel') renderDuel();
    else renderMystery();
}

function renderSpinWheel() {
    const topics = ['Addition', 'Multiplication', 'Fractions', 'Decimals', 'Algebra', 'Geometry', 'Word Problems'];
    const colors = ['#a855f7', '#06b6d4', '#fbbf24', '#22c55e', '#f97316', '#ec4899', '#ef4444'];
    const bonus = document.getElementById('bonus-content');
    bonus.innerHTML = `
    <div class="wheel-wrapper" style="text-align:center;">
      <div class="wheel-pointer">▼</div>
      <canvas class="wheel-canvas" id="spin-canvas" width="340" height="340"></canvas>
    </div>
    <div style="text-align:center;" id="spin-result"></div>
    <div style="text-align:center;">
      <button class="btn btn-gold btn-lg" onclick="spinWheel()">🎡 SPIN!</button>
    </div>
  `;
    drawWheel(topics, colors);
}

let spinAngle = 0;
function drawWheel(topics, colors) {
    const canvas = document.getElementById('spin-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sliceAngle = (2 * Math.PI) / topics.length;
    ctx.clearRect(0, 0, 340, 340);
    topics.forEach((t, i) => {
        const start = spinAngle + i * sliceAngle;
        ctx.beginPath();
        ctx.moveTo(170, 170);
        ctx.arc(170, 170, 160, start, start + sliceAngle);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#0a0a1a'; ctx.lineWidth = 3; ctx.stroke();
        ctx.save();
        ctx.translate(170, 170);
        ctx.rotate(start + sliceAngle / 2);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Inter'; ctx.textAlign = 'right';
        ctx.fillText(t, 140, 6);
        ctx.restore();
    });
}

function spinWheel() {
    const topics = ['Addition', 'Multiplication', 'Fractions', 'Decimals', 'Algebra', 'Geometry', 'Word Problems'];
    const colors = ['#a855f7', '#06b6d4', '#fbbf24', '#22c55e', '#f97316', '#ec4899', '#ef4444'];
    const totalRot = Math.PI * 2 * 5 + Math.random() * Math.PI * 2;
    const duration = 3000;
    const start = performance.now();
    const startAng = spinAngle;
    SoundFX.wheelSpin();

    function animate(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        spinAngle = startAng + totalRot * ease;
        drawWheel(topics, colors);
        if (t < 1) { requestAnimationFrame(animate); }
        else {
            const sliceAngle = (2 * Math.PI) / topics.length;
            const norm = ((spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const chosen = topics[Math.floor(((Math.PI * 2 - norm) / sliceAngle) % topics.length)];
            document.getElementById('spin-result').innerHTML =
                `<div style="font-family:'Bangers',cursive;font-size:2rem;color:var(--gold);margin-top:16px;">🎯 Topic: ${chosen}!</div>`;
            Confetti.burst(80);
            SoundFX.correct();
        }
    }
    requestAnimationFrame(animate);
}

function renderLightningRound() {
    const qs = getLightningQuestions();
    const bonus = document.getElementById('bonus-content');
    let current = 0;
    function showQ() {
        if (current >= qs.length) { bonus.innerHTML = '<div class="bonus-title" style="font-size:3rem;">⚡ Lightning Done!</div>'; return; }
        const q = qs[current];
        bonus.innerHTML = `
      <div class="vb-question-card">
        <div class="vb-question-text" style="font-size:1.6rem;">${q.q}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${(q.type === 'tf' ? ['True', 'False'] : q.choices).map((c, i) => `
          <button class="vb-ans-btn" onclick="lightCheck('${c.replace(/'/g, "\\'")}','${q.answer.replace(/'/g, "\\'")}',this,showNextLQ)" style="font-size:1.15rem;min-height:72px;">
            <span class="letter">${['A', 'B', 'C', 'D'][i]}</span><span>${c}</span>
          </button>`).join('')}
      </div>
      <div style="text-align:center;font-size:1.2rem;color:var(--muted);">Q ${current + 1}/${qs.length}</div>
    `;
        current++;
    }
    window.showNextLQ = showQ;
    showQ();
}

function lightCheck(val, answer, el, next) {
    document.querySelectorAll('.vb-ans-btn').forEach(b => b.disabled = true);
    if (val === answer) { el.classList.add('revealed-correct'); SoundFX.correct(); Confetti.burst(40); }
    else {
        el.classList.add('revealed-wrong'); SoundFX.wrong();
        document.querySelectorAll('.vb-ans-btn').forEach(b => {
            if (b.textContent.includes(answer)) b.classList.add('revealed-correct');
        });
    }
    setTimeout(next, 1500);
}

function renderDuel() {
    const bonus = document.getElementById('bonus-content');
    const q = questions[Math.floor(Math.random() * questions.length)];
    bonus.innerHTML = `
    <div style="text-align:center;font-size:1.1rem;color:var(--muted);">Pick two team champions — first to buzz wins double points!</div>
    <div class="vb-question-card"><div class="vb-question-text">${q.q}</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${(q.type === 'tf' ? ['True', 'False'] : q.choices).map((c, i) => `
        <button class="vb-ans-btn" onclick="duelAnswer('${c.replace(/'/g, "\\'")}','${q.answer.replace(/'/g, "\\'")}',this)" style="font-size:1.15rem;min-height:72px;">
          <span class="letter">${['A', 'B', 'C', 'D'][i]}</span><span>${c}</span>
        </button>`).join('')}
    </div>
  `;
}

function duelAnswer(val, answer, el) {
    document.querySelectorAll('.vb-ans-btn').forEach(b => b.disabled = true);
    if (val === answer) {
        el.classList.add('revealed-correct'); SoundFX.correct(); Confetti.burst(80);
        document.getElementById('spin-result') && (document.getElementById('spin-result').innerHTML = '');
        showToast(`🏆 Correct! Team earns ${Engine.BONUS_WIN_POINTS} pts!`, 'gold');
    } else {
        el.classList.add('revealed-wrong'); SoundFX.wrong();
        document.querySelectorAll('.vb-ans-btn').forEach(b => { if (b.textContent.includes(answer)) b.classList.add('revealed-correct'); });
    }
}

function renderMystery() {
    const bonus = document.getElementById('bonus-content');
    const q = questions[Math.floor(Math.random() * questions.length)];
    bonus.innerHTML = `
    <div style="text-align:center;font-size:1.1rem;color:var(--muted);">🎭 Mystery Math — answer is hidden until you pick!</div>
    <div class="vb-question-card"><div class="vb-question-text">${q.q}</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${(q.type === 'tf' ? ['True', 'False'] : q.choices).map((c, i) => `
        <button class="vb-ans-btn" style="font-size:1.15rem;min-height:72px;" onclick="duelAnswer('${c.replace(/'/g, "\\'")}','${q.answer.replace(/'/g, "\\'")}',this)">
          <span class="letter">${['A', 'B', 'C', 'D'][i]}</span><span>???</span>
        </button>`).join('')}
    </div>
  `;
    setTimeout(() => {
        document.querySelectorAll('.vb-ans-btn').forEach((b, i) => {
            const c = (q.type === 'tf' ? ['True', 'False'] : q.choices)[i];
            if (c) b.querySelector('span:last-child').textContent = c;
        });
    }, 3000);
}

function exitBonus() {
    document.getElementById('screen-bonus').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';
    document.getElementById('bonus-content').innerHTML = '';
}

/* ─────────────────────────────────────
   END GAME
───────────────────────────────────── */
function endGame() {
    clearInterval(timerInterval);
    Engine.awardEndBadges(teams);
    const sorted = Engine.getLeaderboard(teams);

    // Save top team
    if (sorted[0]) Engine.saveToLocalStorage({ name: sorted[0].name, score: sorted[0].score, mode: 'viewboard' });

    document.getElementById('screen-game').style.display = 'none';
    const endScreen = document.getElementById('screen-end');
    endScreen.style.display = 'flex';

    // Podium
    const top3 = sorted.slice(0, 3);
    const podium = document.getElementById('end-podium');
    podium.innerHTML = '';
    [top3[1], top3[0], top3[2]].forEach((t, pos) => {
        if (!t) return;
        const rankNum = pos === 1 ? 1 : pos === 0 ? 2 : 3;
        const heights = ['120px', '160px', '90px'];
        const labels = ['2nd 🥈', '1st 🥇', '3rd 🥉'];
        const col = document.createElement('div');
        col.className = 'podium-col';
        col.innerHTML = `
      <div class="podium-avatar">${['🦁', '🐯', '🦊', '🐻', '🐼', '🐸'][sorted.indexOf(t)]}</div>
      <div class="podium-name" style="color:${t.color};">${t.name}</div>
      <div class="podium-score">${t.score.toLocaleString()}</div>
      <div class="podium-block p${rankNum}" style="height:${heights[pos]};">
        <div class="podium-rank">${labels[pos]}</div>
      </div>
    `;
        podium.appendChild(col);
    });

    // Full leaderboard
    const lb = document.getElementById('end-lb');
    lb.innerHTML = '';
    sorted.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = `lb-row rank-${i + 1}`;
        row.innerHTML = `
      <div class="lb-rank">${['🥇', '🥈', '🥉'][i] || (i + 1)}</div>
      <div style="width:14px;height:14px;border-radius:50%;background:${t.color};flex-shrink:0;"></div>
      <div class="lb-name">${t.name}</div>
      <div class="lb-score">${t.score.toLocaleString()}</div>
      <div style="font-size:0.8rem;color:var(--muted);">Streak: ${t.streak}</div>
    `;
        lb.appendChild(row);
        setTimeout(() => row.style.opacity = '1', i * 150);
        row.style.opacity = '0'; row.style.transition = 'opacity 0.4s';
    });

    SoundFX.levelUp();
    Confetti.burst(200);
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
