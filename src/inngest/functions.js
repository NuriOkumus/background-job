import { inngest } from "./client.js";
import { reports } from "../store.js";

export const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: { event: "test/hello" } },
  async ({ step }) => {
    await step.sleep("wait-a-bit", "5s");
    return "Hello from the background!";
  }
);

export const makeReport = inngest.createFunction(
  { id: "make-report", triggers: { event: "report/requested" } },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", async () => {
      return { summary: `Report for "${topic}" generated at ${new Date().toISOString()}` };
    });

    reports.set(id, { id, topic, status: "done", result });
  }
);
