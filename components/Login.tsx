
import React, { useState, useCallback } from 'react';
import { AuthenticatedUser } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';

interface LoginProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  appName: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, appName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mock authentication
    if (username === 'admin' && password === 'admin') {
      onLoginSuccess({ username: 'admin', role: 'admin' });
    } else if (username === 'client' && password === 'client') {
      onLoginSuccess({ username: 'client', role: 'client' });
    } else {
      setError('Usuário ou senha inválidos.');
    }
  }, [username, password, onLoginSuccess]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <i className="fas fa-tractor fa-3x text-sky-500 mb-3"></i>
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-600">{appName}</h1>
        </div>
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 text-center">Acessar Sistema</h2>
          <Input
            id="username"
            label="Usuário:"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
          <Input
            id="password"
            label="Senha:"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">{error}</p>
          )}
          <Button type="submit" className="w-full !py-2.5 text-base" variant="primary">
            <i className="fas fa-sign-in-alt mr-2"></i>Entrar
          </Button>
        </form>
         <p className="text-center text-xs text-slate-500 mt-6">
          Problemas para acessar? Contate o administrador.
        </p>
      </div>
    </div>
  );
};

export default Login;