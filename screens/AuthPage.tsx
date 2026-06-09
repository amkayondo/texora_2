import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, User, ArrowRight, ShieldCheck, AlertTriangle, Fingerprint, Loader2, CheckCircle2 } from 'lucide-react';

const DEMO_PASSWORD = 'TexoraDemo123!';
const DEMO_ACCOUNTS = {
  [UserRole.CREATOR]: {
    label: 'Creator demo',
    email: 'creator@texora.demo',
    password: DEMO_PASSWORD,
  },
  [UserRole.DONOR]: {
    label: 'Investor demo',
    email: 'donor@texora.demo',
    password: DEMO_PASSWORD,
  },
};

export const AuthPage: React.FC = () => {
  const { login } = useApp();
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'intro' | 'login' | 'verify'>('intro');
  const [verificationProgress, setVerificationProgress] = useState(0);

  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Intro Animation - step through connection phases
  const [connectionStep, setConnectionStep] = useState(0);
  
  useEffect(() => {
    const steps = [1, 2, 3, 4];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setConnectionStep(steps[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStep('login'), 600);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
     if (!role) return;
     setAuthError('');
     setStep('verify');
     setVerificationProgress(5);

     const interval = setInterval(() => {
        setVerificationProgress((current) => Math.min(current + 12, 92));
     }, 300);

     try {
        await login(role, email.trim(), password, authMode, name.trim());
        setVerificationProgress(100);
     } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');
        setVerificationProgress(0);
        setStep('login');
     } finally {
        clearInterval(interval);
     }
  };

  const selectRole = (type: UserRole) => {
      setRole(type);
      setAuthError('');
  };

  const useDemoAccount = (type: UserRole) => {
      const account = DEMO_ACCOUNTS[type];
      setRole(type);
      setAuthMode('sign-in');
      setName('');
      setEmail(account.email);
      setPassword(account.password);
      setAuthError('');
  };

  if (step === 'intro') {
      const steps = [
        { id: 1, label: 'Connecting to blockchain' },
        { id: 2, label: 'Initializing secure session' },
        { id: 3, label: 'Verifying network status' },
        { id: 4, label: 'Loading protocol' },
      ];

      return (
        <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
          <div className="w-full max-w-xs space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center mb-12">
              <span className="text-2xl font-semibold text-foreground">Texora</span>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    connectionStep >= s.id 
                      ? 'bg-primary' 
                      : 'border border-border'
                  }`}>
                    {connectionStep >= s.id && (
                      <CheckCircle2 size={14} className="text-primary-foreground" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${
                    connectionStep >= s.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {s.label}
                  </span>
                  {connectionStep === s.id - 1 && (
                    <Loader2 size={14} className="animate-spin text-muted-foreground ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }

  if (step === 'verify') {
      const verifySteps = [
        { id: 1, label: 'Authenticating credentials', threshold: 20 },
        { id: 2, label: 'Loading your profile', threshold: 50 },
        { id: 3, label: 'Preparing dashboard', threshold: 80 },
      ];

      return (
          <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
              <div className="w-full max-w-xs space-y-8">
                  <div className="text-center mb-12">
                      <span className="text-2xl font-semibold text-foreground">Texora</span>
                  </div>

                  <div className="space-y-4">
                      {verifySteps.map((s) => (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                            verificationProgress > s.threshold 
                              ? 'bg-primary' 
                              : 'border border-border'
                          }`}>
                            {verificationProgress > s.threshold && (
                              <CheckCircle2 size={14} className="text-primary-foreground" />
                            )}
                          </div>
                          <span className={`text-sm transition-colors duration-300 ${
                            verificationProgress > s.threshold ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {s.label}
                          </span>
                          {verificationProgress <= s.threshold && verificationProgress > (s.threshold - 30) && (
                            <Loader2 size={14} className="animate-spin text-muted-foreground ml-auto" />
                          )}
                        </div>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] bg-background">
      {/* Left: Hero & Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-card border-r border-border overflow-hidden">
        <div className="absolute inset-6 rounded-[2rem] border border-border bg-muted/50"></div>
        
        <div className="relative z-10">
          <div className="mb-8">
             <span className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">Texora</span>
          </div>
          <h1 className="text-6xl font-semibold tracking-normal text-foreground leading-[0.98] mb-6">
            Fund ideas with visible proof.
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mb-8">
            Connect with donors, get matched by AI, and bring your projects to life with milestone-based funding.
          </p>
          <div className="grid max-w-xl grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="fluid-rail flex items-center gap-3 px-4 py-3">
              <CheckCircle2 size={16} className="text-foreground" />
              <span>AI-powered donor matching</span>
            </div>
            <div className="fluid-rail flex items-center gap-3 px-4 py-3">
              <CheckCircle2 size={16} className="text-foreground" />
              <span>Milestone-based fund release</span>
            </div>
            <div className="fluid-rail flex items-center gap-3 px-4 py-3">
              <CheckCircle2 size={16} className="text-foreground" />
              <span>Transparent & verifiable</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © 2026 Texora. All rights reserved.
        </div>
      
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-semibold tracking-normal text-foreground">Access Texora</h2>
            <p className="mt-2 text-muted-foreground">Continue as a creator or investor.</p>
          </div>

          <div className="space-y-6">
             {!role ? (
               <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => selectRole(UserRole.CREATOR)}
                    className="fluid-panel fluid-hover flex items-center p-4 group text-left"
                  >
                     <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 transition-colors">
                        <Briefcase size={24} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-foreground">Continue as Creator</h3>
                        <p className="text-xs text-muted-foreground">Launch projects & receive funding</p>
                     </div>
                     <ArrowRight className="ml-auto text-muted-foreground group-hover:text-foreground" size={20} />
                  </button>

                  <button 
                    onClick={() => selectRole(UserRole.DONOR)}
                    className="fluid-panel fluid-hover flex items-center p-4 group text-left"
                  >
                     <div className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mr-4 transition-colors">
                        <User size={24} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-foreground">Continue as Investor</h3>
                        <p className="text-xs text-muted-foreground">Fund projects & track progress</p>
                     </div>
                     <ArrowRight className="ml-auto text-muted-foreground group-hover:text-foreground" size={20} />
                  </button>
               </div>
             ) : (
               <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="space-y-4">
                    <button 
                      onClick={() => setRole(null)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      ← Back
                    </button>

                    <div className="fluid-rail p-4 mb-6">
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-[0.08em] mb-2">
                          {role === UserRole.CREATOR ? 'Creator' : 'Investor'} account
                        </p>
                        <div className="flex justify-between items-center text-sm text-foreground">
                            <span>{authMode === 'sign-in' ? 'Sign in with your account' : 'Create a new account'}</span>
                            <span className="h-2 w-2 rounded-full bg-foreground"></span>
                        </div>
                    </div>

                    {authMode === 'sign-in' && (
                      <div className="fluid-rail space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                              {DEMO_ACCOUNTS[role].label}
                            </p>
                            <p className="mt-1 break-all font-mono text-sm text-foreground">{DEMO_ACCOUNTS[role].email}</p>
                            <p className="font-mono text-xs text-muted-foreground">{DEMO_ACCOUNTS[role].password}</p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => useDemoAccount(role)}
                            className="shrink-0"
                          >
                            Use demo
                          </Button>
                        </div>
                      </div>
                    )}

                    {authMode === 'sign-up' && (
                      <Input
                          label="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                      />
                    )}
                    <Input 
                        label="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="font-mono"
                    />
                    <Input 
                        label="Password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                    />

                    {authError && (
                      <div className="fluid-rail border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                        {authError}
                      </div>
                    )}
                    
                    <Button className="w-full h-12 text-base" onClick={handleLogin} disabled={!email || !password || (authMode === 'sign-up' && !name)}>
                       {authMode === 'sign-in' ? 'Login' : 'Create account'}
                    </Button>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      {authMode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}{' '}
                      <button
                        className="text-foreground hover:underline transition-colors"
                        onClick={() => {
                          setAuthError('');
                          setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in');
                        }}
                      >
                        {authMode === 'sign-in' ? 'Create account' : 'Login'}
                      </button>
                    </p>
                  </div>
               </div>
             )}
          </div>
          
          <div className="border-t border-border pt-6 mt-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldCheck size={12}/> Secure Connection</span>
                  <span>Texora Protocol v1.0.4</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
