// Función para crear corazones flotantes
function createHearts() {
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer) return;
    
    const heart = document.createElement('div');
    const hearts = ['❤️', '💖', '💗', '💓', '💞', '💕', '💘', '💝'];
    heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
    
    heart.classList.add('heart');
    
    const size = Math.random() * 20 + 20;
    heart.style.fontSize = `${size}px`;
    
    const startPosX = Math.random() * 100;
    heart.style.left = `${startPosX}%`;
    
    const duration = Math.random() * 15 + 10;
    heart.style.animationDuration = `${duration}s`;
    
    heart.style.opacity = Math.random() * 0.4 + 0.6;
    
    heartsContainer.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode === heartsContainer) {
            heartsContainer.removeChild(heart);
        }
    }, (duration + 5) * 1000);
}

// Crear corazones de manera continua
function startHearts() {
    for (let i = 0; i < 15; i++) {
        setTimeout(createHearts, i * 200);
    }
    setInterval(() => {
        if (Math.random() > 0.3) {
            createHearts();
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('message');
    const errorMessage = document.getElementById('errorMessage');
    const errorAlert = document.getElementById('errorAlert');
    const closeAlert = document.getElementById('closeAlert');

    if (errorAlert) {
        errorAlert.classList.remove('show');
    }

    const CORRECT_PASSWORD = '23';
    let currentPassword = '';

    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', function () {
            const value = this.getAttribute('data-value');

            if (/[0-9]/.test(value)) {
                closeErrorAlert();
                currentPassword += value;
                updatePasswordDisplay();

                if (currentPassword.length === CORRECT_PASSWORD.length) {
                    checkPassword();
                }
            } else if (value === '#') {
                currentPassword = '';
                updatePasswordDisplay();
                messageElement.textContent = '';
                passwordInput.classList.remove('shake');
                closeErrorAlert();
            }
        });
    });

    function updatePasswordDisplay() {
        passwordInput.value = '*'.repeat(currentPassword.length);
    }

    function showError(message) {
        const baseMessage = message.includes('incorrecta') ? message.split('😢')[0] : message;
        errorMessage.textContent = `${baseMessage.trim()} 😢💔`;

        if (errorAlert) {
            errorAlert.classList.add('show');
            setTimeout(() => {
                errorAlert.classList.remove('show');
            }, 3000);
        }

        passwordInput.classList.add('error');
        setTimeout(() => {
            passwordInput.classList.remove('error');
        }, 1000);
    }

    function closeErrorAlert() {
        if (errorAlert) {
            errorAlert.classList.remove('show');
        }
    }

    // ✅ CORREGIDO: Evento para cerrar alerta (no estaba definido antes)
    if (closeAlert) {
        closeAlert.addEventListener('click', closeErrorAlert);
    }

    function checkPassword() {
        if (currentPassword === CORRECT_PASSWORD) {
            window.location.href = 'contador.html';
        } else {
            showError('La contraseña es incorrecta');
            passwordInput.classList.add('shake');
            setTimeout(() => {
                passwordInput.classList.remove('shake');
            }, 500);
            setTimeout(() => {
                currentPassword = '';
                updatePasswordDisplay();
            }, 300);
        }
    }

    // Iniciar corazones
    startHearts();
});
