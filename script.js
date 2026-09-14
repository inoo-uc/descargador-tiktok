const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const resultContainer = document.getElementById('resultContainer');
const finalDownloadBtn = document.getElementById('finalDownloadBtn');
const timerText = document.getElementById('timer');

downloadBtn.addEventListener('click', async function() {
    const url = videoUrlInput.value.trim();

    if (url === "") {
        alert("Por favor, pega un enlace válido de TikTok.");
        return;
    }

    // Mostrar sección del temporizador
    resultContainer.classList.remove('hidden');
    finalDownloadBtn.classList.add('hidden');
    timerText.style.display = "block";
    
    let timeLeft = 5;
    timerText.innerHTML = `Obteniendo video sin marca de agua... Espera <span id="countdown">${timeLeft}</span> segundos.`;

    const interval = setInterval(() => {
        timeLeft--;
        const countdownSpan = document.getElementById('countdown');
        if (countdownSpan) countdownSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
        }
    }, 1000);

    try {
        // Consultar API de TikWM para obtener el MP4 HD sin marca de agua
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data && data.data && data.data.play) {
            const videoUrl = data.data.play;

            // Esperar los 5 segundos del anuncio antes de mostrar el botón de descarga
            setTimeout(() => {
                timerText.style.display = "none";
                finalDownloadBtn.classList.remove('hidden');
                
                // Enlace directo al archivo .mp4 limpio
                finalDownloadBtn.href = videoUrl;
                finalDownloadBtn.setAttribute('target', '_blank');
                finalDownloadBtn.setAttribute('rel', 'noopener noreferrer');
                finalDownloadBtn.setAttribute('download', 'tiktok_video_hd.mp4');
            }, timeLeft * 1000);

        } else {
            clearInterval(interval);
            timerText.style.display = "none";
            alert("No se pudo obtener el video. Asegúrate de que el enlace sea de un video público de TikTok.");
        }

    } catch (error) {
        clearInterval(interval);
        timerText.style.display = "none";
        alert("Ocurrió un error al procesar el video. Intenta nuevamente con otro enlace.");
    }
});