import { Router } from 'express';
import { pedidoController } from '../controllers/pedidoController.js';

const router = Router();

router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.buscarPorId);
router.post('/', pedidoController.criar);
router.patch('/:id/status', pedidoController.alterarStatus);

export default router;