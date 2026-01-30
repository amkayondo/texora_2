import React, { useState } from 'react';
import { PaymentMethodType, MobileMoneyProvider, UgandanBank } from '../types';
import { Button } from './Button';
import { Input } from './Input';

interface PaymentMethodFormProps {
  onSubmit: (method: {
    userId: string;
    type: PaymentMethodType;
    isDefault: boolean;
    bankName?: UgandanBank;
    accountNumber?: string;
    accountName?: string;
    branchName?: string;
    mobileProvider?: MobileMoneyProvider;
    phoneNumber?: string;
    registeredName?: string;
  }) => void;
  onCancel: () => void;
  userId: string;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSubmit, onCancel, userId }) => {
  const [methodType, setMethodType] = useState<PaymentMethodType>(PaymentMethodType.MOBILE_MONEY);

  // Bank Account Fields
  const [bankName, setBankName] = useState<UgandanBank>(UgandanBank.STANBIC);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [branchName, setBranchName] = useState('');

  // Mobile Money Fields
  const [mobileProvider, setMobileProvider] = useState<MobileMoneyProvider>(MobileMoneyProvider.MTN);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registeredName, setRegisteredName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (methodType === PaymentMethodType.BANK_ACCOUNT) {
      if (!accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      } else if (!/^\d{10,16}$/.test(accountNumber)) {
        newErrors.accountNumber = 'Account number must be 10-16 digits';
      }
      if (!accountName) {
        newErrors.accountName = 'Account name is required';
      }
    } else {
      if (!phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^256\d{9}$/.test(phoneNumber)) {
        newErrors.phoneNumber = 'Phone must be in format: 256XXXXXXXXX';
      }
      if (!registeredName) {
        newErrors.registeredName = 'Registered name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      userId,
      type: methodType,
      isDefault: false,
      ...(methodType === PaymentMethodType.BANK_ACCOUNT
        ? { bankName, accountNumber, accountName, branchName: branchName || undefined }
        : { mobileProvider, phoneNumber, registeredName }
      )
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Type Selector */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-3 block">Payment Method Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethodType(PaymentMethodType.MOBILE_MONEY)}
            className={`p-4 rounded-lg border-2 transition-all ${
              methodType === PaymentMethodType.MOBILE_MONEY
                ? 'border-indigo-500 bg-indigo-950/50'
                : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
            }`}
          >
            <div className="text-center">
              <p className="font-bold text-white mb-1">Mobile Money</p>
              <p className="text-xs text-zinc-400">MTN or Airtel</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMethodType(PaymentMethodType.BANK_ACCOUNT)}
            className={`p-4 rounded-lg border-2 transition-all ${
              methodType === PaymentMethodType.BANK_ACCOUNT
                ? 'border-indigo-500 bg-indigo-950/50'
                : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
            }`}
          >
            <div className="text-center">
              <p className="font-bold text-white mb-1">Bank Account</p>
              <p className="text-xs text-zinc-400">Local bank</p>
            </div>
          </button>
        </div>
      </div>

      {/* Bank Account Form */}
      {methodType === PaymentMethodType.BANK_ACCOUNT && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Bank Name</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value as UgandanBank)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
            >
              {Object.values(UgandanBank).map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="9040012345678"
              maxLength={16}
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-400 mt-1">{errors.accountNumber}</p>
            )}
          </div>

          <div>
            <Input
              label="Account Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Organization or Individual Name"
            />
            {errors.accountName && (
              <p className="text-xs text-red-400 mt-1">{errors.accountName}</p>
            )}
          </div>

          <div>
            <Input
              label="Branch Name (Optional)"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g., Kampala Road Branch"
            />
          </div>
        </div>
      )}

      {/* Mobile Money Form */}
      {methodType === PaymentMethodType.MOBILE_MONEY && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Mobile Money Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMobileProvider(MobileMoneyProvider.MTN)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mobileProvider === MobileMoneyProvider.MTN
                    ? 'border-yellow-500 bg-yellow-950/30'
                    : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                }`}
              >
                <p className="font-bold text-white">MTN Mobile Money</p>
              </button>
              <button
                type="button"
                onClick={() => setMobileProvider(MobileMoneyProvider.AIRTEL)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mobileProvider === MobileMoneyProvider.AIRTEL
                    ? 'border-red-500 bg-red-950/30'
                    : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                }`}
              >
                <p className="font-bold text-white">Airtel Money</p>
              </button>
            </div>
          </div>

          <div>
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="256772123456"
              maxLength={12}
            />
            <p className="text-xs text-zinc-500 mt-1">Format: 256XXXXXXXXX (no spaces)</p>
            {errors.phoneNumber && (
              <p className="text-xs text-red-400 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <Input
              label="Registered Name"
              value={registeredName}
              onChange={(e) => setRegisteredName(e.target.value)}
              placeholder="Name on mobile money account"
            />
            {errors.registeredName && (
              <p className="text-xs text-red-400 mt-1">{errors.registeredName}</p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
          Add Payment Method
        </Button>
      </div>
    </form>
  );
};
