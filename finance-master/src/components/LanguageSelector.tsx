'use client';

import { useLocale } from 'next-intl';
import {routing} from '@/i18n/routing';
import {useParams} from 'next/navigation';
import {Locale} from 'next-intl';
import {ChangeEvent, useTransition} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';


export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: nextLocale}
      );
    });
  }

  return (
    <select
      value={locale}
      onChange={onSelectChange}
      className="border px-2 py-1 rounded text-sm cursor-pointer bg-(--color-bg)"
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {cur.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
