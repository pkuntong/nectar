import { logger } from './logger';

export interface ConvexHustle {
  hustleName: string;
  description: string;
  estimatedProfit: string;
  upfrontCost: string;
  timeCommitment: string;
  requiredSkills: string[];
  potentialChallenges: string;
  learnMoreLink: string;
}

interface ConvexGenerateHustlesRequest {
  interest: string;
  budget: string;
  time: string;
  userId?: string;
}

interface ConvexGenerateHustlesResponse {
  hustles: ConvexHustle[];
  limitReached?: boolean;
  daysUntilReset?: number;
}

const getConvexGenerateHustlesUrl = (): string | undefined => {
  const processEnvGenerateUrl =
    typeof process !== 'undefined' && process.env ? process.env.VITE_CONVEX_GENERATE_HUSTLES_URL : undefined;
  const processEnvSiteUrl =
    typeof process !== 'undefined' && process.env ? process.env.VITE_CONVEX_SITE_URL : undefined;
  const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL || processEnvSiteUrl;
  return (
    import.meta.env.VITE_CONVEX_GENERATE_HUSTLES_URL ||
    processEnvGenerateUrl ||
    (convexSiteUrl ? `${convexSiteUrl.replace(/\/$/, '')}/api/generate-hustles` : undefined) ||
    'https://quaint-lion-604.convex.site/api/generate-hustles'
  );
};

export const generateHustlesWithConvex = async (
  payload: ConvexGenerateHustlesRequest
): Promise<ConvexGenerateHustlesResponse> => {
  const url = getConvexGenerateHustlesUrl();

  if (!url) {
    throw new Error('VITE_CONVEX_GENERATE_HUSTLES_URL is not configured.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    logger.error('Invalid JSON from Convex endpoint:', error);
    throw new Error(`Convex returned a non-JSON response (${response.status}).`);
  }

  if (!response.ok) {
    const errorMessage =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Convex request failed (${response.status}).`;
    throw new Error(errorMessage);
  }

  if (Array.isArray(data)) {
    return { hustles: data as ConvexHustle[] };
  }

  if (data && typeof data === 'object') {
    const typedData = data as ConvexGenerateHustlesResponse;
    if (Array.isArray(typedData.hustles)) {
      return typedData;
    }
  }

  throw new Error('Convex returned an invalid hustle payload.');
};
