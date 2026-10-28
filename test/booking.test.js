const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');

function createPage({ slots = ['09:00', '10:00'], idleCallback = false } = {}) {
  const elements = Object.fromEntries(['slots', 'store', 'day', 'name', 'book'].map((id) => [id, {
    innerHTML: '', value: '', disabled: false, addEventListener() {},
  }]));
  const timers = [];
  const idleTasks = [];
  const context = vm.createContext({
    document: { getElementById: (id) => elements[id] },
    fetch: async (url) => {
      // Keep startup pending so each test controls loadSlots explicitly.
      if (url === '/api/stores') return new Promise(() => {});
      assert.equal(url, '/api/slots?store=sf&day=2026-11-03');
      return { json: async () => ({ slots }) };
    },
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
  });
  if (idleCallback) {
    context.requestIdleCallback = (callback, options) => idleTasks.push({ callback, options });
  }
  vm.runInContext(script, context);
  elements.name.value = 'Jane';
  vm.runInContext("state.store = 'sf'; state.day = '2026-11-03'; state.time = '09:00';", context);
  return { context, elements, timers, idleTasks };
}

test('renders fetched slots without requestIdleCallback, as in iOS Safari', async () => {
  const { context, elements, timers, idleTasks } = createPage();
  assert.equal(vm.runInContext("typeof requestIdleCallback", context), 'undefined');

  await vm.runInContext('loadSlots()', context);

  assert.match(elements.slots.innerHTML, /Loading times/);
  assert.equal(elements.book.disabled, true);
  assert.equal(vm.runInContext('state.time', context), null);
  assert.equal(idleTasks.length, 0);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 0);
  timers[0].callback();
  assert.equal(elements.slots.innerHTML, '<button class="slot" data-time="09:00">09:00</button><button class="slot" data-time="10:00">10:00</button>');
});

test('keeps deferred idle rendering with a timeout when requestIdleCallback is available', async () => {
  const { context, elements, timers, idleTasks } = createPage({ idleCallback: true });

  await vm.runInContext('loadSlots()', context);

  assert.match(elements.slots.innerHTML, /Loading times/);
  assert.equal(elements.book.disabled, true);
  assert.equal(timers.length, 0);
  assert.equal(idleTasks.length, 1);
  assert.equal(idleTasks[0].options.timeout, 500);
  idleTasks[0].callback();
  assert.match(elements.slots.innerHTML, /data-time="09:00"/);
  assert.doesNotMatch(elements.slots.innerHTML, /Loading times/);
});

test('clears the loading message for an empty day without requestIdleCallback', async () => {
  const { context, elements, timers } = createPage({ slots: [] });

  await vm.runInContext('loadSlots()', context);
  assert.equal(timers.length, 1);
  timers[0].callback();

  assert.equal(elements.slots.innerHTML, '<span class="muted">No times left this day.</span>');
  assert.equal(elements.book.disabled, true);
});
