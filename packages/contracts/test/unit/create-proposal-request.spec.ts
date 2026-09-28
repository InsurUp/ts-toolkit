import { describe, it, expect } from 'vitest';
import type { CreateProposalRequest } from '../../src/proposals.js';
import { Channel, ProductBranch } from '../../src/common.base.js';
import { TravelCountry, TravelOption, TravelReason } from '../../src/travel.js';

const base = {
  insurerCustomerId: '11111111-1111-1111-1111-111111111111',
  insuredCustomerId: '22222222-2222-2222-2222-222222222222',
  channel: Channel.Website,
} as const;

const wire = (request: CreateProposalRequest): unknown => JSON.parse(JSON.stringify(request));

describe('CreateProposalRequest wire shape (core CreateProposalEndpointRequest parity)', () => {
  it('serializes TSS additional insured customers as a Guid array', () => {
    const request: CreateProposalRequest = {
      ...base,
      $type: 'tss',
      productBranch: ProductBranch.Tss,
      additionalInsuredCustomers: ['33333333-3333-3333-3333-333333333333'],
      forceBypassRenewalPeriod: false,
    };
    expect(wire(request)).toEqual({
      ...base,
      $type: 'tss',
      productBranch: 'TSS',
      additionalInsuredCustomers: ['33333333-3333-3333-3333-333333333333'],
      forceBypassRenewalPeriod: false,
    });
  });

  it('serializes seyahat-saglik with DateOnly strings and string enums', () => {
    const request: CreateProposalRequest = {
      ...base,
      $type: 'seyahat-saglik',
      productBranch: ProductBranch.Seyahat,
      travelStartDate: '2026-10-01',
      travelEndDate: '2026-10-10',
      travelOption: TravelOption.SchengenStandard,
      country: TravelCountry.Yunanistan,
      travelReason: TravelReason.BusinessTrip,
    };
    expect(wire(request)).toMatchObject({
      $type: 'seyahat-saglik',
      productBranch: 'SEYAHAT',
      travelOption: 'SCHENGEN_STANDARD',
      country: 'YUNANISTAN',
      travelReason: 'BUSINESS_TRIP',
    });
  });

  it('uses the core discriminators and product branch values for every new branch', () => {
    const city = { value: '34', text: 'İSTANBUL' };
    const requests: CreateProposalRequest[] = [
      { ...base, $type: 'oss', productBranch: ProductBranch.Oss, additionalInsuredCustomers: [] },
      {
        ...base,
        $type: 'incoming-travel-health',
        productBranch: ProductBranch.IncomingSeyahatSaglik,
        travelStartDate: '2026-10-01',
        travelEndDate: '2026-10-10',
        travelCity: city,
        addressId: '44444444-4444-4444-4444-444444444444',
      },
      { ...base, $type: 'saglik', productBranch: ProductBranch.Saglik },
      { ...base, $type: 'ferdi_kaza', productBranch: ProductBranch.FerdiKaza, vehicleId: null },
      {
        ...base,
        $type: 'yabanci-saglik',
        productBranch: ProductBranch.YabanciSaglik,
        addressId: '44444444-4444-4444-4444-444444444444',
        residenceCity: city,
      },
      {
        ...base,
        $type: 'pet',
        productBranch: ProductBranch.Pet,
        petId: '55555555-5555-5555-5555-555555555555',
      },
      {
        ...base,
        $type: 'tehlikeli-hastaliklar',
        productBranch: ProductBranch.TehlikeliHastaliklar,
      },
    ];
    expect(requests.map((r) => [r.$type, r.productBranch])).toEqual([
      ['oss', 'OZEL_SAGLIK'],
      ['incoming-travel-health', 'INCOMING_SEYAHAT_SAGLIK'],
      ['saglik', 'SAGLIK'],
      ['ferdi_kaza', 'FERDI_KAZA'],
      ['yabanci-saglik', 'YABANCI_SAGLIK'],
      ['pet', 'PET'],
      ['tehlikeli-hastaliklar', 'TEHLIKELI_HASTALIKLAR'],
    ]);
  });
});

describe('TravelCountry', () => {
  it('mirrors all 175 backend members', () => {
    expect(Object.values(TravelCountry)).toHaveLength(175);
  });
});
