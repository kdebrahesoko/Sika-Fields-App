import type { LucideIcon } from "lucide-react";
import {
  UserPlus, Map, ScanSearch, ClipboardCheck, Calculator, ShieldCheck, Award, Banknote,
} from "lucide-react";

export type StandardKey = "ofp" | "vm0042" | "vm0047" | "future";

export const STANDARD_META: Record<StandardKey, { label: string; shortLabel: string; color: string; glow: string }> = {
  ofp: { label: "Open Forest Protocol (OFP)", shortLabel: "OFP", color: "#1f9d55", glow: "rgba(31,157,85,0.55)" },
  vm0042: { label: "Verra VM0042", shortLabel: "VM0042", color: "#2563eb", glow: "rgba(37,99,235,0.5)" },
  vm0047: { label: "Verra VM0047", shortLabel: "VM0047", color: "#e08a1e", glow: "rgba(224,138,30,0.5)" },
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
 * Region layout uses a stylized grid position (col/row), not surveyed geographic
 * boundaries — see task scope notes. Standard assignment for districts named in
 * the "Combined Standards Map" reference is illustrative (the source PDF's legend
 * colors could not be extracted from text), grouped by the districts that appear
 * on that map; unlisted regions are shown as future-expansion territory.
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
    id: "bono", name: "Bono", standard: "vm0042", status: "Active", col: 0, row: 2,
    districts: ["Jaman North", "Jaman South Municipal", "Dormaa East", "Dormaa Municipal"],
    farmers: "6,200+", hectares: "9,800 ha",
    activities: ["Regenerative farming", "Soil carbon management", "Agroforestry"],
    monitoring: ["Satellite imagery", "Soil sampling", "Field agent inspections"],
    benefits: ["Farmer income", "Soil health", "Carbon credits"],
  },
  {
    id: "bono-east", name: "Bono East", standard: "vm0042", status: "Active", col: 1, row: 3,
    districts: ["Sene East", "Pru West"],
    farmers: "3,100+", hectares: "5,400 ha",
    activities: ["Regenerative farming", "Soil carbon management"],
    monitoring: ["Satellite imagery", "Soil sampling"],
    benefits: ["Farmer income", "Soil health", "Carbon credits"],
  },
  {
    id: "ahafo", name: "Ahafo", standard: "vm0042", status: "Active", col: 0, row: 3,
    districts: ["Tano South Municipal", "Asutifi North", "Asutifi South"],
    farmers: "2,900+", hectares: "4,700 ha",
    activities: ["Regenerative farming", "Agroforestry"],
    monitoring: ["Satellite imagery", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Biodiversity"],
  },
  {
    id: "ashanti", name: "Ashanti", standard: "ofp", status: "Active", col: 1, row: 4,
    districts: [
      "Atwima Mponua", "Bekwai Municipal", "Ejisu Municipal", "Juaben Municipal",
      "Mampong Municipal", "Sekyere Central", "Sekyere Afram Plains North", "Sekyere Kumawu",
    ],
    farmers: "11,400+", hectares: "17,200 ha",
    activities: ["Agroforestry", "Tree planting", "Regenerative farming"],
    monitoring: ["Satellite imagery", "Drone verification", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Biodiversity", "Climate resilience"],
  },
  {
    id: "western-north", name: "Western North", standard: "future", status: "Planned", col: 0, row: 4,
    activities: ["Feasibility scoping", "Community radio outreach"],
    monitoring: ["Satellite baseline mapping"],
    benefits: ["Future farmer income"],
  },
  {
    id: "eastern", name: "Eastern", standard: "ofp", status: "Active", col: 2, row: 4,
    districts: ["Asuogyaman", "Upper Manya", "Yilo Krobo", "Lower Manya"],
    farmers: "8,700+", hectares: "13,100 ha",
    activities: ["Agroforestry", "Tree planting", "Regenerative farming"],
    monitoring: ["Satellite imagery", "Drone verification", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Biodiversity", "Climate resilience"],
  },
  {
    id: "oti", name: "Oti", standard: "vm0047", status: "Active", col: 3, row: 1,
    districts: ["Nkwanta North", "Nkwanta South Municipal", "Krachi East Municipal", "Kadjebi", "Jasikan", "Biakoye"],
    farmers: "5,600+", hectares: "8,900 ha",
    activities: ["Afforestation", "Reforestation", "Community woodlots"],
    monitoring: ["Satellite imagery", "Drone verification", "Field agent inspections"],
    benefits: ["Farmer income", "Carbon credits", "Forest restoration"],
  },
  {
    id: "volta", name: "Volta", standard: "vm0047", status: "Active", col: 3, row: 3,
    districts: ["Kpando Municipal", "North Dayi", "South Dayi", "North Tongu", "South Tongu"],
    farmers: "4,300+", hectares: "6,600 ha",
    activities: ["Afforestation", "Reforestation", "Community woodlots"],
    monitoring: ["Satellite imagery", "Drone verification"],
    benefits: ["Farmer income", "Carbon credits", "Forest restoration"],
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
