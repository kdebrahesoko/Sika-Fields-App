import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import adminRouter from "./admin";
import postsRouter from "./posts";
import contentRouter from "./content";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/admin", adminRouter);
router.use("/admin/posts", postsRouter);
router.use("/content", contentRouter);

export default router;
