import React, { useState } from 'react';
import { Button, Input, Card } from '@qatar-erp/ui';
import { useAuth } from '../../app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-slate-950 select-none font-sans">
      <Card className="w-full max-w-md p-8 shadow-2xl border-slate-800 bg-slate-900 text-white">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            Q
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Qatar Retail ERP</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (e.g. admin)"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full py-3 mt-2 font-bold text-base shadow-lg">
            Sign In to ERP
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;
