const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { createApp } = require('../server/app');

test('returns slots for a store and day', async () => {
  const res = await request(createApp()).get('/api/slots?store=sf&day=2026-11-03');
  assert.ok(res.body.slots.length > 0);
});

test('creates a booking', async () => {
  const res = await request(createApp()).post('/api/bookings').send({ store: 'sf', day: '2026-11-03', time: '10:00', name: 'Jane' });
  assert.strictEqual(res.status, 201);
});
