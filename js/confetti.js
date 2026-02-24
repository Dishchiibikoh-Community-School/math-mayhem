// ============================================================
//  MATH MAYHEM — Confetti Engine
// ============================================================

const Confetti = (() => {
    let canvas, ctx, particles = [], animId = null;

    const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f77f00', '#e040fb', '#00e5ff'];

    function init() {
        canvas = document.getElementById('confetti-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            Object.assign(canvas.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: '9999'
            });
            document.body.appendChild(canvas);
        }
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    }

    function burst(count = 120) {
        if (!canvas) init();
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20,
                w: (Math.random() * 10) + 6,
                h: (Math.random() * 6) + 4,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                vy: (Math.random() * 4) + 2,
                vx: (Math.random() - 0.5) * 6,
                rotation: Math.random() * 360,
                spin: (Math.random() - 0.5) * 8,
                opacity: 1
            });
        }
        if (!animId) animate();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.opacity > 0.01);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12; // gravity
            p.rotation += p.spin;
            if (p.y > canvas.height * 0.7) p.opacity -= 0.02;
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        if (particles.length > 0) {
            animId = requestAnimationFrame(animate);
        } else {
            animId = null;
        }
    }

    function stop() {
        particles = [];
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return { burst, stop, init };
})();
