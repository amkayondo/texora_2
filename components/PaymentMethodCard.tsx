import React from 'react';
import { Building2, Smartphone, Check, Trash2 } from 'lucide-react';
import { PaymentMethod, PaymentMethodType } from '../types';
import { Button } from './Button';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (methodId: string) => void;
  onDelete: (methodId: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, onSetDefault, onDelete }) => {
  const isBankAccount = method.type === PaymentMethodType.BANK_ACCOUNT;

  const maskAccountNumber = (accountNumber?: string) => {
    if (!accountNumber) return '';
    return `****${accountNumber.slice(-4)}`;
  };

  const maskPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    // Format: 256XX XXX 1234
    return `${phone.slice(0, 5)}XX XXX ${phone.slice(-4)}`;
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${
            isBankAccount
              ? 'bg-blue-950/50 text-blue-400'
              : method.mobileProvider === 'MTN_MOBILE_MONEY'
                ? 'bg-yellow-950/50 text-yellow-400'
                : 'bg-red-950/50 text-red-400'
          }`}>
            {isBankAccount ? <Building2 size={20} /> : <Smartphone size={20} />}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-white">
                {isBankAccount
                  ? method.bankName
                  : method.mobileProvider?.replace('_', ' ')}
              </p>
              {method.isDefault && (
                <span className="text-xs px-2 py-0.5 bg-indigo-950/50 text-indigo-400 rounded flex items-center gap-1">
                  <Check size={12} />
                  Default
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-400">
              {isBankAccount ? (
                <>
                  {maskAccountNumber(method.accountNumber)} • {method.accountName}
                  {method.branchName && (
                    <span className="text-zinc-500"> • {method.branchName}</span>
                  )}
                </>
              ) : (
                <>
                  {maskPhoneNumber(method.phoneNumber)}
                  {method.registeredName && (
                    <span> • {method.registeredName}</span>
                  )}
                </>
              )}
            </p>

            <p className="text-xs text-zinc-500 mt-1">
              Added {new Date(method.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-3">
          {!method.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(method.id)}
              className="text-xs"
            >
              Set Default
            </Button>
          )}
          <button
            onClick={() => onDelete(method.id)}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-all"
            title="Delete payment method"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
