import { Worker } from "bullmq";
import { prisma } from "../config/prisma.js";
import { connection } from "./notificationQueue.js";

const worker = new Worker<{ id: string }>(
  "notifications",
  async (job) => {
    const n = await prisma.notification.findUniqueOrThrow({
      where: { id: job.data.id },
      include: { user: { include: { preference: true } } },
    });

    if (n.channel === "EMAIL" && n.user.preference?.emailEnabled === false) {
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: "FAILED", error: "User opted out" },
      });
      return;
    }

    await prisma.notification.update({
      where: { id: n.id },
      data: { status: "SENT" },
    });
  },
  { connection },
);

worker.on("failed", (job, err) =>
  console.error(`Job ${job?.id} failed:`, err.message),
);
