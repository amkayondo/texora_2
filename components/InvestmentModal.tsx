import React, { useState } from 'react';
import { X, Check, Loader, TrendingUp, Briefcase, Target } from 'lucide-react';
import { Project } from '../types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentBalance: number;
  onInvest: (projectId: string, amount: number) => Promise<boolean>;
}

type Step = 'enter-amount' | 'confirm' | 'processing' | 'success';

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  project,
  currentBalance,
  onInvest
}) => {
  const [step, setStep] = useState<Step>('enter-amount');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  if (!isOpen) return null;

  const numericAmount = parseInt(amount.replace(/,/g, '') || '0');
  const fundingRemaining = project.fundingGoal - project.currentFunding;
  const maxAmount = Math.min(currentBalance, fundingRemaining);

  const handleAmountSubmit = () => {
    if (numericAmount > 0 && numericAmount <= maxAmount) {
      setStep('confirm');
    }
  };

  const handleConfirmInvestment = async () => {
    setStep('processing');
    setIsProcessing(true);

    try {
      const success = await onInvest(project.id, numericAmount);

      if (success) {
        // Simulate transaction hash generation
        const hash = `0x${Math.random().toString(16).substr(2, 40)}`;
        setTxHash(hash);

        setTimeout(() => {
          setIsProcessing(false);
          setStep('success');
          toast.success(`Investment of UGX ${numericAmount.toLocaleString()} successful!`, {
            description: `Invested in ${project.title}`
          });
        }, 2000);
      } else {
        setIsProcessing(false);
        setStep('enter-amount');
        toast.error('Investment failed', {
          description: 'Please check your balance and try again'
        });
      }
    } catch (error) {
      setIsProcessing(false);
      setStep('enter-amount');
      toast.error('Transaction error', {
        description: 'An unexpected error occurred. Please try again.'
      });
    }
  };

  const handleClose = () => {
    setStep('enter-amount');
    setAmount('');
    setIsProcessing(false);
    setTxHash('');
    onClose();
  };

  const formatAmount = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const setQuickAmount = (percent: number) => {
    const targetAmount = Math.floor(fundingRemaining * percent / 100);
    const actualAmount = Math.min(targetAmount, currentBalance);
    setAmount(formatAmount(actualAmount.toString()));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/50 rounded-lg">
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Fund Project</h2>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Project Summary */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-800/30">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center flex-shrink-0">
              <Briefcase size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-1 truncate">{project.title}</h3>
              <p className="text-xs text-zinc-400 mb-2">{project.category}</p>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">Goal: </span>
                  <span className="text-white font-medium">UGX {project.fundingGoal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Raised: </span>
                  <span className="text-emerald-400 font-medium">UGX {project.currentFunding.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Enter Amount */}
        {step === 'enter-amount' && (
          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Investment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">UGX</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  placeholder="0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 pl-14 text-lg font-bold text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-zinc-500">Enter any amount</p>
                <p className="text-xs text-zinc-400">Available: UGX {currentBalance.toLocaleString()}</p>
              </div>
              {numericAmount > currentBalance && (
                <p className="text-xs text-red-400 mt-1">Insufficient balance</p>
              )}
              {numericAmount > fundingRemaining && (
                <p className="text-xs text-amber-400 mt-1">Amount exceeds funding needed (UGX {fundingRemaining.toLocaleString()})</p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-2 block">
                Quick Select (% of remaining goal)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map(percent => {
                  const quickAmount = Math.floor(fundingRemaining * percent / 100);
                  const isDisabled = quickAmount > currentBalance;

                  return (
                    <button
                      key={percent}
                      onClick={() => !isDisabled && setQuickAmount(percent)}
                      disabled={isDisabled}
                      className={`py-2 px-3 rounded text-sm border transition-all ${
                        isDisabled
                          ? 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                          : 'bg-zinc-800 hover:bg-emerald-950/30 hover:border-emerald-700 text-white border-zinc-700'
                      }`}
                    >
                      {percent}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Funding Needed Info */}
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-emerald-500" size={16} />
                <span className="text-sm font-medium text-white">Funding Needed</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                UGX {fundingRemaining.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {Math.round((project.currentFunding / project.fundingGoal) * 100)}% funded
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                onClick={handleAmountSubmit}
                disabled={numericAmount <= 0 || numericAmount > maxAmount}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 'confirm' && (
          <div className="p-6 space-y-6">
            <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Investment Amount</span>
                <span className="font-bold text-white">UGX {numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Project</span>
                <span className="text-white truncate ml-4">{project.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Your New Balance</span>
                <span className="text-white">UGX {(currentBalance - numericAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Transaction Type</span>
                <span className="text-white">Investment</span>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3">
              <p className="text-xs text-emerald-400">
                Your investment will be locked in the smart contract and released to the creator as they complete verified milestones.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('enter-amount')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                onClick={handleConfirmInvestment}
              >
                Confirm Investment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="p-6">
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-4 text-emerald-500" size={48} />
              <h3 className="text-lg font-bold text-white mb-2">Processing Investment...</h3>
              <p className="text-sm text-zinc-400">Confirming transaction on the blockchain</p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-950/50 flex items-center justify-center">
                <Check className="text-emerald-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Investment Successful!</h3>
              <p className="text-sm text-zinc-400 mb-6">
                You've invested UGX {numericAmount.toLocaleString()} in {project.title}
              </p>

              {/* Transaction Details */}
              <div className="bg-zinc-800 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-zinc-500">Transaction Hash</p>
                    <p className="text-xs font-mono text-emerald-400 break-all">{txHash}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-700">
                    <span className="text-xs text-zinc-500">Status</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-900/50 text-emerald-400 rounded">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Done
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  onClick={handleClose}
                >
                  View Portfolio
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
