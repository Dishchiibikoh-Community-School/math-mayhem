/* js/teacher.js - Teacher Dashboard logic */
const CUST_Q_KEY = 'math_mayhem_custom_questions';
const PWD_KEY = 'math_mayhem_teacher_pwd';

function checkLoginState() {
    const pwd = localStorage.getItem(PWD_KEY);
    if (!pwd) {
        document.getElementById('login-prompt').innerText = 'Welcome! Create a new password for the dashboard.';
        document.getElementById('login-btn').innerText = 'Set Password';
    } else {
        document.getElementById('login-prompt').innerText = 'Enter your password to access the dashboard.';
        document.getElementById('login-btn').innerText = 'Login';
    }

    // Allow pressing Enter key
    document.getElementById('teacher-pwd').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') attemptLogin();
    });
}

function attemptLogin() {
    const entered = document.getElementById('teacher-pwd').value;
    if (!entered) return;

    let savedPwd = localStorage.getItem(PWD_KEY);

    // First time setup
    if (!savedPwd) {
        localStorage.setItem(PWD_KEY, entered);
        alert('Password set successfully!');
        showDashboard();
        return;
    }

    // Verify existing
    if (entered === savedPwd) {
        showDashboard();
    } else {
        alert('Incorrect password. Try again.');
        document.getElementById('teacher-pwd').value = '';
    }
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    renderQuestions();
}

function getCustomQuestions() {
    return JSON.parse(localStorage.getItem(CUST_Q_KEY) || '[]');
}

function saveCustomQuestions(questions) {
    localStorage.setItem(CUST_Q_KEY, JSON.stringify(questions));
}

function renderQuestions() {
    const questions = getCustomQuestions();
    const list = document.getElementById('q-list');
    document.getElementById('q-count').innerText = questions.length;

    list.innerHTML = '';
    if (questions.length === 0) {
        list.innerHTML = '<div style="color:var(--muted); text-align:center; padding: 24px;">No custom questions added yet.</div>';
        return;
    }

    questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'q-card';

        const qDetails = document.createElement('div');
        qDetails.className = 'q-details';
        qDetails.innerHTML = `
            <div class="q-text">${q.q}</div>
            <div class="q-meta">Topic: <strong>${q.topic}</strong> | Level: <strong>${q.level}</strong> | Ans: <strong style="color:var(--green)">${q.answer}</strong></div>
            <div class="q-meta" style="font-size:0.75rem;">Choices: ${q.choices.join(', ')}</div>
        `;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerText = '🗑️ Delete';
        delBtn.onclick = () => {
            deleteQuestion(idx);
        };

        item.appendChild(qDetails);
        item.appendChild(delBtn);
        list.appendChild(item);
    });
}

function addQuestion() {
    const qText = document.getElementById('q-text').value.trim();
    const qTopic = document.getElementById('q-topic').value;
    const qLevel = parseInt(document.getElementById('q-level').value, 10);
    const qAnsC = document.getElementById('q-ans-correct').value.trim();
    const qAnsW1 = document.getElementById('q-ans-w1').value.trim();
    const qAnsW2 = document.getElementById('q-ans-w2').value.trim();
    const qAnsW3 = document.getElementById('q-ans-w3').value.trim();

    if (!qText || !qAnsC || !qAnsW1) {
        alert("Please provide at least a question, correct answer, and one wrong answer.");
        return;
    }

    const choices = [qAnsC, qAnsW1];
    if (qAnsW2) choices.push(qAnsW2);
    if (qAnsW3) choices.push(qAnsW3);

    const qObj = {
        id: 'cust_' + Date.now(),
        level: qLevel,
        topic: qTopic,
        q: qText,
        choices: choices.sort(() => Math.random() - 0.5), // shuffled
        answer: qAnsC,
        type: choices.length === 2 ? 'tf' : 'mc'
    };

    const qs = getCustomQuestions();
    qs.push(qObj);
    saveCustomQuestions(qs);

    // reset form
    document.getElementById('q-text').value = '';
    document.getElementById('q-ans-correct').value = '';
    document.getElementById('q-ans-w1').value = '';
    document.getElementById('q-ans-w2').value = '';
    document.getElementById('q-ans-w3').value = '';

    renderQuestions();
}

function deleteQuestion(idx) {
    if (confirm("Are you sure you want to delete this specific custom question?")) {
        const qs = getCustomQuestions();
        qs.splice(idx, 1);
        saveCustomQuestions(qs);
        renderQuestions();
    }
}

function clearAllQuestions() {
    if (confirm("🚨 WARNING: Are you sure you want to delete ALL custom questions? This cannot be undone!")) {
        localStorage.removeItem(CUST_Q_KEY);
        renderQuestions();
    }
}

document.addEventListener('DOMContentLoaded', checkLoginState);
