import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { autenticar, exigirPerfil } from '../middlewares/autenticar.js';

const router = Router();

// Única rota pública da API
router.post('/login', authController.login);

router.get('/eu', autenticar, authController.eu);

router.get(
  '/usuarios',
  autenticar,
  exigirPerfil('ADMIN'),
  authController.listarUsuarios
);

router.post(
  '/usuarios',
  autenticar,
  exigirPerfil('ADMIN'),
  authController.criarUsuario
);

export default router;