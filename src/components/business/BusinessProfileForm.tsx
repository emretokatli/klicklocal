'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { de } from '@/lib/i18n/de';
import type { BusinessProfile, BusinessProfileInput } from '@/types/api';

const TYPE_OPTIONS = Object.entries(de.business.types);
const TONE_OPTIONS = Object.entries(de.business.tones);

export function BusinessProfileForm({
  initial,
  onSubmit,
  pending,
  error,
  submitLabel,
}: {
  initial?: BusinessProfile | null;
  onSubmit: (payload: BusinessProfileInput) => void;
  pending: boolean;
  error?: string | null;
  submitLabel?: string;
}) {
  const [businessName, setBusinessName] = useState(
    initial?.business_name ?? '',
  );
  const [businessType, setBusinessType] = useState(
    initial?.business_type ?? '',
  );
  const [city, setCity] = useState(initial?.city ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [toneOfVoice, setToneOfVoice] = useState(
    initial?.tone_of_voice ?? '',
  );
  const [productsServices, setProductsServices] = useState(
    initial?.products_services ?? '',
  );

  const valid =
    businessName.trim() !== '' &&
    businessType.trim() !== '';

  function handleSubmit() {
    onSubmit({
      business_name: businessName.trim(),
      business_type: businessType,
      city: city.trim() || null,
      description: description.trim() || null,
      tone_of_voice: toneOfVoice || null,
      products_services: productsServices.trim() || null,
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="business_name">{de.business.businessName}</Label>
        <Input
          id="business_name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder={de.business.businessNamePlaceholder}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business_type">{de.business.businessType}</Label>
          <select
            id="business_type"
            className="h-10 w-full rounded-xl border border-white/10 bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            <option value="">{de.business.businessTypePlaceholder}</option>
            {TYPE_OPTIONS.map(([key, label]) => (
              <option key={key} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">{de.business.city}</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={de.business.cityPlaceholder}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tone_of_voice">{de.business.toneOfVoice}</Label>
        <select
          id="tone_of_voice"
          className="h-10 w-full rounded-xl border border-white/10 bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={toneOfVoice}
          onChange={(e) => setToneOfVoice(e.target.value)}
        >
          <option value="">{de.business.toneOfVoicePlaceholder}</option>
          {TONE_OPTIONS.map(([key, label]) => (
            <option key={key} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{de.business.descriptionLabel}</Label>
        <Textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={de.business.descriptionPlaceholder}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="products_services">
          {de.business.productsServices}
        </Label>
        <Textarea
          id="products_services"
          rows={3}
          value={productsServices}
          onChange={(e) => setProductsServices(e.target.value)}
          placeholder={de.business.productsServicesPlaceholder}
        />
      </div>

      <Button
        className="w-full"
        disabled={!valid || pending}
        onClick={handleSubmit}
      >
        {pending ? de.common.loading : (submitLabel ?? de.business.save)}
      </Button>
    </div>
  );
}
