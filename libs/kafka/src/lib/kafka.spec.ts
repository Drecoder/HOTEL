import { kafka } from './kafka';

describe('kafka', () => {
  it('should work', () => {
    expect(kafka()).toEqual('kafka');
  });
});
