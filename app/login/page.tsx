'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Spinner } from '@/components/ui/Spinner';

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || t('error'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 언어 토글 */}
        <div className="flex justify-end mb-6">
          <LanguageToggle />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🧠</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="you@amplitude.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Spinner size="sm" />}
              {t('loginBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
