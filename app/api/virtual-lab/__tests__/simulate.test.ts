// app/api/virtual-lab/__tests__/simulate.test.ts
import { NextRequest } from 'next/server';
import { POST } from '../simulate/route';

// Mock do NextRequest
const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
};

describe('/api/virtual-lab/simulate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles start action successfully', async () => {
    const request = createMockRequest({
      experimentId: 'test-experiment',
      parameters: { temperature: 25 },
      action: 'start'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('running');
    expect(data.data.message).toBe('Simulation started successfully');
    expect(data.data.timestamp).toBeDefined();
  });

  it('handles pause action successfully', async () => {
    const request = createMockRequest({
      experimentId: 'test-experiment',
      action: 'pause'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('paused');
    expect(data.data.message).toBe('Simulation paused');
  });

  it('handles reset action successfully', async () => {
    const request = createMockRequest({
      experimentId: 'test-experiment',
      action: 'reset'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('stopped');
    expect(data.data.message).toBe('Simulation reset');
  });

  it('handles update_parameters action successfully', async () => {
    const parameters = { temperature: 30, concentration: 75 };
    const request = createMockRequest({
      experimentId: 'test-experiment',
      parameters,
      action: 'update_parameters'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('updated');
    expect(data.data.message).toBe('Parameters updated successfully');
    expect(data.data.parameters).toEqual(parameters);
  });

  it('handles invalid action', async () => {
    const request = createMockRequest({
      experimentId: 'test-experiment',
      action: 'invalid_action'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid action');
  });

  it('handles request parsing error', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Parse error')),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Simulation failed');
  });
});
