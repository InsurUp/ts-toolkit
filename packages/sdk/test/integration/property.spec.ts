import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { sampleParameters, sampleProperties } from './fixtures/property';

const t = setupIntegrationTest();

describe('PropertyClient', () => {
  describe('address parameter queries', () => {
    it('queryCities returns parsed array', async () => {
      server.use(
        http.get(`${BASE_URL}/address-parameters/cities`, () => HttpResponse.json(sampleParameters))
      );

      const result = await t.client.properties.queryCities();

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.reference).toBe('PARAM-1');
        expect(result.data[0]?.text).toBe('First');
      }
    });

    it('queryDistricts forwards cityReference as query param', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/address-parameters/districts`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(sampleParameters);
        })
      );

      const result = await t.client.properties.queryDistricts({ cityReference: 'IST-34' });

      expect(result.kind).toBe('success');
      expect(capturedUrl).toContain('cityReference=IST-34');
    });

    it('queryTowns forwards districtReference as query param', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/address-parameters/towns`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(sampleParameters);
        })
      );

      await t.client.properties.queryTowns({ districtReference: 'KAD-3401' });

      expect(capturedUrl).toContain('districtReference=KAD-3401');
    });

    it('queryNeighborhoods forwards townReference as query param', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/address-parameters/neighbourhoods`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(sampleParameters);
        })
      );

      await t.client.properties.queryNeighborhoods({ townReference: 'TOW-99' });

      expect(capturedUrl).toContain('townReference=TOW-99');
    });

    it('queryStreets forwards neighbourhoodReference and returns parsed array', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/address-parameters/streets`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json([{ value: '123', text: 'Bahariye Cad.', reference: 'ST-123' }]);
        })
      );

      const result = await t.client.properties.queryStreets({ neighbourhoodReference: 'NB-1' });

      expect(capturedUrl).toContain('neighbourhoodReference=NB-1');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toEqual([{ value: '123', text: 'Bahariye Cad.', reference: 'ST-123' }]);
      }
    });

    it('queryBuildings forwards streetReference as query param', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/address-parameters/buildings`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(sampleParameters);
        })
      );

      await t.client.properties.queryBuildings({ streetReference: 'ST-123' });

      expect(capturedUrl).toContain('streetReference=ST-123');
    });

    it('queryApartments forwards buildingReference as query param', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/address-parameters/apartments`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(sampleParameters);
        })
      );

      await t.client.properties.queryApartments({ buildingReference: 'BLD-7' });

      expect(capturedUrl).toContain('buildingReference=BLD-7');
    });
  });

  describe('customer property CRUD', () => {
    it('getCustomerProperties hits the customer-scoped endpoint and returns array', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE_URL}/customers/:customerId/properties`, ({ request, params }) => {
          capturedUrl = request.url;
          expect(params.customerId).toBe('CUS-42');
          return HttpResponse.json(sampleProperties);
        })
      );

      const result = await t.client.properties.getCustomerProperties('CUS-42');

      expect(capturedUrl).toContain('/customers/CUS-42/properties');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toHaveLength(sampleProperties.length);
        expect(result.data[0]?.id).toBe(sampleProperties[0]?.id);
      }
    });

    it('getCustomerPropertyById returns the specific property', async () => {
      server.use(
        http.get(`${BASE_URL}/customers/:customerId/properties/:propertyId`, ({ params }) => {
          expect(params.customerId).toBe('CUS-42');
          expect(params.propertyId).toBe('PROP-7');
          return HttpResponse.json({ id: 'PROP-7', address: 'Kadikoy' });
        })
      );

      const result = await t.client.properties.getCustomerPropertyById('CUS-42', 'PROP-7');

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.id).toBe('PROP-7');
      }
    });

    it('deleteCustomerProperty sends DELETE to the correct path', async () => {
      let methodSeen: string | undefined;
      server.use(
        http.delete(
          `${BASE_URL}/customers/:customerId/properties/:propertyId`,
          ({ request, params }) => {
            methodSeen = request.method;
            expect(params.customerId).toBe('CUS-42');
            expect(params.propertyId).toBe('PROP-7');
            return new HttpResponse(null, { status: 204 });
          }
        )
      );

      const result = await t.client.properties.deleteCustomerProperty('CUS-42', 'PROP-7');

      expect(methodSeen).toBe('DELETE');
      expect(result.kind).toBe('success');
    });

    it('getCustomerPropertyById maps 404 to ResourceNotFound', async () => {
      server.use(
        http.get(`${BASE_URL}/customers/:customerId/properties/:propertyId`, () =>
          notFound('Property not found')
        )
      );

      const result = await t.client.properties.getCustomerPropertyById('CUS-42', 'missing');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(404);
        expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
      }
    });
  });
});
