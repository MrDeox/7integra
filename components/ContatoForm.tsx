
import React, { useState, useCallback } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

const ContatoForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [statusEnvio, setStatusEnvio] = useState<string | null>(null);
  const [isEnviando, setIsEnviando] = useState(false);

  const handleEnviarContato = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) {
      alert('Preencha pelo menos o nome, email e mensagem.');
      return;
    }
    
    setIsEnviando(true);
    setStatusEnvio('Enviando mensagem...'); // Initial status

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Mensagem para Administrador:', { nome, email, telefone, mensagem });
    setStatusEnvio('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    
    setNome('');
    setEmail('');
    setTelefone('');
    setMensagem('');
    setIsEnviando(false);

    setTimeout(() => setStatusEnvio(null), 5000); 

  }, [nome, email, telefone, mensagem]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Contato com o Administrador</h2>
      <p className="text-sm text-slate-600 mb-6">
        Tem alguma dúvida, sugestão ou precisa de suporte? Preencha o formulário abaixo e nossa equipe entrará em contato.
      </p>
      <form onSubmit={handleEnviarContato} className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Seu Nome Completo:"
              id="contato-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              label="Seu Email Principal:"
              id="contato-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
        </div>
        <Input
          label="Seu Telefone (Opcional):"
          id="contato-telefone"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          autoComplete="tel"
        />
        <Textarea
          label="Sua Mensagem:"
          id="contato-mensagem"
          rows={5}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
          placeholder="Digite sua mensagem detalhada aqui..."
        />
        <Button type="submit" disabled={isEnviando} variant="primary" className="w-full sm:w-auto !py-2.5">
          {isEnviando ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane mr-2"></i>Enviar Mensagem
            </>
          )}
        </Button>
      </form>

      {statusEnvio && !isEnviando && ( // Show status only after sending is complete
        <div className={`mt-6 p-4 rounded-md border text-sm
          ${statusEnvio.includes('sucesso') ? 'bg-green-50 border-green-300 text-green-700' 
          : 'bg-sky-50 border-sky-300 text-sky-700'}`}>
          <p>{statusEnvio}</p>
        </div>
      )}
    </div>
  );
};

export default ContatoForm;
