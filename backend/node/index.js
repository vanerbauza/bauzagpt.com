import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

// Ajusta los orígenes permitidos según necesites
const ALLOW = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8080"
];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOW.includes(origin)),
  credentials: false
}));

// Memoria temporal para órdenes en demo
const ORDERS = [];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get("/search", async (req, res) => {
  const q = (req.query.query || "").toString();
  const base = "https://example.com";
  const mock = [
    { title: `Resultados para "${q}" #1`, link: base, snippet: "Coincidencia OSINT (demo).", score: 0.92 },
    { title: `Resultados para "${q}" #2`, link: base, snippet: "Coincidencia OSINT (demo).", score: 0.87 },
    { title: `Resultados para "${q}" #3`, link: base, snippet: "Coincidencia OSINT (demo).", score: 0.81 }
  ];
  res.json({ query: q, results: mock });
});

app.post("/public/orders", (req, res) => {
  const { query = "", plan = "basic" } = req.body || {};
  const id = uuidv4();
  const order = { id, query, plan, status: "created", createdAt: new Date().toISOString() };
  ORDERS.unshift(order);
  res.json({ ok: true, order });
});

app.get("/client/orders", (req, res) => {
  res.json({ orders: ORDERS });
});

app.post("/api/create-checkout-session", (req, res) => {
  // Placeholder de pago
  res.json({ ok: true, url: "https://pago-demo.example/checkout" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("BAUZA GPT backend on", PORT);
});
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

app.get("/search/pdf", async (req, res) => {
  const q = (req.query.query || "").toString();
  const base = "https://example.com";
  const results = [
    { title: `Resultados para "${q}" #1`, link: base, snippet: "Coincidencia OSINT (demo).", score: 0.92 },
    { title: `Resultados para "${q}" #2`, link: base, snippet: "Coincidencia OSINT (demo).", score: 0.87 },
    { title: `Resultados para "${q}" #3`, link: base, snippet: "Coincidencia OSINT (demo).", score: 0.81 }
  ];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="bauzagpt-${Date.now()}.pdf"`);

  const doc = new PDFDocument({ margin: 36 });
  doc.pipe(res);

  doc.fontSize(18).text("BAUZA GPT — Reporte OSINT (demo)");
  doc.moveDown(0.3);
  doc.fontSize(10).text(`Fecha: ${new Date().toLocaleString("es-MX")}`);
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Consulta: ${q || "(vacía)"}`);
  doc.moveDown(0.5);
  doc.moveTo(36, doc.y).lineTo(559, doc.y).strokeColor("#999").stroke();

  results.forEach((r, i) => {
    doc.moveDown(0.8);
    doc.fontSize(12).fillColor("#fff").text(`${i+1}. ${r.title}`);
    if (r.snippet) doc.fontSize(10).fillColor("#bbb").text(r.snippet);
    if (r.link) doc.fillColor("#69f").text(r.link, { link: r.link, underline: true });
    doc.fillColor("#999").text(`score: ${r.score}`);
  });

  doc.moveDown(1);
  doc.fillColor("#bbb").fontSize(9).text("Este PDF es una vista previa de demo. La versión Premium incluirá anexos y metadatos verificados.");
  doc.end();
});
