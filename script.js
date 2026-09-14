document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const finalDownloadBtn = document.getElementById('finalDownloadBtn');
    const timerText = document.getElementById('timer');

    if (!downloadBtn || !videoUrlInput) return;

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

    async function fetchVideoUrl(url) {
        const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (res.ok && data.success && data.videoUrl) {
            return data.videoUrl;
        }

        throw new Error(data.error || "No se pudo procesar el enlace.");
    }

    downloadBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();

        if (url === "") {
            alert("Por favor, pega un enlace válido de TikTok.");
            return;
        }

        downloadBtn.disabled = true;

        if (resultContainer) resultContainer.classList.remove('hidden');
        if (finalDownloadBtn) finalDownloadBtn.classList.add('hidden');
        if (timerText) {
            timerText.style.display = "block";
            timerText.innerHTML = `Obteniendo video sin marca de agua... Espera <span id="countdown">5</span> segundos.`;
        }

        try {
            const [_, videoHdUrl] = await Promise.all([
                startCountdown(5),
                fetchVideoUrl(url)
            ]);

            if (timerText) timerText.style.display = "none";
            if (finalDownloadBtn) {
                finalDownloadBtn.href = videoHdUrl;
                finalDownloadBtn.classList.remove('hidden');
            }

        } catch (error) {
            if (timerText) timerText.style.display = "none";
            if (resultContainer) resultContainer.classList.add('hidden');
            alert(error.message || "No se pudo procesar el enlace. Revisa que el video sea público.");
        } finally {
            downloadBtn.disabled = false;
        }
    });
});
