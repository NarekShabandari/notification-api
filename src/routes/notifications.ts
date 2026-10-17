import { Router } from "express";
import * as notifications from "../controllers/notifications.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/notifications",
  validate(notifications.createSchema),
  notifications.create,
);
router.get("/users/:userId/notifications", notifications.list);
router.patch("/notifications/:id/read", notifications.markRead);
router.patch(
  "/users/:userId/notifications/read-all",
  notifications.markAllRead,
);

export default router;
