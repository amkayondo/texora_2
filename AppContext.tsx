import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from './lib/auth-client';
import { trpcClient } from './lib/trpc-client';
import {
  ConnectionRequest,
  ConnectionStatus,
  Conversation,
  Investment,
  Message,
  MilestoneStatus,
  PaymentMethod,
  Project,
  Transaction,
  TransactionStatus,
  User,
  UserRole,
  WithdrawalRequest,
} from './types';

type LoginMode = 'sign-in' | 'sign-up';

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  projects: Project[];
  users: User[];
  transactions: Transaction[];
  investments: Investment[];
  paymentMethods: PaymentMethod[];
  withdrawalRequests: WithdrawalRequest[];
  connectionRequests: ConnectionRequest[];

  login: (role: UserRole, email: string, password: string, mode?: LoginMode, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: MilestoneStatus, proofUrl?: string) => Promise<void>;
  simulateReleaseFunds: (projectId: string, milestoneId: string) => Promise<boolean>;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  getTransactionsByUser: (userId: string) => Transaction[];
  getInvestmentsByDonor: (donorId: string) => Investment[];
  createInvestment: (projectId: string, amount: number) => Promise<boolean>;

  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => void;
  updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
  getPaymentMethodsByUser: (userId: string) => PaymentMethod[];

  initiateWithdrawal: (amount: number, paymentMethodId: string) => Promise<boolean>;

  sendConnectionRequest: (donorId: string, message?: string) => void;
  getConnectionStatus: (creatorId: string, donorId: string) => ConnectionStatus;

  messages: Message[];
  conversations: Conversation[];
  sendMessage: (receiverId: string, content: string, projectId?: string) => Promise<void>;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
}

type BootstrapPayload = {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  transactions: Transaction[];
  investments: Investment[];
  paymentMethods: PaymentMethod[];
  withdrawalRequests: WithdrawalRequest[];
  connectionRequests: ConnectionRequest[];
  messages: Message[];
  conversations: Conversation[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const roleToAuth = (role: UserRole) => (role === UserRole.CREATOR ? 'fundraiser' : 'donor');
type SignUpEmailInput = Parameters<typeof authClient.signUp.email>[0] & { role: string };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const applyBootstrap = (payload: BootstrapPayload) => {
    setCurrentUser(payload.currentUser);
    setUsers(payload.users);
    setProjects(payload.projects);
    setTransactions(payload.transactions);
    setInvestments(payload.investments);
    setPaymentMethods(payload.paymentMethods);
    setWithdrawalRequests(payload.withdrawalRequests);
    setConnectionRequests(payload.connectionRequests);
    setConversations(payload.conversations);
    setMessages(payload.messages);
  };

  const refreshData = async () => {
    const payload = await trpcClient.bootstrap.query();
    applyBootstrap(payload);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData().catch(() => {
      setCurrentUser(null);
      setUsers([]);
      setProjects([]);
      setTransactions([]);
      setInvestments([]);
      setPaymentMethods([]);
      setWithdrawalRequests([]);
      setConnectionRequests([]);
      setConversations([]);
      setMessages([]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (role: UserRole, email: string, password: string, mode: LoginMode = 'sign-in', name?: string) => {
    const result =
      mode === 'sign-up'
        ? await authClient.signUp.email({
            name: name?.trim() || email.split('@')[0],
            email,
            password,
            role: roleToAuth(role),
          } as SignUpEmailInput)
        : await authClient.signIn.email({ email, password });

    if (result.error) throw new Error(result.error.message || 'Authentication failed');
    await refreshData();
    return true;
  };

  const logout = async () => {
    await authClient.signOut().catch(() => undefined);
    setCurrentUser(null);
  };

  const addProject = (project: Project) => {
    trpcClient.projects.create.mutate(project).then(applyBootstrap);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    trpcClient.projects.update.mutate({ projectId, updates }).then(applyBootstrap);
  };

  const updateMilestoneStatus = async (projectId: string, milestoneId: string, status: MilestoneStatus, proofUrl?: string) => {
    const payload = await trpcClient.projects.updateMilestone.mutate({ projectId, milestoneId, status, proofUrl });
    applyBootstrap(payload);
  };

  const simulateReleaseFunds = async (projectId: string, milestoneId: string): Promise<boolean> => {
    try {
      const payload = await trpcClient.projects.releaseMilestone.mutate({ projectId, milestoneId });
      applyBootstrap(payload);
      return true;
    } catch {
      return false;
    }
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    trpcClient.users.updateProfile.mutate({ userId, updates }).then(applyBootstrap);
  };

  const getTransactionsByUser = (userId: string) => {
    return transactions
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getInvestmentsByDonor = (donorId: string) => {
    return investments.filter((investment) => investment.donorId === donorId);
  };

  const createInvestment = async (projectId: string, amount: number): Promise<boolean> => {
    try {
      const payload = await trpcClient.projects.invest.mutate({ projectId, amount });
      applyBootstrap(payload);
      return true;
    } catch {
      return false;
    }
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    trpcClient.paymentMethods.create.mutate(method).then(applyBootstrap);
  };

  const updatePaymentMethod = (methodId: string, updates: Partial<PaymentMethod>) => {
    trpcClient.paymentMethods.update.mutate({ methodId, updates }).then(applyBootstrap);
  };

  const deletePaymentMethod = (methodId: string) => {
    trpcClient.paymentMethods.delete.mutate({ methodId }).then(applyBootstrap);
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    trpcClient.paymentMethods.setDefault.mutate({ methodId }).then(applyBootstrap);
  };

  const getPaymentMethodsByUser = (userId: string) => {
    return paymentMethods.filter((paymentMethod) => paymentMethod.userId === userId);
  };

  const initiateWithdrawal = async (amount: number, paymentMethodId: string): Promise<boolean> => {
    try {
      const payload = await trpcClient.withdrawals.create.mutate({ amount, paymentMethodId });
      applyBootstrap(payload);
      return true;
    } catch {
      return false;
    }
  };

  const sendConnectionRequest = (donorId: string, message?: string) => {
    trpcClient.connections.create.mutate({ donorId, message }).then(applyBootstrap);
  };

  const getConnectionStatus = (creatorId: string, donorId: string): ConnectionStatus => {
    const connection = connectionRequests.find(
      (request) => request.creatorId === creatorId && request.donorId === donorId,
    );
    return connection?.status || ConnectionStatus.NONE;
  };

  const sendMessage = async (receiverId: string, content: string, projectId?: string) => {
    const payload = await trpcClient.messages.send.mutate({ receiverId, content, projectId });
    applyBootstrap(payload);
  };

  const getConversationMessages = (conversationId: string) => {
    const conversation = conversations.find((candidate) => candidate.id === conversationId);
    if (!conversation) return [];

    return messages
      .filter(
        (message) =>
          (message.senderId === conversation.participants[0] && message.receiverId === conversation.participants[1]) ||
          (message.senderId === conversation.participants[1] && message.receiverId === conversation.participants[0]),
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getUserConversations = (userId: string) => {
    return conversations
      .filter((conversation) => conversation.participants.includes(userId))
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoading,
        projects,
        users,
        transactions,
        investments,
        paymentMethods,
        withdrawalRequests,
        connectionRequests,
        messages,
        conversations,
        login,
        logout,
        refreshData,
        addProject,
        updateProject,
        updateMilestoneStatus,
        simulateReleaseFunds,
        updateUserProfile,
        getTransactionsByUser,
        getInvestmentsByDonor,
        createInvestment,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
        getPaymentMethodsByUser,
        initiateWithdrawal,
        sendConnectionRequest,
        getConnectionStatus,
        sendMessage,
        getConversationMessages,
        getUserConversations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
