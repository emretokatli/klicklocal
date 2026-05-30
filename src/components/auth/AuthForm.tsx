'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { useAuth } from '@/store/auth-context';

export function AuthForm({ defaultRegister = false }: { defaultRegister?: boolean }) {
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(defaultRegister);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.common.genericError,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell isRegister={isRegister}>
      <Card className="glass-card border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl">
            {isRegister ? de.auth.createAccount : de.auth.signIn}
          </CardTitle>
          <p className="text-sm text-on-surface-variant">
            {isRegister
              ? 'Erstelle dein Klicklocal-Konto und lege los.'
              : 'Melde dich an, um dein Dashboard zu öffnen.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">{de.auth.name}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{de.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{de.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
          <Button
            className="glow-pill w-full border-0 font-bold"
            disabled={pending}
            onClick={() => void handleSubmit()}
          >
            {pending
              ? de.auth.pleaseWait
              : isRegister
                ? de.auth.register
                : de.auth.signIn}
          </Button>
          {isRegister ? (
            <Link
              href={de.auth.hasAccountLink}
              className="block w-full text-center text-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {de.auth.hasAccount}
            </Link>
          ) : (
            <Link
              href={de.auth.registerLink}
              className="block w-full text-center text-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {de.auth.needAccount}
            </Link>
          )}
          <Link
            href="/"
            className="block text-center text-sm text-on-surface-variant hover:text-primary hover:underline"
          >
            {de.auth.backHome}
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
