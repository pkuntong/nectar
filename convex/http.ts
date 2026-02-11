import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';

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

const router = httpRouter();

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
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
  path: '/api/create-checkout-session',
  method: 'POST',
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
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
      const email = body.email?.trim();
      const customerId = await findStripeCustomerIdByEmail(email);

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
  handler: httpAction(async (_, req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    try {
      const body = (await req.json()) as {
        email?: string;
        customerId?: string;
        returnUrl?: string;
      };

      const origin = req.headers.get('origin') ?? 'https://quaint-lion-604.convex.site';
      const returnUrl = body.returnUrl?.trim() || `${origin}/dashboard?tab=settings`;
      const customerId =
        body.customerId?.trim() || (await findStripeCustomerIdByEmail(body.email?.trim()));

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
