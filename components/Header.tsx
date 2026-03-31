'use client';
import { useLang } from '@/lib/i18n';
import { LanguageToggle } from './LanguageToggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userName?: string;
  role?: 'owner' | 'viewer';
}

export function Header({ userName, role }: HeaderProps) {
  const { t } = useLang();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <div>
              <span className="text-lg font-bold text-gray-900">{t('appName')}</span>
              <span className="ml-2 text-sm text-gray-500">{t('subtitle')}</span>
            </div>
          </Link>
        </div>

        {/* 우측 */}
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {userName && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">
                  {role === 'owner' ? t('owner') : `${t('viewer')} · ${t('readOnly')}`}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
