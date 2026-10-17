import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import notificationRoutes from "./routes/notifications.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
app.use(helmet(), cors(), morgan("dev"), express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", notificationRoutes);
app.use(errorHandler);

export default app;
