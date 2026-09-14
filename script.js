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

    // Guardar el tiempo inicial de inicio de espera
    const startTime = Date.now();

    const interval = setInterval(() => {
        timeLeft--;
        const countdownSpan = document.getElementById('countdown');
        if (countdownSpan) countdownSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
        }
    }, 1000);

    try {
        let videoHdUrl = null;

        // Intentar con la API de TikWM (más estable)
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data && data.code === 0 && data.data) {
            videoHdUrl = data.data.hdplay || data.data.play;
        } else {
            // Respaldo con Tiklydown si TikWM no devuelve resultado
            const backupRes = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
            const backupData = await backupRes.json();
            if (backupData && backupData.video && backupData.video.noWatermark) {
                videoHdUrl = backupData.video.noWatermark;
            }
        }

        if (videoHdUrl) {
            // Calcular cuánto tiempo falta para completar los 5 segundos obligatorios
            const elapsedTime = (Date.now() - startTime) / 1000;
            const remainingWait = Math.max(0, 5 - elapsedTime);

            setTimeout(() => {
                timerText.style.display = "none";
                finalDownloadBtn.classList.remove('hidden');
                
                finalDownloadBtn.href = videoHdUrl;
                finalDownloadBtn.setAttribute('target', '_blank');
                finalDownloadBtn.setAttribute('rel', 'noopener noreferrer');
                finalDownloadBtn.setAttribute('download', 'tiktok_video_hd.mp4');
            }, remainingWait * 1000);

        } else {
            clearInterval(interval);
            timerText.style.display = "none";
            alert("No se pudo obtener el video. Verifica que el enlace pertenezca a un video público.");
        }

    } catch (error) {
        clearInterval(interval);
        timerText.style.display = "none";
        console.error("Error al procesar la solicitud:", error);
        alert("Error de conexión. Si usas Brave o un bloqueador de anuncios, intenta deshabilitar los escudos para este sitio.");
    }
});