'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { authService } from '@/services/auth.service';

export function EmailRegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setError(null);
    setPending(true);

    try {
      await authService.registerEmail(email.trim());
      router.replace('/onboarding');
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.common.genericError,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell isRegister>
      <Card className="glass-card border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl">{de.registerWizard.getStarted.title}</CardTitle>
          <p className="text-sm text-on-surface-variant">
            {de.registerWizard.emailOnly.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="register-email">{de.auth.email}</Label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={de.registerWizard.emailOnly.placeholder}
              autoComplete="email"
              autoFocus
            />
          </div>
          <Button
            className="glow-pill w-full border-0 font-bold"
            disabled={pending || !email.trim().includes('@')}
            onClick={() => void handleSubmit()}
          >
            {pending ? de.auth.pleaseWait : de.registerWizard.getStarted.cta}
          </Button>
          <Link
            href="/login"
            className="block w-full text-center text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            {de.auth.hasAccount}
          </Link>
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
