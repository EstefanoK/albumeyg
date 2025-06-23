// script.js COMPLETO con IndexedDB y menú hamburguesa funcional adaptado solo para móviles

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const paginationContainer = document.getElementById('pagination-container');
    const addImageTriggerBtn = document.getElementById('add-image-trigger');
    const imageInput = document.getElementById('image-input');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    
    // Variables para el control táctil
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50; // Mínimo de píxeles para considerar un deslizamiento

    const imagesByPage = {};
    let currentPage = 1;
    let totalPages = 1;
    let currentIndex = 0;
    let items = [];

    const settings = {
        baseTranslateX: 80, translateXIncrement: 45, baseScale: 0.8,
        scaleDecrement: 0.05, baseRotateY: 45, rotateYIncrement: 10,
        baseOpacity: 1, opacityDecrement: 0.2
    };

    // IndexedDB config
    const DB_NAME = 'GaleriaRecuerdosDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'imagenesPorPagina';
    let db;

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => reject(event);

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }

    function savePageToDB(page, data) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(data, `pagina-${page}`);
        return tx.complete;
    }

    function loadAllPagesFromDB() {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAllKeys();

            request.onsuccess = async () => {
                const keys = request.result;
                const allPages = {};

                for (let key of keys) {
                    const pageNumber = parseInt(key.split('-')[1]);
                    const pageData = await new Promise((res, rej) => {
                        const r = store.get(key);
                        r.onsuccess = () => res(r.result || []);
                        r.onerror = (e) => rej(e);
                    });
                    allPages[pageNumber] = pageData;
                }

                resolve(allPages);
            };

            request.onerror = (e) => reject(e);
        });
    }

    function updateCarousel() {
        const totalItems = items.length;
        prevBtn.style.display = totalItems > 0 ? 'block' : 'none';
        nextBtn.style.display = totalItems > 0 ? 'block' : 'none';

        items.forEach((item, index) => {
            const offset = (index - currentIndex + totalItems) % totalItems;
            const side = (index - currentIndex < -totalItems / 2 || (index - currentIndex > 0 && index - currentIndex < totalItems / 2)) ? 1 : -1;
            let transform, zIndex, opacity;
            if (offset === 0) {
                transform = 'translateX(0) scale(1)';
                zIndex = totalItems;
                opacity = 1;
            } else {
                const absOffset = offset > totalItems / 2 ? totalItems - offset : offset;
                const translateX = side * (settings.baseTranslateX + (absOffset - 1) * settings.translateXIncrement);
                const scale = Math.max(0, settings.baseScale - (absOffset - 1) * settings.scaleDecrement);
                const rotateY = -side * (settings.baseRotateY + (absOffset - 1) * settings.rotateYIncrement);
                const currentOpacity = Math.max(0, settings.baseOpacity - (absOffset - 1) * settings.opacityDecrement);
                transform = `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`;
                zIndex = totalItems - absOffset;
                opacity = currentOpacity;
            }
            item.style.transform = transform;
            item.style.zIndex = zIndex;
            item.style.opacity = opacity;
        });
    }

    function updateImageCounter() {
        const counter = document.getElementById('image-counter');
        const currentImages = imagesByPage[currentPage] || [];
        counter.textContent = `${currentImages.length}/8`;
    }

    function renderCarouselForPage(page) {
        carousel.innerHTML = '';
        currentIndex = 0;
        const pageImages = imagesByPage[page] || [];

        pageImages.forEach((imgData, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'carousel-item';

            const img = document.createElement('img');
            img.src = imgData.src;
            img.alt = imgData.alt;
            itemDiv.appendChild(img);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '✕';
            deleteBtn.addEventListener('click', () => {
                showConfirmModal(() => {
                    pageImages.splice(index, 1);
                    imagesByPage[page] = pageImages;
                    savePageToDB(page, pageImages);
                    renderCarouselForPage(page);
                    renderPagination();
                    updateImageCounter();
                });
            });
            itemDiv.appendChild(deleteBtn);
            carousel.appendChild(itemDiv);
        });

        items = document.querySelectorAll('.carousel-item');
        updateCarousel();
        updateImageCounter();
        enableImageZoom();
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = 'page-btn';
                pageBtn.textContent = i;
                if (i === currentPage) pageBtn.classList.add('active');
                pageBtn.addEventListener('click', () => {
                    currentPage = i;
                    renderCarouselForPage(i);
                    renderPagination();
                    updateImageCounter();
                });
                paginationContainer.appendChild(pageBtn);
            }
        }
    }

    function addImageToPage(imageData) {
        let pageToAddTo = currentPage;

        if (!imagesByPage[pageToAddTo]) {
            imagesByPage[pageToAddTo] = [];
        }

        let pageImages = imagesByPage[pageToAddTo];

        if (pageImages.length >= 8) {
            totalPages++;
            pageToAddTo = totalPages;
            imagesByPage[pageToAddTo] = [];
            currentPage = pageToAddTo;
            pageImages = imagesByPage[pageToAddTo];
        }

        pageImages.push(imageData);
        renderCarouselForPage(pageToAddTo);
        updateImageCounter();
        renderPagination();  // Mover después de actualizar el contador para asegurar consistencia
        savePageToDB(pageToAddTo, pageImages);
    }

    addImageTriggerBtn.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImage = {
                    src: e.target.result,
                    alt: file.name
                };
                addImageToPage(newImage);
            };
            reader.readAsDataURL(file);
        }
        imageInput.value = '';
    });

    // Función para ir a la imagen anterior con movimiento infinito
    const goToPrev = () => {
        if (items.length > 0) {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        }
    };

    // Función para ir a la siguiente imagen con movimiento infinito
    const goToNext = () => {
        if (items.length > 0) {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        }
    };

    // Eventos de clic para los botones
    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);
    
    // Eventos táctiles para el carrusel
    carouselWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    carouselWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    // Manejar el gesto de deslizamiento
    const handleSwipe = () => {
        const difference = touchStartX - touchEndX;
        
        // Deslizamiento a la izquierda (siguiente imagen)
        if (difference > SWIPE_THRESHOLD) {
            goToNext();
        } 
        // Deslizamiento a la derecha (imagen anterior)
        else if (difference < -SWIPE_THRESHOLD) {
            goToPrev();
        }
    };
    
    // Hacer los botones más grandes en dispositivos táctiles
    if ('ontouchstart' in window) {
        prevBtn.style.padding = '15px';
        nextBtn.style.padding = '15px';
        prevBtn.style.fontSize = '24px';
        nextBtn.style.fontSize = '24px';
    }

    function enableImageZoom() {
        document.querySelectorAll('.carousel-item img').forEach(img => {
            img.addEventListener('click', () => {
                const overlay = document.createElement('div');
                overlay.className = 'zoom-overlay';

                const zoomContainer = document.createElement('div');
                zoomContainer.className = 'zoom-container';

                const zoomedImg = document.createElement('img');
                zoomedImg.className = 'zoomed-image';
                zoomedImg.src = img.src;

                const closeBtn = document.createElement('button');
                closeBtn.className = 'zoom-close';
                closeBtn.innerHTML = '&times;';

                const controls = document.createElement('div');
                controls.className = 'zoom-controls';

                const zoomInBtn = document.createElement('button');
                zoomInBtn.innerHTML = '+';

                const zoomOutBtn = document.createElement('button');
                zoomOutBtn.innerHTML = '−';

                let scale = 1;
                zoomInBtn.addEventListener('click', () => {
                    scale += 0.1;
                    zoomedImg.style.transform = `scale(${scale})`;
                });

                zoomOutBtn.addEventListener('click', () => {
                    scale = Math.max(0.5, scale - 0.1);
                    zoomedImg.style.transform = `scale(${scale})`;
                });

                const closeZoom = () => {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', onKeyDown);
                };

                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) closeZoom();
                });

                closeBtn.addEventListener('click', closeZoom);

                const onKeyDown = (e) => {
                    if (e.key === 'Escape') closeZoom();
                };
                document.addEventListener('keydown', onKeyDown);

                controls.appendChild(zoomInBtn);
                controls.appendChild(zoomOutBtn);
                zoomContainer.appendChild(closeBtn);
                zoomContainer.appendChild(zoomedImg);
                zoomContainer.appendChild(controls);
                overlay.appendChild(zoomContainer);
                document.body.appendChild(overlay);
            });
        });
    }

    function showConfirmModal(onConfirm) {
        const modal = document.getElementById('custom-confirm');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        modal.classList.remove('hidden');

        const cleanup = () => {
            modal.classList.add('hidden');
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
        };

        const handleYes = () => {
            onConfirm();
            cleanup();
        };

        const handleNo = cleanup;

        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    }

    (async () => {
        await openDatabase();
        const savedPages = await loadAllPagesFromDB();
        Object.assign(imagesByPage, savedPages);

        // Si no hay imágenes guardadas, inicializar con las imágenes predeterminadas
        if (Object.keys(imagesByPage).length === 0) {
            const defaultImages = [];
            // Agregar imágenes de 1.jpg a 11.jpg
            for (let i = 1; i <= 11; i++) {
                defaultImages.push(`img/${i}.jpg`);
            }
            imagesByPage[1] = defaultImages;
            await savePageToDB(1, defaultImages);
        }

        totalPages = Object.keys(imagesByPage).length || 1;
        renderPagination();
        renderCarouselForPage(currentPage);
        enableImageZoom();
    })();

      // Menú hamburguesa funcional solo para móviles
    const toggleBtn = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");

    if (toggleBtn && menu) {
        const toggleMenu = () => {
            menu.classList.toggle("show");
            document.body.classList.toggle("menu-open");
            
            // Asegurarse de que solo el menú tenga scroll, no la página completa
            if (menu.classList.contains("show")) {
                menu.style.overflowY = "auto";
            } else {
                menu.style.overflowY = "";
            }
        };

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevenir que el clic se propague al document
            toggleMenu();
        });

        // Cerrar menú si se hace clic fuera de él
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('show') && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
                menu.classList.remove('show');
                document.body.classList.remove("menu-open");
                menu.style.overflowY = "";
            }
        });
        
        // Prevenir que los clics dentro del menú cierren el menú
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

});
