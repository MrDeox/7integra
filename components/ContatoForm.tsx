
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

  const handleEnviarContato = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) {
      alert('Preencha pelo menos o nome, email e mensagem.');
      return;
    }
    
    // Simulate API call
    setStatusEnvio('Enviando...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would send this to a backend.
    // For now, just show a success message and clear the form.
    console.log({ nome, email, telefone, mensagem });
    setStatusEnvio('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    
    setNome('');
    setEmail('');
    setTelefone('');
    setMensagem('');

    setTimeout(() => setStatusEnvio(null), 5000); // Clear status after 5 seconds

  }, [nome, email, telefone, mensagem]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Contato com o Administrador</h2>
      <form onSubmit={handleEnviarContato} className="space-y-4">
        <Input
          label="Seu Nome:"
          id="contato-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <Input
          label="Seu Email:"
          id="contato-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Seu Telefone (Opcional):"
          id="contato-telefone"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <Textarea
          label="Mensagem:"
          id="contato-mensagem"
          rows={5}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
        />
        <Button type="submit">Enviar Mensagem</Button>
      </form>

      {statusEnvio && (
        <div className={`mt-6 p-4 rounded-md border ${statusEnvio.includes('sucesso') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          <p>{statusEnvio}</p>
        </div>
      )}
    </div>
  );
};

export default ContatoForm;
