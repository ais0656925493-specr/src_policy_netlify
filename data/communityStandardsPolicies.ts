import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  Ban,
  Bot,
  Copyright,
  EyeOff,
  Flame,
  HeartCrack,
  HeartPulse,
  Link2,
  Lock,
  MailWarning,
  MessageSquareWarning,
  Newspaper,
  PackageX,
  ShieldAlert,
  ShieldBan,
  UserX,
} from 'lucide-react'

/**
 * Thứ tự cố định khớp `commonViolations.items` / `appealContentOptions`
 * (trừ `other`) trên mọi locale.
 */
export const COMMUNITY_STANDARD_POLICY_IDS = [
  'violence_criminal',
  'fraud_deception',
  'restricted_goods_services',
  'bullying_harassment',
  'hateful_conduct',
  'violent_graphic_content',
  'adult_nudity_sexual',
  'child_exploitation',
  'human_exploitation',
  'suicide_self_harm',
  'privacy_violations',
  'spam',
  'cybersecurity',
  'inauthentic_behavior',
  'misinformation',
  'intellectual_property',
  'ai_generated_content',
] as const

export type CommunityStandardPolicyId =
  (typeof COMMUNITY_STANDARD_POLICY_IDS)[number]

export const COMMUNITY_STANDARD_POLICY_ICONS: Record<
  CommunityStandardPolicyId,
  LucideIcon
> = {
  violence_criminal: Flame,
  fraud_deception: ShieldAlert,
  restricted_goods_services: PackageX,
  bullying_harassment: MessageSquareWarning,
  hateful_conduct: HeartCrack,
  violent_graphic_content: EyeOff,
  adult_nudity_sexual: Ban,
  child_exploitation: Baby,
  human_exploitation: Link2,
  suicide_self_harm: HeartPulse,
  privacy_violations: Lock,
  spam: MailWarning,
  cybersecurity: ShieldBan,
  inauthentic_behavior: UserX,
  misinformation: Newspaper,
  intellectual_property: Copyright,
  ai_generated_content: Bot,
}
