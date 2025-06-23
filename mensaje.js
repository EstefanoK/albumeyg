const canvas = document.getElementById('particleHeartCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Detectar si es móvil
const isMobile = window.innerWidth < 768;

const settings = {
    particleCount: isMobile ? 200 : 600,
    heartScale: getResponsiveHeartScale(),
    particleBaseSize: 2.2,
    particleLife: 100,
    glowColor: 'rgba(255, 105, 180, 0.5)',
    particleColor: '#ff79c6',
    textColor: '#ffb6dc',
    trailAlpha: 0.1,
};

function getResponsiveHeartScale() {
    return Math.min(window.innerWidth, window.innerHeight) / 50;
}

const heartOrigin = { x: canvas.width / 2, y: canvas.height / 2 };
const heartShape = new Path2D('M0,4 C0,2 2,0 4,0 C6,0 8,2 8,4 C8,7 4,9 4,12 C4,9 0,7 0,4 Z');

let particles = [];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        const t = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        this.targetX = hx * settings.heartScale;
        this.targetY = hy * settings.heartScale;

        const birthFactor = 0.6 + Math.random() * 0.2;
        this.x = this.targetX * birthFactor;
        this.y = this.targetY * birthFactor;

        this.life = Math.random() * settings.particleLife * 0.5 + settings.particleLife * 0.5;
        this.maxLife = this.life;
        this.vx = (this.targetX - this.x) / this.life;
        this.vy = (this.targetY - this.y) / this.life;

        this.size = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        const progress = (this.maxLife - this.life) / this.maxLife;
        this.size = settings.particleBaseSize * progress;

        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = settings.particleColor;
        ctx.shadowColor = settings.glowColor;
        ctx.shadowBlur = isMobile ? 2 : 10; // Reducido en móviles
        ctx.translate(heartOrigin.x + this.x, heartOrigin.y + this.y);
        ctx.scale(this.size, this.size);
        ctx.fill(heartShape);
        ctx.restore();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < settings.particleCount; i++) {
        setTimeout(() => {
            particles.push(new Particle());
        }, i * 2);
    }
}

function animate() {
    ctx.fillStyle = `rgba(0, 0, 0, ${settings.trailAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
        p.update();
        p.draw();
    }

    ctx.save();
    ctx.translate(heartOrigin.x, heartOrigin.y);
    const fontSize = Math.max(20, Math.min(42, window.innerWidth / 20));
    ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = settings.glowColor;
    ctx.shadowBlur = isMobile ? 2 : 8;
    ctx.fillText("Dame click", 0, 0);
    ctx.restore();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    heartOrigin.x = canvas.width / 2;
    heartOrigin.y = canvas.height / 2;
    settings.heartScale = getResponsiveHeartScale();
    init();
});

init();
animate();

// --- Mensajes motivacionales flotantes ---
const messages = [
    "¡Te amoooo con toda mi vida😍❤️!",
    "Eres mi gordita hermosa🥰",
    "Eres la mejor",
    "Eres mi felicidad😘",
    "Gracias por existir🥰",
    "Nunca te rindas💪",
    "Confía en el proceso",
    "Juntos podemos con todo🤗❤️",
    "Eres más fuerte de lo que crees y yo siempre estaré a tu lado❤️",
    "Vamos paso a paso, juntos🫂",
    "No olvides que eres mi vida entera🥰🥰🥰",
    "Gordita Hermosa🤗🤗",
    "Yo te ganoo siempre TE AMO inmensamente más amorcito",
    "Te Amare toda la VIDA♾️❤️",
    "Nunca dudes que te AMO♾️❤️",
];

const floatingMessages = [];
let availableMessages = [];
let currentMessageIndex = 0;

function getRandomMessage() {
    if (availableMessages.length === 0) {
        availableMessages = [...messages];
        for (let i = availableMessages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableMessages[i], availableMessages[j]] = [availableMessages[j], availableMessages[i]];
        }
        currentMessageIndex = 0;
    }

    const message = availableMessages[currentMessageIndex];
    currentMessageIndex = (currentMessageIndex + 1) % availableMessages.length;

    if (currentMessageIndex === 0) availableMessages = [];

    return message;
}

function showMotivationalMessage(x, y) {
    const container = document.getElementById('messageContainer');
    const msg = document.createElement('div');
    msg.classList.add('motivationalMessage');
    msg.textContent = getRandomMessage();

    const offsetX = Math.random() * 100 - 50;
    const offsetY = Math.random() * 100 - 50;
    const startX = x + offsetX;
    const startY = y + offsetY;

    msg.style.left = `${startX}px`;
    msg.style.top = `${startY}px`;
    container.appendChild(msg);

    floatingMessages.push({
        el: msg,
        x: startX,
        y: startY,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        width: msg.offsetWidth,
        height: msg.offsetHeight,
    });

    // Limitar cantidad de mensajes flotantes
    if (floatingMessages.length > 12) {
        const old = floatingMessages.shift();
        old.el.remove();
    }
}

function updateMessages() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    for (let obj of floatingMessages) {
        obj.x += obj.vx;
        obj.y += obj.vy;

        if (obj.x <= 0 || obj.x + obj.width >= screenW) obj.vx *= -1;
        if (obj.y <= 0 || obj.y + obj.height >= screenH) obj.vy *= -1;

        obj.el.style.left = `${obj.x}px`;
        obj.el.style.top = `${obj.y}px`;
    }

    requestAnimationFrame(updateMessages);
}

updateMessages();

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - heartOrigin.x;
    const y = e.clientY - rect.top - heartOrigin.y;
    const d = Math.pow(x / (settings.heartScale * 16), 2) + Math.pow((y / (settings.heartScale * 13)), 2);

    if (d <= 1.2) {
        showMotivationalMessage(e.clientX, e.clientY);
    }
});

// Panel de colores
document.getElementById('toggleColors').addEventListener('click', () => {
    const selector = document.getElementById('colorSelector');
    selector.classList.toggle('hidden');
});

function applyColor(color) {
    if (!color) return;
    
    settings.particleColor = color;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    settings.glowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
    settings.textColor = `rgb(${r}, ${g}, ${b})`;

    const galleryBtn = document.querySelector('.gallery-button');
    if (galleryBtn) {
        galleryBtn.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        galleryBtn.style.boxShadow = `0 0 15px rgba(${r}, ${g}, ${b}, 0.6)`;
    }

    localStorage.setItem('heartColor', color);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedColor = localStorage.getItem('heartColor');
    if (savedColor) {
        applyColor(savedColor);

        document.querySelectorAll('.color-circle').forEach(circle => {
            if (circle.getAttribute('data-color') === savedColor) {
                circle.style.border = '2px solid white';
                circle.style.boxShadow = '0 0 10px white';
            }
        });
    }
});

document.querySelectorAll('.color-circle').forEach(circle => {
    circle.addEventListener('click', () => {
        const selectedColor = circle.getAttribute('data-color');
        applyColor(selectedColor);

        document.querySelectorAll('.color-circle').forEach(c => {
            c.style.border = 'none';
            c.style.boxShadow = 'none';
        });

        circle.style.border = '2px solid white';
        circle.style.boxShadow = '0 0 10px white';
    });
});
