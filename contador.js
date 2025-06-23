// Fecha de inicio de la relación
const startDate = new Date('2020-09-23T00:00:00');
// Fecha del primer aniversario (23 de septiembre de 2025)
const firstAnniversary = new Date('2025-09-23T00:00:00');

// Función para crear partículas flotantes (deshabilitada)
function createParticles() {
    // Función deshabilitada para eliminar los puntos flotantes
}

function createParticle() {
    // Función deshabilitada
}

// Función para calcular la diferencia entre dos fechas
function getDateDifference(startDate, endDate) {
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    let hours = endDate.getHours();
    let minutes = endDate.getMinutes();
    let seconds = endDate.getSeconds();
    
    // Ajustar los valores negativos
    if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months += 12;
    }
    
    if (days < 0) {
        const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        days = lastMonth.getDate() - startDate.getDate() + endDate.getDate();
        months--;
    }
    
    return { years, months, days, hours, minutes, seconds };
}

// Función para actualizar el contador
function updateCounter() {
    const now = new Date();
    
    // Calcular tiempo juntos
    const timeTogether = getDateDifference(startDate, now);
    
    // Calcular tiempo restante hasta el primer aniversario (si aplica)
    let timeToAnniversary = {};
    if (now < firstAnniversary) {
        timeToAnniversary = getDateDifference(now, firstAnniversary);
    }
    
    // Actualizar el DOM con el tiempo juntos
    document.getElementById('years').textContent = timeTogether.years;
    document.getElementById('months').textContent = timeTogether.months;
    document.getElementById('days').textContent = timeTogether.days;
    document.getElementById('hours').textContent = timeTogether.hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = timeTogether.minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = timeTogether.seconds.toString().padStart(2, '0');
    
    // Mostrar tiempo restante para el aniversario si es este año
    const nextAnniversary = new Date(now.getFullYear(), 8, 23); // 8 = septiembre (0-11)
    if (now > nextAnniversary) {
        nextAnniversary.setFullYear(now.getFullYear() + 1);
    }
    
    const timeToNextAnniversary = getDateDifference(now, nextAnniversary);
    
    // Actualizar el título del contador
    const titleElement = document.querySelector('.counter-title');
    if (titleElement) {
        titleElement.textContent = 'Tiempo juntos';
    }
    
    // Mostrar mensaje especial si es el día del aniversario
    if (now.getDate() === 23 && now.getMonth() === 8) { // 8 = septiembre (0-11)
        const yearsTogether = now.getFullYear() - startDate.getFullYear();
        titleElement.textContent = `¡Feliz ${yearsTogether}° Aniversario!`;
    }
}

// Actualizar el contador cada segundo
setInterval(updateCounter, 1000);

// Actualizar el contador inmediatamente al cargar la página
updateCounter();

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar el contador inmediatamente
    updateCounter();
    
    // Actualizar cada segundo para los segundos
    setInterval(updateCounter, 1000);
    
    // Iniciar el efecto de partículas
    createParticles();
    
    // Crear fuegos artificiales cada cierto tiempo
    setInterval(() => {
        if (Math.random() > 0.5) {
            createFirework();
        }
    }, 1500);
    
    // También crear fuegos artificiales al hacer clic
    document.addEventListener('click', (e) => {
        createFireworkAt(e.clientX, e.clientY);
    });
});

// Función para crear fuegos artificiales en una posición específica
function createFireworkAt(x, y) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // Usar la posición proporcionada
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    
    // Color aleatorio
    const colors = ['#ff6b8b', '#ff8e53', '#ffcc33', '#4ecdc4', '#45b7d1'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Crear partículas del fuego artificial
    const particleCount = 50; // Más partículas para un efecto más llamativo
    const angleIncrement = (Math.PI * 2) / particleCount;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        
        // Calcular dirección de la partícula
        const angle = angleIncrement * i;
        const velocity = 0.5 + Math.random() * 2.5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        // Tamaño aleatorio
        const size = 2 + Math.random() * 4;
        
        // Estilo de la partícula
        Object.assign(particle.style, {
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${size * 2}px ${size/2}px ${color}`,
            animation: `firework-animation ${0.5 + Math.random()}s ease-out forwards`,
            '--vx': vx,
            '--vy': vy
        });
        
        firework.appendChild(particle);
    }
    
    document.body.appendChild(firework);
    
    // Eliminar el fuego artificial después de la animación
    setTimeout(() => {
        if (firework.parentNode) {
            firework.parentNode.removeChild(firework);
        }
    }, 1000);
}
