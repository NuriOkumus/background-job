import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client.js";
import { sayHello } from "./src/inngest/functions.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello] }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
