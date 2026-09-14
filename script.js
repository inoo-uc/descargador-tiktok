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
        // Petición a la API pública de Tiklydown con soporte CORS abierto
        const response = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data && data.video && data.video.noWatermark) {
            const videoHdUrl = data.video.noWatermark;

            setTimeout(() => {
                timerText.style.display = "none";
                finalDownloadBtn.classList.remove('hidden');
                
                // Enlace directo al archivo MP4
                finalDownloadBtn.href = videoHdUrl;
                finalDownloadBtn.setAttribute('target', '_blank');
                finalDownloadBtn.setAttribute('download', 'tiktok_video_hd.mp4');
            }, timeLeft * 1000);

        } else {
            clearInterval(interval);
            timerText.style.display = "none";
            alert("No se pudo obtener el video. Verifica que el enlace sea de un video público.");
        }

    } catch (error) {
        clearInterval(interval);
        timerText.style.display = "none";
        alert("Error de conexión. Intenta de nuevo en unos segundos.");
    }
});