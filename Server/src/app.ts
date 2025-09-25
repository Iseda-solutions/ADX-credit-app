import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import kycRoutes from "./routes/kycRoutes.js";


dotenv.config();
const app = express();

app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// user routes
app.use("/api/users", userRoutes);
// loan routes
app.use("/api/loans", loanRoutes);
// admin routes
app.use("/api/admin", adminRoutes);
// error handler
app.use(errorHandler);
// kyc routes
app.use("/api/users", kycRoutes);

export default app;
