import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["donor", "fundraiser"]);
export const milestoneStatus = pgEnum("milestone_status", [
  "locked",
  "pending_submission",
  "in_review",
  "approved",
  "rejected",
]);
export const transactionType = pgEnum("transaction_type", [
  "fund_release",
  "withdrawal",
  "deposit",
  "investment",
]);
export const transactionStatus = pgEnum("transaction_status", [
  "completed",
  "pending",
  "processing",
  "failed",
]);
export const connectionStatus = pgEnum("connection_status", [
  "none",
  "pending",
  "connected",
  "rejected",
]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: userRole("role").notNull().default("donor"),
    walletAddress: text("wallet_address"),
    balanceCents: integer("balance_cents").notNull().default(0),
    interests: jsonb("interests").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    bio: text("bio"),
    location: text("location"),
    website: text("website"),
    linkedin: text("linkedin"),
    profileDetails: jsonb("profile_details")
      .$type<Record<string, string | string[] | number | boolean | undefined>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_email_idx").on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("session_token_idx").on(table.token)],
);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  fundingGoalCents: integer("funding_goal_cents").notNull(),
  currentFundingCents: integer("current_funding_cents").notNull().default(0),
  smartContractAddress: text("smart_contract_address"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: milestoneStatus("status").notNull().default("locked"),
  proofDocumentUrl: text("proof_document_url"),
  feedback: text("feedback"),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const investments = pgTable("investments", {
  id: text("id").primaryKey(),
  donorId: text("donor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: transactionType("type").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: transactionStatus("status").notNull(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  milestoneId: text("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
  counterparty: text("counterparty"),
  txHash: text("tx_hash"),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  details: jsonb("details").$type<Record<string, string | undefined>>().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  paymentMethodId: text("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id, { onDelete: "restrict" }),
  status: transactionStatus("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { mode: "date" }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  transactionId: text("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
});

export const connectionRequests = pgTable("connection_requests", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  donorId: text("donor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: connectionStatus("status").notNull().default("pending"),
  introductionMessage: text("introduction_message"),
  requestedAt: timestamp("requested_at", { mode: "date" }).notNull().defaultNow(),
  respondedAt: timestamp("responded_at", { mode: "date" }),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  participantAId: text("participant_a_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  participantBId: text("participant_b_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  lastMessageTime: timestamp("last_message_time", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  createdProjects: many(projects),
  investments: many(investments),
  transactions: many(transactions),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  creator: one(user, {
    fields: [projects.creatorId],
    references: [user.id],
  }),
  milestones: many(milestones),
  investments: many(investments),
}));

export const milestoneRelations = relations(milestones, ({ one }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
}));

export const investmentRelations = relations(investments, ({ one }) => ({
  donor: one(user, {
    fields: [investments.donorId],
    references: [user.id],
  }),
  project: one(projects, {
    fields: [investments.projectId],
    references: [projects.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  projects,
  milestones,
  investments,
  transactions,
  paymentMethods,
  withdrawalRequests,
  connectionRequests,
  conversations,
  messages,
};

export type UserRole = (typeof userRole.enumValues)[number];
