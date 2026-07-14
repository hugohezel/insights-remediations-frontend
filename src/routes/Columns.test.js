import columns, { Expiration } from './Columns';

describe('routes/Columns', () => {
  it('includes an Expiration column with the expected API sort key', () => {
    expect(Expiration.title).toBe('Expiration');
    expect(Expiration.sortable).toBe('expires_at');
    expect(Expiration.exportKey).toBe('expires_at');
  });

  it('configures the Expiration column with header transforms', () => {
    expect(Expiration.transforms).toHaveLength(2);
    expect(Expiration.transforms.every((transform) => typeof transform === 'function')).toBe(true);
  });

  it('exports the Expiration column in the table columns list', () => {
    expect(columns).toContain(Expiration);
  });
});
