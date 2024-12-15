import { Router } from 'express';
import { deploymentController } from '../controllers/deployment.js';
import { templateController } from '../controllers/template.js';

const router = Router();

// Deployment routes
router.post('/deploy', deploymentController.deploy);
router.get('/deploy/status/:id', deploymentController.getStatus);

// Template routes
router.post('/template/customize', templateController.customize);
router.get('/template/download/:id', templateController.download);

export const apiRouter = router;