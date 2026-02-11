import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    subscriptionTier: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    usageCount: v.number(),
    usageResetDate: v.number(),
    notificationPreferences: v.object({
      weekly: v.boolean(),
      product: v.boolean(),
      offers: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_stripe_customer', ['stripeCustomerId']),

  sessions: defineTable({
    token: v.string(),
    userId: v.id('users'),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_user', ['userId']),

  hustleOutcomes: defineTable({
    userId: v.id('users'),
    hustleName: v.string(),
    tookAction: v.optional(v.boolean()),
    launched: v.optional(v.boolean()),
    revenue: v.optional(v.number()),
    feedback: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_hustle', ['userId', 'hustleName']),
});
