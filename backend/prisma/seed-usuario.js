import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const EMAIL = 'admin@foodstore.com';
const SENHA = 'admin123';

async function main() {
  const existente = await prisma.usuario.findUnique({
    where: { email: EMAIL }
  });

  if (existente) {
    console.log('Usuário administrador já existe.');
    return;
  }

  const senhaHash = await bcrypt.hash(SENHA, 10);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: EMAIL,
      senhaHash,
      perfil: 'ADMIN'
    }
  });

  console.log(`Usuário criado: ${EMAIL} / ${SENHA}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());