import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bone,
  Check,
  Clock,
  Download,
  FileText,
  Globe,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  RotateCw,
  SearchCheck,
  ShieldCheck,
  SquareParking,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '@/content/practice'

/**
 * Lucide equivalents for the `IconName` union in content/practice.ts.
 *
 * `components/Icon.tsx` and the union itself are left alone — the five live
 * pages still consume them, and Phase 2 only replaces icons inside the preview
 * routes. Replacing them here also fixes an inherited bug for free: four of
 * the hand-rolled call sites had no `fill: none; stroke: currentColor`, so the
 * document and download glyphs rendered as solid black silhouettes and the
 * line-based FAQ `+` was completely invisible.
 *
 * Icons are listed explicitly rather than resolved by string at runtime.
 * `import * as icons` or `icons[name]` would defeat the package's
 * `sideEffects: false` and bundle roughly 1,500 icons.
 *
 * Because `IconName` is a finite union rather than an index signature,
 * `ICONS[name]` types as `LucideIcon` and not `LucideIcon | undefined` —
 * noUncheckedIndexedAccess does not apply, so no non-null assertion is needed.
 */
export const ICONS = {
  arrowRight: ArrowRight,
  shield: ShieldCheck,
  globe: Globe,
  pulse: Activity,
  plusCircle: Bone,
  refresh: RotateCw,
  search: SearchCheck,
  mapPin: MapPin,
  document: FileText,
  download: Download,
  plus: Plus,
} satisfies Record<IconName, LucideIcon>

/**
 * Glyphs the directions need that have no `IconName` counterpart, because the
 * original site had no icon for them.
 */
export const UI = {
  phone: Phone,
  download: Download,
  arrowLeft: ArrowLeft,
  clock: Clock,
  parking: SquareParking,
  check: Check,
  plus: Plus,
  minus: Minus,
  menu: Menu,
  close: X,
  alert: TriangleAlert,
  arrowRight: ArrowRight,
  mapPin: MapPin,
} satisfies Record<string, LucideIcon>
