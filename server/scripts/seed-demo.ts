import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db, pool } from "../db";
import {
  account,
  connectionRequests,
  conversations,
  investments,
  messages,
  milestones,
  paymentMethods,
  projects,
  transactions,
  user,
} from "../db/schema";

const DEMO_PASSWORD = "TexoraDemo123!";

const creatorEmail = "creator@texora.demo";
const donorEmail = "donor@texora.demo";

async function upsertDemoUser(input: {
  fallbackId: string;
  email: string;
  name: string;
  role: "donor" | "fundraiser";
  walletAddress: string;
  balanceCents: number;
  interests: string[];
  bio: string;
  location: string;
  website: string;
  linkedin: string;
  profileDetails: Record<string, string | string[] | number>;
}) {
  const [existing] = await db.select().from(user).where(eq(user.email, input.email)).limit(1);
  const id = existing?.id ?? input.fallbackId;

  await db
    .insert(user)
    .values({
      id,
      email: input.email,
      name: input.name,
      emailVerified: true,
      role: input.role,
      walletAddress: input.walletAddress,
      balanceCents: input.balanceCents,
      interests: input.interests,
      bio: input.bio,
      location: input.location,
      website: input.website,
      linkedin: input.linkedin,
      profileDetails: input.profileDetails,
      verified: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: user.email,
      set: {
        name: input.name,
        emailVerified: true,
        role: input.role,
        walletAddress: input.walletAddress,
        balanceCents: input.balanceCents,
        interests: input.interests,
        bio: input.bio,
        location: input.location,
        website: input.website,
        linkedin: input.linkedin,
        profileDetails: input.profileDetails,
        verified: true,
        updatedAt: new Date(),
      },
    });

  const password = await hashPassword(DEMO_PASSWORD);
  await db
    .delete(account)
    .where(and(eq(account.userId, id), eq(account.providerId, "credential")));
  await db.insert(account).values({
    id: `${id}-credential`,
    accountId: id,
    providerId: "credential",
    userId: id,
    password,
  });

  return id;
}

async function main() {
  const creatorId = await upsertDemoUser({
    fallbackId: "demo-creator",
    email: creatorEmail,
    name: "Amani Girls Foundation",
    role: "fundraiser",
    walletAddress: "0x71C9A21DEMO",
    balanceCents: 35_000_000,
    interests: ["Girls Education", "Community Development", "Women Empowerment"],
    bio: "Empowering girls in northern Uganda through scholarships, mentorship, and school retention programs.",
    location: "Kampala, Uganda",
    website: "https://amanigirls.ug",
    linkedin: "amani-girls-foundation",
    profileDetails: {
      specialties: ["Girls Education", "Rural Development", "Mentorship"],
      totalRaised: 73_500_000,
      activeProjects: 2,
    },
  });

  const donorId = await upsertDemoUser({
    fallbackId: "demo-donor",
    email: donorEmail,
    name: "Makerere Impact Fund",
    role: "donor",
    walletAddress: "0x3F21B90DEMO",
    balanceCents: 250_000_000,
    interests: ["Education", "Healthcare", "Youth Empowerment", "Technology"],
    bio: "Supporting grassroots initiatives across Uganda with a focus on measurable community outcomes.",
    location: "Kampala, Uganda",
    website: "https://makerereimpact.ug",
    linkedin: "makerere-impact-fund",
    profileDetails: {
      ticketSize: "UGX 20M - 100M",
      investmentStage: "Community Growth",
      totalInvested: 52_500_000,
      activeInvestments: 2,
    },
  });

  await db
    .insert(projects)
    .values([
      {
        id: "demo-project-girls-education",
        creatorId,
        title: "Northern Uganda Girls Education Program",
        description:
          "Scholarships, school supplies, and menstrual hygiene kits for 200 girls in Gulu and Kitgum districts, with teacher training and community engagement.",
        category: "Girls Education",
        fundingGoalCents: 85_000_000,
        currentFundingCents: 28_000_000,
        smartContractAddress: "0xContractDemoA1",
        imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: "demo-project-water-schools",
        creatorId,
        title: "Clean Water for Rural Schools - Lira District",
        description:
          "Constructing borehole water points in five primary schools so students can spend more time in class and less time fetching water.",
        category: "Water & Sanitation",
        fundingGoalCents: 95_000_000,
        currentFundingCents: 24_500_000,
        smartContractAddress: "0xContractDemoC3",
        imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=1600&auto=format&fit=crop",
      },
    ])
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        creatorId,
        currentFundingCents: 28_000_000,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(milestones)
    .values([
      {
        id: "demo-milestone-education-1",
        projectId: "demo-project-girls-education",
        title: "School Supplies & Scholarships",
        description: "Procure uniforms, books, and scholastic materials for 200 girls and pay first-term school fees.",
        amountCents: 28_000_000,
        status: "approved",
        proofDocumentUrl: "term-1-procurement-report.pdf",
        dueDate: new Date("2026-07-15"),
      },
      {
        id: "demo-milestone-education-2",
        projectId: "demo-project-girls-education",
        title: "Menstrual Hygiene Kit Distribution",
        description: "Distribute reusable sanitary pads and train peer educators in participating schools.",
        amountCents: 22_000_000,
        status: "pending_submission",
        dueDate: new Date("2026-09-20"),
      },
      {
        id: "demo-milestone-water-1",
        projectId: "demo-project-water-schools",
        title: "Hydrogeological Survey & Permits",
        description: "Complete site selection, water table assessments, district approvals, and drilling permits.",
        amountCents: 24_500_000,
        status: "in_review",
        dueDate: new Date("2026-08-05"),
      },
    ])
    .onConflictDoUpdate({
      target: milestones.id,
      set: {
        updatedAt: new Date(),
      },
    });

  await db
    .insert(investments)
    .values([
      {
        id: "demo-investment-education",
        donorId,
        projectId: "demo-project-girls-education",
        amountCents: 28_000_000,
        status: "active",
      },
      {
        id: "demo-investment-water",
        donorId,
        projectId: "demo-project-water-schools",
        amountCents: 24_500_000,
        status: "active",
      },
    ])
    .onConflictDoUpdate({
      target: investments.id,
      set: {
        donorId,
        status: "active",
      },
    });

  await db
    .insert(paymentMethods)
    .values([
      {
        id: "demo-payment-creator-momo",
        userId: creatorId,
        type: "MOBILE_MONEY",
        isDefault: true,
        details: {
          mobileProvider: "MTN_MOBILE_MONEY",
          phoneNumber: "256772123456",
          registeredName: "Amani Girls Foundation",
        },
      },
      {
        id: "demo-payment-donor-bank",
        userId: donorId,
        type: "BANK_ACCOUNT",
        isDefault: true,
        details: {
          bankName: "Stanbic Bank Uganda",
          accountNumber: "9040012345678",
          accountName: "Makerere Impact Fund",
          branchName: "Kampala Road",
        },
      },
    ])
    .onConflictDoUpdate({
      target: paymentMethods.id,
      set: {
        isDefault: true,
      },
    });

  await db
    .insert(transactions)
    .values([
      {
        id: "demo-tx-donor-invest-education",
        userId: donorId,
        type: "investment",
        amountCents: 28_000_000,
        status: "completed",
        projectId: "demo-project-girls-education",
        counterparty: "Northern Uganda Girls Education Program",
        txHash: "0xdemoeducationinvestment",
        description: "Investment in Northern Uganda Girls Education Program",
      },
      {
        id: "demo-tx-creator-release-education",
        userId: creatorId,
        type: "fund_release",
        amountCents: 28_000_000,
        status: "completed",
        projectId: "demo-project-girls-education",
        milestoneId: "demo-milestone-education-1",
        counterparty: "Milestone: School Supplies & Scholarships",
        txHash: "0xdemoeducationrelease",
        description: "Fund release for approved first milestone",
      },
    ])
    .onConflictDoUpdate({
      target: transactions.id,
      set: {
        status: "completed",
      },
    });

  await db
    .insert(connectionRequests)
    .values({
      id: "demo-connection-makerere-amani",
      creatorId,
      donorId,
      status: "connected",
      introductionMessage: "We would like to share our next school retention milestone with your team.",
      respondedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: connectionRequests.id,
      set: {
        status: "connected",
        respondedAt: new Date(),
      },
    });

  await db
    .insert(conversations)
    .values({
      id: "demo-conversation-makerere-amani",
      participantAId: creatorId,
      participantBId: donorId,
      projectId: "demo-project-girls-education",
      lastMessageTime: new Date(),
    })
    .onConflictDoUpdate({
      target: conversations.id,
      set: {
        participantAId: creatorId,
        participantBId: donorId,
        lastMessageTime: new Date(),
      },
    });

  await db
    .insert(messages)
    .values([
      {
        id: "demo-message-creator-1",
        conversationId: "demo-conversation-makerere-amani",
        senderId: creatorId,
        receiverId: donorId,
        content: "We uploaded the procurement proof for term one and are preparing the next kit distribution milestone.",
        read: true,
      },
      {
        id: "demo-message-donor-1",
        conversationId: "demo-conversation-makerere-amani",
        senderId: donorId,
        receiverId: creatorId,
        content: "Thanks. The milestone evidence is clear. Send the district attendance update when it is ready.",
        read: false,
      },
    ])
    .onConflictDoUpdate({
      target: messages.id,
      set: {
        read: true,
      },
    });

  console.log("Seeded Texora demo users and data.");
  console.log(`Creator: ${creatorEmail} / ${DEMO_PASSWORD}`);
  console.log(`Investor: ${donorEmail} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
