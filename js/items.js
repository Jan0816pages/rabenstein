// Dark-Fantasy Danmaku x ARPG Procedural Item & Synergy Loot System
const BASE_ITEMS = [
  { id: 'short_sword', name: 'Kurzschwert', slot: 'weapon', icon: 'icon_sword', minDmg: 5, maxDmg: 10, baseVal: 25 },
  { id: 'broad_sword', name: 'Breitschwert', slot: 'weapon', icon: 'icon_sword', minDmg: 9, maxDmg: 16, baseVal: 60 },
  { id: 'battle_axe', name: 'Streitaxt', slot: 'weapon', icon: 'icon_axe', minDmg: 13, maxDmg: 24, baseVal: 95 },
  { id: 'war_blade', name: 'Runenklinge', slot: 'weapon', icon: 'icon_sword', minDmg: 18, maxDmg: 32, baseVal: 145 },

  { id: 'leather_armor', name: 'Lederrüstung', slot: 'armor', icon: 'icon_armor', armor: 6, baseVal: 30 },
  { id: 'chain_mail', name: 'Kettenhemd', slot: 'armor', icon: 'icon_armor', armor: 14, baseVal: 70 },
  { id: 'plate_mail', name: 'Gotischer Plattenpanzer', slot: 'armor', icon: 'icon_armor', armor: 24, baseVal: 140 },

  { id: 'iron_helm', name: 'Eisenhelm', slot: 'helm', icon: 'icon_helm', armor: 5, baseVal: 28 },
  { id: 'great_helm', name: 'Rittervisier', slot: 'helm', icon: 'icon_helm', armor: 12, baseVal: 80 },

  { id: 'signet_ring', name: 'Siegelring', slot: 'ring', icon: 'icon_ring', armor: 1, baseVal: 50 },
  { id: 'ruby_ring', name: 'Rubinring', slot: 'ring', icon: 'icon_ring', armor: 2, baseVal: 90 },

  { id: 'heavy_boots', name: 'Kampfstiefel', slot: 'boots', icon: 'icon_boots', armor: 4, baseVal: 35 },
  { id: 'greaves', name: 'Stahlbeinschienen', slot: 'boots', icon: 'icon_boots', armor: 9, baseVal: 75 }
];

// Magische & Core-Affixe (Zufällige Wertebereiche, gebalanct für langsame ARPG-Progression)
const MAGIC_PREFIXES = [
  { name: 'Rasendes', stat: 'attackSpeed', min: 5, max: 15, label: '+{v}% Angriffsgeschwindigkeit' },
  { name: 'Weites', stat: 'cleaveRange', min: 5, max: 15, label: '+{v}% Klingen-Reichweite' },
  { name: 'Scharfes', stat: 'bonusDmg', min: 2, max: 7, label: '+{v} Maximalschaden' },
  { name: 'Grausames', stat: 'bonusDmg', min: 6, max: 14, label: '+{v} Maximalschaden' },
  { name: 'Stählernes', stat: 'bonusArmor', min: 3, max: 11, label: '+{v} Rüstung' },
  { name: 'Rubinrotes', stat: 'bonusHp', min: 12, max: 44, label: '+{v} Maximales Leben' },
  { name: 'Saphirblaues', stat: 'bonusMp', min: 10, max: 32, label: '+{v} Maximales Mana' },
  { name: 'Blutiges', stat: 'lifeOnHit', min: 1, max: 5, label: '+{v} Leben pro Treffer' }
];

const MAGIC_SUFFIXES = [
  { name: 'des Eifers', stat: 'attackSpeed', min: 5, max: 14, label: '+{v}% Angriffsgeschwindigkeit' },
  { name: 'des Sturms', stat: 'whirlwindDmg', min: 8, max: 22, label: '+{v}% Wirbelwind-Schaden' },
  { name: 'der Eile', stat: 'speed', min: 5, max: 16, label: '+{v}% Bewegungsgeschwindigkeit' },
  { name: 'des Schattenschritts', stat: 'dodgeCdRed', min: 5, max: 16, label: '-{v}% Ausweichrollen-Cooldown' },
  { name: 'des Weitsprungs', stat: 'dodgeRange', min: 7, max: 18, label: '+{v}% Ausweichrollen-Reichweite' },
  { name: 'des Adlerauges', stat: 'crit', min: 3, max: 10, label: '+{v}% Kritische Trefferchance' },
  { name: 'der Hinrichtung', stat: 'critDmg', min: 10, max: 28, label: '+{v}% Kritischer Schaden' },
  { name: 'der Macht', stat: 'str', min: 2, max: 9, label: '+{v} Stärke' },
  { name: 'der Vitalität', stat: 'vit', min: 2, max: 9, label: '+{v} Vitalität' },
  { name: 'der Willenskraft', stat: 'ene', min: 2, max: 9, label: '+{v} Energie' },
  { name: 'der Präzision', stat: 'dex', min: 2, max: 9, label: '+{v} Geschick' }
];

// Seltene Nahkampf-Synergie-Affixe für den Klingenwächter
const DANMAKU_SYNERGY_AFFIXES = [
  { name: 'Klingensturm', stat: 'whirlwindDmg', min: 14, max: 32, label: 'Wirbelsturm: +{v}% Wirbelwind-Schaden' },
  { name: 'Rundumschlag', stat: 'cleaveRange', min: 10, max: 22, label: 'Klingenweite: +{v}% Nahkampf-Reichweite' },
  { name: 'Scharfrichter', stat: 'critDmg', min: 18, max: 38, label: 'Brutale Hiebe: +{v}% Kritischer Schaden' },
  { name: 'Blutrausch', stat: 'lifeOnHit', min: 3, max: 7, label: 'Blutrausch: +{v} Leben pro Nahkampf-Treffer' },
  { name: 'Klingenwut', stat: 'attackSpeed', min: 12, max: 24, label: 'Klingenwut: +{v}% Angriffsgeschwindigkeit' }
];

// Metadaten für alle Item-Eigenschaften (für Anzeige & Direktvergleich)
const STAT_META = {
  cleaveRange:  { label: 'Nahkampf-Reichweite', unit: '%', weight: 1.6 },
  whirlwindDmg: { label: 'Wirbelwind-Schaden', unit: '%', weight: 1.5 },
  critDmg:      { label: 'Kritischer Schaden', unit: '%', weight: 1.1 },
  attackSpeed:  { label: 'Angriffsgeschwindigkeit', unit: '%', weight: 1.8 },
  bonusDmg:     { label: 'Bonus-Maximalschaden', unit: '', weight: 2.2 },
  bonusArmor:   { label: 'Bonus-Rüstung', unit: '', weight: 1.5 },
  bonusHp:      { label: 'Maximales Leben', unit: '', weight: 0.65 },
  bonusMp:      { label: 'Maximales Mana', unit: '', weight: 0.45 },
  lifeOnHit:    { label: 'Leben pro Treffer', unit: '', weight: 4.5 },
  crit:         { label: 'Kritische Trefferchance', unit: '%', weight: 2.4 },
  speed:        { label: 'Bewegungsgeschwindigkeit', unit: '%', weight: 1.5 },
  dodgeCdRed:   { label: 'Ausweichrollen-Cooldown', unit: '% Red.', weight: 1.6 },
  dodgeRange:   { label: 'Ausweichrollen-Reichweite', unit: '%', weight: 1.0 },
  str:          { label: 'Stärke', unit: '', weight: 2.1 },
  vit:          { label: 'Vitalität', unit: '', weight: 1.8 },
  ene:          { label: 'Energie', unit: '', weight: 1.4 },
  dex:          { label: 'Geschick', unit: '', weight: 1.9 },
  // Legacy-Keys für Abwärtskompatibilität
  malakorWrath: { label: 'Malakors Zorn', unit: '', weight: 20, isBinary: true },
  multishot:    { label: 'Zusatz-Projektile', unit: '', weight: 10 },
  pierce:       { label: 'Durchschlag', unit: '', weight: 8 },
  bounce:       { label: 'Abpraller', unit: '', weight: 8 },
  split:        { label: 'Splitter', unit: '', weight: 10, isBinary: true },
  frostAura:    { label: 'Kugelhagel-Aura', unit: '', weight: 12, isBinary: true },
  projSpeed:    { label: 'Projektil-Tempo', unit: '%', weight: 0.5 }
};

const RARE_NAME_A = ['Klingen', 'Blut', 'Schatten', 'Stahl', 'Knochen', 'Sturm', 'Eisen', 'Raben'];
const RARE_NAME_B = ['schneide', 'spalter', 'wacht', 'zorn', 'brecher', 'kralle', 'schild', 'sturm'];

// Legendäre / Unique Nahkampf-Artefakte (Orange)
const UNIQUE_TEMPLATES = [
  {
    name: 'Malakors Zorn',
    baseId: 'war_blade',
    slot: 'weapon',
    icon: 'icon_sword',
    minDmg: 26,
    maxDmg: 46,
    mods: { attackSpeed: 28, bonusDmg: 16, critDmg: 45, lifeOnHit: 8 },
    lore: 'Die blutrote Großklinge des Herrn der Verfluchten Krypta – schneidet tief durch ganze Horden.',
    price: 550
  },
  {
    name: 'Blutbeil des Kerkermeisters',
    baseId: 'battle_axe',
    slot: 'weapon',
    icon: 'icon_axe',
    minDmg: 24,
    maxDmg: 42,
    mods: { whirlwindDmg: 45, cleaveRange: 24, lifeOnHit: 9, crit: 14 },
    lore: 'Geschmiedet im schwarzen Feuer der Tiefenschmiede von Rabenstein.',
    price: 480
  },
  {
    name: 'Krone des Aschenkönigs Valerius',
    baseId: 'great_helm',
    slot: 'helm',
    icon: 'icon_helm',
    armor: 26,
    mods: { bonusArmor: 16, bonusHp: 75, attackSpeed: 20, str: 10 },
    lore: 'Die verfluchte Herrscherkrone des einstigen Regenten der Düstermark.',
    price: 460
  },
  {
    name: 'Harnisch der Schattenflut',
    baseId: 'plate_mail',
    slot: 'armor',
    icon: 'icon_armor',
    armor: 40,
    mods: { dodgeRange: 25, dodgeCdRed: 18, speed: 18, bonusHp: 85, vit: 10 },
    lore: 'Ein unzerbrechlicher Brustpanzer, der seinem Träger blitzschnelle Reflexe verleiht.',
    price: 540
  },
  {
    name: 'Siegelring des Klingenordens',
    baseId: 'ruby_ring',
    slot: 'ring',
    icon: 'icon_ring',
    armor: 8,
    mods: { whirlwindDmg: 35, cleaveRange: 18, attackSpeed: 26, crit: 15, critDmg: 30 },
    lore: 'Ein uralter Ordensring der Elite-Schwertmeister von Festung Rabenstein.',
    price: 500
  }
];

class ItemGenerator {
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static rebuildModLines(item) {
    const lines = [];
    const m = item.mods || {};
    if (m.cleaveRange) lines.push(`+${m.cleaveRange}% Nahkampf-Reichweite`);
    if (m.whirlwindDmg) lines.push(`+${m.whirlwindDmg}% Wirbelwind-Schaden`);
    if (m.critDmg) lines.push(`+${m.critDmg}% Kritischer Schaden`);
    if (m.attackSpeed) lines.push(`+${m.attackSpeed}% Angriffsgeschwindigkeit`);
    if (m.bonusDmg) lines.push(`+${m.bonusDmg} Maximalschaden`);
    if (m.bonusArmor) lines.push(`+${m.bonusArmor} Rüstung`);
    if (m.bonusHp) lines.push(`+${m.bonusHp} Maximales Leben`);
    if (m.lifeOnHit) lines.push(`+${m.lifeOnHit} Leben pro Treffer`);
    if (m.crit) lines.push(`+${m.crit}% Kritische Trefferchance`);
    if (m.speed) lines.push(`+${m.speed}% Bewegungsgeschwindigkeit`);
    if (m.dodgeCdRed) lines.push(`-${m.dodgeCdRed}% Ausweichrollen-Cooldown`);
    if (m.dodgeRange) lines.push(`+${m.dodgeRange}% Ausweichrollen-Reichweite`);
    if (m.str) lines.push(`+${m.str} Stärke`);
    if (m.vit) lines.push(`+${m.vit} Vitalität`);
    if (m.ene) lines.push(`+${m.ene} Energie`);
    if (m.dex) lines.push(`+${m.dex} Geschick`);
    if (m.bonusMp) lines.push(`+${m.bonusMp} Maximales Mana`);
    item.modLines = lines;
  }

  static generateItem(level = 1, forcedRarity = null) {
    const roll = Math.random();
    let rarity = 'common';
    if (forcedRarity) {
      rarity = forcedRarity;
    } else {
      // Streng absteigende Dropchancen nach Qualitätsstufe:
      // Gewöhnlich (Weiß): ~58% | Magisch (Blau): ~28% | Selten (Gelb): ~11.5% | Legendär/Unique (Orange): ~2.5%
      const uniqueChance = Math.min(0.045, 0.02 + level * 0.002);
      const rareChance = uniqueChance + Math.min(0.16, 0.10 + level * 0.005);
      const magicChance = rareChance + 0.28;

      if (roll < uniqueChance) rarity = 'unique';
      else if (roll < rareChance) rarity = 'rare';
      else if (roll < magicChance) rarity = 'magic';
      else rarity = 'common';
    }

    const allCoreAffixes = [...MAGIC_PREFIXES, ...MAGIC_SUFFIXES];

    if (rarity === 'unique') {
      const tpl = this.pick(UNIQUE_TEMPLATES);
      const scale = (1 + Math.max(0, level - 1) * 0.10) * (0.88 + Math.random() * 0.24);
      const randomizedMods = {};
      // Jede Eigenschaft des Unique-Items erhält einen zufällig ausgewürfelten Zahlenwert
      Object.entries(tpl.mods).forEach(([k, baseVal]) => {
        if (k === 'malakorWrath' || k === 'split' || k === 'frostAura') {
          randomizedMods[k] = 1;
        } else if (k === 'multishot' || k === 'pierce' || k === 'bounce') {
          randomizedMods[k] = Math.max(1, baseVal + this.randInt(-1, 1));
        } else {
          const factor = 0.75 + Math.random() * 0.42;
          randomizedMods[k] = Math.max(1, Math.round(baseVal * factor * (1 + (level - 1) * 0.04)));
        }
      });

      // Zusätzlich 0 bis 2 zufällige Extra-Eigenschaften für variierende Eigenschafts-Menge bei Uniques
      const extraCount = this.randInt(0, 2);
      for (let i = 0; i < extraCount; i++) {
        const extra = this.pick(allCoreAffixes);
        const val = Math.max(1, Math.round(this.randInt(extra.min, extra.max) * (1 + (level - 1) * 0.08)));
        randomizedMods[extra.stat] = (randomizedMods[extra.stat] || 0) + val;
      }

      const minD = tpl.minDmg ? Math.max(1, Math.round(tpl.minDmg * scale * (0.9 + Math.random() * 0.2))) : 0;
      const maxD = tpl.maxDmg ? Math.max(minD + 2, Math.round(tpl.maxDmg * scale * (0.9 + Math.random() * 0.25))) : 0;
      const arm = tpl.armor ? Math.max(1, Math.round(tpl.armor * scale * (0.88 + Math.random() * 0.26))) : 0;

      const uItem = {
        uid: 'itm_' + Math.random().toString(36).slice(2, 9),
        name: tpl.name,
        itemLevel: level,
        typeName: 'Legendärer Gegenstand (' + this.slotLabel(tpl.slot) + ')',
        slot: tpl.slot,
        rarity: 'unique',
        icon: tpl.icon,
        minDmg: minD,
        maxDmg: maxD,
        armor: arm,
        mods: randomizedMods,
        modLines: [],
        lore: tpl.lore,
        price: Math.round(tpl.price * scale)
      };
      this.rebuildModLines(uItem);
      return uItem;
    }

    // Pick base item weighted by level
    const maxIndex = Math.min(BASE_ITEMS.length, Math.max(4, level * 3 + 4));
    const pool = BASE_ITEMS.slice(0, maxIndex);
    const base = this.pick(pool);

    // Zufällige Basiswerte (gebremstes Level-Scaling für nachhaltigere Progression)
    const lvlScale = 1 + (level - 1) * 0.11;
    const minRoll = 0.82 + Math.random() * 0.36;
    const maxRoll = 0.84 + Math.random() * 0.38;
    const armorRoll = 0.80 + Math.random() * 0.42;

    const rolledMinDmg = base.minDmg ? Math.max(1, Math.round(base.minDmg * lvlScale * minRoll)) : 0;
    const rolledMaxDmg = base.maxDmg ? Math.max(rolledMinDmg + 1, Math.round(base.maxDmg * lvlScale * maxRoll)) : 0;
    const rolledArmor = base.armor ? Math.max(1, Math.round(base.armor * lvlScale * armorRoll)) : 0;

    const item = {
      uid: 'itm_' + Math.random().toString(36).slice(2, 9),
      name: base.name,
      itemLevel: level,
      typeName: this.slotLabel(base.slot),
      slot: base.slot,
      rarity: rarity,
      icon: base.icon,
      minDmg: rolledMinDmg,
      maxDmg: rolledMaxDmg,
      armor: rolledArmor,
      mods: {},
      modLines: [],
      price: Math.round((base.baseVal + level * 10) * (0.9 + Math.random() * 0.25))
    };

    const addAffix = (affixPool, preferNewStat = true) => {
      let candidates = affixPool;
      if (preferNewStat) {
        const unused = affixPool.filter((a) => !item.mods[a.stat]);
        if (unused.length > 0) candidates = unused;
      }
      const af = this.pick(candidates);
      const lvlFactor = 1 + Math.max(0, level - 1) * 0.05;
      const rawVal = this.randInt(af.min, af.max);
      const val = (af.stat === 'multishot' || af.stat === 'pierce' || af.stat === 'bounce')
        ? rawVal
        : Math.max(1, Math.round(rawVal * lvlFactor));

      if (af.stat === 'split' || af.stat === 'frostAura') {
        item.mods[af.stat] = 1;
      } else {
        item.mods[af.stat] = (item.mods[af.stat] || 0) + val;
      }
      item.price += val * 14 + 18;
      return af;
    };

    if (rarity === 'common') {
      // Gewöhnlich (Weiß | 0 bis 1 zufällige Eigenschaft):
      // Manche weißen Items sind schlicht (0 Affixe), andere haben 1 leichten Bonuswert
      const propCount = Math.random() < 0.55 ? 1 : 0;
      if (propCount === 1) {
        const af = addAffix(allCoreAffixes, true);
        // Etwas schwächerer Zahlenwert auf gewöhnlichen Items
        item.mods[af.stat] = Math.max(1, Math.round(item.mods[af.stat] * 0.65));
      }
    } else if (rarity === 'magic') {
      // Magisch (Blau | Zufällig 1 bis 3 Eigenschaften mit zufälligen Zahlenwerten!)
      const targetPropCount = this.randInt(1, 3);
      let preName = '';
      let sufName = '';

      const firstPre = addAffix(MAGIC_PREFIXES, true);
      preName = firstPre.name + ' ';

      if (targetPropCount >= 2) {
        const secondSuf = addAffix(MAGIC_SUFFIXES, true);
        sufName = ' ' + secondSuf.name;
      }
      while (Object.keys(item.mods).length < targetPropCount) {
        addAffix(allCoreAffixes, true);
      }
      item.name = `${preName}${base.name}${sufName}`.trim();
    } else if (rarity === 'rare') {
      // Selten (Gelb | Zufällig 3 bis 5 Eigenschaften: Danmaku-Synergien + Core-Stats)
      const targetPropCount = this.randInt(3, 5);
      const synergyCount = this.randInt(1, 2);
      for (let s = 0; s < synergyCount; s++) {
        addAffix(DANMAKU_SYNERGY_AFFIXES, true);
      }
      let guard = 0;
      while (Object.keys(item.mods).length < targetPropCount && guard < 15) {
        guard++;
        addAffix(allCoreAffixes, true);
      }
      item.name = `${this.pick(RARE_NAME_A)}${this.pick(RARE_NAME_B)} (${base.name})`;
      item.price = Math.round(item.price * 1.45);
    }

    if (item.mods.bonusDmg && item.maxDmg > 0) {
      item.maxDmg += item.mods.bonusDmg;
    }
    if (item.mods.bonusArmor && item.armor > 0) {
      item.armor += item.mods.bonusArmor;
    }

    this.rebuildModLines(item);
    return item;
  }

  // Berechnet einen Kampfwert-Score sowie alle Stat-Differenzen zwischen einem neuen Item und dem angelegten Item
  static compareItems(newItem, equippedItem) {
    const getAvgDmg = (it) => (it && it.maxDmg > 0 ? (it.minDmg + it.maxDmg) / 2 : 0);
    const getArmor = (it) => (it && it.armor > 0 ? it.armor : 0);

    const newAvgDmg = getAvgDmg(newItem);
    const eqAvgDmg = getAvgDmg(equippedItem);
    const dmgDiff = Number((newAvgDmg - eqAvgDmg).toFixed(1));

    const newMinDiff = (newItem ? newItem.minDmg || 0 : 0) - (equippedItem ? equippedItem.minDmg || 0 : 0);
    const newMaxDiff = (newItem ? newItem.maxDmg || 0 : 0) - (equippedItem ? equippedItem.maxDmg || 0 : 0);
    const armorDiff = getArmor(newItem) - getArmor(equippedItem);

    const newMods = (newItem && newItem.mods) || {};
    const eqMods = (equippedItem && equippedItem.mods) || {};
    const allKeys = Array.from(new Set([...Object.keys(newMods), ...Object.keys(eqMods)]));

    const statDeltas = [];
    let scoreDiff = dmgDiff * 3.2 + armorDiff * 1.8;

    allKeys.forEach((k) => {
      const meta = STAT_META[k] || { label: k, unit: '', weight: 1.5 };
      const vNew = Number(newMods[k] || 0);
      const vOld = Number(eqMods[k] || 0);
      const diff = vNew - vOld;
      if (diff !== 0 || vNew > 0) {
        scoreDiff += diff * (meta.weight || 1.5);
        statDeltas.push({
          key: k,
          label: meta.label,
          unit: meta.unit,
          isBinary: Boolean(meta.isBinary),
          newVal: vNew,
          oldVal: vOld,
          diff
        });
      }
    });

    // Sortiere Deltas: Verbesserungen zuerst, dann unveränderte, dann Verluste
    statDeltas.sort((a, b) => Math.sign(b.diff) - Math.sign(a.diff));

    return {
      hasEquipped: Boolean(equippedItem),
      dmgDiff,
      newMinDiff,
      newMaxDiff,
      armorDiff,
      statDeltas,
      scoreDiff: Math.round(scoreDiff),
      propCountNew: Object.keys(newMods).length,
      propCountOld: Object.keys(eqMods).length
    };
  }

  static getUpgradeCost(item) {
    if (!item) return 999999;
    const rank = item.upgradeRank || 0;
    const costs = [220, 380, 600];
    return costs[rank] ?? 999999;
  }

  // Schmied Thorgar Upgrade-Funktion (generft): max. +3, nur kleiner Basiswert-Schub, keine Gratis-Affixe
  static upgradeItem(item) {
    if (!item) return false;
    const curRank = item.upgradeRank || 0;
    if (curRank >= 3) return false;

    item.itemLevel = (item.itemLevel || 1) + 1;
    item.upgradeRank = curRank + 1;

    if (item.minDmg > 0) item.minDmg = Math.max(item.minDmg + 1, Math.round(item.minDmg * 1.05));
    if (item.maxDmg > 0) item.maxDmg = Math.max(item.maxDmg + 1, Math.round(item.maxDmg * 1.05));
    if (item.armor > 0) item.armor = Math.max(item.armor + 1, Math.round(item.armor * 1.05));

    const baseCleanName = item.name.replace(/ \+\d+$/, '');
    item.name = `${baseCleanName} +${item.upgradeRank}`;
    item.price = Math.round((item.price || 50) * 1.15);
    this.rebuildModLines(item);
    return true;
  }

  static slotLabel(slot) {
    const map = {
      weapon: 'Waffe',
      armor: 'Brustpanzer',
      helm: 'Helm',
      ring: 'Ring',
      boots: 'Stiefel'
    };
    return map[slot] || slot;
  }
}

window.ItemGenerator = ItemGenerator;
