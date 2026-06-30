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
import { supabase, isStandalone, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  users: User[];
  onBack?: () => void;
  portalType?: 'developer' | 'admin' | 'all';
}

export default function AuthScreen({ onLoginSuccess, onAddToast, users, onBack, portalType = 'all' }: AuthScreenProps) {
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

  // Visitor preference inputs
  const [visNewsletter, setVisNewsletter] = useState(true);
  const [visWhatsApp, setVisWhatsApp] = useState(false);
  const [visGroups, setVisGroups] = useState(false);
  const [visVisibility, setVisVisibility] = useState<'Public' | 'Private' | 'Anonymous'>('Public');

  // Forgot Password inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [simulatedPin, setSimulatedPin] = useState<string | null>(null);

  const isVisitorMode = regRole === 'Visitor';

  // Email validation — allow any domain for Visitor registrations
  const validateEmailDomain = (email: string): boolean => {
    return email.trim().toLowerCase().endsWith('@travelradar.aero');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = loginEmail.trim().toLowerCase();

    if (!emailLower || !loginPassword.trim()) {
      onAddToast('Please fill out all credentials fields.', 'warning');
      return;
    }

    // Only enforce domain check if this is an operator portal, not a visitor sign-in
    // We check if the email matches a visitor profile first
    const matchesVisitor = users.some(u => u.email === emailLower && u.role === 'Visitor');
    if (!matchesVisitor && !validateEmailDomain(emailLower)) {
      onAddToast('Access Blocked: Only official @travelradar.aero enterprise email accounts are permitted on this gateway.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (isStandalone()) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: loginPassword
        });
        if (authError) throw authError;

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', emailLower)
          .single();
        if (profileError) throw new Error('Operator profile not found in directory.');
        if (userProfile.approved === false) throw new Error('Review Pending: Your organization access has not been approved.');

        // Enforce role gates based on portalType
        if (portalType === 'developer' && userProfile.role === 'Admin') {
          throw new Error('Access Blocked: Administrators must authenticate via the official /admin-portal gateway.');
        }
        if (portalType === 'admin' && userProfile.role !== 'Admin') {
          throw new Error('Access Blocked: Only administrator accounts can access this console.');
        }

        onAddToast(`Access Granted: Welcome back, ${userProfile.name}!`, 'success');
        onLoginSuccess(userProfile as any);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password: loginPassword })
        });
        const data = await res.json();
        if (res.ok) {
          // Enforce role gates based on portalType
          if (portalType === 'developer' && data.user.role === 'Admin') {
            onAddToast('Access Blocked: Administrators must authenticate via the official /admin-portal gateway.', 'error');
            return;
          }
          if (portalType === 'admin' && data.user.role !== 'Admin') {
            onAddToast('Access Blocked: Only administrator accounts can access this console.', 'error');
            return;
          }

          onAddToast(`Access Granted: Welcome back, ${data.user.name}!`, 'success');
          onLoginSuccess(data.user);
        } else {
          onAddToast(data.error || 'Authentication failed.', 'error');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      onAddToast(`${err.message || 'Network error'} ${err.code ? `(Code: ${err.code})` : ''}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = regEmail.trim().toLowerCase();

    if (!regName.trim() || !emailLower || !regPassword.trim()) {
      onAddToast('Please compile all elements of the enrollment form.', 'warning');
      return;
    }

    // Visitor registrations allow any email domain
    if (regRole !== 'Visitor' && !validateEmailDomain(emailLower)) {
      onAddToast('Enrollment Blocked: Registration for operators is restricted to @travelradar.aero accounts.', 'error');
      return;
    }

    // Serialize visitor prefs into password field as JSON so they persist
    const storedPassword = regRole === 'Visitor'
      ? JSON.stringify({ password: regPassword, newsletter: visNewsletter, whatsapp: visWhatsApp, groups: visGroups, visibility: visVisibility })
      : regPassword;

    setIsLoading(true);
    try {
      if (isStandalone()) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password: regPassword,
          options: { data: { full_name: regName.trim(), role: regRole } }
        });
        if (authError) throw authError;

        const { data, error: profileError } = await supabase.from('users').insert({
          id: authData.user?.id,
          name: regName.trim(),
          email: emailLower,
          role: regRole,
          password: storedPassword,
          approved: true
        }).select().single();
        if (profileError) throw profileError;

        const successMsg = regRole === 'Visitor'
          ? 'Welcome to Travel Radar! Your community profile has been created. You can now sign in.'
          : 'Account verified: Registration successful! You can now sign in immediately.';
        onAddToast(successMsg, 'success');
        setActiveTab('signin');
        setLoginEmail(emailLower);
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regName.trim(),
            email: emailLower,
            password: storedPassword,
            role: regRole
          })
        });
        const data = await res.json();
        if (res.ok) {
          const successMsg = regRole === 'Visitor'
            ? 'Welcome to Travel Radar! Your community profile has been created. You can now sign in.'
            : 'Account verified: Registration successful! You can now sign in immediately.';
          onAddToast(successMsg, 'success');
          setActiveTab('signin');
          setLoginEmail(emailLower);
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setRegRole('Writer');
        } else {
          onAddToast(data.error || 'Could not complete registration request.', 'error');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      onAddToast(`${err.message || 'Network error'} ${err.code ? `(Code: ${err.code})` : ''}`, 'error');
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
      onAddToast('Registration Error: System access is strictly restricted to employees with an official @travelradar.aero email address.', 'warning');
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
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20a6eb] via-cyan-500 to-[#363636]" />

      {/* Floating decorative gradient blurs to match the home/landing atmospheric design */}
      <div className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
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
          <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">
            {portalType === 'admin' && 'Administrator Control Room Portal'}
            {portalType === 'developer' && 'Content Developer Space Gate'}
            {portalType === 'all' && 'Secure Personnel Authentication Desk'}
          </p>
          {portalType === 'admin' && (
            <p className="text-[10px] bg-red-50 text-red-700 border border-red-100 p-2 py-1.5 rounded-xl text-center font-sans tracking-normal leading-normal">
              ⚠️ Self-registration is disabled at this security gateway. System Admins must be enrolled via directory control.
            </p>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase flex items-center gap-1 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to home</span>
            </button>
          )}
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
            {portalType !== 'admin' && (
              <button
                onClick={() => { setActiveTab('register'); }}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${activeTab === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {portalType === 'all' ? 'Join Travel Radar' : 'Request Access'}
              </button>
            )}
          </div>
        )}

        {/* SIGN IN WRAPPER */}
        {activeTab === 'signin' && (
          <form onSubmit={handleLogin} className="space-y-4" id="signin-shell">
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#20a6eb]" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 font-bold transition-all shadow-6xs"
                  id="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#20a6eb]" />
                  <span>Security Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); setResetStep(1); }}
                  className="text-[10px] text-[#20a6eb] hover:text-cyan-500 font-mono font-bold hover:underline"
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
              className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-cyan-500 hover:scale-102 active:scale-98 text-white font-extrabold tracking-wide text-xs uppercase rounded-xl shadow-lg shadow-sky-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2 border-0"
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
                <span>{isVisitorMode ? 'Your Email Address' : 'Operational Enterprise Email'}</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={isVisitorMode ? 'e.g. you@gmail.com' : 'e.g. name@travelradar.aero'}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] focus:ring-2 focus:ring-[#20a6eb]/10 font-bold transition-all shadow-6xs animate-fadeIn"
                  id="reg-email-input"
                />
              </div>
              {!isVisitorMode && (
                <p className="text-[9px] text-slate-450 leading-normal pl-0.5 pt-0.5">Note: Registration requires an official @travelradar.aero email account.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1 font-sans">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Account Type</label>
                <div className="relative">
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-250 text-slate-800 rounded-xl p-3 text-xs outline-none focus:border-[#20a6eb] font-mono font-extrabold appearance-none shadow-6xs"
                    style={{ backgroundImage: 'none' }}
                    id="reg-role-select"
                  >
                    <option value="Visitor">Community Visitor</option>
                    {portalType !== 'developer' && <>
                      <option value="Writer">Writer</option>
                      <option value="Editor">Editor</option>
                      <option value="Senior Editor">Senior Editor</option>
                      <option value="Quality Checker">Quality Checker</option>
                      <option value="Publisher">Publisher</option>
                    </>}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Password</label>
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

            {/* Visitor preferences */}
            {isVisitorMode && (
              <div className="space-y-3 bg-sky-50 border border-sky-200/60 p-3.5 rounded-2xl text-left">
                <p className="text-[10px] font-black text-[#20a6eb] uppercase tracking-wider">Community Preferences</p>
                <div className="space-y-2">
                  {[
                    { label: '📧 Newsletter & Breaking News Alerts', value: visNewsletter, set: setVisNewsletter },
                    { label: '💬 WhatsApp Community Updates', value: visWhatsApp, set: setVisWhatsApp },
                    { label: '👥 Social Media Groups (Facebook, LinkedIn)', value: visGroups, set: setVisGroups },
                  ].map(({ label, value, set }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => set(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#20a6eb] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-700 font-semibold">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Profile Visibility</label>
                  <select
                    value={visVisibility}
                    onChange={(e) => setVisVisibility(e.target.value as 'Public' | 'Private' | 'Anonymous')}
                    className="w-full bg-white border border-sky-200 text-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-[#20a6eb] font-mono font-bold appearance-none"
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="Public">Public — Visible to community</option>
                    <option value="Private">Private — Admins only</option>
                    <option value="Anonymous">Anonymous — Fully hidden</option>
                  </select>
                </div>
              </div>
            )}

            {isVisitorMode ? (
              <p className="text-[9px] text-[#20a6eb] leading-snug bg-sky-50 border border-sky-200/60 p-2.5 rounded-xl text-left">
                🌐 <strong>Join the Community:</strong> Create your public reader profile to subscribe to newsletters, join groups, and manage your Travel Radar visibility.
              </p>
            ) : (
              <p className="text-[9px] text-[#20a6eb] leading-snug bg-sky-50 border border-sky-200/60 p-2.5 rounded-xl text-left">
                ⚡ <strong>Instant Access Enabled:</strong> Your account will be activated immediately upon registration.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-cyan-500 text-white font-extrabold tracking-wide text-xs uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/15 flex items-center justify-center gap-1.5 border-0"
              id="register-submit-btn"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
              <span>{isVisitorMode ? 'Join Travel Radar' : 'Request Dashboard Access'}</span>
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
                    placeholder="alisha.v@travelradar.aero"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#20a6eb] transition-all"
                    id="forgot-email-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-cyan-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-0"
                  id="forgot-submit-btn"
                >
                  {isLoading ? 'Processing security clearance...' : 'Request Validation Key'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4 animate-fadeIn">
                {simulatedPin && (
                  <div className="bg-sky-50 border border-sky-200/80 p-3.5 rounded-2xl text-left space-y-1 font-mono">
                    <p className="text-[9px] text-[#20a6eb] font-black uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#20a6eb] animate-pulse" />
                      <span>Security Router Callback Received</span>
                    </p>
                    <p className="text-slate-600 text-[10px] leading-snug pb-1">Bypassing actual SMTP delivery. Direct Firebase pin sequence callback:</p>
                    <div className="bg-white border border-sky-200/50 p-2.5 rounded-xl text-center shadow-inner">
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
                  className="w-full py-3.5 bg-gradient-to-r from-[#20a6eb] to-cyan-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-0"
                  id="reset-confirm-submit-btn"
                >
                  {isLoading ? 'Updating safety indexes...' : 'Upgrade Password Credentials'}
                </button>
              </form>
            )}
          </div>
        )}



        {/* Diagnostics Module (Only visible if standalone or in specific debug mode) */}
        {isStandalone() && (
          <div className="mt-8 pt-4 border-t border-slate-100 text-[9px] text-slate-400 font-mono space-y-1">
            <p className="uppercase font-bold text-slate-500">Standalone Diagnostics</p>
            <p>Host: {window.location.hostname}</p>
            <p>Supabase URL: {supabaseUrl}</p>
            <p>Anon Key Status: {supabaseAnonKey.length > 50 ? '✅ LOADED' : '❌ INVALID/MISSING'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
