import { describe, expect, it } from 'vitest';
import { buildLiveCareGapScenarios } from './databricksData';

describe('databricksData live scoring', () => {
  it('joins district, facility, and pincode rows into one scored scenario', () => {
    const scenarios = buildLiveCareGapScenarios({
      districts: [
        {
          district_name: 'District A',
          state_ut: 'State X',
          average_out_of_pocket_expenditure_per_delivery_in_a_public_fac: '2500',
          hh_member_covered_health_insurance_pct: 18,
          mothers_who_had_at_least_4_anc_visits_lb5y_pct: 61,
          institutional_birth_in_public_facility_5y_pct: 29,
        },
      ],
      facilities: [
        {
          name: 'District A Maternity Hospital',
          address_city: 'District A',
          address_stateOrRegion: 'State X',
          address_zipOrPostcode: '123456',
          specialties: 'Maternal delivery care',
          description: 'Obstetric delivery unit with maternity ward and postpartum follow-up.',
          capability: 'Emergency obstetric care',
          procedure: 'Normal delivery, cesarean section',
          latitude: 10,
          longitude: 20,
          source_urls: 'https://example.com/maternity',
        },
      ],
      pincodes: [
        {
          district: 'District A',
          statename: 'State X',
          pincode: 123456,
          latitude: '10.15',
          longitude: '20.12',
        },
      ],
    });

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.districtName).toBe('District A');
    expect(scenarios[0]?.sourceCount).toBe(1);
    expect(scenarios[0]?.trustStrength).toBe('strong');
    expect(scenarios[0]?.summary.length).toBeGreaterThan(0);
    expect(scenarios[0]?.total).toBeGreaterThan(0);
  });

  it('does not join across state boundaries', () => {
    const scenarios = buildLiveCareGapScenarios({
      districts: [
        {
          district_name: 'District A',
          state_ut: 'State X',
        },
      ],
      facilities: [
        {
          name: 'District A Maternity Hospital',
          address_city: 'District A',
          address_stateOrRegion: 'State Y',
          address_zipOrPostcode: '123456',
          specialties: 'Maternal delivery care',
          description: 'Obstetric delivery unit with maternity ward and postpartum follow-up.',
          capability: 'Emergency obstetric care',
          procedure: 'Normal delivery, cesarean section',
          latitude: 10,
          longitude: 20,
          source_urls: 'https://example.com/maternity',
        },
      ],
      pincodes: [
        {
          district: 'District A',
          statename: 'State X',
          pincode: 123456,
          latitude: '10.15',
          longitude: '20.12',
        },
      ],
    });

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.sourceCount).toBe(0);
  });

  it('requires provenance for a strong evidence grade', () => {
    const scenarios = buildLiveCareGapScenarios({
      districts: [
        {
          district_name: 'District A',
          state_ut: 'State X',
        },
      ],
      facilities: [
        {
          name: 'District A Maternity Hospital',
          address_city: 'District A',
          address_stateOrRegion: 'State X',
          address_zipOrPostcode: '123456',
          specialties: 'Maternal delivery care',
          description: 'Obstetric delivery unit with maternity ward and postpartum follow-up.',
          capability: 'Emergency obstetric care',
          procedure: 'Normal delivery, cesarean section',
          latitude: 10,
          longitude: 20,
        },
      ],
      pincodes: [
        {
          district: 'District A',
          statename: 'State X',
          pincode: 123456,
          latitude: '10.15',
          longitude: '20.12',
        },
      ],
    });

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.trustStrength).not.toBe('strong');
  });
});
