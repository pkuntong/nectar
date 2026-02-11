import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';

type Hustle = {
  hustleName: string;
  description: string;
  estimatedProfit: string;
  upfrontCost: string;
  timeCommitment: string;
  requiredSkills: string[];
  potentialChallenges: string;
  learnMoreLink: string;
};

type StripeCheckoutSession = {
  id: string;
  url: string;
};

type StripePortalSession = {
  id: string;
  url: string;
};

type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
};

type AuthSession = {
  access_token: string;
  user: AuthUser;
};

const router = httpRouter();

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

const getPrompt = (interest: string, budget: string, time: string) => `
Based on this profile, generate exactly 3 beginner-friendly side hustle ideas.
- Interest: ${interest}
- Budget: ${budget}
- Time per week: ${time}

Return ONLY valid JSON as an array with exactly 3 objects and these fields:
- hustleName (string)
- description (string)
- estimatedProfit (string)
- upfrontCost (string)
- timeCommitment (string)
- requiredSkills (array of strings, 2-4 items)
- potentialChallenges (string)
- learnMoreLink (string, absolute https URL)
`.trim();

const parseJsonText = (value: string): unknown => {
  const trimmed = value.trim();
  const withoutCodeFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(withoutCodeFence);
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeHustles = (raw: unknown): Hustle[] => {
  const source = Array.isArray(raw)
    ? raw
    : isObject(raw) && Array.isArray(raw.hustles)
    ? raw.hustles
    : isObject(raw) && Array.isArray(raw.ideas)
    ? raw.ideas
    : null;

  if (!source) {
    throw new Error('Invalid hustle array payload');
  }

  const hustles = source
    .slice(0, 3)
    .map((item): Hustle => {
      if (!isObject(item)) {
        throw new Error('Invalid hustle item');
      }
      const requiredSkills = Array.isArray(item.requiredSkills)
        ? item.requiredSkills.filter((skill): skill is string => typeof skill === 'string')
        : [];
      const learnMoreLink =
        typeof item.learnMoreLink === 'string' && /^https?:\/\//i.test(item.learnMoreLink)
          ? item.learnMoreLink
          : 'https://www.google.com/search?q=side+hustle+guide';
      return {
        hustleName: typeof item.hustleName === 'string' ? item.hustleName : 'Side Hustle Idea',
        description:
          typeof item.description === 'string'
            ? item.description
            : 'A practical way to start earning with low overhead.',
        estimatedProfit:
          typeof item.estimatedProfit === 'string' ? item.estimatedProfit : '$300-$900/month',
        upfrontCost: typeof item.upfrontCost === 'string' ? item.upfrontCost : '$0-$100',
        timeCommitment:
          typeof item.timeCommitment === 'string' ? item.timeCommitment : '3-8 hours/week',
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Communication', 'Consistency'],
        potentialChallenges:
          typeof item.potentialChallenges === 'string'
            ? item.potentialChallenges
            : 'Building early momentum and landing first customers.',
        learnMoreLink,
      };
    });

  if (hustles.length !== 3) {
    throw new Error('Expected exactly 3 hustles');
  }

  return hustles;
};

const generateWithGroq = async (
  prompt: string,
  overrideApiKey?: string
): Promise<Hustle[] | null> => {
  const apiKey = overrideApiKey || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content: 'You generate practical, beginner-friendly side hustle ideas as strict JSON.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed (${response.status})`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Groq returned empty content');
  }
  return normalizeHustles(parseJsonText(text));
};

const generateWithGemini = async (
  prompt: string,
  overrideApiKey?: string
): Promise<Hustle[] | null> => {
  const apiKey =
    overrideApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned empty content');
  }

  return normalizeHustles(parseJsonText(text));
};

const fallbackHustles = (interest: string, budget: string, time: string): Hustle[] => [
  {
    hustleName: `${interest} Micro-Service`,
    description: `Package one clear ${interest.toLowerCase()} deliverable and sell it as a fixed-price starter offer.`,
    estimatedProfit: '$300-$1,200/month',
    upfrontCost: budget === 'Almost Zero ($0-$50)' ? '$0-$50' : '$50-$200',
    timeCommitment: time.includes('1-3') ? '2-4 hours/week' : '5-10 hours/week',
    requiredSkills: ['Client communication', 'Basic delivery workflow', 'Time management'],
    potentialChallenges: 'Winning first clients and narrowing scope enough to deliver quickly.',
    learnMoreLink: 'https://www.upwork.com/resources/how-to-start-freelancing',
  },
  {
    hustleName: 'Niche Digital Product',
    description:
      'Create a simple template, checklist, or toolkit for a narrow problem and sell it repeatedly.',
    estimatedProfit: '$200-$1,000/month',
    upfrontCost: '$0-$100',
    timeCommitment: '3-6 hours/week',
    requiredSkills: ['Problem research', 'Basic content creation', 'Simple marketing'],
    potentialChallenges: 'Finding a niche with clear demand and iterating from early feedback.',
    learnMoreLink: 'https://gumroad.com/learn',
  },
  {
    hustleName: 'Local Lead Generation',
    description:
      'Help one local business acquire leads through listings, short-form content, or outreach support.',
    estimatedProfit: '$400-$1,500/month',
    upfrontCost: '$0-$150',
    timeCommitment: '4-8 hours/week',
    requiredSkills: ['Outreach', 'Lead qualification', 'Basic analytics'],
    potentialChallenges: 'Proving early ROI and setting expectations on timeline.',
    learnMoreLink: 'https://www.shopify.com/blog/how-to-get-clients',
  },
];

const getStripeSecretKey = (): string => {
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in Convex env.');
  }
  return secretKey;
};

const getStripeWebhookSecret = (): string => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured in Convex env.');
  }
  return webhookSecret;
};

const textEncoder = new TextEncoder();

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const computeStripeHmac = async (
  payload: string,
  timestamp: string,
  webhookSecret: string
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(`${timestamp}.${payload}`)
  );
  return bytesToHex(new Uint8Array(signed));
};

const verifyStripeWebhookSignature = async (
  payload: string,
  signatureHeader: string | null,
  webhookSecret: string
): Promise<boolean> => {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3).toLowerCase())
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
    return false;
  }

  const expected = (await computeStripeHmac(payload, timestamp, webhookSecret)).toLowerCase();
  return signatures.some((signature) => timingSafeEqual(signature, expected));
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const resolveUserFromStripeObject = async (
  ctx: any,
  stripeObject: Record<string, unknown>
): Promise<{ _id: Id<'users'>; email: string; fullName: string } | null> => {
  const metadata = isObject(stripeObject.metadata) ? stripeObject.metadata : null;
  const metadataUserId = getString(metadata?.user_id);
  if (metadataUserId) {
    try {
      const user = await ctx.runQuery(api.appData.getUserById, {
        userId: metadataUserId as Id<'users'>,
      });
      if (user) return user;
    } catch {
      // Ignore malformed ids and continue with other lookup strategies.
    }
  }

  const customerId = getString(stripeObject.customer);
  if (customerId) {
    const user = await ctx.runQuery(api.appData.getUserByStripeCustomer, {
      stripeCustomerId: customerId,
    });
    if (user) return user;
  }

  const customerDetails = isObject(stripeObject.customer_details) ? stripeObject.customer_details : null;
  const email =
    getString(stripeObject.customer_email) ||
    getString(customerDetails?.email) ||
    getString(stripeObject.email);

  if (email) {
    return await ctx.runQuery(api.appData.getUserByEmail, { email });
  }

  return null;
};

const appendFormValue = (form: URLSearchParams, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormValue(form, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      appendFormValue(form, `${key}[${nestedKey}]`, nestedValue);
    });
    return;
  }

  form.append(key, String(value));
};

const stripeApiRequest = async <T>({
  method,
  path,
  params,
}: {
  method: 'GET' | 'POST';
  path: string;
  params?: Record<string, unknown>;
}): Promise<T> => {
  const secretKey = getStripeSecretKey();
  const url = new URL(`https://api.stripe.com${path}`);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
  };

  let body: string | undefined;
  if (params) {
    const form = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => appendFormValue(form, key, value));
    if (method === 'GET') {
      form.forEach((value, key) => url.searchParams.append(key, value));
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = form.toString();
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    const message =
      isObject(data) &&
      isObject(data.error) &&
      typeof data.error.message === 'string'
        ? data.error.message
        : `Stripe request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
};

const findStripeCustomerIdByEmail = async (email?: string): Promise<string | null> => {
  if (!email) {
    return null;
  }

  const customers = await stripeApiRequest<{
    data?: Array<{ id?: string }>;
  }>({
    method: 'GET',
    path: '/v1/customers',
    params: {
      email,
      limit: 1,
    },
  });

  const id = customers.data?.[0]?.id;
  return typeof id === 'string' ? id : null;
};

const toAuthUser = (user: {
  _id: Id<'users'>;
  email: string;
  fullName: string;
}): AuthUser => ({
  id: String(user._id),
  email: user.email,
  user_metadata: {
    full_name: user.fullName,
  },
});

const createSessionToken = (): string => {
  const random = crypto.randomUUID().replace(/-/g, '');
  return `${Date.now().toString(36)}_${random}`;
};

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const getBearerToken = (req: Request): string | null => {
  const authorization = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
};

const resolveAuthSession = async (
  ctx: any,
  req: Request
): Promise<{ token: string; user: { _id: Id<'users'>; email: string; fullName: string } } | null> => {
  const token = getBearerToken(req);
  if (!token) return null;

  const session = await ctx.runQuery(api.appData.getSessionByToken, { token });
  if (!session) return null;

  const user = await ctx.runQuery(api.appData.getUserById, { userId: session.userId });
  if (!user) return null;

  return { token, user };
};

const sanitizeNotificationPreferences = (value: unknown) => {
  if (
    isObject(value) &&
    typeof value.weekly === 'boolean' &&
    typeof value.product === 'boolean' &&
    typeof value.offers === 'boolean'
  ) {
    return {
      weekly: value.weekly,
      product: value.product,
      offers: value.offers,
    };
  }
  return null;
};

const mapUserProfileRow = (user: {
  _id: Id<'users'>;
  subscriptionTier: string;
  notificationPreferences: {
    weekly: boolean;
    product: boolean;
    offers: boolean;
  };
  usageCount: number;
  usageResetDate: number;
}) => ({
  id: String(user._id),
  subscription_tier: user.subscriptionTier,
  notification_preferences: user.notificationPreferences,
  usage_count: user.usageCount,
  usage_reset_date: new Date(user.usageResetDate).toISOString(),
});

const mapOutcomeRow = (outcome: {
  _id: Id<'hustleOutcomes'>;
  userId: Id<'users'>;
  hustleName: string;
  tookAction?: boolean;
  launched?: boolean;
  revenue?: number;
  feedback?: string;
  createdAt: number;
  updatedAt: number;
}) => ({
  id: String(outcome._id),
  user_id: String(outcome.userId),
  hustle_name: outcome.hustleName,
  took_action: outcome.tookAction ?? null,
  launched: outcome.launched ?? null,
  revenue: outcome.revenue ?? null,
  feedback: outcome.feedback ?? '',
  created_at: new Date(outcome.createdAt).toISOString(),
  updated_at: new Date(outcome.updatedAt).toISOString(),
});

router.route({
  path: '/api/auth/sign-up',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const body = (await req.json()) as {
        email?: string;
        password?: string;
        fullName?: string;
        options?: { data?: { full_name?: string } };
      };

      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? '';
      const fullName = body.fullName ?? body.options?.data?.full_name ?? '';

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (password.length < 6) {
        return new Response(JSON.stringify({ error: 'Password must be at least 6 characters.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const passwordHash = await hashPassword(password);
      const user = await ctx.runMutation(api.appData.createUser, {
        email,
        passwordHash,
        fullName,
      });

      return new Response(
        JSON.stringify({
          user: user ? toAuthUser(user) : null,
          session: null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/auth/sign-up',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/auth/sign-in',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const body = (await req.json()) as { email?: string; password?: string };
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? '';

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const user = await ctx.runQuery(api.appData.getUserByEmail, { email });
      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid login credentials' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const passwordHash = await hashPassword(password);
      if (user.passwordHash !== passwordHash) {
        return new Response(JSON.stringify({ error: 'Invalid login credentials' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const token = createSessionToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await ctx.runMutation(api.appData.createSession, {
        token,
        userId: user._id,
        expiresAt,
      });

      const session: AuthSession = {
        access_token: token,
        user: toAuthUser(user),
      };

      return new Response(JSON.stringify({ user: session.user, session }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/auth/sign-in',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/auth/session',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    const auth = await resolveAuthSession(ctx, req);
    if (!auth) {
      return new Response(JSON.stringify({ session: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session: AuthSession = {
      access_token: auth.token,
      user: toAuthUser(auth.user),
    };

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }),
});

router.route({
  path: '/api/auth/session',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/auth/sign-out',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    const token = getBearerToken(req);
    if (token) {
      await ctx.runMutation(api.appData.deleteSession, { token });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }),
});

router.route({
  path: '/api/auth/sign-out',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/auth/update-user',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const auth = await resolveAuthSession(ctx, req);
      if (!auth) {
        return new Response(JSON.stringify({ error: 'User not authenticated' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = (await req.json()) as {
        email?: string;
        data?: {
          full_name?: string;
        };
      };

      const updatedUser = await ctx.runMutation(api.appData.updateUser, {
        userId: auth.user._id,
        ...(body.email ? { email: body.email } : {}),
        ...(body.data?.full_name ? { fullName: body.data.full_name } : {}),
      });

      return new Response(JSON.stringify({ user: updatedUser ? toAuthUser(updatedUser) : null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/auth/update-user',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/user/delete',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    const auth = await resolveAuthSession(ctx, req);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await ctx.runMutation(api.appData.deleteSession, { token: auth.token });
    await ctx.runMutation(api.appData.deleteUserCascade, { userId: auth.user._id });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }),
});

router.route({
  path: '/api/user/delete',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/db/select',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const auth = await resolveAuthSession(ctx, req);
      const body = (await req.json()) as {
        table?: string;
        columns?: string;
        filters?: Array<{ column?: string; value?: unknown }>;
      };

      const table = body.table;
      const filters = body.filters || [];
      const getFilterValue = (column: string) =>
        filters.find((f) => f.column === column)?.value as string | undefined;

      if (table === 'user_profiles') {
        const userId = getFilterValue('id') || auth?.user._id;
        if (!userId) {
          return new Response(JSON.stringify({ data: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const user = await ctx.runQuery(api.appData.getUserById, { userId: userId as Id<'users'> });
        const row = user ? mapUserProfileRow(user) : null;
        return new Response(JSON.stringify({ data: row }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (table === 'hustle_outcomes') {
        const userId = getFilterValue('user_id') || auth?.user._id;
        const hustleName = getFilterValue('hustle_name');
        if (!userId || !hustleName) {
          return new Response(JSON.stringify({ data: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const outcome = await ctx.runQuery(api.appData.getHustleOutcome, {
          userId: userId as Id<'users'>,
          hustleName,
        });
        return new Response(JSON.stringify({ data: outcome ? mapOutcomeRow(outcome) : null }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data: null, error: 'Unsupported table' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Select failed';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/db/select',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/db/update',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const auth = await resolveAuthSession(ctx, req);
      const body = (await req.json()) as {
        table?: string;
        values?: Record<string, unknown>;
        filters?: Array<{ column?: string; value?: unknown }>;
      };
      const table = body.table;
      const values = body.values || {};
      const filters = body.filters || [];
      const getFilterValue = (column: string) =>
        filters.find((f) => f.column === column)?.value as string | undefined;

      if (table === 'user_profiles') {
        const userId = (getFilterValue('id') || auth?.user._id) as Id<'users'> | undefined;
        if (!userId) {
          throw new Error('Missing user id filter');
        }

        const notificationPreferences = sanitizeNotificationPreferences(values.notification_preferences);
        const usageResetDate =
          typeof values.usage_reset_date === 'string'
            ? new Date(values.usage_reset_date).getTime()
            : typeof values.usage_reset_date === 'number'
            ? values.usage_reset_date
            : undefined;

        await ctx.runMutation(api.appData.updateUser, {
          userId,
          ...(typeof values.subscription_tier === 'string'
            ? { subscriptionTier: values.subscription_tier }
            : {}),
          ...(typeof values.usage_count === 'number' ? { usageCount: values.usage_count } : {}),
          ...(usageResetDate ? { usageResetDate } : {}),
          ...(notificationPreferences ? { notificationPreferences } : {}),
        });
        return new Response(JSON.stringify({ data: null, error: null }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Unsupported table' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/db/update',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/db/upsert',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const auth = await resolveAuthSession(ctx, req);
      const body = (await req.json()) as {
        table?: string;
        values?: Record<string, unknown>;
      };
      const table = body.table;
      const values = body.values || {};

      if (table === 'user_profiles') {
        const userId = (values.id as Id<'users'> | undefined) || auth?.user._id;
        if (!userId) {
          return new Response(JSON.stringify({ data: null, error: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const existing = await ctx.runQuery(api.appData.getUserById, { userId });
        if (!existing) {
          return new Response(JSON.stringify({ data: null, error: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const notificationPreferences = sanitizeNotificationPreferences(values.notification_preferences);
        const usageResetDate =
          typeof values.usage_reset_date === 'string'
            ? new Date(values.usage_reset_date).getTime()
            : typeof values.usage_reset_date === 'number'
            ? values.usage_reset_date
            : undefined;

        const updated = await ctx.runMutation(api.appData.updateUser, {
          userId,
          ...(typeof values.subscription_tier === 'string'
            ? { subscriptionTier: values.subscription_tier }
            : {}),
          ...(typeof values.usage_count === 'number' ? { usageCount: values.usage_count } : {}),
          ...(usageResetDate ? { usageResetDate } : {}),
          ...(notificationPreferences ? { notificationPreferences } : {}),
        });
        return new Response(
          JSON.stringify({ data: updated ? mapUserProfileRow(updated) : null, error: null }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (table === 'hustle_outcomes') {
        const userId = (values.user_id as Id<'users'> | undefined) || auth?.user._id;
        const hustleName = typeof values.hustle_name === 'string' ? values.hustle_name : undefined;
        if (!userId || !hustleName) {
          return new Response(JSON.stringify({ data: null, error: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updated = await ctx.runMutation(api.appData.upsertHustleOutcome, {
          userId,
          hustleName,
          ...(typeof values.took_action === 'boolean' ? { tookAction: values.took_action } : {}),
          ...(typeof values.launched === 'boolean' ? { launched: values.launched } : {}),
          ...(typeof values.revenue === 'number' ? { revenue: values.revenue } : {}),
          ...(typeof values.feedback === 'string' ? { feedback: values.feedback } : {}),
        });

        return new Response(
          JSON.stringify({ data: updated ? mapOutcomeRow(updated) : null, error: null }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify({ error: 'Unsupported table' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upsert failed';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/db/upsert',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/send-email',
  method: 'POST',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const body = (await req.json()) as {
        to?: string;
        subject?: string;
        html?: string;
        type?: string;
      };

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return new Response(
          JSON.stringify({
            success: false,
            skipped: true,
            error: 'Email provider is not configured (missing RESEND_API_KEY).',
          }),
          {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const to = body.to?.trim();
      const subject = body.subject?.trim() || 'Welcome to Nectar Forge';
      if (!to) {
        return new Response(JSON.stringify({ error: 'Missing "to" email address.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const defaultHtml = `<p>Welcome to Nectar Forge!</p><p>Your account is ready.</p>`;
      const emailHtml = body.html || defaultHtml;

      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: `Nectar <${fromEmail}>`,
          to: [to],
          subject,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Resend API error: ${text}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send email';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/send-email',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/generate-hustles',
  method: 'POST',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const body = (await req.json()) as {
        interest?: string;
        budget?: string;
        time?: string;
        groqApiKey?: string;
        geminiApiKey?: string;
      };

      const interest = body.interest?.trim();
      const budget = body.budget?.trim();
      const time = body.time?.trim();

      if (!interest || !budget || !time) {
        return new Response(JSON.stringify({ error: 'Missing required fields: interest, budget, time' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prompt = getPrompt(interest, budget, time);
      const groqApiKey = body.groqApiKey?.trim();
      const geminiApiKey = body.geminiApiKey?.trim();

      let hustles: Hustle[] | null = null;
      try {
        hustles = await generateWithGroq(prompt, groqApiKey);
      } catch (error) {
        console.error('Groq generation failed:', error);
      }

      if (!hustles) {
        try {
          hustles = await generateWithGemini(prompt, geminiApiKey);
        } catch (error) {
          console.error('Gemini generation failed:', error);
        }
      }

      if (!hustles) {
        hustles = fallbackHustles(interest, budget, time);
      }

      return new Response(JSON.stringify({ hustles }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/generate-hustles',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/stripe-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const payload = await req.text();
      const stripeSignature =
        req.headers.get('stripe-signature') || req.headers.get('Stripe-Signature');

      const webhookSecret = getStripeWebhookSecret();
      const isValidSignature = await verifyStripeWebhookSignature(
        payload,
        stripeSignature,
        webhookSecret
      );

      if (!isValidSignature) {
        return new Response(JSON.stringify({ error: 'Invalid Stripe signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const event = JSON.parse(payload) as {
        type?: string;
        data?: { object?: unknown };
      };

      const eventType = getString(event.type);
      const stripeObject =
        isObject(event.data) && isObject(event.data.object) ? event.data.object : null;

      if (!eventType || !stripeObject) {
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (eventType === 'checkout.session.completed') {
        const user = await resolveUserFromStripeObject(ctx, stripeObject);
        const customerId = getString(stripeObject.customer);
        const subscriptionId = getString(stripeObject.subscription);

        if (user) {
          await ctx.runMutation(api.appData.updateUser, {
            userId: user._id,
            subscriptionTier: 'entrepreneur',
            ...(customerId ? { stripeCustomerId: customerId } : {}),
            ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          });
        }
      }

      if (eventType === 'customer.subscription.updated' || eventType === 'customer.subscription.deleted') {
        const customerId = getString(stripeObject.customer);
        if (customerId) {
          const user = await ctx.runQuery(api.appData.getUserByStripeCustomer, {
            stripeCustomerId: customerId,
          });

          if (user) {
            const subscriptionId = getString(stripeObject.id);
            const status = getString(stripeObject.status);
            const isEntrepreneur =
              eventType !== 'customer.subscription.deleted' &&
              (status === 'active' || status === 'trialing' || status === 'past_due');

            await ctx.runMutation(api.appData.updateUser, {
              userId: user._id,
              subscriptionTier: isEntrepreneur ? 'entrepreneur' : 'free',
              stripeCustomerId: customerId,
              ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
            });
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stripe webhook failed';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/stripe-webhook',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/create-checkout-session',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const auth = await resolveAuthSession(ctx, req);
      const body = (await req.json()) as {
        priceId?: string;
        email?: string;
        successUrl?: string;
        cancelUrl?: string;
      };

      const priceId = body.priceId?.trim();
      if (!priceId) {
        return new Response(JSON.stringify({ error: 'Missing required field: priceId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const origin = req.headers.get('origin') ?? 'https://quaint-lion-604.convex.site';
      const successUrl = body.successUrl?.trim() || `${origin}/dashboard?success=true`;
      const cancelUrl = body.cancelUrl?.trim() || `${origin}/pricing?canceled=true`;
      const email = body.email?.trim() || auth?.user.email;
      const customerId = await findStripeCustomerIdByEmail(email);
      if (auth && customerId) {
        await ctx.runMutation(api.appData.updateUser, {
          userId: auth.user._id,
          stripeCustomerId: customerId,
        });
      }

      const session = await stripeApiRequest<StripeCheckoutSession>({
        method: 'POST',
        path: '/v1/checkout/sessions',
        params: {
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: true,
          line_items: [{ price: priceId, quantity: 1 }],
          ...(customerId ? { customer: customerId } : {}),
          ...(!customerId && email ? { customer_email: email } : {}),
          ...(auth
            ? {
                metadata: { user_id: String(auth.user._id) },
                subscription_data: { metadata: { user_id: String(auth.user._id) } },
              }
            : {}),
        },
      });

      return new Response(
        JSON.stringify({
          sessionId: session.id,
          url: session.url,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/create-checkout-session',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

router.route({
  path: '/api/create-portal-session',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const auth = await resolveAuthSession(ctx, req);
      const body = (await req.json()) as {
        email?: string;
        customerId?: string;
        returnUrl?: string;
      };

      const origin = req.headers.get('origin') ?? 'https://quaint-lion-604.convex.site';
      const returnUrl = body.returnUrl?.trim() || `${origin}/dashboard?tab=settings`;
      const customerId =
        body.customerId?.trim() ||
        (await findStripeCustomerIdByEmail(body.email?.trim() || auth?.user.email));

      if (!customerId) {
        return new Response(JSON.stringify({ error: 'No Stripe customer found for this user.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const session = await stripeApiRequest<StripePortalSession>({
        method: 'POST',
        path: '/v1/billing_portal/sessions',
        params: {
          customer: customerId,
          return_url: returnUrl,
        },
      });

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }),
});

router.route({
  path: '/api/create-portal-session',
  method: 'OPTIONS',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response('ok', { headers: corsHeaders });
  }),
});

export default router;
