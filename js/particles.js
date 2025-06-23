document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Configuración de las partículas
    const particles = [];
    const particleCount = 40; // Menos partículas para mejor rendimiento
    
    
    // Configuración del canvas
    function initCanvas() {
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1'; // Asegurar que esté detrás del contenido
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        
        // Asegurarse de que el canvas ocupe toda la pantalla
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Crear partículas en la parte inferior
        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 3 + 1; // Tamaño aleatorio
            particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 100, // Empezar debajo de la pantalla
                size: size,
                speedX: 0, // Sin movimiento horizontal
                speedY: - (Math.random() * 0.8 + 0.3), // Movimiento hacia arriba más lento
                alpha: 0.4, // Opacidad inicial
                twinkle: Math.random() * 0.5 + 0.5, // Factor de brillo
                twinkleSpeed: Math.random() * 0.02 + 0.01 // Velocidad de parpadeo
            });
        }
        
        // Iniciar animación
        animate();
    }
    
    // Función de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Actualizar y dibujar partículas
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // Mover partícula hacia arriba
            p.y += p.speedY;
            
            // Si la partícula sale por arriba, reiniciarla abajo
            if (p.y < -10) {
                p.y = canvas.height + Math.random() * 20;
                p.x = Math.random() * canvas.width;
            }
            
            // Actualizar efecto de parpadeo
            p.twinkle += p.twinkleSpeed;
            const twinkleFactor = 0.3 + Math.abs(Math.sin(p.twinkle)) * 0.7;
            
            // Calcular opacidad con parpadeo
            const baseAlpha = Math.min(1, (canvas.height - p.y) / 100) * 0.6;
            const alpha = baseAlpha * twinkleFactor;
            
            // Dibujar punto brillante en el centro
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.fill();
            
            // Dibujar halo suave alrededor
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size * 2
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Inicializar el canvas
    initCanvas();
});
