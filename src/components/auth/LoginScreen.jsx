import { useState } from 'react';
import { Shield, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const { login, isFirstTime, defaultPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!password && !isFirstTime) return setError('Enter your password');

    setLoading(true);
    setError('');

    try {
      const pass = password || defaultPassword;
      const result = await login(pass);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div>
          <h1 className="text-5xl font-extrabold text-gradient">Arc</h1>
          <p className="mt-2 text-sm t-tertiary">Gamified personal growth tracker</p>
        </div>

        {isFirstTime ? (
          /* First time — welcome + auto-setup */
          <Card>
            <div className="space-y-4">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Shield className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold t-primary">Welcome to Arc</h2>
                <p className="mt-1 text-xs t-muted">
                  Your data is encrypted locally. Default password is <code className="rounded px-1 py-0.5 text-purple-400" style={{ background: 'var(--color-surface-row)' }}>{defaultPassword}</code>
                </p>
                <p className="mt-2 text-xs t-muted">You can change it anytime in Settings.</p>
              </div>

              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                {loading ? 'Setting up...' : 'Get Started'}
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </Card>
        ) : (
          /* Returning user — enter password */
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Lock className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold t-primary">Welcome Back</h2>
                <p className="mt-1 text-xs t-muted">Enter your encryption password to unlock.</p>
              </div>

              <input
                type="password"
                className="input-field text-center text-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button type="submit" disabled={loading || !password} className="btn-primary w-full py-3 text-base"
                style={!password ? { opacity: 0.5 } : {}}>
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                {loading ? 'Unlocking...' : 'Unlock'}
              </button>
            </form>
          </Card>
        )}

        <p className="text-[11px] t-faint">
          All data encrypted with AES-256-GCM. Stored locally in your browser.
        </p>
      </div>
    </div>
  );
}
