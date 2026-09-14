document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const finalDownloadBtn = document.getElementById('finalDownloadBtn');
    const timerText = document.getElementById('timer');

    if (!downloadBtn || !videoUrlInput) {
        console.error("No se encontraron los botones de la interfaz.");
        return;
    }

    downloadBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();

        if (url === "") {
            alert("Por favor, pega un enlace válido de TikTok.");
            return;
        }

        // Mostrar sección del contador
        if (resultContainer) resultContainer.classList.remove('hidden');
        if (finalDownloadBtn) finalDownloadBtn.classList.add('hidden');
        if (timerText) {
            timerText.style.display = "block";
            timerText.innerHTML = `Obteniendo video sin marca de agua... Espera <span id="countdown">5</span> segundos.`;
        }

        let timeLeft = 5;
        const interval = setInterval(() => {
            timeLeft--;
            const countdownSpan = document.getElementById('countdown');
            if (countdownSpan) countdownSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        try {
            // Petición directa a TikWM
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data && data.code === 0 && data.data) {
                const videoHdUrl = data.data.play; // URL directa al MP4 sin marca de agua

                setTimeout(() => {
                    if (timerText) timerText.style.display = "none";
                    if (finalDownloadBtn) {
                        finalDownloadBtn.classList.remove('hidden');
                        finalDownloadBtn.href = videoHdUrl;
                        finalDownloadBtn.setAttribute('target', '_blank');
                        finalDownloadBtn.setAttribute('rel', 'noopener noreferrer');
                        finalDownloadBtn.setAttribute('download', 'tiktok_video_hd.mp4');
                    }
                }, timeLeft * 1000);

            } else {
                clearInterval(interval);
                if (timerText) timerText.style.display = "none";
                alert("No se pudo obtener el video. Asegúrate de que el enlace sea de un video público.");
            }

        } catch (error) {
            clearInterval(interval);
            if (timerText) timerText.style.display = "none";
            alert("Error al procesar el enlace. Revisa tu conexión a internet e inténtalo de nuevo.");
        }
    });
});