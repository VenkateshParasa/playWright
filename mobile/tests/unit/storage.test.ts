import { storage } from '../../src/utils/storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set and get data', async () => {
    const testData = { name: 'Test User', id: 1 };
    await storage.set('testKey', testData);
    const result = await storage.get('testKey');
    expect(result).toEqual(testData);
  });

  it('should remove data', async () => {
    await storage.set('testKey', 'testValue');
    await storage.remove('testKey');
    const result = await storage.get('testKey');
    expect(result).toBeNull();
  });

  it('should return null for non-existent key', async () => {
    const result = await storage.get('nonExistentKey');
    expect(result).toBeNull();
  });
});
