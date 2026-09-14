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
        // API objetivo y proxy para evitar bloqueos CORS del navegador
        const targetApi = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetApi)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data && data.code === 0 && data.data) {
            const videoHdUrl = data.data.hdplay || data.data.play;

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
            alert("No se pudo obtener el video. Verifica que el enlace sea público.");
        }

    } catch (error) {
        clearInterval(interval);
        timerText.style.display = "none";
        console.error("Error de petición:", error);
        alert("No se pudo procesar la solicitud. Intenta con otro enlace.");
    }
});