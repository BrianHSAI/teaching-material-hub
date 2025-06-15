
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'da' | 'en') => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-gray-500" />
      <Button variant={i18n.language.startsWith('da') ? 'secondary' : 'ghost'} size="sm" onClick={() => changeLanguage('da')}>
        Dansk
      </Button>
      <Button variant={i18n.language.startsWith('en') ? 'secondary' : 'ghost'} size="sm" onClick={() => changeLanguage('en')}>
        English
      </Button>
    </div>
  );
};
