import { HomeOnboardingRedirect } from '@/components/auth/OnboardingGate';
import { LandingPage } from '@/components/landing/LandingPage';

import './landing.css';

/** Home — marketing layout; assets from www/images → public/images */
export default function HomePage() {
  return (
    <HomeOnboardingRedirect>
      <LandingPage />
    </HomeOnboardingRedirect>
  );
}
