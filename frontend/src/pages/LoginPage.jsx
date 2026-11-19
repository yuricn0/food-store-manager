import { useState } from 'react';

export default function LoginPage({ onEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    try {
      setEntrando(true);
      setErro(null);
      await onEntrar(email, senha);
    } catch (e) {
      setErro(e.message);
      setEntrando(false);
    }
  }

  const campo =
    'w-full px-3 py-2 bg-white border border-[#D8D8D0] rounded ' +
    'text-[#1A2E1F] placeholder:text-[#9A9A90] ' +
    'focus:outline-none focus:border-[#2F6B3F] focus:ring-2 focus:ring-[#2F6B3F]/20';

  return (
    <div className="min-h-screen bg-[#1A2E1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-semibold text-[#F2F2EC] tracking-tight">
            Food Store Manager
          </h1>
          <p className="text-sm text-[#A8BCAE] mt-1">
            Entre para gerenciar a loja
          </p>
        </div>

        <form
          onSubmit={enviar}
          className="bg-[#FAFAF7] rounded-lg p-6 space-y-4 shadow-xl"
        >
          <div>
            <label className="block text-sm font-medium text-[#4A4A42] mb-1.5">
              E-mail
            </label>
            <input
              className={campo}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A42] mb-1.5">
              Senha
            </label>
            <input
              className={campo}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <p className="text-sm text-[#B4341F] bg-[#FDF2F0] border border-[#F4D5CE] rounded px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={entrando}
            className="w-full px-4 py-2.5 bg-[#2F6B3F] text-white font-medium rounded
                       hover:bg-[#255632] disabled:opacity-50"
          >
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}