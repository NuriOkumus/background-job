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
  {
    id: "make-report",
    triggers: { event: "report/requested" },
    retries: 2,
    onFailure: async ({ event }) => {
      const { id, topic } = event.data.event.data;
      reports.set(id, { id, topic, status: "failed" });
    },
  },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", async () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }
      return { summary: `Report for "${topic}" generated at ${new Date().toISOString()}` };
    });

    reports.set(id, { id, topic, status: "done", result });
  }
);

export const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: { cron: "* * * * *" } },
  async ({ step }) => {
    await step.run("log-summary", async () => {
      const counts = { pending: 0, done: 0, failed: 0 };
      for (const report of reports.values()) {
        counts[report.status] = (counts[report.status] ?? 0) + 1;
      }
      console.log(
        `[heartbeat] pending=${counts.pending} done=${counts.done} failed=${counts.failed}`
      );
    });
  }
);
