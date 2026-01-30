import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, UserRole, MilestoneStatus, Transaction, TransactionType, TransactionStatus, Investment, PaymentMethod, WithdrawalRequest, ConnectionRequest, ConnectionStatus } from './types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_TRANSACTIONS, MOCK_INVESTMENTS, MOCK_PAYMENT_METHODS } from './constants';

interface AppContextType {
  currentUser: User | null;
  projects: Project[];
  users: User[];
  transactions: Transaction[];
  investments: Investment[];
  paymentMethods: PaymentMethod[];
  withdrawalRequests: WithdrawalRequest[];
  connectionRequests: ConnectionRequest[];

  login: (role: UserRole) => void;
  logout: () => void;
  addProject: (project: Project) => void;
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: MilestoneStatus, proofUrl?: string) => Promise<void>;
  simulateReleaseFunds: (projectId: string, milestoneId: string) => Promise<boolean>;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  getTransactionsByUser: (userId: string) => Transaction[];
  getInvestmentsByDonor: (donorId: string) => Investment[];

  // Payment methods
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => void;
  updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
  getPaymentMethodsByUser: (userId: string) => PaymentMethod[];

  // Withdrawals
  initiateWithdrawal: (amount: number, paymentMethodId: string) => Promise<boolean>;

  // Connections
  sendConnectionRequest: (donorId: string, message?: string) => void;
  getConnectionStatus: (creatorId: string, donorId: string) => ConnectionStatus;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);

  const login = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  // Simulate Web3 Interaction: Update blockchain state (mock)
  const updateMilestoneStatus = async (projectId: string, milestoneId: string, status: MilestoneStatus, proofUrl?: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency

    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        milestones: p.milestones.map(m => {
            if (m.id !== milestoneId) return m;
            return { ...m, status, proofDocumentUrl: proofUrl || m.proofDocumentUrl };
        })
      };
    }));
  };

  // Simulate Web3 Smart Contract Fund Release
  const simulateReleaseFunds = async (projectId: string, milestoneId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction confirm

    const project = projects.find(p => p.id === projectId);
    const milestone = project?.milestones.find(m => m.id === milestoneId);
    if (!project || !milestone) return false;

    const creator = users.find(u => u.id === project.creatorId);
    if (!creator) return false;

    // 1. Update project funding
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        currentFunding: p.currentFunding + milestone.amount,
        milestones: p.milestones.map(m =>
          m.id === milestoneId ? { ...m, status: MilestoneStatus.APPROVED } : m
        )
      };
    }));

    // 2. Update creator balance
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === project.creatorId) {
        return { ...u, balance: u.balance + milestone.amount };
      }
      return u;
    }));

    // 3. Create transaction record
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      userId: creator.id,
      type: TransactionType.FUND_RELEASE,
      amount: milestone.amount,
      projectId: projectId,
      milestoneId: milestoneId,
      counterparty: `Milestone: ${milestone.title}`,
      date: new Date().toISOString(),
      status: TransactionStatus.COMPLETED,
      txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
      description: `Fund release for "${milestone.title}"`
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // 4. Update currentUser if they're the creator
    if (currentUser?.id === creator.id) {
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + milestone.amount } : null);
    }

    return true;
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers(prevUsers => prevUsers.map(u =>
      u.id === userId ? { ...u, ...updates } : u
    ));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const getTransactionsByUser = (userId: string) => {
    return transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getInvestmentsByDonor = (donorId: string) => {
    return investments.filter(inv => inv.donorId === donorId);
  };

  // Payment Method Management
  const addPaymentMethod = (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDefault: paymentMethods.filter(pm => pm.userId === method.userId).length === 0
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const updatePaymentMethod = (methodId: string, updates: Partial<PaymentMethod>) => {
    setPaymentMethods(prev => prev.map(pm =>
      pm.id === methodId ? { ...pm, ...updates } : pm
    ));
  };

  const deletePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(pm => pm.id === methodId);
    if (!method) return;

    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.userId === method.userId ? pm.id === methodId : pm.isDefault
    })));
  };

  const getPaymentMethodsByUser = (userId: string) => {
    return paymentMethods.filter(pm => pm.userId === userId);
  };

  // Withdrawal Management
  const initiateWithdrawal = async (amount: number, paymentMethodId: string): Promise<boolean> => {
    if (!currentUser || amount <= 0 || amount > currentUser.balance) {
      return false;
    }

    const paymentMethod = paymentMethods.find(
      pm => pm.id === paymentMethodId && pm.userId === currentUser.id
    );
    if (!paymentMethod) return false;

    const withdrawalId = `wd${Date.now()}`;
    const withdrawal: WithdrawalRequest = {
      id: withdrawalId,
      userId: currentUser.id,
      amount,
      paymentMethodId,
      status: TransactionStatus.PENDING,
      requestedAt: new Date().toISOString()
    };

    setWithdrawalRequests(prev => [withdrawal, ...prev]);

    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      userId: currentUser.id,
      type: TransactionType.WITHDRAWAL,
      amount,
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      counterparty: paymentMethod.type === 'BANK_ACCOUNT'
        ? paymentMethod.bankName || 'Bank Account'
        : `${paymentMethod.mobileProvider} - ${paymentMethod.phoneNumber}`,
      description: `Withdrawal to ${paymentMethod.type === 'BANK_ACCOUNT' ? 'bank account' : 'mobile money'}`
    };

    setTransactions(prev => [newTransaction, ...prev]);

    setTimeout(() => simulateWithdrawalProcessing(withdrawalId), 2000);

    return true;
  };

  const simulateWithdrawalProcessing = async (withdrawalId: string) => {
    const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!withdrawal) return;

    setWithdrawalRequests(prev => prev.map(w =>
      w.id === withdrawalId
        ? { ...w, status: TransactionStatus.PROCESSING, processedAt: new Date().toISOString() }
        : w
    ));

    setTransactions(prev => prev.map(t =>
      t.userId === withdrawal.userId &&
      t.type === TransactionType.WITHDRAWAL &&
      new Date(t.date).getTime() === new Date(withdrawal.requestedAt).getTime()
        ? { ...t, status: TransactionStatus.PROCESSING }
        : t
    ));

    await new Promise(resolve => setTimeout(resolve, 4000));

    setWithdrawalRequests(prev => prev.map(w =>
      w.id === withdrawalId
        ? { ...w, status: TransactionStatus.COMPLETED, completedAt: new Date().toISOString() }
        : w
    ));

    setTransactions(prev => prev.map(t =>
      t.userId === withdrawal.userId &&
      t.type === TransactionType.WITHDRAWAL &&
      new Date(t.date).getTime() === new Date(withdrawal.requestedAt).getTime()
        ? { ...t, status: TransactionStatus.COMPLETED, txHash: `0x${Math.random().toString(16).substr(2, 40)}` }
        : t
    ));

    setUsers(prevUsers => prevUsers.map(u =>
      u.id === withdrawal.userId
        ? { ...u, balance: u.balance - withdrawal.amount }
        : u
    ));

    if (currentUser?.id === withdrawal.userId) {
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - withdrawal.amount } : null);
    }
  };

  // Connection Management
  const sendConnectionRequest = (donorId: string, message?: string) => {
    if (!currentUser) return;

    const newRequest: ConnectionRequest = {
      id: `conn${Date.now()}`,
      creatorId: currentUser.id,
      donorId,
      status: ConnectionStatus.PENDING,
      introductionMessage: message,
      requestedAt: new Date().toISOString()
    };

    setConnectionRequests(prev => [...prev, newRequest]);

    setTimeout(() => {
      setConnectionRequests(prev => prev.map(req =>
        req.id === newRequest.id
          ? { ...req, status: ConnectionStatus.CONNECTED, respondedAt: new Date().toISOString() }
          : req
      ));
      const donorName = users.find(u => u.id === donorId)?.name;
      alert(`${donorName} accepted your connection request!`);
    }, 8000);
  };

  const getConnectionStatus = (creatorId: string, donorId: string): ConnectionStatus => {
    const connection = connectionRequests.find(
      req => req.creatorId === creatorId && req.donorId === donorId
    );
    return connection?.status || ConnectionStatus.NONE;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      projects,
      users,
      transactions,
      investments,
      paymentMethods,
      withdrawalRequests,
      connectionRequests,
      login,
      logout,
      addProject,
      updateMilestoneStatus,
      simulateReleaseFunds,
      updateUserProfile,
      getTransactionsByUser,
      getInvestmentsByDonor,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      setDefaultPaymentMethod,
      getPaymentMethodsByUser,
      initiateWithdrawal,
      sendConnectionRequest,
      getConnectionStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};