import { Router } from "express";

import { SectionController } from "../controllers/SectionController";
import { SectionRepository } from "../repositories/section/SectionRepository";
import { authMiddleware } from "../middlewares/auth";

const router = Router({ mergeParams: true });

const sectionRepository = new SectionRepository();
const sectionController = new SectionController(sectionRepository);

router.post('/', authMiddleware, (req, res) => sectionController.create(req, res));
router.put('/:sectionId', authMiddleware, (req, res) => sectionController.update(req, res));
router.delete('/:sectionId', authMiddleware, (req, res) => sectionController.deleteSection(req, res));

export default router;

