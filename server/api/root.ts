import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, pool } from "@/server/db";
import {
  connectionRequests,
  conversations,
  investments,
  messages,
  milestones,
  paymentMethods,
  projects,
  transactions,
  user,
  withdrawalRequests,
} from "@/server/db/schema";
import {
  ConnectionStatus,
  MilestoneStatus,
  PaymentMethod,
  TransactionStatus,
  TransactionType,
  UserRole,
} from "@/types";
import { protectedProcedure, publicProcedure, router } from "./trpc";

const roleToClient = (role: string): UserRole => (role === "fundraiser" ? UserRole.CREATOR : UserRole.DONOR);
const milestoneStatusToClient = (status: string): MilestoneStatus => status.toUpperCase() as MilestoneStatus;
const milestoneStatusToDb = (status: string) => status.toLowerCase();
const transactionTypeToClient = (type: string): TransactionType => type.toUpperCase() as TransactionType;
const transactionStatusToClient = (status: string): TransactionStatus => status.toUpperCase() as TransactionStatus;
const connectionStatusToClient = (status: string): ConnectionStatus => status.toUpperCase() as ConnectionStatus;

type DbUser = typeof user.$inferSelect;
type DbProject = typeof projects.$inferSelect;
type DbMilestone = typeof milestones.$inferSelect;
type DbInvestment = typeof investments.$inferSelect;
type DbTransaction = typeof transactions.$inferSelect;
type DbPaymentMethod = typeof paymentMethods.$inferSelect;
type DbWithdrawal = typeof withdrawalRequests.$inferSelect;
type DbConnection = typeof connectionRequests.$inferSelect;
type DbConversation = typeof conversations.$inferSelect;
type DbMessage = typeof messages.$inferSelect;

const mapUser = (row: DbUser) => {
  const details = row.profileDetails ?? {};
  return {
    id: row.id,
    name: row.name,
    role: roleToClient(row.role),
    walletAddress: row.walletAddress ?? undefined,
    balance: row.balanceCents,
    interests: row.interests,
    bio: row.bio ?? undefined,
    email: row.email,
    location: row.location ?? undefined,
    website: row.website ?? undefined,
    linkedin: row.linkedin ?? undefined,
    verified: row.verified,
    joinedDate: row.createdAt.toISOString(),
    specialties: Array.isArray(details.specialties) ? details.specialties : undefined,
    ticketSize: typeof details.ticketSize === "string" ? details.ticketSize : undefined,
    investmentStage: typeof details.investmentStage === "string" ? details.investmentStage : undefined,
    totalInvested: typeof details.totalInvested === "number" ? details.totalInvested : undefined,
    activeInvestments: typeof details.activeInvestments === "number" ? details.activeInvestments : undefined,
    totalRaised: typeof details.totalRaised === "number" ? details.totalRaised : undefined,
    activeProjects: typeof details.activeProjects === "number" ? details.activeProjects : undefined,
  };
};

const mapMilestone = (row: DbMilestone) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  amount: row.amountCents,
  status: milestoneStatusToClient(row.status),
  proofDocumentUrl: row.proofDocumentUrl ?? undefined,
  feedback: row.feedback ?? undefined,
  dueDate: row.dueDate.toISOString(),
});

const mapProject = (row: DbProject, projectMilestones: DbMilestone[]) => ({
  id: row.id,
  creatorId: row.creatorId,
  title: row.title,
  description: row.description,
  category: row.category,
  fundingGoal: row.fundingGoalCents,
  currentFunding: row.currentFundingCents,
  smartContractAddress: row.smartContractAddress ?? "",
  imageUrl: row.imageUrl ?? "",
  milestones: projectMilestones.map(mapMilestone),
});

const mapInvestment = (row: DbInvestment) => ({
  id: row.id,
  donorId: row.donorId,
  projectId: row.projectId,
  amount: row.amountCents,
  date: row.createdAt.toISOString(),
  status: row.status as "active" | "completed",
});

const mapTransaction = (row: DbTransaction) => ({
  id: row.id,
  userId: row.userId,
  type: transactionTypeToClient(row.type),
  amount: row.amountCents,
  projectId: row.projectId ?? undefined,
  milestoneId: row.milestoneId ?? undefined,
  counterparty: row.counterparty ?? undefined,
  date: row.createdAt.toISOString(),
  status: transactionStatusToClient(row.status),
  txHash: row.txHash ?? undefined,
  description: row.description ?? undefined,
});

const mapPaymentMethod = (row: DbPaymentMethod) => ({
  id: row.id,
  userId: row.userId,
  type: row.type as PaymentMethod["type"],
  isDefault: row.isDefault,
  createdAt: row.createdAt.toISOString(),
  ...row.details,
});

const mapWithdrawal = (row: DbWithdrawal) => ({
  id: row.id,
  userId: row.userId,
  amount: row.amountCents,
  paymentMethodId: row.paymentMethodId,
  status: transactionStatusToClient(row.status),
  requestedAt: row.requestedAt.toISOString(),
  processedAt: row.processedAt?.toISOString(),
  completedAt: row.completedAt?.toISOString(),
  transactionId: row.transactionId ?? undefined,
});

const mapConnection = (row: DbConnection) => ({
  id: row.id,
  creatorId: row.creatorId,
  donorId: row.donorId,
  status: connectionStatusToClient(row.status),
  introductionMessage: row.introductionMessage ?? undefined,
  requestedAt: row.requestedAt.toISOString(),
  respondedAt: row.respondedAt?.toISOString(),
});

const mapMessage = (row: DbMessage) => ({
  id: row.id,
  senderId: row.senderId,
  receiverId: row.receiverId,
  content: row.content,
  timestamp: row.createdAt.toISOString(),
  read: row.read,
});

const mapConversation = (row: DbConversation, conversationMessages: DbMessage[]) => {
  const lastMessage = conversationMessages.at(-1);
  return {
    id: row.id,
    participants: [row.participantAId, row.participantBId],
    projectId: row.projectId ?? undefined,
    lastMessage: lastMessage ? mapMessage(lastMessage) : undefined,
    lastMessageTime: row.lastMessageTime.toISOString(),
  };
};

async function loadBootstrap() {
  const [
    userRows,
    projectRows,
    milestoneRows,
    investmentRows,
    transactionRows,
    paymentMethodRows,
    withdrawalRows,
    connectionRows,
    conversationRows,
    messageRows,
  ] = await Promise.all([
    db.select().from(user).orderBy(asc(user.createdAt)),
    db.select().from(projects).orderBy(desc(projects.createdAt)),
    db.select().from(milestones).orderBy(asc(milestones.dueDate)),
    db.select().from(investments).orderBy(desc(investments.createdAt)),
    db.select().from(transactions).orderBy(desc(transactions.createdAt)),
    db.select().from(paymentMethods).orderBy(desc(paymentMethods.createdAt)),
    db.select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.requestedAt)),
    db.select().from(connectionRequests).orderBy(desc(connectionRequests.requestedAt)),
    db.select().from(conversations).orderBy(desc(conversations.lastMessageTime)),
    db.select().from(messages).orderBy(asc(messages.createdAt)),
  ]);

  return {
    users: userRows.map(mapUser),
    projects: projectRows.map((project) =>
      mapProject(
        project,
        milestoneRows.filter((milestone) => milestone.projectId === project.id),
      ),
    ),
    investments: investmentRows.map(mapInvestment),
    transactions: transactionRows.map(mapTransaction),
    paymentMethods: paymentMethodRows.map(mapPaymentMethod),
    withdrawalRequests: withdrawalRows.map(mapWithdrawal),
    connectionRequests: connectionRows.map(mapConnection),
    conversations: conversationRows.map((conversation) =>
      mapConversation(
        conversation,
        messageRows.filter((message) => message.conversationId === conversation.id),
      ),
    ),
    messages: messageRows.map(mapMessage),
  };
}

const bootstrapForUser = async (userId: string) => {
  const data = await loadBootstrap();
  const currentUser = data.users.find((candidate) => candidate.id === userId) ?? null;
  return { currentUser, ...data };
};

const looseObject = z.object({}).catchall(z.unknown());
const milestoneInput = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
  status: z.string().optional(),
  proofDocumentUrl: z.string().optional(),
  dueDate: z.string().optional(),
});
const projectInput = z.object({
  id: z.string().optional(),
  creatorId: z.string().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  fundingGoal: z.number(),
  currentFunding: z.number().optional(),
  smartContractAddress: z.string().optional(),
  imageUrl: z.string().optional(),
  milestones: z.array(milestoneInput).optional(),
});

const toProfileDetails = (updates: Record<string, unknown>) => {
  const details: Record<string, string | number | boolean | string[]> = {};
  const keys = [
    "specialties",
    "ticketSize",
    "investmentStage",
    "totalInvested",
    "activeInvestments",
    "totalRaised",
    "activeProjects",
  ];

  for (const key of keys) {
    const value = updates[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      details[key] = value;
    } else if (Array.isArray(value)) {
      details[key] = value.map(String);
    }
  }

  return details;
};

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  dbHealth: publicProcedure.query(async () => {
    const result = await pool.query("select current_database() as database, now() as checked_at");
    return { ok: true, database: result.rows[0].database, checkedAt: result.rows[0].checked_at };
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await db.select().from(user).where(eq(user.id, ctx.user.id)).limit(1);
    return { user: profile ? mapUser(profile) : null };
  }),
  bootstrap: protectedProcedure.query(({ ctx }) => bootstrapForUser(ctx.user.id)),
  projects: router({
    create: protectedProcedure.input(projectInput).mutation(async ({ ctx, input }) => {
      const projectId = randomUUID();
      const smartContractAddress = input.smartContractAddress || `0x${randomUUID().replaceAll("-", "").slice(0, 24)}`;

      await db.insert(projects).values({
        id: projectId,
        creatorId: ctx.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        fundingGoalCents: input.fundingGoal,
        currentFundingCents: input.currentFunding ?? 0,
        smartContractAddress,
        imageUrl: input.imageUrl || "",
      });

      const milestoneValues = Array.isArray(input.milestones)
        ? input.milestones.map((milestone, index) => ({
            id: typeof milestone.id === "string" && milestone.id ? milestone.id : randomUUID(),
            projectId,
            title: String(milestone.title ?? `Milestone ${index + 1}`),
            description: String(milestone.description ?? ""),
            amountCents: Number(milestone.amount ?? 0),
            status: milestoneStatusToDb(String(milestone.status ?? (index === 0 ? "PENDING_SUBMISSION" : "LOCKED"))) as "locked",
            proofDocumentUrl: typeof milestone.proofDocumentUrl === "string" ? milestone.proofDocumentUrl : null,
            dueDate: new Date(String(milestone.dueDate ?? new Date().toISOString())),
          }))
        : [];

      if (milestoneValues.length) {
        await db.insert(milestones).values(milestoneValues);
      }

      return bootstrapForUser(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({ projectId: z.string(), updates: looseObject }))
      .mutation(async ({ ctx, input }) => {
        await db
          .update(projects)
          .set({
            title: typeof input.updates.title === "string" ? input.updates.title : undefined,
            description: typeof input.updates.description === "string" ? input.updates.description : undefined,
            category: typeof input.updates.category === "string" ? input.updates.category : undefined,
            fundingGoalCents: input.updates.fundingGoal === undefined ? undefined : Number(input.updates.fundingGoal),
            currentFundingCents: input.updates.currentFunding === undefined ? undefined : Number(input.updates.currentFunding),
            imageUrl: typeof input.updates.imageUrl === "string" ? input.updates.imageUrl : undefined,
            updatedAt: new Date(),
          })
          .where(and(eq(projects.id, input.projectId), eq(projects.creatorId, ctx.user.id)));

        return bootstrapForUser(ctx.user.id);
      }),
    updateMilestone: protectedProcedure
      .input(z.object({ projectId: z.string(), milestoneId: z.string(), status: z.string(), proofUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db
          .update(milestones)
          .set({
            status: milestoneStatusToDb(input.status) as "locked",
            proofDocumentUrl: input.proofUrl,
            updatedAt: new Date(),
          })
          .where(and(eq(milestones.id, input.milestoneId), eq(milestones.projectId, input.projectId)));

        return bootstrapForUser(ctx.user.id);
      }),
    releaseMilestone: protectedProcedure
      .input(z.object({ projectId: z.string(), milestoneId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const [project] = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
        const [milestone] = await db.select().from(milestones).where(eq(milestones.id, input.milestoneId)).limit(1);
        if (!project || !milestone) throw new TRPCError({ code: "NOT_FOUND" });
        if (project.creatorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const newFunding = project.currentFundingCents + milestone.amountCents;
        await db.update(milestones).set({ status: "approved", updatedAt: new Date() }).where(eq(milestones.id, input.milestoneId));
        await db.update(projects).set({ currentFundingCents: newFunding, updatedAt: new Date() }).where(eq(projects.id, input.projectId));
        await db.update(user).set({ balanceCents: newFunding }).where(eq(user.id, project.creatorId));
        await db.insert(transactions).values({
          id: randomUUID(),
          userId: project.creatorId,
          type: "fund_release",
          amountCents: milestone.amountCents,
          status: "completed",
          projectId: input.projectId,
          milestoneId: input.milestoneId,
          counterparty: `Milestone: ${milestone.title}`,
          txHash: `0x${randomUUID().replaceAll("-", "")}`,
          description: `Fund release for "${milestone.title}"`,
        });

        return bootstrapForUser(ctx.user.id);
      }),
    invest: protectedProcedure
      .input(z.object({ projectId: z.string(), amount: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (input.amount <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid amount" });

        const [donor] = await db.select().from(user).where(eq(user.id, ctx.user.id)).limit(1);
        const [project] = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
        if (!donor || !project) throw new TRPCError({ code: "NOT_FOUND" });
        if (donor.balanceCents < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        await db.insert(investments).values({
          id: randomUUID(),
          donorId: donor.id,
          projectId: project.id,
          amountCents: input.amount,
          status: "active",
        });
        await db.insert(transactions).values({
          id: randomUUID(),
          userId: donor.id,
          type: "investment",
          amountCents: input.amount,
          status: "completed",
          projectId: project.id,
          counterparty: project.title,
          txHash: `0x${randomUUID().replaceAll("-", "")}`,
          description: `Investment in ${project.title}`,
        });
        await db.update(user).set({ balanceCents: donor.balanceCents - input.amount }).where(eq(user.id, donor.id));
        await db
          .update(projects)
          .set({ currentFundingCents: project.currentFundingCents + input.amount, updatedAt: new Date() })
          .where(eq(projects.id, project.id));

        return bootstrapForUser(ctx.user.id);
      }),
  }),
  users: router({
    updateProfile: protectedProcedure
      .input(z.object({ userId: z.string(), updates: looseObject }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id !== input.userId) throw new TRPCError({ code: "FORBIDDEN" });

        const profileDetails = toProfileDetails(input.updates);

        await db
          .update(user)
          .set({
            name: typeof input.updates.name === "string" ? input.updates.name : undefined,
            walletAddress: typeof input.updates.walletAddress === "string" ? input.updates.walletAddress : undefined,
            balanceCents: input.updates.balance === undefined ? undefined : Number(input.updates.balance),
            interests: Array.isArray(input.updates.interests) ? input.updates.interests.map(String) : undefined,
            bio: typeof input.updates.bio === "string" ? input.updates.bio : undefined,
            location: typeof input.updates.location === "string" ? input.updates.location : undefined,
            website: typeof input.updates.website === "string" ? input.updates.website : undefined,
            linkedin: typeof input.updates.linkedin === "string" ? input.updates.linkedin : undefined,
            profileDetails,
            updatedAt: new Date(),
          })
          .where(eq(user.id, ctx.user.id));

        return bootstrapForUser(ctx.user.id);
      }),
  }),
  paymentMethods: router({
    create: protectedProcedure.input(looseObject).mutation(async ({ ctx, input }) => {
      const existing = await db.select().from(paymentMethods).where(eq(paymentMethods.userId, ctx.user.id));
      const { type, isDefault: _ignored, userId: _ignoredUserId, ...details } = input;
      await db.insert(paymentMethods).values({
        id: randomUUID(),
        userId: ctx.user.id,
        type: String(type),
        isDefault: existing.length === 0,
        details: details as Record<string, string | undefined>,
      });

      return bootstrapForUser(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({ methodId: z.string(), updates: looseObject }))
      .mutation(async ({ ctx, input }) => {
        const { type, isDefault, id: _id, userId: _userId, createdAt: _createdAt, ...details } = input.updates;
        await db
          .update(paymentMethods)
          .set({
            type: typeof type === "string" ? type : undefined,
            isDefault: typeof isDefault === "boolean" ? isDefault : undefined,
            details: details as Record<string, string | undefined>,
          })
          .where(and(eq(paymentMethods.id, input.methodId), eq(paymentMethods.userId, ctx.user.id)));

        return bootstrapForUser(ctx.user.id);
      }),
    delete: protectedProcedure.input(z.object({ methodId: z.string() })).mutation(async ({ ctx, input }) => {
      await db.delete(paymentMethods).where(and(eq(paymentMethods.id, input.methodId), eq(paymentMethods.userId, ctx.user.id)));
      return bootstrapForUser(ctx.user.id);
    }),
    setDefault: protectedProcedure.input(z.object({ methodId: z.string() })).mutation(async ({ ctx, input }) => {
      await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, ctx.user.id));
      await db
        .update(paymentMethods)
        .set({ isDefault: true })
        .where(and(eq(paymentMethods.id, input.methodId), eq(paymentMethods.userId, ctx.user.id)));

      return bootstrapForUser(ctx.user.id);
    }),
  }),
  withdrawals: router({
    create: protectedProcedure
      .input(z.object({ amount: z.number(), paymentMethodId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const [method] = await db
          .select()
          .from(paymentMethods)
          .where(and(eq(paymentMethods.id, input.paymentMethodId), eq(paymentMethods.userId, ctx.user.id)))
          .limit(1);
        if (!method || input.amount <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid withdrawal" });

        const transactionId = randomUUID();
        await db.insert(transactions).values({
          id: transactionId,
          userId: ctx.user.id,
          type: "withdrawal",
          amountCents: input.amount,
          status: "pending",
          counterparty:
            method.type === "BANK_ACCOUNT"
              ? method.details.bankName
              : `${method.details.mobileProvider} - ${method.details.phoneNumber}`,
          description: `Withdrawal to ${method.type === "BANK_ACCOUNT" ? "bank account" : "mobile money"}`,
        });
        await db.insert(withdrawalRequests).values({
          id: randomUUID(),
          userId: ctx.user.id,
          amountCents: input.amount,
          paymentMethodId: method.id,
          status: "pending",
          transactionId,
        });

        return bootstrapForUser(ctx.user.id);
      }),
  }),
  connections: router({
    create: protectedProcedure
      .input(z.object({ donorId: z.string(), message: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.insert(connectionRequests).values({
          id: randomUUID(),
          creatorId: ctx.user.id,
          donorId: input.donorId,
          status: "pending",
          introductionMessage: input.message,
        });

        return bootstrapForUser(ctx.user.id);
      }),
  }),
  messages: router({
    send: protectedProcedure
      .input(z.object({ receiverId: z.string(), content: z.string(), projectId: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db
          .select()
          .from(conversations)
          .where(
            or(
              and(eq(conversations.participantAId, ctx.user.id), eq(conversations.participantBId, input.receiverId)),
              and(eq(conversations.participantAId, input.receiverId), eq(conversations.participantBId, ctx.user.id)),
            ),
          )
          .limit(1);

        const conversationId = existing[0]?.id ?? randomUUID();
        if (!existing[0]) {
          await db.insert(conversations).values({
            id: conversationId,
            participantAId: ctx.user.id,
            participantBId: input.receiverId,
            projectId: input.projectId,
            lastMessageTime: new Date(),
          });
        }

        await db.insert(messages).values({
          id: randomUUID(),
          conversationId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
          read: false,
        });
        await db.update(conversations).set({ lastMessageTime: new Date() }).where(eq(conversations.id, conversationId));

        return bootstrapForUser(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
