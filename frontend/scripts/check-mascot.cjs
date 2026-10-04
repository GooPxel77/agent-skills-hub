const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'osint-mascot-'));
try {
  const files = { config: 'src/mascot.config.ts', drives: 'src/mascot/engine/drives.ts', selection: 'src/mascot/engine/selection.ts', player: 'src/mascot/engine/player.ts' };
  for (const [name, file] of Object.entries(files)) {
    const source = fs.readFileSync(file, 'utf8').replaceAll('../../mascot.config', './config.cjs').replaceAll('"./drives"', '"./drives.cjs"').replaceAll('"./selection"', '"./selection.cjs"');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
    fs.writeFileSync(path.join(temp, name + '.cjs'), compiled.outputText);
  }
  const { MascotEngine } = require(path.join(temp, 'player.cjs'));
  const { selectBehavior } = require(path.join(temp, 'selection.cjs'));
  const { mascotConfig: config } = require(path.join(temp, 'config.cjs'));
  let passed = 0;
  const check = (label, run) => { run(); passed++; console.log('PASS ' + label); };
  const tap = (at, anchorX = 78) => ({ type: 'tap', at, anchorX });
  check('Single tap is decoded once, responds, then returns to rest', () => {
    const pet = new MascotEngine(null, 0, () => 0);
    pet.tick(0, [tap(0)], false); pet.tick(319, [], false); assert.equal(pet.snapshot().mode, 'rest');
    pet.tick(320, [], false); assert.equal(pet.snapshot().behavior, 'click_react');
    pet.tick(1080, [], false); assert.equal(pet.snapshot().mode, 'companion');
    pet.tick(10321, [], false); assert.equal(pet.snapshot().mode, 'rest');
  });
  check('Double tap startles; environmental input cannot replace a direct action', () => {
    const pet = new MascotEngine(null, 0);
    pet.tick(0, [tap(0)], false); pet.tick(150, [tap(150)], false); pet.tick(470, [], false);
    assert.equal(pet.snapshot().behavior, 'flinch');
    pet.tick(500, [{ type: 'scroll' }], false); assert.equal(pet.snapshot().mode, 'shock');
  });
  check('Triple tap blushes, hides, and recovers after the configured quiet interval', () => {
    const pet = new MascotEngine(null, 0);
    pet.tick(0, [tap(0)], false); pet.tick(100, [tap(100)], false); pet.tick(200, [tap(200)], false);
    assert.equal(pet.snapshot().mode, 'shy');
    pet.tick(1180, [], false); assert.equal(pet.snapshot().mode, 'shy_hide');
    pet.tick(1830, [{ type: 'transition_end' }], false); assert.equal(pet.snapshot().mode, 'shy_wait');
    pet.tick(4230, [{ type: 'scroll' }], false); assert.equal(pet.snapshot().mode, 'rest');
  });
  check('Busy search or panel guard blocks input and resumes only the resting peek', () => {
    const pet = new MascotEngine(null, 0);
    pet.tick(0, [{ type: 'busy', value: true }, tap(0)], false); assert.equal(pet.snapshot().mode, 'guarded');
    pet.tick(400, [{ type: 'busy', value: false }], false); assert.equal(pet.snapshot().mode, 'rest'); assert.equal(pet.snapshot().behavior, null);
  });
  check('A tap freezes autonomous travel at the visible anchor before combo decoding', () => {
    const pet = new MascotEngine(null, 0, () => .8);
    pet.tick(12000, [], false); assert.equal(pet.snapshot().behavior, 'wander_slide');
    pet.tick(12001, [tap(12001, 40)], false); assert.equal(pet.snapshot().xPercent, 40); assert.equal(pet.snapshot().behavior, null);
    pet.tick(12321, [], false); assert.equal(pet.snapshot().behavior, 'click_react');
  });
  check('Reduced motion skips autonomous travel; idle sleep wakes from nearby activity', () => {
    const pet = new MascotEngine(null, 0);
    pet.tick(12000, [], true); assert.equal(pet.snapshot().behavior, null);
    pet.tick(90000, [], false); assert.equal(pet.snapshot().mode, 'sleep');
    pet.tick(90100, [{ type: 'pointer_activity', near: true }], false); assert.equal(pet.snapshot().mode, 'rest');
  });
  check('Hover entry is deduplicated through the 150ms leave window', () => {
    const pet = new MascotEngine(null, 0);
    pet.tick(0, [{ type: 'hover', anchorX: 78 }], false); const affection = pet.snapshot().drives.affection;
    pet.tick(100, [{ type: 'hover_leave' }], false); pet.tick(200, [{ type: 'hover', anchorX: 78 }], false);
    assert.equal(pet.snapshot().drives.affection, affection);
  });
  check('Drive weighting reduces travel for low energy and saved data is clamped', () => {
    const view = { mode: 'rest', drives: { energy: 10, curiosity: 20, affection: 20 } };
    assert.notEqual(selectBehavior(view, null, () => .7), 'wander_slide');
    const saved = { getItem: () => JSON.stringify({ xPercent: 1000, drives: { energy: -1, curiosity: 1000, affection: 40 } }), setItem() {} };
    const pet = new MascotEngine(saved, 0); assert.equal(pet.snapshot().xPercent, 84); assert.equal(pet.snapshot().drives.energy, 0);
  });
  check('Skin catalog covers all 17 skins and 33 slots; event actions never use roulette', () => {
    const catalog = JSON.parse(fs.readFileSync('src/mascot.behaviors.json', 'utf8'));
    assert.equal(Object.keys(catalog.skins).length, 17);
    const slots = Object.values(catalog.skins).flatMap(skin => Object.values(skin.slots)); assert.equal(slots.length, 33);
    for (const slot of slots) { assert.equal(slot.click.weight, 0); assert.equal(slot.shock.weight, 0); }
    assert.equal(catalog.skins['skill-lab'].slots.whetstone.antic.action, config.siteAntic.id);
  });
  console.log(passed + ' mascot checks passed.');
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
