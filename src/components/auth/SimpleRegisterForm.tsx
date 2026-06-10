'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { de } from '@/lib/i18n/de';
import { ONBOARDING_INDUSTRIES } from '@/lib/onboarding-wizard/constants';
import { setStoredWorkspaceId } from '@/lib/token';
import { ApiClientError } from '@/services/api-client';
import { authService } from '@/services/auth.service';
import { userOnboardingService } from '@/services/user-onboarding.service';

export function SimpleRegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const passwordMismatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;

  const isValid =
    email.trim().includes('@') &&
    password.length >= 8 &&
    password === passwordConfirmation &&
    businessName.trim().length > 0 &&
    industry.length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setError(null);
    setPending(true);

    try {
      await authService.registerEmail(email.trim());

      const result = await userOnboardingService.complete({
        password,
        password_confirmation: passwordConfirmation,
        first_name: '',
        business_name: businessName.trim(),
        industry,
      });

      setStoredWorkspaceId(result.workspace.id);
      await queryClient.resetQueries();
      router.replace('/dashboard');
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
            Erstelle dein Konto und starte sofort.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="reg-password">{de.auth.password}</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 Zeichen"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password-confirm">Passwort bestätigen</Label>
            <Input
              id="reg-password-confirm"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Passwort wiederholen"
              autoComplete="new-password"
            />
            {passwordMismatch && (
              <p className="text-xs text-error">Passwörter stimmen nicht überein.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-business">Unternehmensname</Label>
            <Input
              id="reg-business"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Dein Unternehmensname"
              autoComplete="organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-industry">Branche</Label>
            <NativeSelect
              id="reg-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="" disabled>Branche wählen…</option>
              {ONBOARDING_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </NativeSelect>
          </div>

          <Button
            className="glow-pill w-full border-0 font-bold"
            disabled={pending || !isValid}
            onClick={() => void handleSubmit()}
          >
            {pending ? de.auth.pleaseWait : 'Konto erstellen & starten'}
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
