export enum UserRole {
  DONOR = 'DONOR',
  CREATOR = 'CREATOR'
}

export enum MilestoneStatus {
  LOCKED = 'LOCKED',
  PENDING_SUBMISSION = 'PENDING_SUBMISSION',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number; // In USD
  status: MilestoneStatus;
  proofDocumentUrl?: string;
  feedback?: string;
  dueDate: string;
}

export interface Project {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number; // In USD
  currentFunding: number; // In USD
  milestones: Milestone[];
  smartContractAddress: string;
  imageUrl: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  walletAddress?: string;
  balance: number; // In UGX
  interests: string[]; // For AI matching
  bio?: string;

  // Enhanced profile fields
  email?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  verified?: boolean;
  joinedDate?: string;

  // Donor-specific fields
  ticketSize?: string;
  investmentStage?: string;
  totalInvested?: number;
  activeInvestments?: number;

  // Creator-specific fields
  specialties?: string[];
  totalRaised?: number;
  activeProjects?: number;

  // Payment methods
  paymentMethods?: PaymentMethod[];
}

export interface MatchScore {
  projectId: string;
  donorId: string;
  score: number; // 0-100
  reason: string;
}

export enum TransactionType {
  FUND_RELEASE = 'FUND_RELEASE',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  INVESTMENT = 'INVESTMENT'
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  projectId?: string;
  milestoneId?: string;
  counterparty?: string; // Donor/Creator name
  date: string; // ISO format
  status: TransactionStatus;
  txHash?: string;
  description?: string;
}

export interface Investment {
  id: string;
  donorId: string;
  projectId: string;
  amount: number;
  date: string;
  status: 'active' | 'completed';
}

export enum PaymentMethodType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export enum MobileMoneyProvider {
  MTN = 'MTN_MOBILE_MONEY',
  AIRTEL = 'AIRTEL_MONEY'
}

export enum UgandanBank {
  STANBIC = 'Stanbic Bank Uganda',
  CENTENARY = 'Centenary Bank',
  DFCU = 'DFCU Bank',
  EQUITY = 'Equity Bank Uganda',
  POSTBANK = 'PostBank Uganda',
  ABSA = 'ABSA Bank Uganda',
  STANDARD_CHARTERED = 'Standard Chartered Bank',
  BANK_OF_BARODA = 'Bank of Baroda Uganda',
  HOUSING_FINANCE = 'Housing Finance Bank',
  FINANCE_TRUST = 'Finance Trust Bank'
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  isDefault: boolean;
  createdAt: string;

  // Bank Account Details
  bankName?: UgandanBank;
  accountNumber?: string;
  accountName?: string;
  branchName?: string;

  // Mobile Money Details
  mobileProvider?: MobileMoneyProvider;
  phoneNumber?: string;
  registeredName?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethodId: string;
  status: TransactionStatus;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  transactionId?: string;
}

export enum ConnectionStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  REJECTED = 'REJECTED'
}

export interface ConnectionRequest {
  id: string;
  creatorId: string;
  donorId: string;
  status: ConnectionStatus;
  introductionMessage?: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // [donorId, creatorId]
  projectId?: string;
  lastMessage?: Message;
  lastMessageTime: string;
}
