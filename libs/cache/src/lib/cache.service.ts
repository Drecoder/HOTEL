// NodeCache setup
import NodeCache from 'node-cache';

export const roomCache = new NodeCache({
  stdTTL: 60, // cache TTL in seconds
  checkperiod: 120,
});
