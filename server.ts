import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  // Initialize Gemini Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "KioskGuard Enterprise MDM Server", timestamp: new Date().toISOString() });
  });

  // AI Security Policy Generator & Compliance Advisor Endpoint
  app.post("/api/ai/analyze-policy", async (req, res) => {
    try {
      const { companyType, deviceCount, riskLevel, customRequirements, currentPolicies } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback intelligent response if API key is not yet set
        return res.json({
          success: true,
          source: "offline_rules_engine",
          recommendations: [
            "Ativar modo Device Owner (DPC) via QR Code 'afw#setup' no primeiro boot para controle total de hardware.",
            "Bloquear instalação de fontes desconhecidas (APK) e desativar Google Play Store pública para evitar Shadow IT.",
            "Impor Whitelist estrita de URLs corporativas na intranet com bloqueio de redes sociais e streaming.",
            "Desativar depuração USB (ADB) e transferência de arquivos MTP para mitigar extração de dados.",
            "Exigir PIN alfanumérico mínimo de 6 dígitos com bloqueio por inatividade de 60 segundos.",
            "Implementar bloqueio automático fora do horário de trabalho contratual (ex: 18h às 08h) para conformidade trabalhista e LGPD."
          ],
          complianceRating: "A+ (98% de Conformidade Corporativa)",
          androidEnterpriseDpcXml: `<device-policy-config>\n  <restriction key="disable_usb_data" value="true" />\n  <restriction key="disable_camera_external" value="true" />\n  <restriction key="disable_developer_mode" value="true" />\n  <restriction key="kiosk_mode" value="multi_app_whitelisted" />\n  <lockscreen timeout="60" pin_complexity="high" />\n</device-policy-config>`,
          summary: "Políticas recomendadas para garantir bloqueio total de acessos não autorizados e conformidade com LGPD e ISO 27001."
        });
      }

      const prompt = `Você é um Engenheiro Sênior de Cibersegurança e Especialista em MDM/EMM (Mobile Device Management / Android Enterprise / Samsung Knox / Apple Supervised Mode).
O cliente solicitou uma análise e recomendação de políticas de bloqueio para smartphones corporativos.

DADOS DA EMPRESA:
- Tipo/Segmento: ${companyType || "Corporativo / Geral"}
- Quantidade de Celulares na Frota: ${deviceCount || "25 dispositivos"}
- Nível de Risco/Restrição: ${riskLevel || "Alto (Kiosk Estrito)"}
- Políticas Atuais Configuradas: ${JSON.stringify(currentPolicies || {})}
- Requisitos Adicionais: ${customRequirements || "Permitir apenas ferramentas de produtividade essenciais, bloquear redes sociais, downloads e acesso externo"}

Por favor, forneça uma análise estruturada em JSON contendo:
1. "summary": Resumo executivo da estratégia de bloqueio e conformidade.
2. "complianceRating": Nota de conformidade (ex: "A+ (99% Seguro)").
3. "recommendations": Lista de 5 a 7 recomendações práticas e técnicas de bloqueio para aplicar no dispositivo.
4. "riskAnalysis": 3 riscos potenciais caso as travas não sejam ativadas.
5. "androidEnterpriseDpcXml": Trecho de configuração técnica formatado para Android Enterprise Device Owner / Knox Configure.
6. "lgpdComplianceNotes": Observações sobre LGPD e proteção contra vazamento de dados de clientes.

Responda APENAS com JSON válido.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, source: "gemini", ...parsed });
    } catch (error: any) {
      console.error("Erro na API Gemini:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Erro ao processar análise com IA",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KioskGuard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
