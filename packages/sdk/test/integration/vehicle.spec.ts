import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { sampleVehicleBrands, sampleVehicleByBrandCode } from './fixtures/vehicle';

const t = setupIntegrationTest();

describe('VehicleClient', () => {
  it('getCustomerVehicle embeds customer + vehicle ids in path', async () => {
    server.use(
      http.get(`${BASE_URL}/customers/:customerId/vehicles/:vehicleId`, ({ params }) => {
        expect(params.customerId).toBe('CUS-9');
        expect(params.vehicleId).toBe('VEH-42');
        return HttpResponse.json({ id: 'VEH-42', plate: '34ABC123' });
      })
    );

    const result = await t.client.vehicles.getCustomerVehicle('CUS-9', 'VEH-42');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('VEH-42');
    }
  });

  it('getCustomerVehicles returns parsed array for a customer', async () => {
    server.use(
      http.get(`${BASE_URL}/customers/:customerId/vehicles`, ({ params }) => {
        expect(params.customerId).toBe('CUS-9');
        return HttpResponse.json([
          { id: 'VEH-1', plate: '34A1' },
          { id: 'VEH-2', plate: '34A2' },
        ]);
      })
    );

    const result = await t.client.vehicles.getCustomerVehicles({ customerId: 'CUS-9' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
    }
  });

  it('getCustomerVehicle maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/customers/:customerId/vehicles/:vehicleId`, () => notFound()));

    const result = await t.client.vehicles.getCustomerVehicle('CUS-9', 'missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('deleteCustomerVehicle sends DELETE', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(
        `${BASE_URL}/customers/:customerId/vehicles/:vehicleId`,
        ({ request, params }) => {
          methodSeen = request.method;
          expect(params.customerId).toBe('CUS-9');
          expect(params.vehicleId).toBe('VEH-1');
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    await t.client.vehicles.deleteCustomerVehicle('CUS-9', 'VEH-1');

    expect(methodSeen).toBe('DELETE');
  });

  it('queryVehicleBrands returns parsed array', async () => {
    server.use(
      http.get(`${BASE_URL}/vehicle-parameters/brands`, () =>
        HttpResponse.json(sampleVehicleBrands)
      )
    );

    const result = await t.client.vehicles.queryVehicleBrands();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.text).toBe(sampleVehicleBrands[0]?.text);
    }
  });

  it('queryVehicleModels forwards brandReference and year as query params', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/vehicle-parameters/models`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([{ value: 'COROLLA', text: 'Corolla', reference: 'COROLLA' }]);
      })
    );

    const result = await t.client.vehicles.queryVehicleModels({
      brandReference: 'TOY',
      year: 2024,
    });

    expect(capturedUrl).toContain('brandReference=TOY');
    expect(capturedUrl).toContain('year=2024');
    expect(result.kind).toBe('success');
  });

  it('queryVehicleByBrandCode POSTs brandCode and returns parsed response', async () => {
    let receivedBody: { brandCode?: string } | undefined;
    server.use(
      http.post(
        `${BASE_URL}/insurance-services/query-vehicle-by-brand-code`,
        async ({ request }) => {
          receivedBody = (await request.json()) as typeof receivedBody;
          return HttpResponse.json(sampleVehicleByBrandCode);
        }
      )
    );

    const result = await t.client.vehicles.queryVehicleByBrandCode('TY');

    expect(receivedBody?.brandCode).toBe('TY');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.model).toEqual(sampleVehicleByBrandCode.model);
    }
  });
});
