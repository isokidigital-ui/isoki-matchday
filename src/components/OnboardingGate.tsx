import React from 'react';
import { LangType } from '../utils/lang';
import ClubOnboarding from './ClubOnboarding';
import { ClubConfig } from '../types';

type OnboardingGateProps = {
  lang: LangType;
  toggleLang: () => void;
  adminUsername: string;
  clubId: string;
  initialConfig?: ClubConfig | null;
  onFinish: (clubConfig: ClubConfig) => void;
};

export default function OnboardingGate({
  lang,
  toggleLang,
  adminUsername,
  clubId,
  initialConfig,
  onFinish,
}: OnboardingGateProps) {
  return (
    <ClubOnboarding
      lang={lang}
      toggleLang={toggleLang}
      adminUsername={adminUsername}
      clubId={clubId}
      initialConfig={initialConfig}
      onDone={onFinish}
    />
  );
}

