import { useState } from 'react';
import { Key, Shield, ArrowRight, RefreshCw, ExternalLink, Github } from 'lucide-react';
import { Card } from '../common/Card';
import * as authService from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

const PAT_URL = 'https://github.com/settings/personal-access-tokens/new';

export function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'setup' | 'recover'
  const [step, setStep] = useState(1);
  const [pat, setPat] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('my-arc');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!pat.startsWith('github_pat_')) return setError('Invalid PAT format — should start with github_pat_');
    if (!owner) return setError('Enter your GitHub username');

    setLoading(true);
    setError('');
    try {
      const user = await authService.setupAuth(pat, password, owner, repo);
      login(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!owner || !password) return setError('Fill in all fields');
    setLoading(true);
    setError('');
    try {
      const user = await authService.recoverAuth(owner, repo, password);
      login(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Welcome screen ---
  if (mode === 'welcome') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-5xl font-extrabold text-gradient">Arc</h1>
            <p className="mt-2 text-lg t-tertiary">Gamified personal growth tracker</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => setMode('setup')} className="btn-primary w-full text-base py-3">
              <Key className="h-5 w-5" /> Get Started
            </button>
            <button onClick={() => setMode('recover')} className="btn-secondary w-full">
              <RefreshCw className="h-4 w-4" /> I have an existing account
            </button>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-xs t-muted">
              Your data is encrypted and stored in your own GitHub repo.
              <br />No servers. No accounts. You own everything.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Setup wizard ---
  if (mode === 'setup') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gradient">Setup Arc</h1>
            <p className="mt-1 text-sm t-muted">Step {step} of 2</p>
          </div>

          {step === 1 && (
            <Card>
              <h2 className="text-lg font-bold t-primary mb-1">Create a GitHub Token</h2>
              <p className="text-xs t-muted mb-4">
                Arc needs a fine-grained PAT with <strong>Contents: Read &amp; write</strong> permission
                on your my-arc repo. Set expiration to <strong>No expiration</strong>.
              </p>

              <a href={PAT_URL} target="_blank" rel="noopener noreferrer"
                className="btn-secondary w-full mb-4 justify-center">
                <Github className="h-4 w-4" /> Create PAT on GitHub
                <ExternalLink className="h-3 w-3 t-muted" />
              </a>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium t-secondary mb-1">GitHub username</label>
                  <input type="text" className="input-field" placeholder="harshit"
                    value={owner} onChange={(e) => setOwner(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium t-secondary mb-1">Repo name</label>
                  <input type="text" className="input-field" placeholder="my-arc"
                    value={repo} onChange={(e) => setRepo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium t-secondary mb-1">Paste your PAT</label>
                  <input type="password" className="input-field font-mono text-xs" placeholder="github_pat_..."
                    value={pat} onChange={(e) => setPat(e.target.value)} />
                </div>
              </div>

              <button onClick={() => { setError(''); setStep(2); }}
                disabled={!pat || !owner}
                className="btn-primary w-full mt-4"
                style={!pat || !owner ? { opacity: 0.5 } : {}}>
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <h2 className="text-lg font-bold t-primary mb-1">Set Encryption Password</h2>
              <p className="text-xs t-muted mb-4">
                This password encrypts all your data. It <strong>cannot be recovered</strong> — remember it.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium t-secondary mb-1">Password (min 8 chars)</label>
                  <input type="password" className="input-field" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium t-secondary mb-1">Confirm password</label>
                  <input type="password" className="input-field" placeholder="••••••••"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

              <div className="flex gap-2 mt-4">
                <button onClick={() => { setStep(1); setError(''); }} className="btn-secondary flex-1">
                  Back
                </button>
                <button onClick={handleSetup} disabled={loading} className="btn-primary flex-1">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </Card>
          )}

          <button onClick={() => { setMode('welcome'); setStep(1); setError(''); }}
            className="block mx-auto text-xs t-muted hover:t-secondary transition-colors">
            ← Back to start
          </button>
        </div>
      </div>
    );
  }

  // --- Recovery flow ---
  if (mode === 'recover') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gradient">Welcome Back</h1>
            <p className="mt-1 text-sm t-muted">Recover your data with your password</p>
          </div>

          <Card>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium t-secondary mb-1">GitHub username</label>
                <input type="text" className="input-field" placeholder="harshit"
                  value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium t-secondary mb-1">Repo name</label>
                <input type="text" className="input-field" placeholder="my-arc"
                  value={repo} onChange={(e) => setRepo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium t-secondary mb-1">Encryption password</label>
                <input type="password" className="input-field" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button onClick={handleRecover} disabled={loading} className="btn-primary w-full mt-4">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {loading ? 'Recovering...' : 'Recover Account'}
            </button>
          </Card>

          <button onClick={() => { setMode('welcome'); setError(''); }}
            className="block mx-auto text-xs t-muted hover:t-secondary transition-colors">
            ← Back to start
          </button>
        </div>
      </div>
    );
  }

  return null;
}
