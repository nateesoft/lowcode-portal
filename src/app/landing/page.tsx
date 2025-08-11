'use client'

import React, { useState } from 'react';
import LandingPage from '@/components/pages/LandingPage';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <LandingPage 
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );
}