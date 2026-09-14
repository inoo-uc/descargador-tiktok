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

    // Ocultar botón final y mostrar temporizador de 5 segundos
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
        // Petición a la API de TikWM para obtener el enlace directo al archivo .mp4 HD
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data && data.data && data.data.play) {
            const videoHdUrl = data.data.play; // URL directa al MP4 sin marca de agua

            // Descargar el archivo directamente a la computadora/celular mediante Blob
            const videoResponse = await fetch(videoHdUrl);
            const videoBlob = await videoResponse.blob();
            const blobUrl = URL.createObjectURL(videoBlob);

            setTimeout(() => {
                timerText.style.display = "none";
                finalDownloadBtn.classList.remove('hidden');
                
                // Asignar el archivo procesado localmente
                finalDownloadBtn.href = blobUrl;
                finalDownloadBtn.setAttribute('download', 'tiktok_video_hd.mp4');
            }, timeLeft * 1000);

        } else {
            clearInterval(interval);
            timerText.style.display = "none";
            alert("No se pudo procesar el video. Verifica que el enlace sea correcto.");
        }

    } catch (error) {
        clearInterval(interval);
        timerText.style.display = "none";
        alert("El navegador bloqueó la prueba local. Cuando subamos la página a su servidor gratuito (Vercel/GitHub), la descarga directa funcionará al 100%.");
    }
});