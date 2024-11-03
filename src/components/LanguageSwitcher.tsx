// src/components/LanguageSwitcher.tsx
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useAtom } from 'jotai';
import { LanguageAtom } from '@/states/atoms';
import useDic from './dic';

const languages = {
  pt: 'Português',
  en: 'English',
};

export function LanguageSwitcher() {
  const [ language, setLanguage ] = useAtom(LanguageAtom);
  const dic = useDic()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{dic('language.switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([key, name]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key)}
            className={language === key ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}