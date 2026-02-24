// ============================================================
//  MATH MAYHEM — Core Game Engine
// ============================================================

const Engine = (() => {

    /* ── Constants ── */
    const BASE_POINTS = 100;
    const SPEED_BONUS = 50;
    const SPEED_THRESHOLD = 5;   // seconds
    const BONUS_WIN_POINTS = 250;
    const STREAK_LEVELS = [3, 5];
    const STREAK_MULTS = [1.5, 2.0];
    const XP_PER_CORRECT = 40;
    const XP_PER_LEVEL = 500;

    /* ── Badge definitions ── */
    const BADGE_DEFS = [
        { id: 'on_fire', icon: '🔥', name: 'On Fire', desc: '5-answer streak' },
        { id: 'speed_demon', icon: '⚡', name: 'Speed Demon', desc: 'Answer in < 3 seconds' },
        { id: 'perfect', icon: '🌟', name: 'Perfect Round', desc: 'All correct in a round' },
        { id: 'big_brain', icon: '🧠', name: 'Big Brain', desc: '10 correct in a row' },
        { id: 'champion', icon: '👑', name: 'Champion', desc: 'Finish 1st place' },
        { id: 'sharpshooter', icon: '🎯', name: 'Sharpshooter', desc: '10 correct in a row (no misses)' },
        { id: 'comeback', icon: '💪', name: 'Comeback Kid', desc: 'Win from last place' },
        { id: 'powerhouse', icon: '💥', name: 'Powerhouse', desc: 'Use all 4 power-up types' },
    ];

    /* ── Default player state ── */
    function newPlayer(name, avatar = '🧑') {
        return {
            name, avatar,
            score: 0,
            streak: 0,
            maxStreak: 0,
            totalCorrect: 0,
            totalAnswered: 0,
            xp: 0,
            level: 1,
            badges: [],
            powerups: { shield: 1, double: 1, freeze: 1, bomb: 1, chaos: 1 },
            powerupsUsed: new Set(),
            history: [],          // [{q, correct, time}]
        };
    }

    /* ── Score calculation ── */
    function calcScore(player, isCorrect, timeLeft, maxTime) {
        if (!isCorrect) return 0;
        let pts = BASE_POINTS;
        const elapsed = maxTime - timeLeft;
        if (elapsed < SPEED_THRESHOLD) pts += SPEED_BONUS;
        // streak multiplier
        const mult = getMultiplier(player.streak);
        pts = Math.round(pts * mult);
        return pts;
    }

    function getMultiplier(streak) {
        let mult = 1;
        STREAK_LEVELS.forEach((s, i) => { if (streak >= s) mult = STREAK_MULTS[i]; });
        return mult;
    }

    /* ── Update player after answer ── */
    function applyAnswer(player, isCorrect, timeLeft, maxTime, activePowerup) {
        let points = 0;
        if (isCorrect) {
            player.streak++;
            player.totalCorrect++;
            player.maxStreak = Math.max(player.maxStreak, player.streak);
            let pts = calcScore(player, true, timeLeft, maxTime);
            if (activePowerup === 'double') pts *= 2;
            player.score += pts;
            player.xp += XP_PER_CORRECT;
            points = pts;
        } else {
            if (activePowerup === 'shield') {
                // absorb this wrong answer
            } else {
                player.streak = 0;
            }
        }
        player.totalAnswered++;
        checkBadges(player, timeLeft, maxTime);
        checkLevelUp(player);
        return points;
    }

    /* ── Level up check ── */
    function checkLevelUp(player) {
        const xpNeeded = player.level * XP_PER_LEVEL;
        if (player.xp >= xpNeeded) {
            player.xp -= xpNeeded;
            player.level++;
            return true;
        }
        return false;
    }

    /* ── Badge checks ── */
    function checkBadges(player, timeLeft, maxTime) {
        const earned = [];
        const hasBadge = (id) => player.badges.some(b => b.id === id);

        if (player.streak >= 5 && !hasBadge('on_fire')) {
            const b = BADGE_DEFS.find(b => b.id === 'on_fire');
            player.badges.push(b); earned.push(b);
        }
        if (player.streak >= 10 && !hasBadge('big_brain')) {
            const b = BADGE_DEFS.find(b => b.id === 'big_brain');
            player.badges.push(b); earned.push(b);
        }
        if ((maxTime - timeLeft) < 3 && !hasBadge('speed_demon')) {
            const b = BADGE_DEFS.find(b => b.id === 'speed_demon');
            player.badges.push(b); earned.push(b);
        }
        if (player.powerupsUsed.size >= 4 && !hasBadge('powerhouse')) {
            const b = BADGE_DEFS.find(b => b.id === 'powerhouse');
            player.badges.push(b); earned.push(b);
        }
        return earned;
    }

    function awardEndBadges(players) {
        const sorted = [...players].sort((a, b) => b.score - a.score);
        // Champion
        if (sorted[0]) {
            const champ = BADGE_DEFS.find(b => b.id === 'champion');
            if (!sorted[0].badges.some(b => b.id === 'champion')) sorted[0].badges.push(champ);
        }
        // Perfect round: totalCorrect === totalAnswered (and > 0)
        players.forEach(p => {
            if (p.totalAnswered > 0 && p.totalCorrect === p.totalAnswered) {
                const perf = BADGE_DEFS.find(b => b.id === 'perfect');
                if (!p.badges.some(b => b.id === 'perfect')) p.badges.push(perf);
            }
        });
    }

    /* ── Power-up handling ── */
    function usePowerup(player, type) {
        if (player.powerups[type] <= 0) return false;
        player.powerups[type]--;
        player.powerupsUsed.add(type);
        return true;
    }

    /* ── Team for ViewBoard ── */
    function newTeam(name, color) {
        return { name, color, score: 0, streak: 0, badges: [], powerups: { chaos: 2, bomb: 1, double: 1, freeze: 1, shield: 1 } };
    }

    function applyTeamAnswer(team, isCorrect, timeLeft, maxTime, activePowerup) {
        let points = 0;
        if (isCorrect) {
            team.streak++;
            let pts = calcScore({ streak: team.streak - 1 }, true, timeLeft, maxTime);
            if (activePowerup === 'double') pts *= 2;
            team.score += pts; points = pts;
        } else {
            if (activePowerup !== 'shield') team.streak = 0;
        }
        return points;
    }

    /* ── Leaderboard ── */
    function getLeaderboard(players) {
        return [...players].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }));
    }

    /* ── LocalStorage helpers ── */
    const LS_KEY = 'math_mayhem_lb';
    function saveToLocalStorage(entry) {
        const lb = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        lb.push({ ...entry, date: new Date().toISOString() });
        lb.sort((a, b) => b.score - a.score);
        localStorage.setItem(LS_KEY, JSON.stringify(lb.slice(0, 50)));
    }
    function getLocalLeaderboard() {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    }
    function clearLocalLeaderboard() {
        localStorage.removeItem(LS_KEY);
    }

    /* ── Shuffle utility ── */
    function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

    /* ── XP progress (0–100%) ── */
    function xpPercent(player) {
        return Math.min(100, Math.round((player.xp / (player.level * XP_PER_LEVEL)) * 100));
    }

    /* ── Multiplier label ── */
    function multLabel(streak) {
        const m = getMultiplier(streak);
        if (m >= 2) return '🔥 2×';
        if (m >= 1.5) return '⚡ 1.5×';
        return '×1';
    }

    return {
        BADGE_DEFS,
        newPlayer, newTeam,
        calcScore, applyAnswer, applyTeamAnswer,
        getMultiplier, multLabel,
        usePowerup,
        awardEndBadges,
        getLeaderboard,
        checkBadges,
        checkLevelUp,
        xpPercent,
        saveToLocalStorage, getLocalLeaderboard, clearLocalLeaderboard,
        shuffle,
        BASE_POINTS, SPEED_BONUS, BONUS_WIN_POINTS
    };
})();
