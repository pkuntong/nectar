import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const defaultNotificationPreferences = {
  weekly: false,
  product: false,
  offers: false,
};

const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
    if (existing) {
      throw new Error('User already exists');
    }

    const now = Date.now();
    const userId = await ctx.db.insert('users', {
      email,
      passwordHash: args.passwordHash,
      fullName: (args.fullName || email.split('@')[0] || 'User').trim(),
      subscriptionTier: 'free',
      usageCount: 0,
      usageResetDate: now + oneWeekMs,
      notificationPreferences: defaultNotificationPreferences,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    subscriptionTier: v.optional(v.string()),
    usageCount: v.optional(v.number()),
    usageResetDate: v.optional(v.number()),
    notificationPreferences: v.optional(
      v.object({
        weekly: v.boolean(),
        product: v.boolean(),
        offers: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.userId);
    if (!existing) {
      throw new Error('User not found');
    }

    if (args.email && args.email.toLowerCase().trim() !== existing.email) {
      const duplicate = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', args.email!.toLowerCase().trim()))
        .first();
      if (duplicate && duplicate._id !== args.userId) {
        throw new Error('Email already in use');
      }
    }

    await ctx.db.patch(args.userId, {
      ...(args.email !== undefined ? { email: args.email.toLowerCase().trim() } : {}),
      ...(args.fullName !== undefined ? { fullName: args.fullName.trim() } : {}),
      ...(args.subscriptionTier !== undefined ? { subscriptionTier: args.subscriptionTier } : {}),
      ...(args.usageCount !== undefined ? { usageCount: args.usageCount } : {}),
      ...(args.usageResetDate !== undefined ? { usageResetDate: args.usageResetDate } : {}),
      ...(args.notificationPreferences !== undefined
        ? { notificationPreferences: args.notificationPreferences }
        : {}),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

export const deleteUserCascade = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    const outcomes = await ctx.db
      .query('hustleOutcomes')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    for (const outcome of outcomes) {
      await ctx.db.delete(outcome._id);
    }

    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

export const createSession = mutation({
  args: {
    token: v.string(),
    userId: v.id('users'),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert('sessions', {
      token: args.token,
      userId: args.userId,
      expiresAt: args.expiresAt,
      createdAt: now,
    });
    return { success: true };
  },
});

export const getSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    return session;
  },
});

export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});

export const getHustleOutcome = query({
  args: {
    userId: v.id('users'),
    hustleName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('hustleOutcomes')
      .withIndex('by_user_hustle', (q) =>
        q.eq('userId', args.userId).eq('hustleName', args.hustleName)
      )
      .first();
  },
});

export const upsertHustleOutcome = mutation({
  args: {
    userId: v.id('users'),
    hustleName: v.string(),
    tookAction: v.optional(v.boolean()),
    launched: v.optional(v.boolean()),
    revenue: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('hustleOutcomes')
      .withIndex('by_user_hustle', (q) =>
        q.eq('userId', args.userId).eq('hustleName', args.hustleName)
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        tookAction: args.tookAction,
        launched: args.launched,
        revenue: args.revenue,
        feedback: args.feedback,
        updatedAt: now,
      });
      return await ctx.db.get(existing._id);
    }

    const outcomeId = await ctx.db.insert('hustleOutcomes', {
      userId: args.userId,
      hustleName: args.hustleName,
      tookAction: args.tookAction,
      launched: args.launched,
      revenue: args.revenue,
      feedback: args.feedback,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(outcomeId);
  },
});
