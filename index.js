import express from "express";
import { randomUUID } from "node:crypto";
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client.js";
import { sayHello, makeReport } from "./src/inngest/functions.js";
import { reports } from "./src/store.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello, makeReport] }));

app.post("/reports", async (req, res) => {
  const { topic } = req.body ?? {};

  if (!topic) {
    return res.status(400).json({ error: "topic is required" });
  }

  const id = randomUUID();
  reports.set(id, { id, topic, status: "pending" });

  await inngest.send({ name: "report/requested", data: { id, topic } });

  res.status(202).json({ id, status: "pending" });
});

app.get("/reports/:id", (req, res) => {
  const report = reports.get(req.params.id);

  if (!report) {
    return res.status(404).json({ error: "not found" });
  }

  res.json(report);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
