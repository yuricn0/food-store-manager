import express from 'express';
import cors from 'cors';
import produtoRoutes from './routes/produtoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import loteRoutes from './routes/loteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { autenticar } from './middlewares/autenticar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Públicas
app.use('/auth', authRoutes);

// Protegidas: o autenticar roda antes de qualquer rota abaixo
app.use('/produtos', autenticar, produtoRoutes);
app.use('/clientes', autenticar, clienteRoutes);
app.use('/pedidos', autenticar, pedidoRoutes);
app.use('/lotes', autenticar, loteRoutes);
app.use('/dashboard', autenticar, dashboardRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});