import { Router } from 'express';
import { loteController } from '../controllers/loteController.js';

const router = Router();

// As rotas fixas vêm antes de /:id, senão o Express
// interpreta "pendentes" como se fosse um id
router.get('/pendentes', loteController.listarPendentes);
router.get('/sugestoes', loteController.sugerir);

router.get('/', loteController.listar);
router.get('/:id', loteController.buscarPorId);
router.post('/', loteController.criar);
router.patch('/:id/status', loteController.alterarStatus);

export default router;