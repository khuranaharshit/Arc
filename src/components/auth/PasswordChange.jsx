import { useState } from 'react';
import { Shield, RefreshCw, Check } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function PasswordChange() {
  const { changePassword } = useAuth();
  const { addToast } = useToast();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (newPass.length < 8) return setError('New password must be at least 8 characters');
    if (newPass !== confirmPass) return setError('Passwords do not match');
    if (newPass === currentPass) return setError('New password must be different from current');

    setLoading(true);
    try {
      const result = await changePassword(currentPass, newPass);
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
        addToast('Password changed successfully!', 'success');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold t-primary">Password Changed</h3>
          <p className="text-xs t-muted">Your encryption password has been updated.</p>
          <button onClick={() => setSuccess(false)} className="btn-ghost text-xs">Change again</button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Change Password" icon={Shield} subtitle="Update your encryption password" />
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium t-secondary mb-1">Current password</label>
          <input type="password" className="input-field" placeholder="Enter current password"
            value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium t-secondary mb-1">New password (min 8 chars)</label>
          <input type="password" className="input-field" placeholder="Enter new password"
            value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium t-secondary mb-1">Confirm new password</label>
          <input type="password" className="input-field" placeholder="Confirm new password"
            value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button onClick={handleSubmit} disabled={loading || !currentPass || !newPass || !confirmPass}
          className="btn-primary w-full" style={!currentPass || !newPass || !confirmPass ? { opacity: 0.5 } : {}}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </Card>
  );
}
