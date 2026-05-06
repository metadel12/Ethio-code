/**
 * Feature Flags + A/B Testing
 * In production: fetch from /api/v1/admin/feature-flags
 */

const FLAGS = {
  new_dashboard:       { enabled: true,  rollout: 100 },
  ai_recommendations:  { enabled: true,  rollout: 100 },
  gamification:        { enabled: true,  rollout: 100 },
  creator_marketplace: { enabled: true,  rollout: 100 },
  enterprise_sso:      { enabled: true,  rollout: 100 },
  pwa_push:            { enabled: true,  rollout: 80  },
  new_editor:          { enabled: false, rollout: 0   },
  beta_analytics:      { enabled: true,  rollout: 50  },
}

const EXPERIMENTS = {
  cta_button_color: {
    variants: ['green', 'blue', 'gold'],
    weights:  [50, 30, 20],
  },
  onboarding_flow: {
    variants: ['wizard', 'single_page'],
    weights:  [60, 40],
  },
}

// Stable user bucket (0-99) based on user ID
const bucket = (userId = 'anon') => {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0
  return h % 100
}

export const isEnabled = (flag, userId = 'anon') => {
  const f = FLAGS[flag]
  if (!f || !f.enabled) return false
  return bucket(userId) < f.rollout
}

export const getVariant = (experiment, userId = 'anon') => {
  const exp = EXPERIMENTS[experiment]
  if (!exp) return null
  const b = bucket(String(userId) + experiment)
  let cumulative = 0
  for (let i = 0; i < exp.variants.length; i++) {
    cumulative += exp.weights[i]
    if (b < cumulative) return exp.variants[i]
  }
  return exp.variants[0]
}

export const getAllFlags = () => FLAGS
