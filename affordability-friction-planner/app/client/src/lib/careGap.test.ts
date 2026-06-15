import { describe, expect, it } from 'vitest';
import {
  bandLabel,
  sampleScenarios,
  scoreCareGap,
  scoreTravel,
} from './careGap';

describe('careGap scoring', () => {
  it('scores longer travel as higher friction', () => {
    expect(scoreTravel(10)).toBeLessThan(scoreTravel(45));
    expect(scoreTravel(45)).toBeLessThan(scoreTravel(100));
  });

  it('labels the worst scenario as critical', () => {
    const worst = sampleScenarios.find((scenario) => scenario.districtName === 'Rural referral belt');
    expect(worst).toBeDefined();
    expect(worst?.band).toBe('critical');
    expect(worst?.total).toBeGreaterThan(80);
    expect(bandLabel(worst!.band)).toBe('Critical');
  });

  it('keeps mixed scenarios below critical', () => {
    const mixed = scoreCareGap({
      districtName: 'Test district',
      specialty: 'Maternal delivery care',
      travelMinutes: 28,
      trustStrength: 'partial',
      outOfPocketRatio: 0.31,
      insuranceCoveragePct: 45,
      burdenScore: 48,
      facilityDensity: 1.8,
    });

    expect(mixed.band).toBe('moderate');
    expect(mixed.total).toBeGreaterThan(35);
    expect(mixed.total).toBeLessThan(60);
  });
});
