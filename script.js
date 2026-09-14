document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const finalDownloadBtn = document.getElementById('finalDownloadBtn');
    const timerText = document.getElementById('timer');

    if (!downloadBtn || !videoUrlInput) return;

    // Función que realiza la cuenta regresiva de 5 segundos
    function startCountdown(seconds) {
        return new Promise((resolve) => {
            let timeLeft = seconds;
            const countdownSpan = document.getElementById('countdown');
            if (countdownSpan) countdownSpan.textContent = timeLeft;

            const interval = setInterval(() => {
                timeLeft--;
                if (countdownSpan) countdownSpan.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    }

    // Función para consultar las APIs con múltiples respaldos
    async function fetchVideoUrl(url) {
        const encodedUrl = encodeURIComponent(url);

        // Intento 1: API Directa de TikWM
        try {
            const res = await fetch(`https://www.tikwm.com/api/?url=${encodedUrl}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.code === 0 && data.data) {
                    return data.data.hdplay || data.data.play;
                }
            }
        } catch (e) {
            console.warn("Intento 1 falló, probando proxy...", e);
        }

        // Intento 2: TikWM a través de Proxy (Evita bloqueos CORS de navegadores)
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.tikwm.com/api/?url=${encodedUrl}`)}`;
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const data = await res.json();
                if (data && data.code === 0 && data.data) {
                    return data.data.hdplay || data.data.play;
                }
            }
        } catch (e) {
            console.warn("Intento 2 falló, probando API secundaria...", e);
        }

        // Intento 3: API Tiklydown
        try {
            const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodedUrl}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.video && data.video.noWatermark) {
                    return data.video.noWatermark;
                }
            }
        } catch (e) {
            console.warn("Intento 3 falló...", e);
        }

        throw new Error("No se pudo obtener el video.");
    }

    // Evento de clic en "Obtener Video"
    downloadBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();

        if (url === "") {
            alert("Por favor, pega un enlace válido de TikTok.");
            return;
        }

        // Deshabilitar botón durante el proceso
        downloadBtn.disabled = true;
        
        // Preparar interfaz
        if (resultContainer) resultContainer.classList.remove('hidden');
        if (finalDownloadBtn) finalDownloadBtn.classList.add('hidden');
        if (timerText) {
            timerText.style.display = "block";
            timerText.innerHTML = `Obteniendo video sin marca de agua... Espera <span id="countdown">5</span> segundos.`;
        }

        try {
            // Ejecutar el contador de 5s y la búsqueda del video simultáneamente
            const [_, videoHdUrl] = await Promise.all([
                startCountdown(5),
                fetchVideoUrl(url)
            ]);

            // Mostrar el botón verde de descarga al finalizar
            if (timerText) timerText.style.display = "none";
            if (finalDownloadBtn) {
                finalDownloadBtn.href = videoHdUrl;
                finalDownloadBtn.classList.remove('hidden');
            }

        } catch (error) {
            if (timerText) timerText.style.display = "none";
            if (resultContainer) resultContainer.classList.add('hidden');
            alert("No se pudo procesar el enlace. Verifica que sea un video público e inténtalo de nuevo.");
        } finally {
            downloadBtn.disabled = false;
        }
    });
});