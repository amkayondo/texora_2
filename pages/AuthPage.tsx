import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, User, ArrowRight, ShieldCheck, AlertTriangle, Fingerprint, Loader2, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useApp();
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'intro' | 'login' | 'verify'>('intro');
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Demo Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  // Verification Logic
  const handleLogin = () => {
     if (!role) return;
     setStep('verify');
     // Simulate Verification Process
     let progress = 0;
     const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
           progress = 100;
           clearInterval(interval);
           setTimeout(() => {
               login(role);
           }, 800);
        }
        setVerificationProgress(progress);
     }, 300);
  };

  const setDemo = (type: UserRole) => {
      setRole(type);
      if (type === UserRole.CREATOR) {
          setEmail('alice@texora.demo');
          setPassword('creator_pass_123');
      } else {
          setEmail('bob@texora.demo');
          setPassword('investor_pass_456');
      }
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
                    <Loader2 size={14} className="animate-spin text-zinc-500 ml-auto" />
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
                            <Loader2 size={14} className="animate-spin text-zinc-500 ml-auto" />
                          )}
                        </div>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Hero & Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-card border-r border-border overflow-hidden">
        {/* Updated Image to Gradient */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card"></div>
        
        <div className="relative z-10">
          <div className="mb-8">
             <span className="text-2xl font-bold tracking-tight text-foreground">Texora</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Fund Ideas. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Build Trust.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mb-8">
            Connect with donors, get matched by AI, and bring your projects to life with milestone-based funding.
          </p>
          <div className="space-y-3 text-zinc-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>AI-powered donor matching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Milestone-based fund release</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Transparent & verifiable</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-600">
          © 2026 Texora. All rights reserved.
        </div>
      
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Access Texora</h2>
            <p className="mt-2 text-muted-foreground">Continue as a creator or investor.</p>
          </div>

          <div className="space-y-6">
             {!role ? (
               <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setDemo(UserRole.CREATOR)}
                    className="flex items-center p-4 border border-border rounded-xl hover:bg-muted hover:border-blue-500/50 transition-all group text-left relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-primary-foreground transition-colors">
                        <Briefcase size={24} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-foreground">Continue as Creator</h3>
                        <p className="text-xs text-muted-foreground">Launch projects & receive funding</p>
                     </div>
                     <ArrowRight className="ml-auto text-muted-foreground group-hover:text-foreground" size={20} />
                  </button>

                  <button 
                    onClick={() => setDemo(UserRole.DONOR)}
                    className="flex items-center p-4 border border-border rounded-xl hover:bg-muted hover:border-emerald-500/50 transition-all group text-left relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mr-4 group-hover:bg-emerald-500 group-hover:text-primary-foreground transition-colors">
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

                    <div className="bg-muted/50 p-4 rounded-lg border border-border mb-6">
                        <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Demo Credentials Auto-Filled</p>
                        <div className="flex justify-between items-center text-sm text-zinc-300 font-mono">
                            <span>{email}</span>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        </div>
                    </div>

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
                    
                    <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20" onClick={handleLogin}>
                       Login
                    </Button>
                    
                    <p className="text-center text-sm text-zinc-500">
                      Don't have an account? <button className="text-blue-400 hover:text-blue-300 transition-colors">Create account</button>
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