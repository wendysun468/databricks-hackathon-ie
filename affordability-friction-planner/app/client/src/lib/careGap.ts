export type EvidenceStrength = 'strong' | 'partial' | 'weak' | 'none';

export interface CareGapInputs {
  districtName: string;
  specialty: string;
  travelMinutes: number;
  trustStrength: EvidenceStrength;
  outOfPocketRatio: number;
  insuranceCoveragePct: number;
  burdenScore: number;
  facilityDensity: number;
}

export interface CareGapScore {
  total: number;
  band: 'low' | 'moderate' | 'high' | 'critical';
  components: {
    travel: number;
    trust: number;
    affordability: number;
    burden: number;
    supply: number;
  };
  reasons: string[];
}

export interface CareGapScenario extends CareGapInputs {
  total: number;
  band: CareGapScore['band'];
  summary: string;
}

const TRUST_PENALTY: Record<EvidenceStrength, number> = {
  strong: 10,
  partial: 28,
  weak: 48,
  none: 70,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeOutOfPocket(value: number | null, fallback = 45) {
  if (value == null || !Number.isFinite(value)) return fallback;
  if (value >= 0 && value <= 1) return clamp(value * 100);
  if (value <= 100) return clamp(value);
  const scaled = (Math.log10(value + 1) / 4) * 100;
  return clamp(scaled);
}

export function scoreTravel(minutes: number) {
  if (!Number.isFinite(minutes)) return 0;
  if (minutes <= 15) return 8;
  if (minutes <= 30) return 36;
  if (minutes <= 60) return 64;
  if (minutes <= 90) return 82;
  return 94;
}

export function scoreTrust(trustStrength: EvidenceStrength) {
  return TRUST_PENALTY[trustStrength] ?? TRUST_PENALTY.none;
}

export function scoreAffordability(outOfPocketRatio: number, insuranceCoveragePct: number) {
  const oop = normalizeOutOfPocket(outOfPocketRatio);
  const insuranceRelief = clamp(100 - insuranceCoveragePct);
  return Math.round(oop * 0.65 + insuranceRelief * 0.35);
}

export function scoreBurden(burdenScore: number) {
  return clamp(burdenScore);
}

export function scoreSupply(facilityDensity: number) {
  if (!Number.isFinite(facilityDensity)) return 50;
  if (facilityDensity <= 0) return 92;
  if (facilityDensity < 0.5) return 78;
  if (facilityDensity < 1.5) return 54;
  if (facilityDensity < 3) return 32;
  return 16;
}

export function scoreCareGap(input: CareGapInputs): CareGapScore {
  const components = {
    travel: scoreTravel(input.travelMinutes),
    trust: scoreTrust(input.trustStrength),
    affordability: scoreAffordability(input.outOfPocketRatio, input.insuranceCoveragePct),
    burden: scoreBurden(input.burdenScore),
    supply: scoreSupply(input.facilityDensity),
  };

  const total = Math.round(
    components.travel * 0.28 +
      components.trust * 0.28 +
      components.affordability * 0.2 +
      components.burden * 0.14 +
      components.supply * 0.1,
  );

  const band =
    total >= 80 ? 'critical' : total >= 60 ? 'high' : total >= 35 ? 'moderate' : 'low';

  const reasons = explainScore(input, components, total);

  return { total, band, components, reasons };
}

function explainScore(
  input: CareGapInputs,
  components: CareGapScore['components'],
  total: number,
) {
  const reasons: string[] = [];

  if (components.travel >= 70) {
    reasons.push(`Travel time is ${input.travelMinutes} minutes to the nearest trusted facility.`);
  } else if (components.travel >= 35) {
    reasons.push(`Travel time is still meaningful at ${input.travelMinutes} minutes.`);
  }
  if (components.trust >= 60) {
    reasons.push(`Nearby facility evidence is ${input.trustStrength} rather than strong.`);
  }
  if (components.affordability >= 60) {
    reasons.push('Out-of-pocket pressure remains high after insurance relief.');
  }
  if (components.burden >= 60) {
    reasons.push('District burden indicators suggest higher need.');
  }
  if (components.supply >= 70) {
    reasons.push('Facility density is thin, so nearby options may not be sufficient.');
  }

  if (!reasons.length) {
    reasons.push('This area looks more like a watch zone than a crisis zone.');
  }

  if (total >= 80) {
    reasons.unshift('This is a high-priority hidden access gap.');
  } else if (total >= 60) {
    reasons.unshift('This area should be investigated first.');
  } else if (total >= 35) {
    reasons.unshift('This area is mixed and needs more evidence.');
  }

  return reasons;
}

export function bandLabel(band: CareGapScore['band']) {
  switch (band) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    default:
      return 'Low';
  }
}

const sampleScenarioInputs: CareGapInputs[] = [
  {
    districtName: 'Purnia',
    specialty: 'Maternal delivery care',
    travelMinutes: 78,
    trustStrength: 'weak',
    outOfPocketRatio: 0.58,
    insuranceCoveragePct: 21,
    burdenScore: 84,
    facilityDensity: 0.4,
  },
  {
    districtName: 'Kolkata fringe',
    specialty: 'Maternal delivery care',
    travelMinutes: 24,
    trustStrength: 'partial',
    outOfPocketRatio: 0.36,
    insuranceCoveragePct: 48,
    burdenScore: 52,
    facilityDensity: 2.1,
  },
  {
    districtName: 'Rural referral belt',
    specialty: 'Emergency obstetric care',
    travelMinutes: 94,
    trustStrength: 'none',
    outOfPocketRatio: 0.63,
    insuranceCoveragePct: 14,
    burdenScore: 91,
    facilityDensity: 0.2,
  },
];

export const sampleScenarios: CareGapScenario[] = sampleScenarioInputs.map((scenario) => {
  const scored = scoreCareGap(scenario);
  return {
    ...scenario,
    total: scored.total,
    band: scored.band,
    summary: scored.reasons[0],
  };
});
