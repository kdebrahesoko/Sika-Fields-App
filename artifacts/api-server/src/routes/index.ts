import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import adminRouter from "./admin";
import postsRouter from "./posts";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/admin", adminRouter);
router.use("/admin/posts", postsRouter);

export default router;
