import React from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Star, Check, Menu, X } from 'lucide-react';
import { TEMPLATES, TIER_LIMITS } from '@/lib/constants';
import { useCurrency } from '@/contexts/CurrencyContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import { useTranslation } from 'react-i18next';
import { useScrollToSection } from '@/hooks/useScrollToSection';

interface LandingPageProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const router = useRouter();
  const { getPricing } = useCurrency();
  const { t } = useTranslation();
  const { activeSection, scrollToSection } = useScrollToSection();
  const pricing = getPricing();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TON Lowcode</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('features')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'features' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {t('features')}
              </button>
              <button 
                onClick={() => scrollToSection('templates')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'templates' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {t('templates')}
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {t('pricing')}
              </button>
              <CurrencySwitcher />
              <LanguageSwitcher />
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-4">
              <div className="flex flex-col space-y-4 px-4">
                <button 
                  onClick={() => {
                    scrollToSection('features');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'features' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {t('features')}
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('templates');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'templates' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {t('templates')}
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('pricing');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {t('pricing')}
                </button>
                <button 
                  onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-center mt-4"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Build Apps <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10x Faster</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto px-4">
            The AI-powered low-code platform that transforms your ideas into production-ready applications with visual workflows and intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
            >
              Start Building Free
            </button>
            <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">{t('powerfulFeatures')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('visualDevelopment')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('visualDevelopmentDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('aiPowered')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('aiPoweredDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('productionReady')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('productionReadyDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Start with Production-Ready Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map(template => (
              <div key={template.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{template.name}</h3>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-sm mb-3">
                  {template.category}
                </span>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{template.stars}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-500">{template.uses} uses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {['Junior', 'Senior', 'Specialist'].map((tier, index) => (
              <div key={tier} className={`bg-white dark:bg-slate-800 rounded-xl p-8 ${index === 1 ? 'ring-2 ring-blue-600 transform scale-105' : ''}`}>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{tier}</h3>
                <div className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                  {pricing[tier]?.monthly}/mo
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].projects} {tier === 'Specialist' ? 'Unlimited' : ''} Projects
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].exports} Exports/month
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].nodes} Nodes per flow
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].support} Support
                  </li>
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition ${
                  index === 1 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}>
                  {tier === 'Junior' ? 'Start Free' : 'Upgrade Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default LandingPage;