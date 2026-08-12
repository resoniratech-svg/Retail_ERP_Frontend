import React, { useState } from 'react';
import { Button, Input, Card } from '@qatar-erp/ui';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';

export const AuthPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username, password });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-slate-700 bg-slate-900 text-white">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-3">
            Q
          </div>
          <h2 className="text-2xl font-bold">Qatar Retail ERP</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
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
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full py-2.5 mt-2 font-bold">
            Sign In to ERP
          </Button>
        </form>
      </Card>
    </div>
  );
};
