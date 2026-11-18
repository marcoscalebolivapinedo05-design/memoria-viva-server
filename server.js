const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// 1. PEGA AQUÍ TU TOKEN DE REPLICATE (entre las comillas)
const REPLICATE_API_TOKEN = "r8_AQUÍ_VA_TU_TOKEN_DE_REPLICATE";

app.post('/restaurar', async (req, res) => {
  try {
    const { imagenBase64, modo } = req.body;

    // 1. LECTOR INTELIGENTE (Analiza los daños)
    console.log("🔍 Memoria Viva analizando daños...");
    const analisisResponse = await fetch("https://api.replicate.com/v1/models/openai/gpt-4o-mini/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        input: {
          image: imagenBase64,
          prompt: "Analiza esta foto física antigua en español en máximo 2 líneas: detecta si tiene grietas, partes rotas, manchas, está borrosa o en blanco y negro."
        }
      })
    });
    const analisisData = await analisisResponse.json();
    const diagnostico = analisisData.output ? analisisData.output.join("") : "Daños por el tiempo y desgaste detectados.";

    // 2. INSTRUCCIÓN DINÁMICA SEGÚN EL MODO ELEGIDO
    const instruccionColor = modo === 'colorear'
      ? "Colorize the photograph with rich, natural, historically accurate colors and realistic skin tones."
      : "Preserve the original black and white or vintage monochrome tones without adding artificial colors, keeping authentic lighting and contrast.";

    const promptFinal = `Restore this damaged vintage physical photograph. Seamlessly reconstruct missing torn parts, remove scratches, creases, stains, and dust. Sharpen blurry faces naturally while preserving the original people's exact identity. ${instruccionColor}`;

    // 3. RECONSTRUCCIÓN CON IA ESPECIALIZADA
    console.log(`🪄 Reconstruyendo en modo: ${modo}...`);
    const restaurarResponse = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        input: {
          input_image: imagenBase64,
          prompt: promptFinal
        }
      })
    });

    const restaurarData = await restaurarResponse.json();
    
    res.json({
      diagnostico: diagnostico,
      imagenRestaurada: restaurarData.output
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error conectando con la IA de Memoria Viva" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor de Memoria Viva listo en el puerto ${PORT}`);
});