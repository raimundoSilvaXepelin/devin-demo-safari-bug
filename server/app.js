const express = require('express');
const path = require('path');

const STORES = [
  { id: 'sf', name: 'San Francisco — Market St' },
  { id: 'den', name: 'Denver — Larimer Sq' },
  { id: 'nyc', name: 'New York — SoHo' },
];

function slotsFor(storeId, day) {
  const seed = [...(storeId + day)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return ['09:00', '09:30', '10:00', '11:00', '13:30', '14:00', '15:30', '16:00', '17:30'].filter((_, i) => (seed + i) % 3 !== 0);
}

function createApp() {
  const app = express();
  const bookings = [];
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get('/api/stores', (req, res) => res.json(STORES));
  app.get('/api/slots', (req, res) => {
    const { store, day } = req.query;
    if (!STORES.some((s) => s.id === store) || !/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return res.status(400).json({ error: 'store and day required' });
    res.json({ store, day, slots: slotsFor(store, day) });
  });
  app.post('/api/bookings', (req, res) => {
    const { store, day, time, name } = req.body || {};
    if (!store || !day || !time || !name) return res.status(400).json({ error: 'missing fields' });
    const b = { id: 'bk_' + (bookings.length + 1), store, day, time, name };
    bookings.push(b);
    res.status(201).json(b);
  });
  return app;
}

module.exports = { createApp, slotsFor };
