import { Queue } from "bullmq";
import { env } from "../config/env";

export const connection = { host: env.REDIS_HOST, port: env.REDIS_PORT };

export const notificationQueue = new Queue<{ id: string }>("notification", {
  connection,
});

export const enqueue = (id: string) => {
  notificationQueue.add(
    "send",
    { id },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
  );
};
