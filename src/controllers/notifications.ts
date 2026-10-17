import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/error";
import { enqueue } from "../queues/notificationQueue";

export const createSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  channel: z.enum(["IN_APP", "EMAIL"]).default("IN_APP"),
});

export type CreateNotificationInput = z.infer<typeof createSchema>;

export const create = async (req: Request, res: Response) => {
  const data: CreateNotificationInput = req.body;
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new HttpError(404, "User not found");
  const notification = await prisma.notification.create({ data });
  await enqueue(notification.id);
  res.status(202).json(notification);
};

export const list = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const cursor = req.query.cursor as string | undefined;

  const items = await prisma.notification.findMany({
    where: { userId, ...(req.query.unread === "true" && { read: false }) },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
  const hasMore = items.length > limit;
  if (hasMore) items.pop();
  res.json({ items, nextCursor: hasMore ? items[items.length - 1]!.id : null });
};

export const markRead = async (req: Request, res: Response) => {
  const n = await prisma.notification.update({
    where: { id: req.params.id as string },
    data: { read: true, readAt: new Date() },
  });
  res.json(n);
};

export const markAllRead = async (req: Request, res: Response) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.params.userId as string, read: false },
    data: { read: true, readAt: new Date() },
  });
  res.json({ updated: result.count });
};
