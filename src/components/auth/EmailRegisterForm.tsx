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

/**
 * Email-first registration: collects ONLY an email, calls
 * POST /auth/register-email (via useAuth().registerEmail) and, on success,
 * routes to /onboarding where the multi-step wizard handles everything else
 * (name, business, website, KYC, AI analysis, sample posts, password).
 *
 * Account completion happens ONLY at the final wizard "Set password" step
 * (POST /auth/onboarding/complete) — never here.
 */
export function EmailRegisterForm() {
  const { registerEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isValid = email.trim().includes('@');

  async function handleSubmit() {
    if (!isValid) return;
    setError(null);
    setPending(true);
    try {
      // registerEmail stores the token and redirects to /onboarding on success.
      await registerEmail(email.trim());
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.common.genericError,
      );
      setPending(false);
    }
  }

  return (
    <AuthShell isRegister>
      <Card className="glass-card border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl">
            {de.registerWizard.getStarted.title}
          </CardTitle>
          <p className="text-sm text-on-surface-variant">
            Gib deine E-Mail-Adresse ein – den Rest richten wir gemeinsam ein.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="reg-email">{de.auth.email}</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                autoComplete="email"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="glow-pill w-full border-0 font-bold"
              disabled={pending || !isValid}
            >
              {pending ? de.auth.pleaseWait : 'Weiter'}
            </Button>
          </form>

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
