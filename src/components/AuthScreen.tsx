import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Logo } from './Logo';
import { 
  Sparkles, 
  Key, 
  Mail, 
  CheckCircle, 
  HelpCircle, 
  ArrowLeft, 
  RefreshCw, 
  UserPlus, 
  FileText
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  users: User[];
}

export default function AuthScreen({ onLoginSuccess, onAddToast, users }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Writer');
  const [regPassword, setRegPassword] = useState('');

  // Forgot Password inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [simulatedPin, setSimulatedPin] = useState<string | null>(null);

  // Email validation helper to enforce organization domain check
  const validateEmailDomain = (email: string): boolean => {
    return email.trim().toLowerCase().endsWith('@travelradar.com');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = loginEmail.trim().toLowerCase();
    
    if (!emailLower || !loginPassword.trim()) {
      onAddToast('Please fill out all credentials fields.', 'warning');
      return;
    }

    if (!validateEmailDomain(emailLower)) {
      onAddToast('Access Blocked: Only official @travelradar.com enterprise email accounts are permitted on this gateway.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        onAddToast(`Access Granted: Welcome back, ${data.user.name}!`, 'success');
        onLoginSuccess(data.user);
      } else {
        onAddToast(data.error || 'Authentication failed.', 'error');
      }
    } catch {
      onAddToast('Network error while executing login.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = regEmail.trim().toLowerCase();

    if (!regName.trim() || !emailLower || !regPassword.trim()) {
      onAddToast('Please compile all elements of the operator enrollment form.', 'warning');
      return;
    }

    if (!validateEmailDomain(emailLower)) {
      onAddToast('Enrollment Blocked: Registration is strictly restricted to @travelradar.com organization email accounts.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: emailLower,
          password: regPassword,
          role: regRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        onAddToast('Self-service registration submitted successfully!', 'success');
        setActiveTab('signin');
        // Pre-fill email for ease of login once approved
        setLoginEmail(emailLower);
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegRole('Writer');
      } else {
        onAddToast(data.error || 'Could not complete registration request.', 'error');
      }
    } catch {
      onAddToast('Network error while completing registration.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = resetEmail.trim().toLowerCase();

    if (!emailLower) {
      onAddToast('Please furnish your registered email address.', 'warning');
      return;
    }

    if (!validateEmailDomain(emailLower)) {
      onAddToast('Recovery Blocked: Password resets are restricted to official @travelradar.com organization accounts.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower })
      });
      const data = await res.json();
      if (res.ok) {
        onAddToast('Password recovery verification code generated!', 'success');
        setSimulatedPin(data.pin);
        setResetStep(2);
      } else {
        onAddToast(data.error || 'Failed to dispatch password recovery code.', 'error');
      }
    } catch {
      onAddToast('Server connection error while resetting credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPin.trim() || !newPassword.trim()) {
      onAddToast('Please input the recovery code and your new credentials.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          pin: resetPin.trim(),
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        onAddToast('Security parameters upgraded: password reset successfully!', 'success');
        setActiveTab('signin');
        setLoginEmail(resetEmail.trim().toLowerCase());
        setResetEmail('');
        setResetPin('');
        setNewPassword('');
        setSimulatedPin(null);
        setResetStep(1);
      } else {
        onAddToast(data.error || 'Could not upgrade safety keys.', 'error');
      }
    } catch {
      onAddToast('Connection error during reset confirmation.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAutofill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('password123');
    onAddToast(`Autofilled credentials for: ${email}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none text-left" id="auth-canvas-container">
      
      {/* Top micro-premium neon gradient stripe from the home page */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20a6eb] via-[#e86420] to-[#363636]" />

      {/* Floating decorative gradient blurs to match the home/landing atmospheric design */}
      <div className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full bg-[#e86420]/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-[#20a6eb]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8 space-y-6 relative z-10" id="auth-core-terminal">
        
        {/* Top Header Logo resembling the Landing Page RD Logo */}
        <div className="text-center space-y-2 pt-1">
          <div className="flex justify-center items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="text-lg font-extrabold tracking-tight font-display text-[#363636]">
              RadarDesk
            </span>
          </div>
          <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Secure Personnel Authentication Desk</p>
        </div>

        {/* Tab Switcher - Visual Harmony layout */}
        {activeTab !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80" id="auth-view-tabs">
            <button
              onClick={() => { setActiveTab('signin'); }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${activeTab === 'signin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); }}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${activeTab === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Request Access
            </button>
          </div>
        )}

        {/* SIGN IN WRAPPER */}
        {activeTab === 'signin' && (
          <form onSubmit={handleLogin} className="space-y-4" id="signin-shell">
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#20a6eb]" />
                <span>Personnel Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. alisha.v@travelradar.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl p-3 pr-24 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 font-bold transition-all shadow-6xs"
                  id="login-email-input"
                />
                <span className="absolute right-3 top-2.5 bg-slate-100 text-slate-500 border border-slate-200 text-[8.5px] font-mono font-extrabold px-2 py-1 rounded-md uppercase">
                  @travelradar.com
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#e86420]" />
                  <span>Security Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); setResetStep(1); }}
                  className="text-[10px] text-[#e86420] hover:text-[#ff762f] font-mono font-bold hover:underline"
                >
                  Forgot Key?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 transition-all shadow-6xs"
                id="login-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-[#e86420] hover:scale-102 active:scale-98 text-white font-extrabold tracking-wide text-xs uppercase rounded-xl shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2 border-0"
              id="signin-submit-btn"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <CheckCircle className="w-4 h-4 text-white" />}
              <span>Sign In</span>
            </button>
          </form>
        )}

        {/* REGISTRATION WRAPPER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" id="register-shell">
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#20a6eb]" />
                <span>Personnel Full Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alisha Vance"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 transition-all shadow-6xs"
                id="reg-name-input"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#20a6eb]" />
                <span>Operational Enterprise Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. name@travelradar.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl p-3 pr-24 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 font-bold transition-all shadow-6xs animate-fadeIn"
                  id="reg-email-input"
                />
                <span className="absolute right-3 top-2.5 bg-sky-50 text-[#20a6eb] border border-sky-200 text-[8.5px] font-mono font-extrabold px-2 py-1 rounded-md uppercase">
                  REQUIRED
                </span>
              </div>
              <p className="text-[9px] text-slate-450 leading-normal pl-0.5 pt-0.5">Note: Registrations with non-@travelradar.com email domains will fail gate verification checks.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1 font-sans">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Desired Role</label>
                <div className="relative">
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-250 text-slate-800 rounded-xl p-3 text-xs outline-none focus:border-[#20a6eb] font-mono font-extrabold appearance-none shadow-6xs"
                    style={{ backgroundImage: 'none' }}
                    id="reg-role-select"
                  >
                    <option value="Writer">Writer</option>
                    <option value="Editor">Editor</option>
                    <option value="Senior Editor">Senior Editor</option>
                    <option value="Quality Checker">Quality Checker</option>
                    <option value="Publisher">Publisher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Setup Code</label>
                <input
                  type="password"
                  required
                  placeholder="Set Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 transition-all shadow-6xs"
                  id="reg-password-input"
                />
              </div>
            </div>

            <p className="text-[9px] text-[#e86420] leading-snug bg-orange-50 border border-orange-200/60 p-2.5 rounded-xl text-left">
              ⚡ <strong>Enforced Gating Policy:</strong> Real authorization control is active. Staged accounts enter a <strong>"Pending Approval"</strong> directory block and must be un-gated manually by a Senior Editor or Administrator.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#e86420] to-[#ff762f] text-white font-extrabold tracking-wide text-xs uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/15 flex items-center justify-center gap-1.5 border-0"
              id="register-submit-btn"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
              <span>Request Dashboard Access</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD RECOVERY MODULE */}
        {activeTab === 'forgot' && (
          <div className="space-y-4 text-left font-sans" id="forgot-shell">
            <button
              type="button"
              onClick={() => { setActiveTab('signin'); setSimulatedPin(null); }}
              className="text-[10px] text-slate-500 hover:text-slate-800 font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#20a6eb]" />
              <span>Back into Sign In</span>
            </button>

            {resetStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alisha.v@travelradar.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] transition-all"
                    id="forgot-email-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-[#e86420] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-0"
                  id="forgot-submit-btn"
                >
                  {isLoading ? 'Processing security clearance...' : 'Request Validation Key'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4 animate-fadeIn">
                {simulatedPin && (
                  <div className="bg-orange-50 border border-orange-200/80 p-3.5 rounded-2xl text-left space-y-1 font-mono">
                    <p className="text-[9px] text-[#e86420] font-black uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#e86420] animate-pulse" />
                      <span>Security Router Callback Received</span>
                    </p>
                    <p className="text-slate-600 text-[10px] leading-snug pb-1">Bypassing actual SMTP delivery. Direct Firebase pin sequence callback:</p>
                    <div className="bg-white border border-orange-200/50 p-2.5 rounded-xl text-center shadow-inner">
                      <span className="text-[#363636] font-black tracking-widest text-lg">{simulatedPin}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase">Recovery Pin</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit code"
                      value={resetPin}
                      onChange={(e) => setResetPin(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] text-center font-mono font-black shadow-6xs"
                      id="reset-pin-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] transition-all shadow-6xs"
                      id="reset-password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-[#e86420] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-0"
                  id="reset-confirm-submit-btn"
                >
                  {isLoading ? 'Updating safety indexes...' : 'Upgrade Password Credentials'}
                </button>
              </form>
            )}
          </div>
        )}



      </div>
    </div>
  );
}
