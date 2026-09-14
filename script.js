export default async function handler(req, res) {
    // Permitir conexión con tu frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Por favor, ingresa un enlace válido.' });
    }

    try {
        const cleanUrl = url.trim();

        // 1. Petición POST a TikWM (Servidor a Servidor con headers de navegador)
        const params = new URLSearchParams();
        params.append('url', cleanUrl);
        params.append('hd', '1');

        const tikwmResponse = await fetch('https://www.tikwm.com/api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: params
        });

        if (tikwmResponse.ok) {
            const data = await tikwmResponse.json();
            if (data && data.code === 0 && data.data) {
                const videoUrl = data.data.hdplay || data.data.play;
                if (videoUrl) {
                    const finalUrl = videoUrl.startsWith('http') ? videoUrl : `https://www.tikwm.com${videoUrl}`;
                    return res.status(200).json({ success: true, videoUrl: finalUrl });
                }
            }
        }

        // 2. Respaldo secundario: Tiklydown
        const tiklyRes = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(cleanUrl)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (tiklyRes.ok) {
            const data = await tiklyRes.json();
            if (data && data.video && data.video.noWatermark) {
                return res.status(200).json({ success: true, videoUrl: data.video.noWatermark });
            }
        }

        return res.status(400).json({ error: 'No se pudo procesar el video. Verifica que el enlace sea público.' });

    } catch (err) {
        return res.status(500).json({ error: 'Error del servidor al conectar con TikTok.' });
    }
}
