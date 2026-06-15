import { scoreCareGap, type CareGapScenario, type EvidenceStrength } from './careGap';

export type UnknownRow = Record<string, unknown>;

const FIELD_CANDIDATES = {
  facilityName: ['facility_name', 'facilityname', 'name', 'hospital_name', 'provider_name'],
  district: ['district', 'district_name', 'districtname'],
  city: ['city', 'town', 'locality'],
  state: ['state', 'province'],
  postcode: ['postcode', 'pincode', 'postal_code', 'postalcode', 'zip'],
  latitude: ['latitude', 'lat', 'facility_latitude', 'approx_latitude'],
  longitude: ['longitude', 'lon', 'lng', 'facility_longitude', 'approx_longitude'],
  specialty: ['specialties', 'specialty', 'services', 'service_line', 'care_type'],
  description: ['description', 'capabilities', 'capability', 'procedure', 'procedures', 'equipment'],
  sourceUrls: ['source_urls', 'sourceurl', 'source_url', 'urls', 'website'],
  insurance: ['insurance', 'insurance_coverage', 'health_insurance_coverage', 'insurancecoverage'],
  outOfPocket: [
    'average_out_of_pocket_expenditure_per_delivery_in_a_public_fac',
    'out_of_pocket',
    'delivery_cost',
    'delivery_expense',
  ],
} as const;

const MATERNAL_KEYWORDS = [
  'maternal',
  'maternity',
  'delivery',
  'obstetric',
  'obstetrics',
  'gyne',
  'gynec',
  'antenatal',
  'postnatal',
  'newborn',
];

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function rowEntries(row: UnknownRow) {
  return Object.entries(row);
}

function pickEntry(row: UnknownRow, candidateKeys: readonly string[]) {
  const normalizedCandidates = new Set(candidateKeys.map(normalizeKey));

  for (const [key, value] of rowEntries(row)) {
    if (normalizedCandidates.has(normalizeKey(key))) {
      return value;
    }
  }

  return undefined;
}

export function toRow(value: unknown): UnknownRow | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRow) : null;
}

export function pickString(row: UnknownRow, candidates: readonly string[]) {
  const value = pickEntry(row, candidates);
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

export function pickNumber(row: UnknownRow, candidates: readonly string[]) {
  const value = pickEntry(row, candidates);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function pickStringList(row: UnknownRow, candidates: readonly string[]) {
  const value = pickEntry(row, candidates);
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

export function getTextBlob(row: UnknownRow) {
  return [
    pickString(row, FIELD_CANDIDATES.specialty),
    pickString(row, FIELD_CANDIDATES.description),
    pickString(row, ['capability', 'capabilities']),
    pickString(row, ['procedure', 'procedures']),
    pickString(row, ['equipment']),
    pickString(row, FIELD_CANDIDATES.sourceUrls),
  ]
    .filter(Boolean)
    .join(' | ');
}

export function isMaternalRecord(row: UnknownRow) {
  const blob = getTextBlob(row).toLowerCase();
  return MATERNAL_KEYWORDS.some((keyword) => blob.includes(keyword));
}

export function deriveEvidenceStrength(row: UnknownRow): EvidenceStrength {
  const snippets = [
    pickString(row, FIELD_CANDIDATES.specialty),
    pickString(row, FIELD_CANDIDATES.description),
    pickString(row, ['capability', 'capabilities']),
    pickString(row, ['procedure', 'procedures']),
    pickString(row, ['equipment']),
    pickString(row, FIELD_CANDIDATES.sourceUrls),
  ].filter(Boolean);

  const richFields = snippets.filter((snippet) => snippet.length >= 18).length;

  if (snippets.length >= 4 && richFields >= 2) return 'strong';
  if (snippets.length >= 2) return 'partial';
  if (snippets.length >= 1) return 'weak';
  return 'none';
}

function keyFromRow(row: UnknownRow) {
  return (
    pickString(row, FIELD_CANDIDATES.district) ||
    pickString(row, FIELD_CANDIDATES.city) ||
    pickString(row, FIELD_CANDIDATES.state) ||
    pickString(row, FIELD_CANDIDATES.postcode) ||
    'Unknown geography'
  );
}

function numericRowsByPattern(row: UnknownRow, patterns: RegExp[]) {
  return rowEntries(row)
    .filter(([key, value]) => patterns.some((pattern) => pattern.test(normalizeKey(key))) && typeof value === 'number' && Number.isFinite(value))
    .map(([, value]) => value as number);
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function normalizePercent(value: number | null, fallback = 50) {
  if (value == null || !Number.isFinite(value)) return fallback;
  if (value >= 0 && value <= 1) return Math.round(value * 100);
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeRatio(value: number | null, fallback = 0.45) {
  if (value == null || !Number.isFinite(value)) return fallback;
  if (value > 1) return Math.max(0, Math.min(1, value / 10000));
  return Math.max(0, Math.min(1, value));
}

function getLatitude(row: UnknownRow) {
  return pickNumber(row, FIELD_CANDIDATES.latitude);
}

function getLongitude(row: UnknownRow) {
  return pickNumber(row, FIELD_CANDIDATES.longitude);
}

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDelta = toRad(b.latitude - a.latitude);
  const lonDelta = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinLat = Math.sin(latDelta / 2);
  const sinLon = Math.sin(lonDelta / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

function estimateTravelMinutes(
  districtRows: UnknownRow[],
  facilityRows: UnknownRow[],
  pincodeRows: UnknownRow[],
) {
  const facilityPoints = facilityRows
    .map((row) => ({ latitude: getLatitude(row), longitude: getLongitude(row) }))
    .filter((point): point is { latitude: number; longitude: number } => point.latitude != null && point.longitude != null);

  const pincodePoints = pincodeRows
    .map((row) => ({ latitude: getLatitude(row), longitude: getLongitude(row) }))
    .filter((point): point is { latitude: number; longitude: number } => point.latitude != null && point.longitude != null);

  const pairDistances = pincodePoints.flatMap((pincodePoint) =>
    facilityPoints.map((facilityPoint) =>
      haversineKm(
        { latitude: pincodePoint.latitude, longitude: pincodePoint.longitude },
        { latitude: facilityPoint.latitude, longitude: facilityPoint.longitude },
      ),
    ),
  );

  const nearestKm = pairDistances.length ? Math.min(...pairDistances) : null;
  if (nearestKm != null && Number.isFinite(nearestKm)) {
    return Math.max(5, Math.round(nearestKm * 2.4 + 8));
  }

  const fallbackDistance = districtRows.length || facilityRows.length || pincodeRows.length;
  return Math.max(15, Math.min(120, 25 + fallbackDistance * 3));
}

function scoreBurdenFromRow(row: UnknownRow) {
  const weightedNumbers = numericRowsByPattern(row, [
    /maternal/,
    /child/,
    /anemia/,
    /diabetes/,
    /hypertension/,
    /nutrition/,
    /sanitation/,
    /insurance/,
    /education/,
    /birth/,
    /delivery/,
  ]);

  if (!weightedNumbers.length) {
    const fallback = numericRowsByPattern(row, [/rate/, /pct/, /percent/, /coverage/]);
    if (fallback.length) {
      return Math.max(0, Math.min(100, Math.round(median(fallback) ?? 50)));
    }
    return 52;
  }

  return Math.max(0, Math.min(100, Math.round(median(weightedNumbers) ?? 52)));
}

export interface LiveCareGapScenario extends CareGapScenario {
  sourceCount: number;
  districtLabel: string;
  exampleFacility: string;
}

export interface LiveSnapshotSummary {
  facilityCount: number;
  maternalFacilityCount: number;
  districtCount: number;
  pincodeCount: number;
  liveCoverageCount: number;
  averageScore: number;
}

export function buildLiveCareGapScenarios(bundle: {
  facilities: UnknownRow[];
  districts: UnknownRow[];
  pincodes: UnknownRow[];
}) {
  const maternalFacilities = bundle.facilities.filter((row) => isMaternalRecord(row));
  const sourceFacilities = maternalFacilities.length ? maternalFacilities : bundle.facilities;

  const facilityGroups = new Map<string, UnknownRow[]>();
  for (const row of sourceFacilities) {
    const key = keyFromRow(row);
    const current = facilityGroups.get(key) ?? [];
    current.push(row);
    facilityGroups.set(key, current);
  }

  const districtLookup = new Map<string, UnknownRow[]>();
  for (const row of bundle.districts) {
    const key = keyFromRow(row);
    const current = districtLookup.get(key) ?? [];
    current.push(row);
    districtLookup.set(key, current);
  }

  const pincodeLookup = new Map<string, UnknownRow[]>();
  for (const row of bundle.pincodes) {
    const key = keyFromRow(row);
    const current = pincodeLookup.get(key) ?? [];
    current.push(row);
    pincodeLookup.set(key, current);
  }

  const scenarios: LiveCareGapScenario[] = [];

  for (const [districtLabel, facilities] of facilityGroups) {
    const districtRows = districtLookup.get(districtLabel) ?? [];
    const pincodeRows = pincodeLookup.get(districtLabel) ?? [];
    const trustPenaltyAverage =
      facilities.reduce((sum, row) => {
        const strength = deriveEvidenceStrength(row);
        const penalty =
          strength === 'strong' ? 10 : strength === 'partial' ? 28 : strength === 'weak' ? 48 : 70;
        return sum + penalty;
      }, 0) / Math.max(1, facilities.length);

    const trustStrength: EvidenceStrength =
      trustPenaltyAverage <= 18
        ? 'strong'
        : trustPenaltyAverage <= 38
          ? 'partial'
          : trustPenaltyAverage <= 60
            ? 'weak'
            : 'none';

    const districtRow = districtRows[0] ?? {};
    const outOfPocketValue = pickNumber(districtRow, FIELD_CANDIDATES.outOfPocket);
    const insuranceValue = pickNumber(districtRow, FIELD_CANDIDATES.insurance);
    const burdenValue = scoreBurdenFromRow(districtRow);
    const facilityDensity = facilities.length / Math.max(1, pincodeRows.length || districtRows.length || 1);
    const travelMinutes = estimateTravelMinutes(districtRows, facilities, pincodeRows);

    const scored = scoreCareGap({
      districtName: districtLabel,
      specialty: 'Maternal delivery care',
      travelMinutes,
      trustStrength,
      outOfPocketRatio: normalizeRatio(outOfPocketValue),
      insuranceCoveragePct: normalizePercent(insuranceValue),
      burdenScore: burdenValue,
      facilityDensity,
    });

    scenarios.push({
      districtName: districtLabel,
      specialty: 'Maternal delivery care',
      travelMinutes,
      trustStrength,
      outOfPocketRatio: normalizeRatio(outOfPocketValue),
      insuranceCoveragePct: normalizePercent(insuranceValue),
      burdenScore: burdenValue,
      facilityDensity,
      total: scored.total,
      band: scored.band,
      summary: scored.reasons[0],
      sourceCount: facilities.length,
      districtLabel,
      exampleFacility: pickString(facilities[0], FIELD_CANDIDATES.facilityName) || districtLabel,
    });
  }

  return scenarios.sort((a, b) => b.total - a.total);
}

export function buildLiveSnapshotSummary(bundle: {
  facilities: UnknownRow[];
  districts: UnknownRow[];
  pincodes: UnknownRow[];
  scenarios: LiveCareGapScenario[];
}): LiveSnapshotSummary {
  return {
    facilityCount: bundle.facilities.length,
    maternalFacilityCount: bundle.facilities.filter((row) => isMaternalRecord(row)).length,
    districtCount: bundle.districts.length,
    pincodeCount: bundle.pincodes.length,
    liveCoverageCount: new Set(bundle.scenarios.map((scenario) => scenario.districtName)).size,
    averageScore:
      bundle.scenarios.length > 0
        ? Math.round(bundle.scenarios.reduce((sum, scenario) => sum + scenario.total, 0) / bundle.scenarios.length)
        : 0,
  };
}

export function evidenceBandLabel(strength: EvidenceStrength) {
  switch (strength) {
    case 'strong':
      return 'Strong';
    case 'partial':
      return 'Partial';
    case 'weak':
      return 'Weak';
    default:
      return 'None';
  }
}
