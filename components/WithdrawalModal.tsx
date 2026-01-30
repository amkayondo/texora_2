import React, { useState } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { useApp } from '../AppContext';
import { PaymentMethod, PaymentMethodType } from '../types';
import { Button } from './Button';
import { PaymentMethodForm } from './PaymentMethodForm';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

type Step = 'select-method' | 'enter-amount' | 'confirm' | 'processing';

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const { getPaymentMethodsByUser, currentUser, initiateWithdrawal, addPaymentMethod } = useApp();

  const [step, setStep] = useState<Step>('select-method');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const paymentMethods = getPaymentMethodsByUser(currentUser.id);
  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
  const numericAmount = parseInt(amount.replace(/,/g, '') || '0');
  const minAmount = 10000; // UGX 10,000

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethodId(methodId);
    setStep('enter-amount');
  };

  const handleAddPaymentMethod = (method: any) => {
    addPaymentMethod(method);
    setShowAddMethod(false);
  };

  const handleAmountSubmit = () => {
    if (numericAmount >= minAmount && numericAmount <= currentBalance) {
      setStep('confirm');
    }
  };

  const handleConfirmWithdrawal = async () => {
    setStep('processing');
    setIsProcessing(true);

    const success = await initiateWithdrawal(numericAmount, selectedMethodId);

    if (success) {
      setTimeout(() => {
        setIsProcessing(false);
        setWithdrawalSuccess(true);
      }, 2000);
    }
  };

  const handleClose = () => {
    setStep('select-method');
    setSelectedMethodId('');
    setAmount('');
    setShowAddMethod(false);
    setIsProcessing(false);
    setWithdrawalSuccess(false);
    onClose();
  };

  const formatAmount = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Select Payment Method */}
        {step === 'select-method' && !showAddMethod && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-zinc-400">Select a payment method to withdraw your funds</p>

            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    className="w-full p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 hover:border-indigo-500 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {method.type === PaymentMethodType.BANK_ACCOUNT
                            ? method.bankName
                            : `${method.mobileProvider}`}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {method.type === PaymentMethodType.BANK_ACCOUNT
                            ? `****${method.accountNumber?.slice(-4)} • ${method.accountName}`
                            : `${method.phoneNumber?.slice(0, 5)}XX XXX ${method.phoneNumber?.slice(-4)}`}
                        </p>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs px-2 py-1 bg-indigo-950/50 text-indigo-400 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p>No payment methods added yet</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddMethod(true)}
            >
              + Add New Payment Method
            </Button>
          </div>
        )}

        {/* Add Payment Method Form */}
        {showAddMethod && (
          <div className="p-6">
            <PaymentMethodForm
              userId={currentUser.id}
              onSubmit={handleAddPaymentMethod}
              onCancel={() => setShowAddMethod(false)}
            />
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 'enter-amount' && (
          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">UGX</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  placeholder="0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 pl-14 text-lg font-bold text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-zinc-500">Minimum: UGX 10,000</p>
                <p className="text-xs text-zinc-400">Available: UGX {currentBalance.toLocaleString()}</p>
              </div>
              {numericAmount > currentBalance && (
                <p className="text-xs text-red-400 mt-1">Insufficient balance</p>
              )}
              {numericAmount < minAmount && numericAmount > 0 && (
                <p className="text-xs text-red-400 mt-1">Amount below minimum</p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(percent => (
                <button
                  key={percent}
                  onClick={() => setAmount(formatAmount(Math.floor(currentBalance * percent / 100).toString()))}
                  className="py-2 px-3 bg-zinc-800 hover:bg-zinc-750 rounded text-sm text-white border border-zinc-700"
                >
                  {percent}%
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('select-method')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                onClick={handleAmountSubmit}
                disabled={numericAmount < minAmount || numericAmount > currentBalance}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedMethod && (
          <div className="p-6 space-y-6">
            <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Withdrawal Amount</span>
                <span className="font-bold text-white">UGX {numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Method</span>
                <span className="text-white">
                  {selectedMethod.type === PaymentMethodType.BANK_ACCOUNT
                    ? selectedMethod.bankName
                    : selectedMethod.mobileProvider}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Processing Time</span>
                <span className="text-white">Usually 2-3 minutes</span>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
              <p className="text-xs text-amber-400">
                Your balance will be deducted once the withdrawal is completed
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('enter-amount')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                onClick={handleConfirmWithdrawal}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Processing */}
        {step === 'processing' && (
          <div className="p-6">
            <div className="text-center py-8">
              {isProcessing ? (
                <>
                  <Loader className="animate-spin mx-auto mb-4 text-indigo-500" size={48} />
                  <h3 className="text-lg font-bold text-white mb-2">Processing Withdrawal...</h3>
                  <p className="text-sm text-zinc-400">Please wait while we process your request</p>
                </>
              ) : withdrawalSuccess ? (
                <>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-950/50 flex items-center justify-center">
                    <Check className="text-emerald-500" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Withdrawal Initiated!</h3>
                  <p className="text-sm text-zinc-400 mb-6">
                    UGX {numericAmount.toLocaleString()} is being sent to your {selectedMethod?.type === PaymentMethodType.BANK_ACCOUNT ? 'bank account' : 'mobile money'}
                  </p>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                    onClick={handleClose}
                  >
                    Done
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
