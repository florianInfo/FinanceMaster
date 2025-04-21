import {useTranslations} from 'next-intl';  

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  return (
    <main className=" min-h-screen flex flex-col items-center justify-center gap-4 bg-bg text-text transition-all">
      <h1 className="text-3xl font-bold text-primary">{t('title')}</h1>

      <div className="p-6 border rounded-lg shadow">
        <p className="text-muted">{t('description')}</p>
      </div>

      <button className="px-4 py-2 rounded bg-(--color-primary) hover:bg-(--color-secondary) text-(--color-text) cursor-pointer">
        {t('loginButton')}
      </button>
    </main>
  );
}