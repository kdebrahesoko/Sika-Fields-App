import type { LucideIcon } from "lucide-react";
import {
  UserPlus, Map, ScanSearch, ClipboardCheck, Calculator, ShieldCheck, Award, Banknote,
} from "lucide-react";

export type StandardKey = "ofp" | "vm0042" | "vm0047" | "mixed" | "future";

/**
 * Colors match the legend in the reference source map exactly (OFP = orange,
 * Verra VM0047 = green, Verra VM0042 = magenta) — see data provenance note below.
 */
export const STANDARD_META: Record<StandardKey, { label: string; shortLabel: string; color: string; glow: string }> = {
  ofp: { label: "Open Forest Protocol (OFP)", shortLabel: "OFP", color: "#e69800", glow: "rgba(230,152,0,0.5)" },
  vm0047: { label: "Verra VM0047", shortLabel: "VM0047", color: "#63b43b", glow: "rgba(99,180,59,0.5)" },
  vm0042: { label: "Verra VM0042", shortLabel: "VM0042", color: "#cd6699", glow: "rgba(205,102,153,0.5)" },
  mixed: { label: "Mixed (OFP + VM0047)", shortLabel: "Mixed", color: "#8b5cf6", glow: "rgba(139,92,246,0.5)" },
  future: { label: "Future Expansion", shortLabel: "Planned", color: "#94a3b8", glow: "rgba(148,163,184,0.45)" },
};

export interface GhanaRegion {
  id: string;
  name: string;
  standard: StandardKey;
  status: "Active" | "Onboarding" | "Planned";
  col: number;
  row: number;
  districts?: string[];
  farmers?: string;
  hectares?: string;
  activities: string[];
  monitoring: string[];
  benefits: string[];
}

/**
 * Data provenance: standard/district assignment is sourced from
 * `attached_assets/Combined_Standards_Map_(1)_1783510454545.pdf`
 * ("Spatial Distribution of Standards for the SikaFields Project"), read directly
 * from its legend and per-district inset maps (OFP = orange, Verra VM0047 = green,
 * Verra VM0042 = magenta). Regions with no colored district in that source map are
 * marked "future" (planned expansion). Bono region contains districts under two
 * different standards (Jaman North/South = OFP, Dormaa East/Municipal = VM0047)
 * and is marked "mixed" accordingly, since region-level boundaries can only show
 * one fill color.
 *
 * Farmers/hectares figures are derived estimates, not per-region source data: the
 * per-region breakdown isn't published, only current/expected totals per standard
 * (`attached_assets/Sikafields_Project_Statistics_Summary_1783510466925.xlsx`).
 * Figures below split each standard's current-onboarded total (or, for VM0042
 * where current onboarding is still zero, its expected total) proportionally by
 * district count across the regions carrying that standard. `col`/`row` retain a
 * stylized grid layout value for potential fallback/legacy use but are no longer
 * used for map positioning (positioning now comes from real GeoJSON boundaries).
 */
export const GHANA_REGIONS: GhanaRegion[] = [
  {
    id: "upper-west", name: "Upper West", standard: "future", status: "Planned", col: 0, row: 0,
    activities: ["Feasibility scoping", "Community engagement"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income", "Land restoration potential"],
  },
  {
    id: "upper-east", name: "Upper East", standard: "future", status: "Planned", col: 2, row: 0,
    activities: ["Feasibility scoping", "Community engagement"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income", "Land restoration potential"],
  },
  {
    id: "north-east", name: "North East", standard: "future", status: "Planned", col: 2, row: 1,
    activities: ["Feasibility scoping"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income"],
  },
  {
    id: "savannah", name: "Savannah", standard: "future", status: "Planned", col: 0, row: 1,
    activities: ["Feasibility scoping"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income"],
  },
  {
    id: "northern", name: "Northern", standard: "future", status: "Planned", col: 1, row: 2,
    activities: ["Feasibility scoping", "Stakeholder mapping"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income", "Climate resilience"],
  },
  {
    id: "bono", name: "Bono", standard: "mixed", status: "Active", col: 0, row: 2,
    districts: ["Jaman North (OFP)", "Jaman South Municipal (OFP)", "Dormaa East (VM0047)", "Dormaa Municipal (VM0047)"],
    farmers: "~2,000+", hectares: "~3,150 ha",
    activities: ["Agroforestry", "Afforestation", "Regenerative farming"],
    monitoring: ["Satellite imagery", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Forest restoration"],
  },
  {
    id: "bono-east", name: "Bono East", standard: "vm0047", status: "Active", col: 1, row: 3,
    districts: ["Sene East", "Pru West"],
    farmers: "~850+", hectares: "~1,360 ha",
    activities: ["Afforestation", "Reforestation", "Community woodlots"],
    monitoring: ["Satellite imagery", "Drone verification"],
    benefits: ["Farmer income", "Carbon credits", "Forest restoration"],
  },
  {
    id: "ahafo", name: "Ahafo", standard: "vm0047", status: "Active", col: 0, row: 3,
    districts: ["Tano South Municipal", "Asutifi North", "Asutifi South"],
    farmers: "~1,300+", hectares: "~2,050 ha",
    activities: ["Afforestation", "Reforestation", "Community woodlots"],
    monitoring: ["Satellite imagery", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Forest restoration"],
  },
  {
    id: "ashanti", name: "Ashanti", standard: "vm0047", status: "Active", col: 1, row: 4,
    districts: [
      "Atwima Mponua", "Bekwai Municipal", "Ejisu Municipal", "Juaben Municipal",
      "Mampong Municipal", "Sekyere Central", "Sekyere Afram Plains North", "Sekyere Kumawu",
    ],
    farmers: "~3,400+", hectares: "~5,450 ha",
    activities: ["Afforestation", "Reforestation", "Community woodlots"],
    monitoring: ["Satellite imagery", "Drone verification", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Forest restoration", "Biodiversity"],
  },
  {
    id: "western-north", name: "Western North", standard: "future", status: "Planned", col: 0, row: 4,
    activities: ["Feasibility scoping", "Community radio outreach"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income"],
  },
  {
    id: "eastern", name: "Eastern", standard: "vm0042", status: "Onboarding", col: 2, row: 4,
    districts: ["Asuogyaman", "Upper Manya", "Yilo Krobo", "Lower Manya"],
    farmers: "~8,900 (est.)", hectares: "~22,200 ha (est.)",
    activities: ["Farmer registration", "Soil baseline mapping"],
    monitoring: ["Satellite baseline mapping", "Soil sampling"],
    benefits: ["Future farmer income", "Soil health", "Carbon credits"],
  },
  {
    id: "oti", name: "Oti", standard: "ofp", status: "Active", col: 3, row: 1,
    districts: ["Nkwanta North", "Nkwanta South Municipal", "Krachi East Municipal", "Kadjebi", "Jasikan", "Biakoye"],
    farmers: "~3,400+", hectares: "~5,400 ha",
    activities: ["Agroforestry", "Tree planting", "Regenerative farming"],
    monitoring: ["Satellite imagery", "Drone verification", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Biodiversity", "Climate resilience"],
  },
  {
    id: "volta", name: "Volta", standard: "vm0042", status: "Onboarding", col: 3, row: 3,
    districts: ["Kpando Municipal", "North Dayi", "South Dayi", "North Tongu", "South Tongu"],
    farmers: "~11,200 (est.)", hectares: "~27,800 ha (est.)",
    activities: ["Farmer registration", "Soil baseline mapping"],
    monitoring: ["Satellite baseline mapping", "Soil sampling"],
    benefits: ["Future farmer income", "Soil health", "Carbon credits"],
  },
  {
    id: "western", name: "Western", standard: "future", status: "Planned", col: 0, row: 5,
    activities: ["Feasibility scoping"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income"],
  },
  {
    id: "central", name: "Central", standard: "future", status: "Planned", col: 1, row: 5,
    activities: ["Feasibility scoping"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income"],
  },
  {
    id: "greater-accra", name: "Greater Accra", standard: "future", status: "Planned", col: 2, row: 5,
    activities: ["Buyer & partner engagement", "HQ operations"],
    monitoring: ["Program oversight"],
    benefits: ["Institutional partnerships"],
  },
];

export interface TimelineStep {
  title: string;
  icon: LucideIcon;
}

export const MRV_TIMELINE: TimelineStep[] = [
  { title: "Farmer Registration", icon: UserPlus },
  { title: "Farm Mapping", icon: Map },
  { title: "AI Boundary Detection", icon: ScanSearch },
  { title: "Field Verification", icon: ClipboardCheck },
  { title: "Carbon Assessment", icon: Calculator },
  { title: "Verification", icon: ShieldCheck },
  { title: "Carbon Credit Issuance", icon: Award },
  { title: "Payments to Farmers", icon: Banknote },
];

export interface LiveStat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

export const LIVE_STATS: LiveStat[] = [
  { label: "Registered Farmers", value: 47000, suffix: "+" },
  { label: "Mapped Farms", value: 32500, suffix: "+" },
  { label: "Hectares Monitored", value: 68400, suffix: "+" },
  { label: "Active Districts", value: 31 },
  { label: "Trees Protected", value: 1850000, suffix: "+" },
  { label: "Estimated CO₂ (tonnes)", value: 125000, suffix: "+" },
];
