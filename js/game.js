// RABENSTEIN: SCHATTENFLUT – Klingenwächter (Nahkampf x Danmaku-Dodging) ARPG Engine
const SKILL_TREE_DATA = [
  {
    id: 'blade',
    title: 'PFAD DES KLINGENSTURMS',
    subtitle: 'Schwertkunst & Wirbelwind',
    cssClass: 'branch-blade',
    nodes: [
      {
        id: 'blade_1',
        tier: 1,
        maxRank: 3,
        cost: 1,
        reqLevel: 2,
        name: 'Wirbelwind (Rechtsklick)',
        desc: 'Rang 1 schaltet den aktiven Skill Wirbelwind [Rechte Maustaste, 12 Mana] frei (360°-Schwertwirbel). Pro Rang: +25% Wirbelwind-Schaden & +12% Radius.',
        req: null,
        reqRank: 0
      },
      {
        id: 'blade_2',
        tier: 2,
        maxRank: 3,
        cost: 2,
        reqLevel: 5,
        name: 'Meisterhafter Rundumschlag',
        desc: 'Pro Rang: +8% Nahkampf-Reichweite und +7% Angriffsgeschwindigkeit für deine Schwerthiebe (Max: +24% / +21%).',
        req: 'blade_1',
        reqRank: 3
      },
      {
        id: 'blade_3',
        tier: 3,
        maxRank: 1,
        cost: 4,
        reqLevel: 9,
        name: 'Blutklinge der Vernichtung (Meister)',
        desc: 'Jeder 3. Schwerthieb entfesselt einen mächtigen Klingenstoß (+65% Nahkampf-Schaden & Rückstoß); zudem -35% Wirbelwind-Cooldown.',
        req: 'blade_2',
        reqRank: 3
      }
    ]
  },
  {
    id: 'warden',
    title: 'PFAD DES BOLLWERKS',
    subtitle: 'Rüstung, Stärke & Blutdurst',
    cssClass: 'branch-warden',
    nodes: [
      {
        id: 'warden_1',
        tier: 1,
        maxRank: 3,
        cost: 1,
        reqLevel: 2,
        name: 'Eisenhaut & Wucht',
        desc: 'Pro Rang: +10% Rüstung und +6% physischer Nahkampf-Schaden (Max: +30% Rüstung, +18% Schaden).',
        req: null,
        reqRank: 0
      },
      {
        id: 'warden_2',
        tier: 2,
        maxRank: 3,
        cost: 2,
        reqLevel: 5,
        name: 'Blutdurst der Klinge',
        desc: 'Pro Rang: +1 Leben pro Nahkampf-Treffer und +2% Kritische Trefferchance (Max: +3 Leben/Treffer, +6% Krit).',
        req: 'warden_1',
        reqRank: 3
      },
      {
        id: 'warden_3',
        tier: 3,
        maxRank: 1,
        cost: 4,
        reqLevel: 9,
        name: 'Zorn des Klingenwächters (Meister)',
        desc: 'Erhöht deine Nahkampf-Angriffsrate um +55% und den Kritischen Nahkampf-Schaden auf 210%.',
        req: 'warden_2',
        reqRank: 3
      }
    ]
  },
  {
    id: 'shadow',
    title: 'PFAD DES SCHATTENS',
    subtitle: 'Überleben, I-Frames & Mobilität',
    cssClass: 'branch-shadow',
    nodes: [
      {
        id: 'shadow_1',
        tier: 1,
        maxRank: 3,
        cost: 1,
        reqLevel: 2,
        name: 'Doppelter Schattenschritt',
        desc: 'Pro Rang: -7% Ausweichrollen-Cooldown. Auf Rang 3/3 zusätzlich +1 Aufladung für die Ausweichrolle.',
        req: null,
        reqRank: 0
      },
      {
        id: 'shadow_2',
        tier: 2,
        maxRank: 3,
        cost: 2,
        reqLevel: 5,
        name: 'Schatteneile & Beutemagnet',
        desc: 'Nach dem Ausweichen bist du 1.5 / 2.0 / 2.5 Sek. lang +10% / +20% / +30% schneller & saugst nahen Loot an.',
        req: 'shadow_1',
        reqRank: 3
      },
      {
        id: 'shadow_3',
        tier: 3,
        maxRank: 1,
        cost: 4,
        reqLevel: 9,
        name: 'Phasen-Klingenkonter (Meister)',
        desc: 'Das Ausweichen durch feindliche Projektile (I-Frames) heilt dich um 3% HP und senkt den Wirbelwind-Cooldown um 0,4 Sek.',
        req: 'shadow_2',
        reqRank: 3
      }
    ]
  }
];

const ARCHETYPE_DATA = [
  {
    id: 'blade_warden',
    title: 'Klingenwächter',
    desc: 'Unerschütterlicher Frontkämpfer der Festung Rabenstein mit hoher Stärke und Lebenskraft.',
    statsText: '+4 Stärke | +2 Vitalität | Start: Runenklinge',
    baseStr: 16,
    baseVit: 14,
    baseEne: 10,
    baseDex: 10,
    weapon: {
      uid: 'starter_sword_blade',
      name: 'Runenklinge des Wächters',
      itemLevel: 1,
      typeName: 'Waffe',
      slot: 'weapon',
      rarity: 'magic',
      icon: 'icon_sword',
      minDmg: 5,
      maxDmg: 10,
      armor: 0,
      mods: { attackSpeed: 10, str: 1 },
      modLines: ['+10% Angriffsgeschwindigkeit', '+1 Stärke'],
      price: 30
    }
  }
  // Weitere Klassen (Arkaner Schütze, Schattenläufer) folgen später
];

const HERO_NAME_POOL = [
  'Vaelen', 'Kaelen', 'Draven', 'Morvath', 'Alden', 'Thorne', 'Corvus', 'Severin', 'Garrick', 'Alaric', 'Lyra', 'Nyx'
];

class SaveManager {
  static STORAGE_KEY = 'rabenstein_saved_chars_v1';
  static LAST_ID_KEY = 'rabenstein_last_char_id_v1';
  static MAX_CHARS = 5;

  static getCharacters() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, this.MAX_CHARS) : [];
    } catch (e) {
      return [];
    }
  }

  static saveCharacters(chars) {
    try {
      const trimmed = (chars || []).slice(0, this.MAX_CHARS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  static getLastSelectedId() {
    try {
      return localStorage.getItem(this.LAST_ID_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  static setLastSelectedId(id) {
    try {
      if (id) localStorage.setItem(this.LAST_ID_KEY, id);
      else localStorage.removeItem(this.LAST_ID_KEY);
    } catch (e) {
      // Ignore
    }
  }

  static createNewCharacter(name, archetypeId) {
    const chars = this.getCharacters();
    if (chars.length >= this.MAX_CHARS) return null;

    const arch = ARCHETYPE_DATA.find((a) => a.id === archetypeId) || ARCHETYPE_DATA[0];
    const cleanName = (name || '').trim().slice(0, 18) || 'Vaelen';
    const now = Date.now();
    const newChar = {
      id: 'char_' + now + '_' + Math.random().toString(36).slice(2, 7),
      name: cleanName,
      archetypeId: arch.id,
      archetypeTitle: arch.title,
      createdAt: now,
      lastPlayedAt: now,
      level: 1,
      xp: 0,
      xpNext: 260,
      statPoints: 0,
      skillPoints: 0,
      totalSkillPointsEarned: 0,
      skillsUnlocked: {},
      baseStr: arch.baseStr,
      baseVit: arch.baseVit,
      baseEne: arch.baseEne,
      baseDex: arch.baseDex,
      gold: 120,
      potions: { hp: 4, mp: 3 },
      maxPotions: 4,
      equipment: {
        weapon: JSON.parse(JSON.stringify(arch.weapon)),
        armor: {
          uid: 'starter_armor_' + now,
          name: 'Wanderer-Lederwams',
          itemLevel: 1,
          typeName: 'Brustpanzer',
          slot: 'armor',
          rarity: 'common',
          icon: 'icon_armor',
          minDmg: 0,
          maxDmg: 0,
          armor: 6,
          mods: {},
          modLines: [],
          price: 15
        },
        helm: null,
        ring: null,
        boots: null
      },
      inventory: [],
      autoAimNearest: false,
      quest: {
        bountyTier: 1,
        bountyTiers: {
          horde: { maxTier: 1, selectedTier: 1 },
          boss: { maxTier: 1, selectedTier: 1 }
        },
        activeBounty: null
      }
    };

    chars.push(newChar);
    this.saveCharacters(chars);
    this.setLastSelectedId(newChar.id);
    return newChar;
  }

  static deleteCharacter(charId) {
    const chars = this.getCharacters().filter((c) => c.id !== charId);
    this.saveCharacters(chars);
    if (this.getLastSelectedId() === charId) {
      this.setLastSelectedId(chars[0] ? chars[0].id : null);
    }
    return chars;
  }

  static updateCharacterFromGame(game) {
    if (!game || !game.activeCharId) return;
    const chars = this.getCharacters();
    const idx = chars.findIndex((c) => c.id === game.activeCharId);
    if (idx === -1) return;

    const p = game.player;
    const q = game.quest;
    chars[idx] = {
      ...chars[idx],
      name: p.name || chars[idx].name,
      archetypeId: p.archetypeId || chars[idx].archetypeId,
      archetypeTitle: p.archetypeTitle || chars[idx].archetypeTitle,
      lastPlayedAt: Date.now(),
      level: p.level,
      xp: p.xp,
      xpNext: p.xpNext,
      statPoints: p.statPoints,
      skillPoints: p.skillPoints,
      totalSkillPointsEarned: p.totalSkillPointsEarned,
      skillsUnlocked: { ...p.skillsUnlocked },
      baseStr: p.baseStr,
      baseVit: p.baseVit,
      baseEne: p.baseEne,
      baseDex: p.baseDex,
      gold: p.gold,
      potions: { ...p.potions },
      maxPotions: p.maxPotions,
      equipment: JSON.parse(JSON.stringify(p.equipment)),
      inventory: JSON.parse(JSON.stringify(p.inventory)),
      autoAimNearest: Boolean(p.autoAimNearest),
      quest: {
        bountyTier: Math.max(
          game.bountyTiers ? game.bountyTiers.horde.maxTier : 1,
          game.bountyTiers ? game.bountyTiers.boss.maxTier : 1
        ),
        bountyTiers: JSON.parse(JSON.stringify(game.bountyTiers || {
          horde: { maxTier: 1, selectedTier: 1 },
          boss: { maxTier: 1, selectedTier: 1 }
        })),
        activeBounty: game.activeBounty ? JSON.parse(JSON.stringify(game.activeBounty)) : null
      }
    };

    this.saveCharacters(chars);
  }
}

window.SaveManager = SaveManager;

class HackAndSlayGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    // Native HiDPI Rendering with 1.75x camera zoom so 512x512 sprites render at full monitor sharpness
    this.zoom = 1.75;
    this.dpr = window.devicePixelRatio || 1;
    this.viewW = 960;
    this.viewH = 540;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.scenes = {
      castle: new window.WorldMap('castle'),
      world: new window.WorldMap('world')
    };
    this.currentScene = 'castle';
    this.world = this.scenes.castle;
    this.inMainMenu = true;
    this.activeCharId = null;
    this.autoSaveTimer = 4.0;
    this.questPortalGraceTimer = 0;
    this.questPortalAnimTime = 0;
    this.deathSequence = null;
    this.minimapBaseCache = {};

    // Player State (Danmaku x Auto-Attack Build)
    this.player = {
      name: 'Streiter',
      archetypeId: 'blade_warden',
      archetypeTitle: 'Klingenwächter',
      x: this.world.spawnPoint ? this.world.spawnPoint.x : 11 * window.TILE_SIZE,
      y: this.world.spawnPoint ? this.world.spawnPoint.y : 71.5 * window.TILE_SIZE,
      vx: 0,
      vy: 0,
      radius: 11,
      facing: 0,
      flipX: false,
      level: 1,
      xp: 0,
      xpNext: 260,
      statPoints: 0,
      skillPoints: 0,
      totalSkillPointsEarned: 0,
      skillsUnlocked: {},
      baseStr: 12,
      baseVit: 12,
      baseEne: 10,
      baseDex: 10,
      hp: 120,
      maxHp: 120,
      mp: 60,
      maxMp: 60,
      gold: 120,
      potions: { hp: 4, mp: 3 },
      maxPotions: 4,
      equipment: {
        weapon: null,
        armor: null,
        helm: null,
        ring: null,
        boots: null
      },
      inventory: [],
      maxInv: 18,
      activeSkill: 0,
      skillCds: [0, 0, 0, 0],
      skillMaxCds: [0.45, 1.2, 0.9, 3.5],
      // Twin-Stick Auto-Attack State
      autoAimNearest: false,
      autoAttackTimer: 0,
      autoAttackCount: 0,
      attackSpeed: 2.2,
      frostAuraTimer: 3.0,
      // Dodge Roll & I-Frames State
      dodgeTimer: 0,
      iFrameTimer: 0,
      dodgeCharges: 1,
      maxDodgeCharges: 1,
      dodgeRechargeTimer: 0,
      dodgeMaxCd: 1.0,
      dodgeSpeed: 330,
      postDodgeBuffTimer: 0,
      // Animations
      slashAnimTimer: 0,
      slashAnimDuration: 0.24,
      slashSwingSign: 1,
      whirlwindAnimTimer: 0,
      castAnimTimer: 0,
      frostAnimTimer: 0,
      stepDustTimer: 0,
      dodgeGhostTrail: [],
      isMoving: false,
      animTime: 0,
      walkAnimTime: 0,
      moveTarget: null,
      wasInTown: true
    };

    // Starter Gear with a taste of Danmaku stats
    this.player.equipment.weapon = JSON.parse(JSON.stringify(ARCHETYPE_DATA[0].weapon));
    this.player.equipment.armor = {
      uid: 'starter_armor',
      name: 'Wanderer-Lederwams',
      itemLevel: 1,
      typeName: 'Brustpanzer',
      slot: 'armor',
      rarity: 'common',
      icon: 'icon_armor',
      minDmg: 0,
      maxDmg: 0,
      armor: 6,
      mods: {},
      modLines: [],
      price: 15
    };

    // Persistent Town Portal State
    this.townPortal = {
      active: false,
      wildX: this.scenes.world.defaultPortalWild.x,
      wildY: this.scenes.world.defaultPortalWild.y,
      townX: this.scenes.castle.defaultPortalTown.x,
      townY: this.scenes.castle.defaultPortalTown.y,
      portalCooldown: 0,
      portalMaxCooldown: 60,
      openTimer: 0
    };

    // Tier-basiertes Bounty-Quest-System ("Die Chroniken" - getrennte Tiers pro Quest-Typ)
    this.bountyTiers = {
      horde: { maxTier: 1, selectedTier: 1 },
      boss: { maxTier: 1, selectedTier: 1 }
    };
    this.bountyTier = 1;
    this.activeBounty = null;
    this.availableBounties = [];
    this.quest = {
      respawnTimer: 1.5
    };
    this.generateBounties();

    this.sceneGroundItems = { castle: [], world: [] };
    this.projectiles = [];
    this.fireZones = []; // Burning DoT trails from Arcane Path Tier 2
    this.particles = [];
    this.slashEffects = [];
    this.floatingTexts = [];
    this.systemLogs = [];
    this.shopInventory = [];
    this.showLootLabels = true;
    this.hoveredGroundItem = null;
    this.hoveredNPC = null;
    this.hoveredPortal = null;

    this.keys = {};
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, leftDown: false, rightDown: false };
    this.cam = { x: 0, y: 0 };

    this.recalcStats(true);
    this.refreshShop();
    this.initSkillIcons();
    this.bindEvents();
    window.GameUI.initMainMenu();
    window.GameUI.renderAll();

    window.addEventListener('beforeunload', () => {
      this.saveCurrentCharacter();
    });

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  saveCurrentCharacter() {
    if (!this.inMainMenu && this.activeCharId) {
      SaveManager.updateCharacterFromGame(this);
    }
  }

  isPaused() {
    const esc = document.getElementById('esc-menu');
    const deathModal = document.getElementById('death-modal');
    return Boolean(
      (esc && esc.classList.contains('open')) ||
      (deathModal && deathModal.classList.contains('open'))
    );
  }

  loadCharacterSave(charData) {
    if (!charData) return;
    this.activeCharId = charData.id;
    SaveManager.setLastSelectedId(charData.id);

    const p = this.player;
    p.name = charData.name || 'Streiter';
    p.archetypeId = charData.archetypeId || 'blade_warden';
    p.archetypeTitle = charData.archetypeTitle || 'Klingenwächter';
    p.x = this.world.spawnPoint ? this.world.spawnPoint.x : 11 * window.TILE_SIZE;
    p.y = this.world.spawnPoint ? this.world.spawnPoint.y : 71.5 * window.TILE_SIZE;
    p.moveTarget = null;
    p.wasInTown = true;

    p.level = Number(charData.level || 1);
    p.xp = Number(charData.xp || 0);
    p.xpNext = Number(charData.xpNext || 260);
    p.statPoints = Number(charData.statPoints || 0);
    p.skillPoints = Number(charData.skillPoints || 0);
    p.totalSkillPointsEarned = Number(charData.totalSkillPointsEarned || 0);
    p.skillsUnlocked = charData.skillsUnlocked ? { ...charData.skillsUnlocked } : {};

    p.baseStr = Number(charData.baseStr || 12);
    p.baseVit = Number(charData.baseVit || 12);
    p.baseEne = Number(charData.baseEne || 10);
    p.baseDex = Number(charData.baseDex || 10);
    p.gold = Number(charData.gold ?? 120);
    p.maxPotions = Math.min(10, Math.max(4, Number(charData.maxPotions || 4)));
    const rawPotions = charData.potions || { hp: p.maxPotions, mp: p.maxPotions };
    p.potions = {
      hp: Math.max(0, Math.min(p.maxPotions, Number(rawPotions.hp ?? p.maxPotions))),
      mp: Math.max(0, Math.min(p.maxPotions, Number(rawPotions.mp ?? p.maxPotions)))
    };
    p.equipment = charData.equipment
      ? JSON.parse(JSON.stringify(charData.equipment))
      : { weapon: null, armor: null, helm: null, ring: null, boots: null };
    p.inventory = Array.isArray(charData.inventory)
      ? JSON.parse(JSON.stringify(charData.inventory))
      : [];
    p.autoAimNearest = Boolean(charData.autoAimNearest);

    const btnAim = document.getElementById('btn-aim-mode');
    if (btnAim) {
      btnAim.textContent = p.autoAimNearest ? 'ZIEL: AUTO-AIM (F)' : 'ZIEL: MAUS (F)';
    }

    if (charData.quest && charData.quest.bountyTiers) {
      const hRaw = charData.quest.bountyTiers.horde || {};
      const bRaw = charData.quest.bountyTiers.boss || {};
      const hMax = Math.max(1, Number(hRaw.maxTier || 1));
      const bMax = Math.max(1, Number(bRaw.maxTier || 1));
      this.bountyTiers = {
        horde: {
          maxTier: hMax,
          selectedTier: Math.max(1, Math.min(hMax, Number(hRaw.selectedTier || hMax)))
        },
        boss: {
          maxTier: bMax,
          selectedTier: Math.max(1, Math.min(bMax, Number(bRaw.selectedTier || bMax)))
        }
      };
      this.bountyTier = Math.max(hMax, bMax);
      this.activeBounty = charData.quest.activeBounty
        ? JSON.parse(JSON.stringify(charData.quest.activeBounty))
        : null;
    } else if (charData.quest && typeof charData.quest.bountyTier === 'number') {
      const legacyTier = Math.max(1, Number(charData.quest.bountyTier || 1));
      this.bountyTiers = {
        horde: { maxTier: legacyTier, selectedTier: legacyTier },
        boss: { maxTier: legacyTier, selectedTier: legacyTier }
      };
      this.bountyTier = legacyTier;
      this.activeBounty = charData.quest.activeBounty
        ? JSON.parse(JSON.stringify(charData.quest.activeBounty))
        : null;
    } else if (charData.quest && typeof charData.quest.tier === 'number') {
      // Migration älterer Spielstände in das Bounty-System
      const legacyTier = Math.max(1, Number(charData.quest.tier || 1));
      this.bountyTiers = {
        horde: { maxTier: legacyTier, selectedTier: legacyTier },
        boss: { maxTier: legacyTier, selectedTier: legacyTier }
      };
      this.bountyTier = legacyTier;
      this.activeBounty = null;
    } else {
      this.bountyTiers = {
        horde: { maxTier: 1, selectedTier: 1 },
        boss: { maxTier: 1, selectedTier: 1 }
      };
      this.bountyTier = 1;
      this.activeBounty = null;
    }
    this.generateBounties();

    this.currentScene = 'castle';
    this.world = this.scenes.castle;
    this.townPortal.active = false;
    this.townPortal.portalCooldown = 0;
    this.sceneGroundItems = { castle: [], world: [] };
    this.projectiles = [];
    this.fireZones = [];
    this.slashEffects = [];
    this.floatingTexts = [];
    this.questPortalGraceTimer = 0;

    this.scenes.world.spawnInitialMonsters(this.activeBounty);

    this.recalcStats(true);
    this.refillPotionsInTown(true);
    this.refreshShop();
    this.inMainMenu = false;
    window.GameUI.closeDeathModal();
    this.saveCurrentCharacter();
    window.GameUI.renderAll();
    window.GameUI.updateHUD();
    this.clearSystemLog();
    this.addSystemLog(`Willkommen in Festung Rabenstein, ${p.name}! Sprich mit Chronist Aldric für eine Mission.`, 'info');
    this.addFloatingText(p.x, p.y - 28, `WILLKOMMEN IN RABENSTEIN, ${p.name.toUpperCase()}!`, '#ffdf40');
  }

  clearSystemLog() {
    this.systemLogs = [];
    const container = document.getElementById('system-log-entries');
    if (container) container.innerHTML = '';
  }

  addSystemLog(message, category = 'info') {
    if (!message) return;
    if (!Array.isArray(this.systemLogs)) this.systemLogs = [];
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hh}:${mm}:${ss}`;
    const entry = { time: timeStr, message: String(message), category };
    this.systemLogs.push(entry);
    if (this.systemLogs.length > 40) {
      this.systemLogs.shift();
    }

    const container = document.getElementById('system-log-entries');
    if (!container) return;
    const row = document.createElement('div');
    row.className = `syslog-line syslog-${category}`;
    const ts = document.createElement('span');
    ts.className = 'syslog-time';
    ts.textContent = `[${timeStr}]`;
    const txt = document.createElement('span');
    txt.textContent = entry.message;
    row.appendChild(ts);
    row.appendChild(txt);
    container.appendChild(row);
    while (container.children && container.children.length > 40 && container.removeChild) {
      container.removeChild(container.children[0]);
    }
    container.scrollTop = container.scrollHeight;
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.viewW = window.innerWidth / this.zoom;
    this.viewH = window.innerHeight / this.zoom;
    this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.ctx.setTransform(this.zoom * this.dpr, 0, 0, this.zoom * this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  initSkillIcons() {
    const drawIcon = (canvasId, spriteKey) => {
      const el = document.getElementById(canvasId);
      if (!el) return;
      const ic = el.getContext('2d');
      ic.imageSmoothingEnabled = false;
      ic.clearRect(0, 0, 32, 32);
      if (window.Sprites.cache[spriteKey]) {
        ic.drawImage(window.Sprites.cache[spriteKey], 0, 0, 32, 32);
      }
    };
    drawIcon('icon-skill-0', 'icon_sword');
    drawIcon('icon-skill-1', 'skill_whirlwind');
    drawIcon('icon-pot-hp', 'icon_pot_hp');
    drawIcon('icon-pot-mp', 'icon_pot_mp');
    drawIcon('icon-portal', 'icon_portal');
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (this.inMainMenu) {
        if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'char-name-input') {
          e.preventDefault();
          window.GameUI.confirmCreateCharacter();
        }
        return;
      }
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      const k = e.key.toLowerCase();

      if (e.key === 'Escape') {
        e.preventDefault();
        const deathModal = document.getElementById('death-modal');
        if (deathModal && deathModal.classList.contains('open')) return;
        // Erst offene Fenster der Reihe nach schließen – sind keine mehr offen, öffnet ESC das Spielmenü
        if (!window.GameUI.closeTopPanel()) {
          window.GameUI.openEscMenu();
        }
        return;
      }
      // Während das ESC-Spielmenü offen ist, ist das Spiel pausiert
      if (this.isPaused()) return;

      this.keys[k] = true;

      if (k === '1') this.selectSkill(0);
      if (k === '2') {
        this.addFloatingText(this.player.x, this.player.y - 26, 'Wirbelwind mit [Rechter Maustaste] auslösen!', '#f2c94c');
      }
      if (k === 'q') this.usePotion('hp');
      if (k === 'e') this.usePotion('mp');
      if (k === 'f') this.toggleAimMode();
      if (k === 'i' || k === 'c') window.GameUI.togglePanel('char-panel');
      if (k === 'k') window.GameUI.togglePanel('skilltree-panel');
      if (k === 't') this.toggleTownPortal();
      if (k === ' ') {
        e.preventDefault();
        this.performDodge();
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        this.toggleLootLabels();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / this.zoom;
      this.mouse.y = (e.clientY - rect.top) / this.zoom;
      this.mouse.worldX = this.mouse.x + this.cam.x;
      this.mouse.worldY = this.mouse.y + this.cam.y;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.inMainMenu || this.isPaused()) return;
      window.SFX.init();
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / this.zoom;
      this.mouse.y = (e.clientY - rect.top) / this.zoom;
      this.mouse.worldX = this.mouse.x + this.cam.x;
      this.mouse.worldY = this.mouse.y + this.cam.y;

      if (e.button === 0) {
        this.mouse.leftDown = true;
        this.handleLeftClick();
      } else if (e.button === 2) {
        this.mouse.rightDown = true;
        this.castSkill(1, this.mouse.worldX, this.mouse.worldY);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.leftDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const btnAim = document.getElementById('btn-aim-mode');
    if (btnAim) btnAim.addEventListener('click', () => this.toggleAimMode());

    document.getElementById('btn-loot-labels').addEventListener('click', () => this.toggleLootLabels());
    document.getElementById('btn-sound').addEventListener('click', (e) => {
      const on = window.SFX.toggle();
      e.target.textContent = on ? 'SFX: AN' : 'SFX: AUS';
    });
  }

  toggleAimMode() {
    this.player.autoAimNearest = !this.player.autoAimNearest;
    const btn = document.getElementById('btn-aim-mode');
    if (btn) {
      btn.textContent = this.player.autoAimNearest ? 'ZIEL: AUTO-AIM (F)' : 'ZIEL: MAUS (F)';
    }
    this.addFloatingText(
      this.player.x,
      this.player.y - 26,
      this.player.autoAimNearest ? 'AUTO-ATTACK: NÄCHSTER GEGNER' : 'AUTO-ATTACK: MAUSRICHTUNG',
      '#f2c94c'
    );
  }

  toggleLootLabels() {
    this.showLootLabels = !this.showLootLabels;
    const btn = document.getElementById('btn-loot-labels');
    if (btn) btn.textContent = `ALT: Beute ${this.showLootLabels ? 'AN' : 'AUS'}`;
  }

  selectSkill(idx) {
    this.player.activeSkill = idx;
    for (let i = 0; i < 2; i++) {
      const el = document.getElementById(`skill-slot-${i}`);
      if (el) el.classList.toggle('active', i === idx);
    }
  }

  useSkillSlot(idx) {
    this.selectSkill(idx);
    if (idx === 1) {
      if (!this.hasSkillNode('blade_1')) {
        this.addFloatingText(this.player.x, this.player.y - 26, 'Wirbelwind erst im Skill-Tree [K] freischalten!', '#ff7b6b');
      } else {
        this.addFloatingText(this.player.x, this.player.y - 26, 'Wirbelwind aktiv mit [Rechter Maustaste] auslösen!', '#f2c94c');
      }
    }
  }

  getSkillRank(nodeId) {
    return Number(this.player.skillsUnlocked[nodeId] || 0);
  }

  hasSkillNode(nodeId) {
    return this.getSkillRank(nodeId) > 0;
  }

  unlockSkillNode(nodeId) {
    const p = this.player;
    let foundNode = null;
    for (const branch of SKILL_TREE_DATA) {
      for (const n of branch.nodes) {
        if (n.id === nodeId) foundNode = n;
      }
    }
    if (!foundNode) return false;

    const curRank = this.getSkillRank(nodeId);
    const maxRank = foundNode.maxRank || 1;
    const cost = foundNode.cost || 1;
    const reqLevel = foundNode.reqLevel || 1;

    if (curRank >= maxRank) return false;
    if (p.level < reqLevel) {
      this.addFloatingText(p.x, p.y - 28, `Benötigt Charakter-Stufe ${reqLevel}!`, '#ff5555');
      return false;
    }
    if (foundNode.req && this.getSkillRank(foundNode.req) < (foundNode.reqRank || 1)) {
      this.addFloatingText(p.x, p.y - 28, 'Vorherige Stufe muss auf Max-Rang (3/3) sein!', '#ff5555');
      return false;
    }
    if (p.skillPoints < cost) {
      this.addFloatingText(p.x, p.y - 28, `Benötigt ${cost} Skillpunkte!`, '#ff5555');
      return false;
    }

    p.skillsUnlocked[nodeId] = curRank + 1;
    p.skillPoints -= cost;
    this.recalcStats(false);
    window.SFX.levelUp();
    this.addFloatingText(p.x, p.y - 28, `SKILL: ${foundNode.name} (${curRank + 1}/${maxRank})!`, '#ffdf40');
    window.GameUI.renderAll();
    return true;
  }

  getSpentSkillPoints() {
    const p = this.player;
    if (!p || !p.skillsUnlocked) return 0;
    let spent = 0;
    SKILL_TREE_DATA.forEach((branch) => {
      branch.nodes.forEach((node) => {
        const rank = Number(p.skillsUnlocked[node.id] || 0);
        if (rank > 0) {
          spent += rank * (node.cost || 1);
        }
      });
    });
    return spent;
  }

  getRespecCost() {
    const spent = this.getSpentSkillPoints();
    if (spent <= 0) return 0;
    return spent * 45;
  }

  respecSkillTree() {
    const p = this.player;
    const spent = this.getSpentSkillPoints();
    if (spent <= 0) {
      this.addFloatingText(p.x, p.y - 24, 'Keine Skillpunkte zum Zurücksetzen vorhanden!', '#ff7b6b');
      return false;
    }
    p.skillsUnlocked = {};
    p.skillPoints = Math.max(p.totalSkillPointsEarned || 0, (p.skillPoints || 0) + spent);
    this.recalcStats(false);
    window.SFX.levelUp();
    this.addFloatingText(p.x, p.y - 28, 'SKILL-TREE ZURÜCKGESETZT!', '#5ce1ff');
    this.addSystemLog(`Skill-Tree zurückgesetzt (${spent} Skillpunkte zurückerhalten).`, 'info');
    this.saveCurrentCharacter();
    window.GameUI.renderAll();
    window.GameUI.updateHUD();
    return true;
  }

  recalcStats(fullRestore = false) {
    const p = this.player;
    let bonusStr = 0;
    let bonusVit = 0;
    let bonusEne = 0;
    let bonusDex = 0;
    let bonusHp = 0;
    let bonusMp = 0;
    let minDmg = 4;
    let maxDmg = 8;
    let armor = 0;
    let crit = 0;
    let lifeOnHit = 0;
    let speedBonus = 0;

    // Melee & Synergy Stats from Equipment
    let attackSpeedPct = 0;
    let cleaveRangePct = 0;
    let whirlwindDmgPct = 0;
    let critDmgBonusPct = 0;
    let dodgeCdRed = 0;
    let dodgeRangePct = 0;

    Object.values(p.equipment).forEach((item) => {
      if (!item) return;
      minDmg += item.minDmg || 0;
      maxDmg += item.maxDmg || 0;
      armor += item.armor || 0;
      if (item.mods) {
        bonusStr += item.mods.str || 0;
        bonusVit += item.mods.vit || 0;
        bonusEne += item.mods.ene || 0;
        bonusDex += item.mods.dex || 0;
        bonusHp += item.mods.bonusHp || 0;
        bonusMp += item.mods.bonusMp || 0;
        crit += item.mods.crit || 0;
        lifeOnHit += item.mods.lifeOnHit || 0;
        speedBonus += item.mods.speed || 0;
        attackSpeedPct += item.mods.attackSpeed || 0;
        cleaveRangePct += item.mods.cleaveRange || 0;
        whirlwindDmgPct += item.mods.whirlwindDmg || 0;
        critDmgBonusPct += item.mods.critDmg || 0;
        dodgeCdRed += item.mods.dodgeCdRed || 0;
        dodgeRangePct += item.mods.dodgeRange || 0;
      }
    });

    // Apply Multi-Rank Melee Skill-Tree Passives
    const rBlade1 = this.getSkillRank('blade_1'); // Wirbelwind (Rechtsklick)
    const rBlade2 = this.getSkillRank('blade_2'); // Meisterhafter Rundumschlag
    const hasBlade3 = this.hasSkillNode('blade_3'); // Blutklinge der Vernichtung
    const rWarden1 = this.getSkillRank('warden_1'); // Eisenhaut & Wucht
    const rWarden2 = this.getSkillRank('warden_2'); // Blutdurst der Klinge
    const hasWarden3 = this.hasSkillNode('warden_3'); // Zorn des Klingenwächters
    const rShadow1 = this.getSkillRank('shadow_1'); // Doppelter Schattenschritt

    if (rBlade2 > 0) {
      cleaveRangePct += rBlade2 * 8;
      attackSpeedPct += rBlade2 * 7;
    }
    if (rWarden2 > 0) {
      lifeOnHit += rWarden2 * 1;
      crit += rWarden2 * 2;
    }
    if (rShadow1 > 0) {
      dodgeCdRed += rShadow1 * 7;
    }

    p.totalStr = p.baseStr + bonusStr;
    p.totalVit = p.baseVit + bonusVit;
    p.totalEne = p.baseEne + bonusEne;
    p.totalDex = p.baseDex + bonusDex;
    crit += 4 + Math.floor(p.totalDex * 0.3);

    const physSkillMult = 1 + rWarden1 * 0.06;
    const strMult = (1 + p.totalStr * 0.02) * physSkillMult;
    p.minDmg = Math.round(minDmg * strMult);
    p.maxDmg = Math.round(maxDmg * strMult);

    const baseArmor = armor + Math.floor(p.totalDex * 0.25);
    p.armor = Math.round(baseArmor * (1 + rWarden1 * 0.10));
    p.critChance = Math.min(75, crit);
    p.critDmgMult = (hasWarden3 ? 2.10 : 1.75) + critDmgBonusPct / 100;
    p.lifeOnHit = lifeOnHit;
    p.baseMoveSpeed = Math.round(138 * (1 + speedBonus / 100));
    p.moveSpeed = p.baseMoveSpeed;

    // Pure Melee Computed Properties
    let baseAPS = 1.65 * (1 + attackSpeedPct / 100);
    if (hasWarden3) {
      baseAPS *= 1.55; // Zorn des Klingenwächters: +55% Nahkampf-Angriffsrate
    }
    p.attackSpeed = Number(baseAPS.toFixed(2));
    p.skillMaxCds[0] = Math.max(0.08, 1 / p.attackSpeed);
    p.skillMaxCds[1] = hasBlade3 ? Number((1.2 * 0.65).toFixed(2)) : 1.2;

    p.cleaveRangeMult = 1 + cleaveRangePct / 100;
    p.whirlwindUnlocked = rBlade1 > 0;
    p.whirlwindDmgMult = (1.15 + Math.max(0, rBlade1 - 1) * 0.25) * (1 + whirlwindDmgPct / 100);
    p.whirlwindRadiusMult = 1 + Math.max(0, rBlade1 - 1) * 0.12;
    p.frostAura = 0;
    p.malakorWrath = 0;

    // Dodge Roll & I-Frames Computed Properties
    p.maxDodgeCharges = 1 + (rShadow1 >= 3 ? 1 : 0);
    if (p.dodgeCharges > p.maxDodgeCharges) p.dodgeCharges = p.maxDodgeCharges;
    p.dodgeMaxCd = Math.max(0.35, 1.05 * (1 - Math.min(65, dodgeCdRed) / 100));
    p.dodgeSpeed = Math.round(330 * (1 + dodgeRangePct / 100));

    p.maxHp = 80 + p.totalVit * 5 + (p.level - 1) * 12 + bonusHp;
    p.maxMp = 40 + p.totalEne * 3 + (p.level - 1) * 6 + bonusMp;
    // Klingenwächter Grundwert für Mana-Regeneration: max. 0,5 MP pro Sekunde
    p.baseManaRegen = 0.5;
    p.manaRegen = p.baseManaRegen;

    if (fullRestore) {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      p.dodgeCharges = p.maxDodgeCharges;
    } else {
      p.hp = Math.min(p.hp, p.maxHp);
      p.mp = Math.min(p.mp, p.maxMp);
    }
  }

  getHoveredNPC(wx, wy) {
    for (const npc of this.world.npcs) {
      if (Math.abs(wx - npc.x) <= 28 && wy >= npc.y - 50 && wy <= npc.y + 16) {
        return npc;
      }
    }
    return null;
  }

  getHoveredPortal(wx, wy) {
    if (this.currentScene === 'castle' && this.activeBounty && this.activeBounty.status === 'active') {
      const qp = this.scenes.castle.questPortal;
      if (qp && Math.abs(wx - qp.x) <= 38 && wy >= qp.y - 76 && wy <= qp.y + 18) {
        return { x: qp.x, y: qp.y, kind: 'quest' };
      }
    }
    if (this.currentScene === 'world') {
      const rp = this.scenes.world.returnPortal;
      if (rp && Math.abs(wx - rp.x) <= 38 && wy >= rp.y - 76 && wy <= rp.y + 18) {
        return { x: rp.x, y: rp.y, kind: 'return' };
      }
    }
    if (!this.townPortal.active) return null;
    const inTown = this.world.isTown(this.player.x, this.player.y);
    const px = inTown ? this.townPortal.townX : this.townPortal.wildX;
    const py = inTown ? this.townPortal.townY : this.townPortal.wildY;
    if (Math.abs(wx - px) <= 38 && wy >= py - 76 && wy <= py + 18) {
      return { x: px, y: py, inTown, kind: 'town' };
    }
    return null;
  }

  enterQuestPortal() {
    if (!this.activeBounty || this.activeBounty.status !== 'active') {
      this.addFloatingText(this.player.x, this.player.y - 28, 'ERST QUEST BEI ALDRIC (!) ANNEHMEN!', '#ffe455');
      return false;
    }
    const gate = this.scenes.world.duestermarkGate;
    if (window.SFX && typeof window.SFX.portalTravel === 'function') window.SFX.portalTravel();
    this.switchScene('world', gate.x, gate.y);
    this.addFloatingText(this.player.x, this.player.y - 28, 'DÜSTERMARK BETRETEN!', '#b86bff');
    return true;
  }

  returnThroughWaystone() {
    const castle = this.scenes.castle;
    if (window.SFX && typeof window.SFX.portalTravel === 'function') window.SFX.portalTravel();
    this.switchScene('castle', castle.respawnPoint.x, castle.respawnPoint.y);
    this.addFloatingText(this.player.x, this.player.y - 28, 'FESTUNG RABENSTEIN ERREICHT!', '#5ce1ff');
    return true;
  }

  handleLeftClick() {
    const wx = this.mouse.worldX;
    const wy = this.mouse.worldY;

    // 1. Ground Loot Pickup
    if (this.hoveredGroundItem) {
      this.mouse.leftDown = false;
      const g = this.hoveredGroundItem;
      const dist = Math.hypot(g.x - this.player.x, g.y - this.player.y);
      if (dist <= 80) {
        this.pickupGroundItem(g);
        return;
      } else {
        this.player.moveTarget = { x: g.x, y: g.y, pickup: g };
        return;
      }
    }

    // 2. Portal Click Interaction (Quest-Portal, Rückkehr-Portal & Stadtportal)
    const clickedPortal = this.getHoveredPortal(wx, wy);
    if (clickedPortal) {
      this.mouse.leftDown = false;
      const dist = Math.hypot(this.player.x - clickedPortal.x, this.player.y - clickedPortal.y);
      if (dist <= 90) {
        this.player.moveTarget = null;
        if (clickedPortal.kind === 'quest') this.enterQuestPortal();
        else if (clickedPortal.kind === 'return') this.returnThroughWaystone();
        else this.useActivePortal();
      } else {
        this.player.moveTarget = { x: clickedPortal.x, y: clickedPortal.y, usePortal: true, portalKind: clickedPortal.kind };
      }
      return;
    }

    // 3. NPC Interaction (No attack triggered!)
    const clickedNPC = this.getHoveredNPC(wx, wy);
    if (clickedNPC) {
      this.mouse.leftDown = false;
      const dist = Math.hypot(this.player.x - clickedNPC.x, this.player.y - clickedNPC.y);
      if (dist <= 95) {
        this.player.moveTarget = null;
        this.interactNPC(clickedNPC);
      } else {
        this.player.moveTarget = { x: clickedNPC.x, y: clickedNPC.y + 26, npc: clickedNPC };
      }
      return;
    }

    // 4. Fountain & Chests
    for (const prop of this.world.props) {
      if (prop.type === 'fountain' && Math.hypot(wx - (prop.x + 32), wy - (prop.y + 32)) < 48) {
        this.mouse.leftDown = false;
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        this.refillPotionsInTown(true);
        window.SFX.potion();
        this.addFloatingText(this.player.x, this.player.y - 24, 'BRUNNEN: LEBEN & TRÄNKE ERNEUERT!', '#5ce1ff');
        return;
      }
      if (prop.type === 'chest' && !prop.opened && Math.hypot(wx - prop.x, wy - prop.y) < 28) {
        if (Math.hypot(this.player.x - prop.x, this.player.y - prop.y) <= 76) {
          this.mouse.leftDown = false;
          this.openChest(prop);
          return;
        }
      }
    }
  }

  performDodge() {
    const p = this.player;
    if (p.dodgeCharges <= 0 || p.dodgeTimer > 0) return;

    p.dodgeCharges--;
    if (p.dodgeRechargeTimer <= 0) {
      p.dodgeRechargeTimer = p.dodgeMaxCd;
    }

    const angle = Math.atan2(this.mouse.worldY - p.y, this.mouse.worldX - p.x);
    p.facing = angle;
    p.flipX = Math.cos(angle) < 0;
    p.dodgeTimer = 0.22;
    p.iFrameTimer = 0.22; // Invincibility Frames (0.2s+ Unverwundbarkeit)
    if (window.SFX && typeof window.SFX.dodge === 'function') window.SFX.dodge();

    // Pfad des Schattens Tier 2: 1.5s / 2.0s / 2.5s lang +Tempo & Beutemagnet
    const rShadow2 = this.getSkillRank('shadow_2');
    if (rShadow2 > 0) {
      p.postDodgeBuffTimer = 1.0 + rShadow2 * 0.5;
    }

    window.SFX.swing();
    for (let i = 0; i < 14; i++) {
      this.spawnParticle(p.x, p.y, '#99e6ff', 65, 0.34);
    }
  }

  // Twin-Stick Auto-Attack Aim Target Calculation
  getAutoAttackTargetAngle() {
    const p = this.player;
    if (p.autoAimNearest && this.world.monsters.length > 0) {
      let nearest = null;
      let bestDist = 360;
      for (const m of this.world.monsters) {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d < bestDist) {
          bestDist = d;
          nearest = m;
        }
      }
      if (nearest) {
        return Math.atan2(nearest.y - p.y, nearest.x - p.x);
      }
    }
    return Math.atan2(this.mouse.worldY - p.y, this.mouse.worldX - p.x);
  }

  // Checks if at least one living monster is within melee cleave range
  hasEnemyInMeleeRange() {
    const p = this.player;
    const monsters = this.world && this.world.monsters;
    if (!monsters || monsters.length === 0) return false;
    const meleeRadius = Math.round(54 * (p.cleaveRangeMult || 1)) + 8;
    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (!m || m.hp <= 0) continue;
      if (Math.hypot(m.x - p.x, m.y - p.y) <= meleeRadius + (m.radius || 0)) {
        return true;
      }
    }
    return false;
  }

  // Fires a single pure melee Auto-Attack cleave pulse (No arcane projectiles!)
  performAutoAttack() {
    if (!this.activeBounty || this.activeBounty.status !== 'active') return;
    const p = this.player;
    const angle = this.getAutoAttackTargetAngle();
    p.facing = angle;
    p.flipX = Math.cos(angle) < 0;
    const swingDur = Math.min(0.26, Math.max(0.12, p.skillMaxCds[0] * 0.88));
    p.slashAnimDuration = swingDur;
    p.slashAnimTimer = swingDur;
    p.slashSwingSign = (p.slashSwingSign || 1) * -1;
    p.autoAttackCount++;

    window.SFX.swing();

    const isHeavyBloodStrike = this.hasSkillNode('blade_3') && (p.autoAttackCount % 3 === 0);
    const cleaveRadius = Math.round((isHeavyBloodStrike ? 66 : 54) * p.cleaveRangeMult);
    const dmgScale = isHeavyBloodStrike ? 1.65 : 1.0;
    const knockPower = isHeavyBloodStrike ? 20 : 10;

    this.slashEffects.push({
      x: p.x,
      y: p.y,
      angle,
      radius: cleaveRadius,
      timer: 0.16,
      maxTimer: 0.16,
      color: isHeavyBloodStrike ? '#ff4a4a' : (this.hasSkillNode('warden_3') ? '#ffb84d' : '#a8dcff'),
      swingSign: p.slashSwingSign
    });

    // Break nearby barrels / open chests in cleave range
    this.world.props.forEach((prop) => {
      const d = Math.hypot(prop.x - p.x, prop.y - p.y);
      if (d <= cleaveRadius + 8) {
        if (prop.type === 'barrel' && !prop.broken) {
          prop.broken = true;
          window.SFX.hit();
          for (let i = 0; i < 10; i++) this.spawnParticle(prop.x, prop.y, '#8f5b31', 65, 0.4);
          if (Math.random() < 0.45) this.spawnLootAt(prop.x, prop.y, 1, false);
        } else if (prop.type === 'chest' && !prop.opened) {
          this.openChest(prop);
        }
      }
    });

    // Pure Melee Cleave Damage
    this.world.monsters.forEach((m) => {
      const dx = m.x - p.x;
      const dy = m.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= cleaveRadius + m.radius) {
        const mAngle = Math.atan2(dy, dx);
        let diff = Math.abs(mAngle - angle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff <= 1.45 || dist < 30) {
          this.damageMonster(m, dmgScale, Math.cos(angle) * knockPower, Math.sin(angle) * knockPower);
        }
      }
    });
  }

  triggerWhirlwind() {
    const p = this.player;
    p.whirlwindAnimTimer = 0.36;
    window.SFX.whirlwind();
    const radius = Math.round(68 * (p.whirlwindRadiusMult || 1) * (p.cleaveRangeMult || 1));
    const dmgScale = p.whirlwindDmgMult || 1.15;

    this.slashEffects.push({
      x: p.x,
      y: p.y,
      angle: 0,
      fullCircle: true,
      radius,
      timer: 0.32,
      maxTimer: 0.32,
      color: '#ff8566'
    });
    for (let i = 0; i < 14; i++) {
      this.spawnParticle(p.x, p.y, '#ffaa70', 90, 0.32);
    }
    this.world.monsters.forEach((m) => {
      const dist = Math.hypot(m.x - p.x, m.y - p.y);
      if (dist <= radius + 4 + m.radius) {
        const pushAngle = Math.atan2(m.y - p.y, m.x - p.x);
        this.damageMonster(m, dmgScale, Math.cos(pushAngle) * 14, Math.sin(pushAngle) * 14);
      }
    });
  }

  castSkill(skillIdx, targetX, targetY) {
    const p = this.player;
    if (skillIdx === 0) {
      this.performAutoAttack();
      return;
    }
    if (skillIdx !== 1) return;

    if (!this.hasSkillNode('blade_1')) {
      this.addFloatingText(p.x, p.y - 26, 'Wirbelwind erst im Skill-Tree [K] freischalten!', '#ff7b6b');
      return;
    }
    if (p.skillCds[1] > 0) return;

    const angle = Math.atan2(targetY - p.y, targetX - p.x);
    p.facing = angle;
    p.flipX = Math.cos(angle) < 0;

    const cost = 12;
    if (p.mp < cost) {
      this.addFloatingText(p.x, p.y - 22, `Nicht genug Mana (${cost} MP)!`, '#5c8aff');
      return;
    }
    p.mp -= cost;
    p.skillCds[1] = p.skillMaxCds[1];
    this.triggerWhirlwind();
  }

  damageMonster(m, mult = 1.0, knockX = 0, knockY = 0) {
    if (!m || m.hp <= 0) return;
    const p = this.player;
    let raw = window.ItemGenerator.randInt(p.minDmg, p.maxDmg) * mult;
    const isCrit = Math.random() * 100 < p.critChance;
    if (isCrit) raw *= (p.critDmgMult || 1.85);
    const dmg = Math.max(1, Math.round(raw));

    m.hp -= dmg;
    m.hitFlash = 0.14;
    if (m.speed > 0 && !this.world.isSolidAtPixel(m.x + knockX, m.y + knockY, m.radius)) {
      m.x += knockX;
      m.y += knockY;
    }

    if (p.lifeOnHit > 0) {
      p.hp = Math.min(p.maxHp, p.hp + p.lifeOnHit);
    }

    if (isCrit) {
      window.SFX.crit();
      this.addFloatingText(m.x, m.y - 24, `${dmg} KRIT!`, '#ffea00');
    } else {
      window.SFX.hit();
      this.addFloatingText(m.x, m.y - 20, `${dmg}`, '#ffffff');
    }

    for (let i = 0; i < 6; i++) {
      this.spawnParticle(m.x, m.y, '#b81d24', 70, 0.32);
    }

    if (m.hp <= 0) {
      this.killMonster(m);
    }
  }

  trimFarthestExcessMonsters(limit, refX, refY, minDist = 0) {
    const nonBosses = this.world.monsters.filter((m) => !m.isBoss);
    if (nonBosses.length <= limit) return;
    let excess = nonBosses.length - limit;

    // Entferne immer zuerst die am weitesten entfernten Gegner (nie sichtbare vor der Burg)
    const removable = nonBosses
      .map((m) => ({ m, dist: Math.hypot(m.x - refX, m.y - refY) }))
      .filter((entry) => entry.dist >= minDist)
      .sort((a, b) => b.dist - a.dist);

    for (let i = 0; i < removable.length && excess > 0; i++) {
      const idx = this.world.monsters.indexOf(removable[i].m);
      if (idx !== -1) {
        this.world.monsters.splice(idx, 1);
        excess--;
      }
    }
  }

  getBountyTierState(type) {
    const key = type === 'boss' ? 'boss' : 'horde';
    if (!this.bountyTiers) {
      this.bountyTiers = {
        horde: { maxTier: 1, selectedTier: 1 },
        boss: { maxTier: 1, selectedTier: 1 }
      };
    }
    if (!this.bountyTiers[key]) {
      this.bountyTiers[key] = { maxTier: 1, selectedTier: 1 };
    }
    return this.bountyTiers[key];
  }

  setBountyTier(type, tier) {
    const state = this.getBountyTierState(type);
    const clamped = Math.max(1, Math.min(state.maxTier, Math.floor(Number(tier) || 1)));
    state.selectedTier = clamped;
    this.generateBounties();
    this.saveCurrentCharacter();
    if (window.GameUI) window.GameUI.updateHUD();
    return clamped;
  }

  generateBounties() {
    const hordeState = this.getBountyTierState('horde');
    const bossState = this.getBountyTierState('boss');
    const hordeTier = Math.max(1, Math.min(hordeState.maxTier, hordeState.selectedTier));
    const bossTier = Math.max(1, Math.min(bossState.maxTier, bossState.selectedTier));
    const hordeMult = 1.0 + hordeTier * 0.25;
    const bossMult = 1.0 + bossTier * 0.25;

    this.availableBounties = [
      {
        id: `horde-t${hordeTier}`,
        type: 'horde',
        title: 'Horden-Säuberung',
        description: `Besiege ${30 * hordeTier} Monster in der weiten Düstermark und ihren Dungeons.`,
        tier: hordeTier,
        difficultyMult: hordeMult,
        targetKills: 30 * hordeTier,
        currentKills: 0,
        rewardGold: 180 * hordeTier,
        rewardRarity: 'magic/rare',
        status: 'available'
      },
      {
        id: `boss-t${bossTier}`,
        type: 'boss',
        title: 'Exekution',
        description: 'Durchquere die Düstermark und besiege Boss Malakor in der Verfluchten Krypta im Osten.',
        tier: bossTier,
        difficultyMult: bossMult,
        targetKills: 1,
        currentKills: 0,
        rewardGold: 220 * bossTier,
        rewardRarity: 'rare/unique',
        status: 'available'
      }
    ];
    return this.availableBounties;
  }

  get groundItems() {
    if (!this.sceneGroundItems) this.sceneGroundItems = { castle: [], world: [] };
    return this.sceneGroundItems[this.currentScene] || (this.sceneGroundItems[this.currentScene] = []);
  }

  set groundItems(val) {
    if (!this.sceneGroundItems) this.sceneGroundItems = { castle: [], world: [] };
    this.sceneGroundItems[this.currentScene] = val;
  }

  switchScene(targetScene, spawnX = null, spawnY = null) {
    const nextScene = targetScene === 'castle' ? 'castle' : 'world';
    const nextWorld = this.scenes[nextScene];
    const p = this.player;
    this.currentScene = nextScene;
    this.world = nextWorld;
    if (window.SFX && typeof window.SFX.setMusicScene === 'function') {
      window.SFX.setMusicScene(nextScene);
    }
    if (p) {
      if (typeof spawnX === 'number' && typeof spawnY === 'number') {
        p.x = spawnX;
        p.y = spawnY;
      } else if (nextScene === 'castle') {
        p.x = nextWorld.respawnPoint.x;
        p.y = nextWorld.respawnPoint.y;
      } else {
        p.x = nextWorld.duestermarkGate.x;
        p.y = nextWorld.duestermarkGate.y;
      }
      p.moveTarget = null;
      p.dodgeTimer = 0;
      p.wasInTown = nextWorld.isTown(p.x, p.y);
      this.updateCamera(p.x, p.y, nextWorld);
    }
    this.projectiles = [];
    this.particles = [];
    this.fireZones = [];
    this.slashEffects = [];
    this.hoveredNPC = null;
    this.hoveredPortal = null;
    this.hoveredGroundItem = null;
    this.hoveredChest = null;
    this.questPortalGraceTimer = 0.7;
    if (nextScene === 'castle') {
      this.refillPotionsInTown(false);
    }
    if (window.GameUI) window.GameUI.updateHUD();
  }

  changeZone(zoneId) {
    const p = this.player;
    if (!p) return;

    if (zoneId === 'duestermark') {
      const gate = this.scenes.world.duestermarkGate;
      this.townPortal.active = false;
      this.switchScene('world', gate.x, gate.y);
      this.addFloatingText(p.x, p.y - 28, 'DÜSTERMARK BETRETEN!', '#66d9ff');
    } else if (zoneId === 'krypta') {
      const ent = this.scenes.world.kryptaEntrance;
      this.townPortal.active = false;
      this.switchScene('world', ent.x, ent.y);
      this.addFloatingText(p.x, p.y - 28, 'VERFLUCHTE KRYPTA!', '#ff6b6b');
    } else {
      const sp = this.scenes.castle.respawnPoint;
      this.switchScene('castle', sp.x, sp.y);
    }

    for (let i = 0; i < 16; i++) {
      this.spawnParticle(p.x, p.y, '#5ce1ff', 85, 0.5);
    }
    window.GameUI.closeDeathModal();
  }

  startBounty(bountyOrIndex) {
    const chosen =
      typeof bountyOrIndex === 'number'
        ? this.availableBounties[bountyOrIndex]
        : typeof bountyOrIndex === 'string'
        ? this.availableBounties.find((b) => b.id === bountyOrIndex || b.type === bountyOrIndex)
        : bountyOrIndex;
    if (!chosen) return null;

    this.activeBounty = {
      ...chosen,
      currentKills: 0,
      status: 'active'
    };
    this.quest.respawnTimer = 1.0;
    window.GameUI.closeDeathModal();

    const newSeed = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
    this.scenes.world.regenerateWorld(newSeed, this.activeBounty);
    if (this.sceneGroundItems) this.sceneGroundItems.world = [];
    if (this.minimapBaseCache) delete this.minimapBaseCache.world;
    this.questPortalAnimTime = 0;
    if (this.currentScene === 'castle' && this.scenes.castle.questPortal) {
      const qp = this.scenes.castle.questPortal;
      if (window.SFX && typeof window.SFX.questAccept === 'function') window.SFX.questAccept();
      for (let i = 0; i < 26; i++) {
        this.spawnParticle(qp.x, qp.y, '#b86bff', 95, 0.65);
      }
      this.addFloatingText(qp.x, qp.y - 36, 'QUEST-PORTAL GEÖFFNET!', '#d29bff');
    }
    this.addFloatingText(
      this.player.x,
      this.player.y - 44,
      `BOUNTY TIER ${this.activeBounty.tier}: ${this.activeBounty.title.toUpperCase()}`,
      '#f2c94c'
    );
    this.saveCurrentCharacter();
    this.addSystemLog(
      `Quest angenommen: ${this.activeBounty.title} (Tier ${this.activeBounty.tier}) – Portal in die Düstermark geöffnet!`,
      'quest'
    );
    if (window.GameUI) window.GameUI.updateHUD();
    return this.activeBounty;
  }

  claimActiveBounty() {
    const b = this.activeBounty;
    const p = this.player;
    if (!b || b.status !== 'ready_to_turn_in' || !p) return null;

    const goldReward = b.rewardGold || (b.type === 'boss' ? 150 * b.tier : 100 * b.tier);
    const xpReward = (b.type === 'boss' ? 95 : 70) + b.tier * 35;
    p.gold += goldReward;
    this.gainXP(xpReward);

    let forcedRarity = 'magic';
    if (b.type === 'boss') {
      const uniqueChance = Math.min(0.65, 0.25 + (b.tier - 1) * 0.08);
      forcedRarity = Math.random() < uniqueChance ? 'unique' : 'rare';
    } else {
      const rareChance = Math.min(0.75, 0.4 + (b.tier - 1) * 0.08);
      forcedRarity = Math.random() < rareChance ? 'rare' : 'magic';
    }

    const rewardItem = window.ItemGenerator.generateItem(p.level + b.tier, forcedRarity);
    if (window.GameUI.hasInvSpace(p)) window.GameUI.addInvItem(p, rewardItem);
    else this.dropItemObject(rewardItem, p.x, p.y);
    window.SFX.levelUp();

    this.addFloatingText(
      p.x,
      p.y - 34,
      `BOUNTY TIER ${b.tier} ABGESCHLOSSEN! +${goldReward} GOLD`,
      '#ffdf40'
    );

    // Nur der jeweilige Quest-Typ steigt im Tier auf (sofern sein bisheriges Max-Tier geschafft wurde)
    const state = this.getBountyTierState(b.type);
    if (b.tier >= state.maxTier) {
      state.maxTier = b.tier + 1;
      state.selectedTier = state.maxTier;
    } else {
      state.selectedTier = b.tier;
    }
    this.bountyTier = Math.max(
      this.getBountyTierState('horde').maxTier,
      this.getBountyTierState('boss').maxTier
    );
    this.activeBounty = null;
    this.closeTownPortal();
    this.scenes.world.monsters = [];
    this.world.monsters = [];
    this.projectiles = this.projectiles.filter((pr) => pr.fromPlayer);
    this.generateBounties();
    this.saveCurrentCharacter();
    const saveStatusEl = document.getElementById('esc-save-status');
    if (saveStatusEl) {
      saveStatusEl.textContent = `Spiel automatisch gespeichert (${new Date().toLocaleTimeString('de-DE')})`;
    }
    this.addFloatingText(p.x, p.y - 54, 'SPIEL AUTOMATISCH GESPEICHERT!', '#66ff99');
    this.addSystemLog(
      `Quest abgegeben: ${b.title} (Tier ${b.tier})! +${goldReward} Gold, +${xpReward} XP, Item: ${rewardItem.name}. (Automatisch gespeichert)`,
      'quest'
    );
    if (window.GameUI) {
      window.GameUI.renderAll();
      window.GameUI.updateHUD();
    }
    return { goldReward, xpReward, rewardItem, newTier: state.maxTier, type: b.type };
  }

  cancelActiveBounty() {
    if (!this.activeBounty) return false;
    const cancelled = this.activeBounty;
    this.activeBounty = null;
    this.closeTownPortal();
    // Ohne aktive Quest alle Gegner und gegnerischen Projektile aus dem Spiel entfernen
    this.scenes.world.monsters = [];
    this.world.monsters = [];
    this.projectiles = this.projectiles.filter((pr) => pr.fromPlayer);
    this.generateBounties();
    this.saveCurrentCharacter();
    this.addFloatingText(
      this.player.x,
      this.player.y - 30,
      `MISSION ABGEBROCHEN: ${cancelled.title.toUpperCase()} (TIER ${cancelled.tier})`,
      '#ff8866'
    );
    this.addSystemLog(`Quest abgebrochen: ${cancelled.title} (Tier ${cancelled.tier}).`, 'quest');
    if (window.GameUI) window.GameUI.updateHUD();
    return true;
  }

  killMonster(m) {
    window.SFX.monsterDeath();
    const idx = this.world.monsters.indexOf(m);
    if (idx !== -1) this.world.monsters.splice(idx, 1);

    for (let i = 0; i < 18; i++) {
      this.spawnParticle(m.x, m.y, m.isBoss ? '#ff3838' : '#8a151b', 90, 0.55);
    }

    this.gainXP(m.xp);

    const b = this.activeBounty;
    if (b && b.status === 'active') {
      let progressed = false;
      if (b.type === 'horde' && !m.isBoss) {
        b.currentKills = Math.min(b.targetKills, (b.currentKills || 0) + 1);
        progressed = true;
      } else if (b.type === 'boss' && m.isBoss) {
        b.currentKills = b.targetKills;
        progressed = true;
      }
      if (progressed && b.currentKills >= b.targetKills) {
        b.status = 'ready_to_turn_in';
        this.world.monsters = [];
        this.projectiles = this.projectiles.filter((pr) => pr.fromPlayer);
        this.saveCurrentCharacter();
        this.addFloatingText(
          this.player ? this.player.x : m.x,
          (this.player ? this.player.y : m.y) - 36,
          'Feldzug abgeschlossen! Kehre zu Chronist Aldric zurück.',
          '#f2c94c'
        );
        this.addSystemLog(
          `Feldzug erfüllt (${b.title} Tier ${b.tier})! Kehre zu Chronist Aldric zurück.`,
          'quest'
        );
        window.SFX.levelUp();
      }
    }

    if (m.isBoss) {
      const bossTier = b && b.type === 'boss' ? b.tier : this.getBountyTierState('boss').selectedTier;
      this.addFloatingText(m.x, m.y - 36, 'MALAKOR DER ENTFESSELTE BESIEGT!', '#ff9900');
      const bossDropRarity = bossTier >= 3 && Math.random() < 0.35 ? 'unique' : 'rare';
      this.dropItemObject(window.ItemGenerator.generateItem(this.player.level + bossTier, bossDropRarity), m.x, m.y);
      this.dropGold(m.x - 16, m.y + 12, window.ItemGenerator.randInt(110, 190));
      this.dropPotion(m.x + 16, m.y + 14, 'hp');
      return;
    }

    this.spawnLootAt(m.x, m.y, m.level, true);
  }

  openChest(chest) {
    chest.opened = true;
    window.SFX.gold();
    for (let i = 0; i < 14; i++) {
      this.spawnParticle(chest.x, chest.y, '#f2c94c', 75, 0.45);
    }
    this.dropGold(chest.x, chest.y, window.ItemGenerator.randInt(25, 65));
    // Chests have a 35% chance to contain an item (following descending quality tiers)
    if (Math.random() < 0.35) {
      const item = window.ItemGenerator.generateItem(this.player.level + 1);
      this.dropItemObject(item, chest.x, chest.y);
    }
    if (Math.random() < 0.45) {
      this.dropPotion(chest.x, chest.y, Math.random() < 0.65 ? 'hp' : 'mp');
    }
  }

  spawnLootAt(x, y, level, isMonster) {
    if (Math.random() < 0.52) {
      this.dropGold(x, y, window.ItemGenerator.randInt(5, 15) * level);
    }
    if (Math.random() < 0.18) {
      this.dropPotion(x, y, Math.random() < 0.65 ? 'hp' : 'mp');
    }
    // Drastically reduced item drop rate: 4.5% from monsters, 1.5% from barrels/props!
    // When an item does drop, ItemGenerator.generateItem uses strictly descending quality chances:
    // Common (58%) > Magic (28%) > Rare (11.5%) > Unique (2.5%)
    const itemDropChance = isMonster ? 0.045 : 0.015;
    if (Math.random() < itemDropChance) {
      const item = window.ItemGenerator.generateItem(level);
      this.dropItemObject(item, x, y);
    }
  }

  dropGold(x, y, amount, isDeathGold = false) {
    this.groundItems.push({
      uid: 'g_' + Math.random().toString(36).slice(2, 9),
      kind: 'gold',
      amount,
      isDeathGold: Boolean(isDeathGold),
      name: isDeathGold ? `Verlorenes Gold (${amount})` : `${amount} Gold`,
      rarity: 'common',
      icon: 'icon_gold',
      x: isDeathGold ? x : x + (Math.random() * 28 - 14),
      y: isDeathGold ? y : y + (Math.random() * 28 - 14),
      z: isDeathGold ? 28 : 20,
      vz: isDeathGold ? 95 : 70
    });
  }

  dropPotion(x, y, potType) {
    this.groundItems.push({
      uid: 'p_' + Math.random().toString(36).slice(2, 9),
      kind: 'potion',
      potType,
      name: potType === 'hp' ? 'Heiltrank' : 'Manatrank',
      rarity: 'common',
      icon: potType === 'hp' ? 'icon_pot_hp' : 'icon_pot_mp',
      x: x + (Math.random() * 28 - 14),
      y: y + (Math.random() * 28 - 14),
      z: 20,
      vz: 70
    });
  }

  dropItemObject(item, x, y) {
    window.SFX.itemDrop(item.rarity);
    this.groundItems.push({
      uid: item.uid,
      kind: 'item',
      item,
      name: item.name,
      rarity: item.rarity,
      icon: item.icon,
      x: x + (Math.random() * 30 - 15),
      y: y + (Math.random() * 30 - 15),
      z: 24,
      vz: 85
    });
  }

  pickupGroundItem(g) {
    const idx = this.groundItems.indexOf(g);
    if (idx === -1) return;

    if (g.kind === 'gold') {
      this.player.gold += g.amount;
      window.SFX.gold();
      const msg = g.isDeathGold
        ? `VERLORENES GOLD ZURÜCKGEHOLT: +${g.amount} Gold!`
        : `+${g.amount} Gold`;
      this.addFloatingText(this.player.x, this.player.y - 20, msg, g.isDeathGold ? '#ffd700' : '#f2c94c');
      if (g.isDeathGold) {
        this.addSystemLog(`Verlorenes Gold zurückgeholt: +${g.amount} Gold.`, 'loot');
      }
      this.groundItems.splice(idx, 1);
      window.GameUI.renderAll();
    } else if (g.kind === 'potion') {
      if (this.player.potions[g.potType] >= this.player.maxPotions) {
        return;
      }
      this.player.potions[g.potType] = Math.min(this.player.maxPotions, this.player.potions[g.potType] + 1);
      window.SFX.potion();
      this.addFloatingText(this.player.x, this.player.y - 20, `+1 ${g.name}`, '#70ff85');
      this.groundItems.splice(idx, 1);
      window.GameUI.renderAll();
    } else if (g.kind === 'item') {
      if (!window.GameUI.hasInvSpace(this.player)) {
        this.addFloatingText(this.player.x, this.player.y - 24, 'Inventar ist voll! [T] für Stadtportal!', '#ff5555');
        return;
      }
      window.GameUI.addInvItem(this.player, g.item);
      window.SFX.itemDrop(g.item.rarity);
      this.addFloatingText(this.player.x, this.player.y - 22, `Aufgehoben: ${g.item.name}`, '#f5e042');
      if (g.item.rarity === 'rare' || g.item.rarity === 'unique') {
        this.addSystemLog(`Seltene Beute aufgehoben: ${g.item.name}.`, 'loot');
      }
      this.groundItems.splice(idx, 1);
      window.GameUI.renderAll();
    }
  }

  gainXP(amount) {
    const p = this.player;
    p.xp += amount;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      // Steeper XP curve + moderated stat points (3x +1 per Level-Up) for slower, rewarding ARPG progression
      p.xpNext = Math.round(p.xpNext * 1.68 + 115);
      p.statPoints += 3;
      p.skillPoints += 1;
      p.totalSkillPointsEarned += 1;
      this.recalcStats(true);
      window.SFX.levelUp();
      this.addFloatingText(p.x, p.y - 34, `LEVEL ${p.level}! +3 CHAR-PUNKTE [C] | +1 SKILLPUNKT [K]`, '#ffdf40');
      this.addSystemLog(`Level ${p.level} erreicht! +3 Attributpunkte [C] & +1 Skillpunkt [K].`, 'level');
      for (let i = 0; i < 32; i++) {
        this.spawnParticle(p.x, p.y, '#ffdf40', 115, 0.7);
      }
      window.GameUI.renderAll();
    }
  }

  usePotion(type) {
    const p = this.player;
    if (p.potions[type] <= 0) {
      this.addFloatingText(p.x, p.y - 20, 'Keine Tränke mehr!', '#ff6b6b');
      return;
    }
    if (type === 'hp' && p.hp >= p.maxHp) return;
    if (type === 'mp' && p.mp >= p.maxMp) return;

    p.potions[type]--;
    window.SFX.potion();
    if (type === 'hp') {
      const heal = Math.round(p.maxHp * 0.6);
      p.hp = Math.min(p.maxHp, p.hp + heal);
      this.addFloatingText(p.x, p.y - 22, `+${heal} HP`, '#ff5c5c');
    } else {
      const mana = Math.round(p.maxMp * 0.65);
      p.mp = Math.min(p.maxMp, p.mp + mana);
      this.addFloatingText(p.x, p.y - 22, `+${mana} MP`, '#5c9bff');
    }
  }

  getPotionCapacityUpgradeCost() {
    const p = this.player;
    const curMax = Math.max(4, Number(p.maxPotions || 4));
    if (curMax >= 10) return null;
    const stepCosts = [450, 900, 1650, 2800, 4500, 7200];
    return stepCosts[curMax - 4] ?? null;
  }

  // Seraphina / Town Refill: Automatically refills potions when entering Festung Rabenstein
  refillPotionsInTown(silent = false) {
    const p = this.player;
    const refilledHp = p.potions.hp < p.maxPotions;
    const refilledMp = p.potions.mp < p.maxPotions;
    p.potions.hp = p.maxPotions;
    p.potions.mp = p.maxPotions;
    if (!silent && (refilledHp || refilledMp)) {
      window.SFX.potion();
      this.addFloatingText(p.x, p.y - 28, 'SERAPHINAS SEGEN: TRÄNKE AUFGEFÜLLT!', '#70ff85');
      window.GameUI.renderAll();
    }
  }

  // Persistent Town-Portal Loop ([T] opens portal in wilderness; in town, portal is triggered ONLY by clicking!)
  closeTownPortal() {
    if (!this.townPortal || !this.townPortal.active) return false;
    this.townPortal.active = false;
    for (let i = 0; i < 16; i++) {
      this.spawnParticle(this.townPortal.townX, this.townPortal.townY, '#5ce1ff', 70, 0.45);
    }
    this.addSystemLog('Das aktive Stadtportal wurde geschlossen.', 'info');
    return true;
  }

  toggleTownPortal() {
    const p = this.player;
    const inTown = this.world.isTown(p.x, p.y);

    if (!inTown) {
      if (this.townPortal.portalCooldown > 0) {
        const secsLeft = Math.ceil(this.townPortal.portalCooldown);
        this.addFloatingText(p.x, p.y - 26, `STADTPORTAL ABKLINGZEIT: ${secsLeft} SEK.!`, '#ff7b6b');
        return;
      }

      // Open portal at exact wilderness location and teleport to Festung Rabenstein (60s cooldown)
      this.townPortal.active = true;
      this.townPortal.wildX = p.x;
      this.townPortal.wildY = p.y;
      this.townPortal.portalCooldown = this.townPortal.portalMaxCooldown || 60;
      this.townPortal.openTimer = 0;

      for (let i = 0; i < 24; i++) {
        this.spawnParticle(p.x, p.y, '#5ce1ff', 90, 0.55);
      }

      this.switchScene('castle', this.townPortal.townX, this.townPortal.townY + 26);
      window.SFX.frostNova();
      for (let i = 0; i < 24; i++) {
        this.spawnParticle(p.x, p.y, '#5ce1ff', 90, 0.55);
      }
      this.addFloatingText(p.x, p.y - 26, 'STADTPORTAL GEÖFFNET (Klicke Portal für Rückkehr)', '#5ce1ff');
    } else if (this.townPortal.active) {
      this.addFloatingText(p.x, p.y - 24, 'Klicke das Stadtportal im Burghof an, um zurückzukehren!', '#ffe455');
    } else {
      this.addFloatingText(p.x, p.y - 24, 'Du bist bereits in der Festung Rabenstein!', '#f2c94c');
    }
  }

  useActivePortal() {
    if (!this.townPortal.active) return;
    const p = this.player;
    const inTown = this.world.isTown(p.x, p.y);

    if (inTown) {
      // Return to exact wilderness coordinates and close the portal after one return trip (keeps remaining 60s cast cooldown)
      this.townPortal.active = false;
      this.switchScene('world', this.townPortal.wildX, this.townPortal.wildY);
      window.SFX.frostNova();
      for (let i = 0; i < 24; i++) {
        this.spawnParticle(p.x, p.y, '#5ce1ff', 90, 0.55);
      }
      this.addFloatingText(p.x, p.y - 26, 'ZURÜCK IN DER WILDNIS (PORTAL GESCHLOSSEN)', '#5ce1ff');
    } else {
      this.toggleTownPortal();
    }
  }

  interactNPC(npc) {
    const linesByNpc = {
      aldric: [
        {
          de: 'Seid gegrüßt, Streiter. Die Schriften verheißen dunkle Zeiten.',
          en: 'Greetings, champion. The ancient texts foretell dark days ahead.'
        },
        {
          de: 'Tretet näher. Neue Kopfgelder warten in der Düstermark.',
          en: 'Step closer. New bounties await you in the Duskwood.'
        },
        {
          de: 'Möge das Licht der Festung Euch durch die Schatten geleiten.',
          en: 'May the light of the keep guide you through the shadows.'
        },
        {
          de: 'Die Nebel der Düstermark verschieben sich mit jedem neuen Mond.',
          en: 'The mists of the Duskwood shift with every rising moon.'
        },
        {
          de: 'Malakors Schergen werden mit jeder Stunde kühner.',
          en: 'Malakor’s minions grow bolder with every passing hour.'
        },
        {
          de: 'Wer die alten Krypten betritt, sollte Stahl und Mut bei sich tragen.',
          en: 'Whoever enters the old crypts must carry both steel and courage.'
        },
        {
          de: 'Meine Augen sind schwach, doch Eure Taten hallen weit durch das Reich.',
          en: 'My eyes grow dim, yet your deeds echo far across the realm.'
        },
        {
          de: 'Das Portal erwacht, sobald Ihr einen Auftrag der Krone annehmt.',
          en: 'The portal awakens as soon as you accept a decree of the crown.'
        },
        {
          de: 'Vergesst nicht: Auch der größte Held fällt durch Hochmut.',
          en: 'Remember well: even the greatest hero falls to pride.'
        },
        {
          de: 'Ich habe schon viele Streiter kommen und gehen sehen. Kehrt lebend zurück.',
          en: 'I have watched many champions come and go. Return alive.'
        }
      ],
      thorgar: [
        {
          de: 'Hah! Mein Amboss glüht – braucht Euer Stahl einen Schliff?',
          en: 'Hah! My anvil burns hot. Does your steel need an edge?'
        },
        {
          de: 'Guter Stahl entscheidet über Leben und Tod, Krieger.',
          en: 'Good steel decides between life and death, warrior.'
        },
        {
          de: 'Bringt mir Gold, und ich schmiede Euch eine mächtige Klinge!',
          en: 'Bring me gold, and I will forge you a mighty blade!'
        },
        {
          de: 'Diese Skelette draußen taugen höchstens als Zielscheibe für meinen Hammer!',
          en: 'Those skeletons out there are barely good enough for hammer practice!'
        },
        {
          de: 'Eine schartige Klinge bricht im schlimmsten Moment. Lasst mich ran!',
          en: 'A chipped blade snaps at the worst moment. Let me work on it!'
        },
        {
          de: 'Feuer, Schweiß und Eisen – das ist alles, was ein Mann braucht.',
          en: 'Fire, sweat, and iron. That is all a man ever needs.'
        },
        {
          de: 'Wenn Ihr Glück habt, ziehe ich ein echtes Relikt aus meinen Truhen!',
          en: 'If luck favors you, I might pull a true relic from my chests!'
        },
        {
          de: 'Spart nicht an Eurer Rüstung, sonst holen Euch die Kultisten zuerst.',
          en: 'Do not skimp on your armor, or the cultists will claim you first.'
        },
        {
          de: 'Der Blasebalg ruht nie, solange Monster vor unseren Mauern lauern.',
          en: 'The bellows never rest while monsters lurk beyond our walls.'
        },
        {
          de: 'Zeigt mir Eure Beute! Was Ihr nicht tragt, kaufe ich Euch ab.',
          en: 'Show me your spoils! Whatever you cannot carry, I will buy.'
        }
      ],
      seraphina: [
        {
          de: 'Der Segen des Lichts ruht auf Euch, tapferer Streiter.',
          en: 'The blessing of the light rests upon you, brave champion.'
        },
        {
          de: 'Eure Wunden sollen geheilt werden. Ruht Euch einen Moment aus.',
          en: 'Your wounds shall be healed. Rest here for a moment.'
        },
        {
          de: 'Nehmt Tränke mit – die Düstermark kennt keine Gnade.',
          en: 'Take potions with you. The Duskwood shows no mercy.'
        },
        {
          de: 'Die Gebete der Kapelle wachen über Euch, selbst in den tiefsten Katakomben.',
          en: 'The prayers of the chapel watch over you, even in the deepest catacombs.'
        },
        {
          de: 'Kommt zu mir, wenn die Dunkelheit an Eurer Lebenskraft zehrt.',
          en: 'Come to me whenever the darkness drains your strength.'
        },
        {
          de: 'Ein gefüllter Trankgürtel hat schon so manches Leben gerettet.',
          en: 'A full potion belt has saved many a soul from the brink.'
        },
        {
          de: 'Selbst im Schatten der Düstermark erlischt die Hoffnung niemals ganz.',
          en: 'Even in the shadow of the Duskwood, hope never truly fades.'
        },
        {
          de: 'Lasst mich Eure Rüstung segnen und Eure Wunden schließen.',
          en: 'Let me bless your armor and mend your weary flesh.'
        },
        {
          de: 'Euer Mut gibt den Menschen in Festung Rabenstein neue Kraft.',
          en: 'Your courage gives new hope to the people of Ravenstone Keep.'
        },
        {
          de: 'Mögen diese heiligen Elixiere Euren Geist und Körper stärken.',
          en: 'May these sacred elixirs restore both your spirit and your body.'
        }
      ]
    };
    const pool = linesByNpc[npc.id] || [{ de: 'Seid gegrüßt, Wanderer.', en: 'Greetings, traveler.' }];
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === npc._lastLineIdx) {
      idx = (idx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    }
    npc._lastLineIdx = idx;
    const picked = pool[idx];
    npc.speechText = picked.de;
    npc.speechTimer = 4.2;

    if (window.SFX && typeof window.SFX.npcSpeak === 'function') {
      window.SFX.npcSpeak(npc.id, picked.en);
    } else if (window.SFX && typeof window.SFX.npcGreet === 'function') {
      window.SFX.npcGreet(npc.id);
    }
    window.GameUI.openNpcDialog(npc);
  }

  refreshShop() {
    this.shopInventory = [];
    for (let i = 0; i < 12; i++) {
      const roll = Math.random();
      const rarity = roll < 0.30 ? 'rare' : 'magic';
      this.shopInventory.push(window.ItemGenerator.generateItem(this.player.level, rarity));
    }
  }

  spawnParticle(x, y, color, speed, life) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * speed;
    this.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      color,
      life,
      maxLife: life,
      size: Math.random() < 0.5 ? 2 : 3
    });
  }

  addFloatingText(x, y, text, color = '#ffffff') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1.1
    });
  }

  update(dt) {
    const p = this.player;
    p.animTime = Math.max(0, p.animTime + Math.max(0, dt));

    if (this.inMainMenu) {
      this.updateCamera(p.x, p.y);
      window.GameUI.updateCreatePreviewCanvas(p.animTime);
      return;
    }

    // ESC-Spielmenü offen -> Spielwelt pausiert
    if (this.isPaused()) {
      this.keys = {};
      return;
    }

    // Dramatische Sterbeszene (Slow-Motion-Sturz + Vignette vor dem Respawn-Popup)
    if (this.deathSequence) {
      const ds = this.deathSequence;
      ds.timer += dt;
      const slowDt = dt * 0.25;
      this.keys = {};
      this.mouse.leftDown = false;
      this.mouse.rightDown = false;
      if (this.camShake > 0) this.camShake = Math.max(0, this.camShake - dt * 22);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.x += pt.vx * slowDt;
        pt.y += pt.vy * slowDt;
        pt.life -= slowDt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy * slowDt;
        ft.life -= slowDt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
      this.updateCamera(p.x, p.y);
      if (ds.timer >= ds.duration && !ds.modalShown) {
        ds.modalShown = true;
        this.saveCurrentCharacter();
        window.GameUI.renderAll();
        window.GameUI.updateHUD();
        window.GameUI.showDeathModal(ds.droppedGold, ds.lostXp, ds.xpLossPct);
      }
      return;
    }

    // Periodic Auto-Save to localStorage
    this.autoSaveTimer -= dt;
    if (this.autoSaveTimer <= 0) {
      this.autoSaveTimer = 4.0;
      this.saveCurrentCharacter();
    }

    const inTown = this.world.isTown(p.x, p.y);
    if (inTown && !p.wasInTown) {
      // Entered Festung Rabenstein -> Seraphina automatically refills potions!
      this.refillPotionsInTown(false);
    } else if (!inTown && p.wasInTown && this.townPortal.active) {
      // Left Festung Rabenstein on foot -> close active town portal!
      this.townPortal.active = false;
      this.hoveredPortal = null;
      for (let i = 0; i < 14; i++) {
        this.spawnParticle(this.townPortal.townX, this.townPortal.townY, '#5ce1ff', 65, 0.45);
      }
      this.addFloatingText(p.x, p.y - 26, 'STADTPORTAL GESCHLOSSEN (BURG VERLASSEN)', '#5ce1ff');
    }
    p.wasInTown = inTown;

    if (this.townPortal.portalCooldown > 0) {
      this.townPortal.portalCooldown = Math.max(0, this.townPortal.portalCooldown - dt);
    }
    if (this.questPortalGraceTimer > 0) {
      this.questPortalGraceTimer = Math.max(0, this.questPortalGraceTimer - dt);
    }
    this.questPortalAnimTime = (this.questPortalAnimTime || 0) + dt;
    if (this.townPortal.active) {
      this.townPortal.openTimer = (this.townPortal.openTimer || 0) + dt;
    }
    if (this.world && Array.isArray(this.world.npcs)) {
      this.world.npcs.forEach((npc) => {
        if (npc.speechTimer > 0) {
          npc.speechTimer = Math.max(0, npc.speechTimer - dt);
        }
      });
    }

    if (inTown) {
      p.hp = Math.min(p.maxHp, p.hp + 18 * dt);
      p.mp = Math.min(p.maxMp, p.mp + 12 * dt);
    } else {
      // Klingenwächter Grund-Manareg in der Wildnis: 0,5 Mana pro Sekunde
      const mpRegen = p.manaRegen ?? 0.5;
      p.mp = Math.min(p.maxMp, p.mp + mpRegen * dt);
    }

    for (let i = 0; i < 4; i++) {
      if (p.skillCds[i] > 0) p.skillCds[i] = Math.max(0, p.skillCds[i] - dt);
    }

    // Dodge Charges Recharge
    if (p.dodgeCharges < p.maxDodgeCharges) {
      p.dodgeRechargeTimer -= dt;
      if (p.dodgeRechargeTimer <= 0) {
        p.dodgeCharges++;
        if (p.dodgeCharges < p.maxDodgeCharges) {
          p.dodgeRechargeTimer = p.dodgeMaxCd;
        } else {
          p.dodgeRechargeTimer = 0;
        }
      }
    }

    if (p.iFrameTimer > 0) p.iFrameTimer = Math.max(0, p.iFrameTimer - dt);
    if (p.postDodgeBuffTimer > 0) p.postDodgeBuffTimer = Math.max(0, p.postDodgeBuffTimer - dt);
    if (p.slashAnimTimer > 0) p.slashAnimTimer = Math.max(0, p.slashAnimTimer - dt);
    if (p.whirlwindAnimTimer > 0) p.whirlwindAnimTimer = Math.max(0, p.whirlwindAnimTimer - dt);
    if (p.castAnimTimer > 0) p.castAnimTimer = Math.max(0, p.castAnimTimer - dt);
    if (p.frostAnimTimer > 0) p.frostAnimTimer = Math.max(0, p.frostAnimTimer - dt);

    // Update Dodge Roll afterimage ghosts
    for (let i = p.dodgeGhostTrail.length - 1; i >= 0; i--) {
      p.dodgeGhostTrail[i].life -= dt;
      if (p.dodgeGhostTrail[i].life <= 0) p.dodgeGhostTrail.splice(i, 1);
    }

    // Align Hero sprite facing direction toward target / mouse cursor
    const aimAngle = this.getAutoAttackTargetAngle();
    if (p.dodgeTimer <= 0) {
      p.facing = aimAngle;
      p.flipX = Math.cos(aimAngle) < 0;
    }

    // Check NPC & Town Portal hover for yellow highlight & interactive cursor sprite
    this.hoveredNPC = this.getHoveredNPC(this.mouse.worldX, this.mouse.worldY);
    this.hoveredPortal = this.getHoveredPortal(this.mouse.worldX, this.mouse.worldY);
    this.canvas.style.cursor = (this.hoveredNPC || this.hoveredPortal) ? 'none' : 'crosshair';

    // TWIN-STICK AUTO-ATTACK: Läuft nur bei aktiver Quest außerhalb der Burg und nur wenn Gegner in Nahkampf-Reichweite sind
    const hasActiveQuest = Boolean(this.activeBounty && this.activeBounty.status === 'active');
    p.autoAttackTimer = Math.max(0, p.autoAttackTimer - dt);
    if (!hasActiveQuest || inTown) {
      p.skillCds[0] = 0;
    } else if (p.autoAttackTimer <= 0 && p.dodgeTimer <= 0) {
      if (this.hasEnemyInMeleeRange()) {
        const interval = Math.max(0.08, 1 / p.attackSpeed);
        p.autoAttackTimer = interval;
        p.skillCds[0] = interval;
        p.skillMaxCds[0] = interval;
        this.performAutoAttack();
      } else {
        p.skillCds[0] = 0;
      }
    }

    let mx = 0;
    let my = 0;
    if (this.keys['w'] || this.keys['arrowup']) my -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) my += 1;
    if (this.keys['a'] || this.keys['arrowleft']) mx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) mx += 1;

    if (mx !== 0 || my !== 0) {
      p.moveTarget = null;
      const len = Math.hypot(mx, my);
      mx /= len;
      my /= len;
    } else if (p.moveTarget) {
      const dx = p.moveTarget.x - p.x;
      const dy = p.moveTarget.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 16) {
        if (p.moveTarget.pickup) this.pickupGroundItem(p.moveTarget.pickup);
        if (p.moveTarget.npc) this.interactNPC(p.moveTarget.npc);
        if (p.moveTarget.usePortal) {
          if (p.moveTarget.portalKind === 'quest') this.enterQuestPortal();
          else if (p.moveTarget.portalKind === 'return') this.returnThroughWaystone();
          else this.useActivePortal();
        }
        p.moveTarget = null;
      } else {
        mx = dx / dist;
        my = dy / dist;
      }
    }

    // Movement Speed (including +10% per rank speed after dodge from Shadow Tier 2)
    const rShadow2 = this.getSkillRank('shadow_2');
    p.moveSpeed = (p.postDodgeBuffTimer > 0 && rShadow2 > 0)
      ? Math.round(p.baseMoveSpeed * (1 + 0.10 * rShadow2))
      : p.baseMoveSpeed;
    let speed = p.moveSpeed;

    if (p.dodgeTimer > 0) {
      p.dodgeTimer -= dt;
      mx = Math.cos(p.facing);
      my = Math.sin(p.facing);
      speed = p.dodgeSpeed;
      if (Math.random() < 0.78) {
        p.dodgeGhostTrail.push({
          x: p.x,
          y: p.y,
          flipX: p.flipX,
          frame: Math.floor(p.animTime * 14) % 8,
          life: 0.18,
          maxLife: 0.18
        });
      }
    }

    const prevX = p.x;
    const prevY = p.y;
    const nextX = p.x + mx * speed * dt;
    const nextY = p.y + my * speed * dt;

    if (!this.world.isSolidAtPixel(nextX, p.y, p.radius)) p.x = nextX;
    if (!this.world.isSolidAtPixel(p.x, nextY, p.radius)) p.y = nextY;

    p.isMoving = Math.hypot(p.x - prevX, p.y - prevY) > 0.15;
    if (p.isMoving) {
      const speedRatio = p.baseMoveSpeed > 0 ? (speed / p.baseMoveSpeed) : 1;
      p.walkAnimTime = (p.walkAnimTime || 0) + dt * Math.max(0.7, Math.min(1.6, speedRatio));
    } else {
      p.walkAnimTime = 0;
    }

    // Quest-Portal in Burg-Szene & Rückkehr-Portal in Welt-Szene betreten
    if (this.questPortalGraceTimer <= 0) {
      if (this.currentScene === 'castle' && this.scenes.castle.questPortal) {
        const qp = this.scenes.castle.questPortal;
        if (this.activeBounty && this.activeBounty.status === 'active' && Math.hypot(p.x - qp.x, p.y - qp.y) < 24) {
          this.enterQuestPortal();
          return;
        }
      } else if (this.currentScene === 'world' && this.scenes.world.returnPortal) {
        const rp = this.scenes.world.returnPortal;
        if (Math.hypot(p.x - rp.x, p.y - rp.y) < 22) {
          this.returnThroughWaystone();
          return;
        }
      }
    }
    if (p.isMoving) {
      p.stepDustTimer -= dt;
      if (p.stepDustTimer <= 0) {
        p.stepDustTimer = 0.16;
        this.particles.push({
          x: p.x + (Math.random() * 10 - 5),
          y: p.y + 6,
          vx: -mx * 18 + (Math.random() * 12 - 6),
          vy: -8 - Math.random() * 10,
          color: inTown ? '#9e9689' : '#7a634b',
          life: 0.28,
          maxLife: 0.28,
          size: 2
        });
      }
    }

    // Ground Loot Physics & Magnetic Loot Vacuum (Shadow Path Tier 2)
    const magnetActive = p.postDodgeBuffTimer > 0 && rShadow2 > 0;
    const magnetRadius = magnetActive ? (85 + rShadow2 * 30) : 32;

    for (let i = this.groundItems.length - 1; i >= 0; i--) {
      const g = this.groundItems[i];
      if (g.z > 0 || g.vz !== 0) {
        g.z += g.vz * dt;
        g.vz -= 280 * dt;
        if (g.z <= 0) {
          g.z = 0;
          g.vz = 0;
        }
      }

      const distToPlayer = Math.hypot(g.x - p.x, g.y - p.y);
      const canPickupPotion = g.kind === 'potion' && p.potions[g.potType] < p.maxPotions;
      if (magnetActive && distToPlayer < magnetRadius && distToPlayer > 8 && (g.kind !== 'potion' || canPickupPotion)) {
        const pullSpeed = 290;
        g.x += ((p.x - g.x) / distToPlayer) * pullSpeed * dt;
        g.y += ((p.y - g.y) / distToPlayer) * pullSpeed * dt;
      }

      if (distToPlayer < 28) {
        if (g.kind === 'gold' || canPickupPotion || (magnetActive && g.kind === 'item' && p.inventory.length < p.maxInv)) {
          this.pickupGroundItem(g);
        }
      }
    }

    // Update Burning Flame Trail Zones (Arcane Path Tier 2 DoT)
    for (let i = this.fireZones.length - 1; i >= 0; i--) {
      const fz = this.fireZones[i];
      fz.life -= dt;
      fz.tickTimer -= dt;
      if (Math.random() < 0.35) {
        this.spawnParticle(fz.x + (Math.random() * 14 - 7), fz.y + (Math.random() * 14 - 7), '#ff771c', 25, 0.22);
      }
      if (fz.tickTimer <= 0) {
        fz.tickTimer = 0.35;
        const dotScale = fz.dmgMult || 0.24;
        this.world.monsters.forEach((m) => {
          if (Math.hypot(m.x - fz.x, m.y - fz.y) <= fz.radius + m.radius) {
            this.damageMonster(m, dotScale, 0, 0);
          }
        });
      }
      if (fz.life <= 0) this.fireZones.splice(i, 1);
    }

    // Scaled Wilderness Monster Respawn System — NUR bei aktiver Quest!
    if (!this.activeBounty || this.activeBounty.status !== 'active') {
      if (this.world.monsters.length > 0) {
        this.world.monsters = [];
      }
    } else {
      if (this.activeBounty.type !== 'boss' && this.world.monsters.some((m) => m.isBoss)) {
        this.world.monsters = this.world.monsters.filter((m) => !m.isBoss);
      }
      this.quest.respawnTimer -= dt;
      if (this.quest.respawnTimer <= 0) {
        this.quest.respawnTimer = 1.6;
        const nonBossCount = this.world.monsters.filter((m) => !m.isBoss).length;
        if (nonBossCount < 24) {
          this.world.spawnSingleWildernessMonster(this.activeBounty.tier, p.x, p.y, this.activeBounty);
        }
      }
    }

    // Update Danmaku Monsters & Boss Patterns
    let activeBoss = null;
    this.world.monsters.forEach((m) => {
      m.animTime += dt;
      if (m.hitFlash > 0) m.hitFlash -= dt;
      if (m.cdTimer > 0) m.cdTimer -= dt;
      if (m.frozenTimer > 0) {
        m.frozenTimer -= dt;
        return;
      }

      const dx = p.x - m.x;
      const dy = p.y - m.y;
      const dist = Math.hypot(dx, dy);

      if (m.isBoss && dist < 390) {
        activeBoss = m;
      }

      if (inTown || dist > 350) return;

      if (m.speed > 0) {
        m.flipX = dx > 4;
      }

      if (m.speed > 0 && dist > m.attackRange) {
        const dirX = dx / dist;
        const dirY = dy / dist;
        const nx = m.x + dirX * m.speed * dt;
        const ny = m.y + dirY * m.speed * dt;
        if (!this.world.isTown(nx, ny)) {
          if (!this.world.isSolidAtPixel(nx, m.y, m.radius)) m.x = nx;
          if (!this.world.isSolidAtPixel(m.x, ny, m.radius)) m.y = ny;
        }
      } else if (m.cdTimer <= 0) {
        const cdMult = m.isBoss ? (m.bossCdMult || Math.max(0.5, 1 - this.bountyTier * 0.05)) : 1;
        m.cdTimer = m.attackCd * cdMult;
        if (m.ranged) {
          if (m.pattern === 'fan5') {
            // Kultist Danmaku Pattern: 5 Projektile in einem 45-Grad-Fächer (Shotgun-Fächer)
            const baseAngle = Math.atan2(dy, dx);
            const fanSpread = Math.PI / 4; // 45 degrees
            for (let i = 0; i < 5; i++) {
              const a = baseAngle - fanSpread / 2 + (fanSpread * i) / 4;
              this.projectiles.push({
                fromPlayer: false,
                x: m.x,
                y: m.y,
                vx: Math.cos(a) * 165,
                vy: Math.sin(a) * 165,
                radius: 6,
                color: '#d842ff',
                dmg: m.dmg,
                life: 2.3
              });
            }
          } else if (m.pattern === 'spiral') {
            // Knochenturm Danmaku Pattern: Rotierende Spiralen-Arme im Kreis
            m.spiralAngle = (m.spiralAngle || 0) + 0.36;
            for (let arm = 0; arm < 2; arm++) {
              const a = m.spiralAngle + arm * Math.PI;
              this.projectiles.push({
                fromPlayer: false,
                x: m.x,
                y: m.y - 6,
                vx: Math.cos(a) * 140,
                vy: Math.sin(a) * 140,
                radius: 5.5,
                color: '#ff3888',
                dmg: m.dmg,
                life: 2.6
              });
            }
          } else {
            const a = Math.atan2(dy, dx);
            this.projectiles.push({
              fromPlayer: false,
              x: m.x,
              y: m.y,
              vx: Math.cos(a) * 175,
              vy: Math.sin(a) * 175,
              radius: 6,
              color: '#d842ff',
              dmg: m.dmg,
              life: 2.0
            });
          }
        } else {
          this.damagePlayer(m.dmg);
          if (this.isPaused() || this.player.hp <= 0) return;
        }
      }

      // Boss Malakor Multi-Pattern Danmaku (Radial, Spiral, Shotgun-Fan)
      if (m.isBoss && dist < 320) {
        const bossTier = (this.activeBounty && this.activeBounty.type === 'boss')
          ? this.activeBounty.tier
          : this.getBountyTierState('boss').selectedTier;
        const cdMult = m.bossCdMult || Math.max(0.5, 1 - bossTier * 0.05);
        const dmgMult = this.activeBounty ? (this.activeBounty.difficultyMult || 1) : (1.0 + bossTier * 0.25);
        const radialCount = m.radialProjectileCount || (8 + (Math.max(1, bossTier) - 1));

        m.specialTimer -= dt;
        if (m.bossSpiralTimer > 0) {
          m.bossSpiralTimer -= dt;
          m.spiralAngle = (m.spiralAngle || 0) + 11.5 * dt;
          if (Math.floor((m.bossSpiralTimer + dt) * 10) !== Math.floor(m.bossSpiralTimer * 10)) {
            for (let arm = 0; arm < 4; arm++) {
              const a = m.spiralAngle + (arm * Math.PI) / 2;
              this.projectiles.push({
                fromPlayer: false,
                x: m.x,
                y: m.y,
                vx: Math.cos(a) * 150,
                vy: Math.sin(a) * 150,
                radius: 6,
                color: '#ff3b3b',
                dmg: Math.round(14 * dmgMult),
                life: 2.3
              });
            }
          }
        }

        if (m.specialTimer <= 0) {
          m.bossPhase = ((m.bossPhase || 0) + 1) % 3;
          if (m.bossPhase === 0) {
            // Pattern 1: Radial Expanding Ring (scales 8 + (bountyTier - 1) projectiles)
            m.specialTimer = 4.2 * cdMult;
            for (let i = 0; i < radialCount; i++) {
              const a = (Math.PI * 2 * i) / radialCount;
              this.projectiles.push({
                fromPlayer: false,
                x: m.x,
                y: m.y,
                vx: Math.cos(a) * 155,
                vy: Math.sin(a) * 155,
                radius: 6.5,
                color: '#ff2a2a',
                dmg: Math.round(16 * dmgMult),
                life: 2.2
              });
            }
            this.addFloatingText(m.x, m.y - 36, `MALAKOR: RADIALE BLUTNOVA (${radialCount})!`, '#ff4444');
          } else if (m.bossPhase === 1) {
            // Pattern 2: Rotating Spiral Arms
            m.specialTimer = 4.8 * cdMult;
            m.bossSpiralTimer = 2.0;
            this.addFloatingText(m.x, m.y - 36, 'MALAKOR: HÖLLENSPIRALE!', '#ff7733');
          } else {
            // Pattern 3: Heavy Shotgun Fan
            m.specialTimer = 3.6 * cdMult;
            const aim = Math.atan2(dy, dx);
            const cone = Math.PI / 3;
            for (let i = 0; i < 7; i++) {
              const a = aim - cone / 2 + (cone * i) / 6;
              this.projectiles.push({
                fromPlayer: false,
                x: m.x,
                y: m.y,
                vx: Math.cos(a) * 195,
                vy: Math.sin(a) * 195,
                radius: 7,
                color: '#ff9922',
                dmg: Math.round(18 * dmgMult),
                life: 2.0
              });
            }
            this.addFloatingText(m.x, m.y - 36, 'MALAKOR: SCHATTENFÄCHER!', '#ffaa22');
          }
        }
      }
    });

    const bossBar = document.getElementById('boss-bar-container');
    if (activeBoss) {
      bossBar.style.display = 'block';
      document.getElementById('boss-name').textContent = `${activeBoss.name} (${activeBoss.hp}/${activeBoss.maxHp})`;
      document.getElementById('boss-hp-fill').style.width = `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%`;
    } else {
      bossBar.style.display = 'none';
    }

    // Update Projectiles (with Homing, Flame Trails, Pierce, Bounce, Split, and I-Frame Dodge Heal)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];

      // Homing behavior for Spectral Blades (Blade Path Tier 3)
      if (pr.fromPlayer && pr.homing && this.world.monsters.length > 0) {
        let target = null;
        let minDist = 260;
        for (const m of this.world.monsters) {
          if (pr.hitIds && pr.hitIds.has(m.uid)) continue;
          const d = Math.hypot(m.x - pr.x, m.y - pr.y);
          if (d < minDist) {
            minDist = d;
            target = m;
          }
        }
        if (target) {
          const curSpeed = Math.hypot(pr.vx, pr.vy) || 230;
          const desiredAngle = Math.atan2(target.y - pr.y, target.x - pr.x);
          const curAngle = Math.atan2(pr.vy, pr.vx);
          let diff = desiredAngle - curAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const newAngle = curAngle + Math.max(-6.5 * dt, Math.min(6.5 * dt, diff));
          pr.vx = Math.cos(newAngle) * curSpeed;
          pr.vy = Math.sin(newAngle) * curSpeed;
        }
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;

      // Arcane Path Tier 2: Leave burning flame trail
      if (pr.fromPlayer && pr.leavesFlame) {
        pr.flameTick = (pr.flameTick || 0) - dt;
        if (pr.flameTick <= 0) {
          pr.flameTick = 0.09;
          this.fireZones.push({
            x: pr.x,
            y: pr.y,
            radius: 16,
            life: 1.15,
            tickTimer: 0.15,
            dmgMult: 0.12 * (pr.flameRank || 1)
          });
        }
      }

      if (Math.random() < 0.55) {
        this.spawnParticle(pr.x, pr.y, pr.color, 28, 0.20);
      }

      if (pr.life <= 0 || this.world.isSolidAtPixel(pr.x, pr.y, 3)) {
        if (pr.fromPlayer && pr.aoe) this.explodeFireball(pr);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.fromPlayer) {
        let removeProj = false;
        for (const m of this.world.monsters) {
          if (pr.hitIds && pr.hitIds.has(m.uid)) continue;
          if (Math.hypot(m.x - pr.x, m.y - pr.y) <= m.radius + pr.radius) {
            if (!pr.hitIds) pr.hitIds = new Set();
            pr.hitIds.add(m.uid);

            if (pr.aoe) {
              this.explodeFireball(pr);
            } else {
              this.damageMonster(m, pr.dmgMult, 0, 0);
            }

            // "Splitter" Affix: Projektile zerteilen sich bei Treffer in 2 kleinere Splitter
            if (pr.canSplit) {
              pr.canSplit = false;
              const baseA = Math.atan2(pr.vy, pr.vx);
              const spd = Math.hypot(pr.vx, pr.vy) * 0.95;
              [-0.45, 0.45].forEach((offset) => {
                const sa = baseA + offset;
                this.projectiles.push({
                  fromPlayer: true,
                  x: pr.x,
                  y: pr.y,
                  vx: Math.cos(sa) * spd,
                  vy: Math.sin(sa) * spd,
                  radius: Math.max(4, pr.radius - 1),
                  color: '#ffe042',
                  dmgMult: pr.dmgMult * 0.65,
                  pierceLeft: 0,
                  bounceLeft: 0,
                  canSplit: false,
                  hitIds: new Set([m.uid]),
                  life: 0.75
                });
              });
            }

            // "Abpraller" (Bounce) Affix: Springt auf nächsten weiteren Gegner über
            if (pr.bounceLeft && pr.bounceLeft > 0) {
              let nextTarget = null;
              let bestD = 210;
              for (const other of this.world.monsters) {
                if (other.uid !== m.uid && !pr.hitIds.has(other.uid)) {
                  const d = Math.hypot(other.x - pr.x, other.y - pr.y);
                  if (d < bestD) {
                    bestD = d;
                    nextTarget = other;
                  }
                }
              }
              if (nextTarget) {
                pr.bounceLeft--;
                const spd = Math.hypot(pr.vx, pr.vy);
                const ba = Math.atan2(nextTarget.y - pr.y, nextTarget.x - pr.x);
                pr.vx = Math.cos(ba) * spd;
                pr.vy = Math.sin(ba) * spd;
                pr.color = '#70ffaa';
                break;
              }
            }

            // "Durchschlag" (Pierce) Affix: Durchschlägt Gegner
            if (pr.pierceLeft && pr.pierceLeft > 0) {
              pr.pierceLeft--;
              break;
            }

            removeProj = true;
            break;
          }
        }
        if (removeProj) this.projectiles.splice(i, 1);
      } else {
        // Enemy Danmaku Projectile colliding with Player
        if (Math.hypot(p.x - pr.x, p.y - pr.y) <= p.radius + pr.radius) {
          if (p.iFrameTimer > 0 || p.dodgeTimer > 0) {
            // I-Frame Dodge through projectile!
            if (this.hasSkillNode('shadow_3')) {
              const healAmt = Math.max(2, Math.round(p.maxHp * 0.03));
              p.hp = Math.min(p.maxHp, p.hp + healAmt);
              p.skillCds[1] = Math.max(0, p.skillCds[1] - 0.4);
              this.addFloatingText(p.x, p.y - 26, `+${healAmt} HP (PHASEN-KONTER!)`, '#6eff9b');
            }
            for (let k = 0; k < 6; k++) {
              this.spawnParticle(pr.x, pr.y, '#80f5ff', 50, 0.25);
            }
            this.projectiles.splice(i, 1);
          } else {
            this.damagePlayer(pr.dmg);
            if (this.projectiles[i]) this.projectiles.splice(i, 1);
            if (this.isPaused() || this.player.hp <= 0) break;
          }
        }
      }
    }

    for (let i = this.slashEffects.length - 1; i >= 0; i--) {
      this.slashEffects[i].timer -= dt;
      if (this.slashEffects[i].timer <= 0) this.slashEffects.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 24 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Spawn subtle ambient embers around torches
    if (Math.random() < 0.35) {
      const t = this.world.torches[Math.floor(Math.random() * this.world.torches.length)];
      if (t && Math.hypot(t.x - p.x, t.y - p.y) < 420) {
        this.particles.push({
          x: t.x + (Math.random() * 8 - 4),
          y: t.y - 10,
          vx: Math.random() * 14 - 7,
          vy: -18 - Math.random() * 18,
          color: Math.random() < 0.5 ? '#ff9922' : '#ffee55',
          life: 0.7,
          maxLife: 0.7,
          size: 2
        });
      }
    }

    this.updateCamera(p.x, p.y);
    this.mouse.worldX = this.mouse.x + this.cam.x;
    this.mouse.worldY = this.mouse.y + this.cam.y;

    window.GameUI.updateHUD();
  }

  updateCamera(targetX, targetY, worldObj = this.world) {
    const worldPxW = worldObj.width * window.TILE_SIZE;
    const worldPxH = worldObj.height * window.TILE_SIZE;
    if (worldPxW <= this.viewW) {
      this.cam.x = (worldPxW - this.viewW) / 2;
    } else {
      this.cam.x = Math.max(0, Math.min(worldPxW - this.viewW, targetX - this.viewW / 2));
    }
    if (worldPxH <= this.viewH) {
      this.cam.y = (worldPxH - this.viewH) / 2;
    } else {
      this.cam.y = Math.max(0, Math.min(worldPxH - this.viewH, targetY - this.viewH / 2));
    }
  }

  explodeFireball(pr) {
    window.SFX.hit();
    for (let i = 0; i < 18; i++) {
      this.spawnParticle(pr.x, pr.y, i % 2 === 0 ? '#ff6a00' : '#ffdd44', 95, 0.38);
    }
    this.world.monsters.forEach((m) => {
      if (Math.hypot(m.x - pr.x, m.y - pr.y) <= (pr.aoe || 45) + m.radius) {
        this.damageMonster(m, pr.dmgMult, 0, 0);
      }
    });
  }

  damagePlayer(rawDmg) {
    const p = this.player;
    if (p.dodgeTimer > 0 || p.iFrameTimer > 0) return;
    const mitigation = p.armor / (p.armor + 50);
    const dmg = Math.max(1, Math.round(rawDmg * (1 - mitigation)));
    p.hp -= dmg;
    window.SFX.hit();
    this.addFloatingText(p.x, p.y - 20, `-${dmg}`, '#ff3b3b');

    if (p.hp <= 0 && !this.deathSequence) {
      const deathX = p.x;
      const deathY = p.y;

      // Todes-Malus: 30% des aktuellen Goldes als großer, rückholbarer Goldhaufen am Todesort fallen lassen
      const droppedGold = Math.round(p.gold * 0.30);
      if (droppedGold > 0) {
        p.gold = Math.max(0, p.gold - droppedGold);
        this.dropGold(deathX, deathY, droppedGold, true);
      }

      // Todes-Malus: 10% bis 20% der aktuellen XP auf dem Weg zum nächsten Level verlieren (kein Level-Verlust)
      const xpLossRate = 0.10 + Math.random() * 0.10;
      const lostXp = p.xp > 0 ? Math.max(1, Math.round(p.xp * xpLossRate)) : 0;
      p.xp = Math.max(0, p.xp - lostXp);

      p.hp = 0;
      p.mp = p.maxMp;
      p.moveTarget = null;
      this.keys = {};
      this.mouse.leftDown = false;
      this.mouse.rightDown = false;
      this.projectiles = [];
      this.fireZones = [];
      this.slashEffects = [];
      this.camShake = 14;
      for (let i = 0; i < 28; i++) {
        this.spawnParticle(deathX, deathY - 12, i % 3 === 0 ? '#ff6a33' : '#b80f1c', 120, 1.1);
      }
      this.addFloatingText(deathX, deathY - 34, 'GEFALLEN!', '#ff3b3b');
      if (window.SFX && typeof window.SFX.playerDeath === 'function') {
        window.SFX.playerDeath();
      } else if (window.SFX && typeof window.SFX.hit === 'function') {
        window.SFX.hit();
      }

      this.deathSequence = {
        timer: 0,
        duration: 3.0,
        modalShown: false,
        droppedGold,
        lostXp,
        xpLossPct: Math.round(xpLossRate * 100),
        deathX,
        deathY
      };
      this.pendingRespawn = { deathX, deathY, droppedGold, lostXp };
      window.GameUI.updateHUD();

      this.addSystemLog(
        `Gestorben! Verlust: -${droppedGold} Gold (am Todesort) & -${lostXp} XP.`,
        'death'
      );
    }
  }

  respawnPlayer(mode = 'castle') {
    const p = this.player;
    if (!p) return;
    this.deathSequence = null;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    p.iFrameTimer = mode === 'portal' ? 1.5 : 1.0;
    this.keys = {};
    this.mouse.leftDown = false;
    this.mouse.rightDown = false;

    if (mode === 'portal') {
      const gate = this.scenes.world.defaultPortalWild || this.scenes.world.returnPortal;
      this.switchScene('world', gate.x, gate.y);
      this.addFloatingText(p.x, p.y - 26, 'AM PORTAL WIEDERBELEBT!', '#70e5ff');
    } else {
      const castle = this.scenes.castle;
      this.switchScene('castle', castle.respawnPoint.x, castle.respawnPoint.y);
      this.addFloatingText(p.x, p.y - 26, 'IN FESTUNG RABENSTEIN WIEDERBELEBT!', '#f2c94c');
    }
    this.pendingRespawn = null;
    this.saveCurrentCharacter();
    window.GameUI.renderAll();
    window.GameUI.updateHUD();
  }

  render() {
    const ctx = this.ctx;
    ctx.setTransform(this.zoom * this.dpr, 0, 0, this.zoom * this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    const startCol = Math.max(0, Math.floor(this.cam.x / window.TILE_SIZE) - 1);
    const endCol = Math.min(this.world.width - 1, Math.ceil((this.cam.x + this.viewW) / window.TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(this.cam.y / window.TILE_SIZE) - 1);
    const endRow = Math.min(this.world.height - 1, Math.ceil((this.cam.y + this.viewH) / window.TILE_SIZE) + 1);

    const sp = window.Sprites.cache;
    const ySortList = [];

    // 1. RENDER SEAMLESS AUTOTILED GROUND TILEMAP & COLLECT WALLS/TREES FOR Y-SORTING
    if (this.world.tilemapCanvas) {
      const sc = this.world.tilemapScale;
      const tm = this.world.tilemapCanvas;
      const srcX = Math.max(0, this.cam.x * sc);
      const srcY = Math.max(0, this.cam.y * sc);
      const dstX = Math.max(0, -this.cam.x);
      const dstY = Math.max(0, -this.cam.y);
      const visW = Math.min(this.viewW - dstX, (tm.width - srcX) / sc);
      const visH = Math.min(this.viewH - dstY, (tm.height - srcY) / sc);
      if (visW > 0 && visH > 0) {
        ctx.drawImage(
          tm,
          srcX,
          srcY,
          visW * sc,
          visH * sc,
          dstX,
          dstY,
          visW,
          visH
        );
      }
    }

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const t = this.world.tiles[y][x];
        const v = this.world.variants[y][x];
        const sx = Math.floor(x * window.TILE_SIZE - this.cam.x);
        const sy = Math.floor(y * window.TILE_SIZE - this.cam.y);

        if (!this.world.tilemapCanvas) {
          if (t === 1) {
            const arr = sp.tile_cobble;
            ctx.drawImage(arr[v % arr.length], sx, sy, 32, 32);
          } else if (t === 2) {
            const arr = sp.tile_dirt;
            ctx.drawImage(arr[v % arr.length], sx, sy, 32, 32);
          } else if (t === 3) {
            const arr = sp.tile_sanctum;
            ctx.drawImage(arr[v % arr.length], sx, sy, 32, 32);
          } else {
            const arr = sp.tile_grass;
            ctx.drawImage(arr[v % arr.length], sx, sy, 32, 32);
          }
        }

        if (t === 4) {
          const hasWallW = (x > 0) && this.world.tiles[y][x - 1] === 4;
          const hasWallE = (x + 1 < this.world.width) && this.world.tiles[y][x + 1] === 4;
          const hasWallN = (y > 0) && this.world.tiles[y - 1][x] === 4;
          const hasWallS = (y + 1 < this.world.height) && this.world.tiles[y + 1][x] === 4;
          const isVerticalWall = (hasWallN || hasWallS) && !(hasWallW || hasWallE);
          const wallImg = (isVerticalWall && sp.tile_wall_v) ? sp.tile_wall_v : sp.tile_wall;
          ySortList.push({
            sortY: (y + 1) * window.TILE_SIZE,
            draw: () => {
              if (isVerticalWall && wallImg && wallImg.height >= 256) {
                const sliceH = Math.floor(wallImg.height / 4);
                const uy = (y % 4) * sliceH;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.fillRect(sx - 2, sy, 36, 32);
                ctx.drawImage(wallImg, 0, uy, wallImg.width, sliceH, sx, sy, 32, 32);
              } else if (wallImg && wallImg.width >= 300) {
                const sliceW = wallImg.width / 3;
                const ux = (x % 3) * sliceW;
                ctx.drawImage(wallImg, ux, 0, sliceW, wallImg.height, sx, sy - 14, 32, 46);
              } else {
                ctx.drawImage(wallImg, sx, sy - 12, 32, 44);
              }
              if (!hasWallS) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
                ctx.fillRect(sx, sy + 28, 32, 4);
              }
            }
          });
        } else if (t === 5) {
          ySortList.push({
            sortY: (y + 1) * window.TILE_SIZE,
            draw: () => {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
              ctx.beginPath();
              ctx.ellipse(sx + 16, sy + 24, 20, 9, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(120, 175, 125, 0.28)';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.drawImage(sp.tile_tree, sx - 26, sy - 54, 84, 88);
            }
          });
        }
      }
    }

    // 1B. APPLY FLOOR ATMOSPHERIC VIGNETTE BEFORE FOREGROUND ENTITIES
    this.renderFloorVignette(ctx);

    // 1C. RENDER BURNING FLAME TRAIL ZONES (Arcane Path Tier 2)
    this.fireZones.forEach((fz) => {
      const sx = fz.x - this.cam.x;
      const sy = fz.y - this.cam.y;
      ctx.save();
      ctx.globalAlpha = Math.min(1, fz.life) * 0.55;
      ctx.fillStyle = '#ff5a00';
      ctx.beginPath();
      ctx.ellipse(sx, sy, fz.radius, fz.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcf40';
      ctx.beginPath();
      ctx.ellipse(sx, sy, fz.radius * 0.55, fz.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 1D. RENDER QUEST-PORTAL (Burg), RÜCKKEHR-PORTAL (Wildnis) & ACTIVE TOWN PORTALS
    const activePortals = [];
    if (this.currentScene === 'castle' && this.scenes.castle.questPortal) {
      const qp = this.scenes.castle.questPortal;
      const isQuestOpen = Boolean(this.activeBounty && this.activeBounty.status === 'active');
      if (isQuestOpen) {
        activePortals.push({
          x: qp.x,
          y: qp.y,
          label: 'QUEST-PORTAL -> DÜSTERMARK',
          openTimer: this.questPortalAnimTime || 1.0
        });
      } else {
        // Dormant rune pedestal on the castle floor when no quest is active
        const sx = qp.x - this.cam.x;
        const sy = qp.y - this.cam.y;
        if (sx >= -80 && sy >= -80 && sx <= this.viewW + 80 && sy <= this.viewH + 80) {
          ctx.save();
          ctx.fillStyle = 'rgba(40, 32, 52, 0.55)';
          ctx.strokeStyle = 'rgba(130, 115, 160, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(sx, sy + 2, 24, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.font = '12px "VT323", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(210, 200, 230, 0.7)';
          ctx.fillText('QUEST-PORTAL (INAKTIV)', sx, sy - 14);
          ctx.restore();
        }
      }
    } else if (this.currentScene === 'world' && this.scenes.world.returnPortal) {
      const rp = this.scenes.world.returnPortal;
      activePortals.push({
        x: rp.x,
        y: rp.y,
        label: 'PORTAL -> FESTUNG RABENSTEIN',
        openTimer: 2.0 + (this.questPortalAnimTime || 0)
      });
    }

    if (this.townPortal.active) {
      if (this.currentScene === 'castle') {
        activePortals.push({
          x: this.townPortal.townX,
          y: this.townPortal.townY,
          label: 'STADTPORTAL -> WILDNIS (KLICKEN)',
          openTimer: this.townPortal.openTimer || 0
        });
      } else {
        activePortals.push({
          x: this.townPortal.wildX,
          y: this.townPortal.wildY,
          label: 'STADTPORTAL -> FESTUNG RABENSTEIN',
          openTimer: this.townPortal.openTimer || 0
        });
      }
    }

    if (activePortals.length > 0) {
      activePortals.forEach((pt) => {
        const sx = pt.x - this.cam.x;
        const sy = pt.y - this.cam.y;
        if (sx < -80 || sy < -80 || sx > this.viewW + 80 || sy > this.viewH + 80) return;
        ySortList.push({
          sortY: pt.y + 8,
          draw: () => {
            const isHovered = Boolean(
              this.hoveredPortal &&
              Math.hypot(this.hoveredPortal.x - pt.x, this.hoveredPortal.y - pt.y) < 10
            );

            // Determine current animation frame from the 2x4 sprite sheet (8 frames total):
            // Opening Phase (Intro) - Frame 1 to 4 (indices 0..3, 0.18s per frame = 0.72s total)
            // Persistent Portal State (Loop) - Frame 5 to 8 (indices 4..7, continuous loop at 8 fps)
            const tOpen = pt.openTimer || 0;
            const introDuration = 0.72;
            let frameIdx = 0;
            if (tOpen < introDuration) {
              frameIdx = Math.min(3, Math.floor((tOpen / introDuration) * 4));
            } else {
              frameIdx = 4 + (Math.floor((tOpen - introDuration) * 8.0) % 4);
            }

            if (isHovered) {
              // Yellow highlight ground ring when hovered (matching NPC hover ring)
              ctx.save();
              ctx.fillStyle = 'rgba(255, 228, 85, 0.25)';
              ctx.strokeStyle = 'rgba(255, 235, 100, 0.95)';
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.ellipse(sx, sy + 2, 30, 10, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.restore();
            }

            const portalFrames = (isHovered && sp.portal_frames_highlight)
              ? sp.portal_frames_highlight
              : sp.portal_frames;

            if (portalFrames && portalFrames[frameIdx]) {
              const pw = 88;
              const ph = 98;
              ctx.save();
              if (isHovered) {
                ctx.filter = 'brightness(1.14)';
              }
              ctx.drawImage(portalFrames[frameIdx], Math.floor(sx - pw / 2), Math.floor(sy - ph + 16), pw, ph);
              ctx.restore();
            } else {
              const spin = performance.now() * 0.004;
              ctx.save();
              ctx.translate(sx, sy - 10);
              ctx.strokeStyle = isHovered ? '#ffe455' : '#38c7ff';
              ctx.fillStyle = 'rgba(25, 115, 230, 0.55)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.ellipse(0, 0, 16, 24, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.strokeStyle = '#b8f2ff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.ellipse(0, 0, 10 + Math.sin(spin * 2) * 2, 16 + Math.cos(spin * 2) * 2, 0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }

            ctx.font = '13px "VT323", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.fillText(pt.label, sx + 1, sy - 85);
            ctx.fillStyle = isHovered ? '#ffe455' : '#70e5ff';
            ctx.fillText(pt.label, sx, sy - 86);
          }
        });
      });
    }

    // 2. QUEUE TORCHES & PROPS INTO Y-SORT LIST
    const torchFrame = Math.floor(performance.now() / 170) % 2;
    this.world.torches.forEach((t) => {
      ySortList.push({
        sortY: t.y + 8,
        draw: () => {
          if (sp.prop_torch) {
            const sx = Math.floor(t.x - 14 - this.cam.x);
            const sy = Math.floor(t.y - 48 - this.cam.y);
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
            ctx.beginPath();
            ctx.ellipse(t.x - this.cam.x, t.y + 6 - this.cam.y, 13, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            if (torchFrame === 1) ctx.filter = 'brightness(1.08)';
            ctx.drawImage(sp.prop_torch, sx, sy, 28, 60);
            ctx.restore();
          } else {
            const sx = Math.floor(t.x - 20 - this.cam.x);
            const sy = Math.floor(t.y - 28 - this.cam.y);
            ctx.drawImage(sp.obj_torch[torchFrame], sx, sy, 40, 40);
          }
        }
      });
    });

    this.world.props.forEach((pr) => {
      if (pr.type === 'barrel' && pr.broken) return;
      const isCastleBuilding = pr.type.startsWith('castle_');
      const isBuildingProp = pr.type.startsWith('prop_');
      ySortList.push({
        sortY: pr.type === 'fountain' ? pr.y + 52 : (isCastleBuilding || isBuildingProp ? pr.y + 12 : pr.y + 10),
        draw: () => {
          const sx = Math.floor(pr.x - this.cam.x);
          const sy = Math.floor(pr.y - this.cam.y);
          if (pr.type === 'fountain') {
            ctx.drawImage(sp.obj_fountain, sx - 18, sy - 22, 100, 100);
          } else if (isCastleBuilding && sp[pr.type]) {
            const w = pr.w || 120;
            const h = pr.h || 120;
            ctx.drawImage(sp[pr.type], Math.floor(sx - w / 2), Math.floor(sy - h + 16), w, h);
          } else if (isBuildingProp && sp[pr.type]) {
            const w = pr.w || 48;
            const h = pr.h || 64;
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + 6, Math.max(10, w * 0.36), 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.drawImage(sp[pr.type], Math.floor(sx - w / 2), Math.floor(sy - h + 12), w, h);
          } else if (pr.type === 'chest') {
            ctx.drawImage(pr.opened ? sp.obj_chest_open : sp.obj_chest_closed, sx - 18, sy - 20, 36, 36);
          } else if (pr.type === 'barrel') {
            ctx.drawImage(sp.obj_barrel, sx - 18, sy - 22, 36, 36);
          }
        }
      });
    });

    // 3. RENDER GROUND LOOT & LIGHT BEAMS
    this.hoveredGroundItem = null;
    this.groundItems.forEach((g) => {
      const sx = Math.floor(g.x - this.cam.x);
      const sy = Math.floor(g.y - g.z - this.cam.y);

      if (g.isDeathGold) {
        ctx.fillStyle = 'rgba(255, 215, 55, 0.50)';
        ctx.fillRect(sx - 6, sy - 64, 12, 64);
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(sx - 2, sy - 60, 4, 60);
      } else if (g.rarity === 'unique' || g.rarity === 'rare' || g.rarity === 'magic') {
        const beamColor = g.rarity === 'unique' ? 'rgba(255, 145, 35, 0.42)' :
                          (g.rarity === 'rare' ? 'rgba(245, 224, 66, 0.35)' : 'rgba(92, 138, 255, 0.28)');
        ctx.fillStyle = beamColor;
        ctx.fillRect(sx - 4, sy - 48, 8, 48);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx - 1, sy - 44, 2, 44);
      }

      if (sp[g.icon]) {
        const sz = g.isDeathGold ? 38 : 24;
        const half = sz / 2;
        if (g.isDeathGold) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 200, 40, 0.32)';
          ctx.beginPath();
          ctx.ellipse(sx, sy + 6, 20, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.drawImage(sp[g.icon], sx - half, sy - half, sz, sz);
      }
    });

    // 4. QUEUE NPCS INTO Y-SORT LIST
    this.world.npcs.forEach((npc) => {
      ySortList.push({
        sortY: npc.y + 12,
        draw: () => {
          const cx = npc.x - this.cam.x;
          const cy = npc.y - this.cam.y;
          const sx = cx - 32;
          const sy = cy - 52;
          const isHovered = (this.hoveredNPC === npc);

          ctx.save();
          ctx.fillStyle = isHovered ? 'rgba(255, 228, 85, 0.28)' : 'rgba(46, 213, 115, 0.16)';
          ctx.strokeStyle = isHovered ? 'rgba(255, 235, 100, 0.95)' : 'rgba(66, 245, 108, 0.65)';
          ctx.lineWidth = isHovered ? 2.0 : 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 6, 16, 6.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          const spriteToDraw = (isHovered && sp[`${npc.sprite}_highlight`]) ? sp[`${npc.sprite}_highlight`] : sp[npc.sprite];
          ctx.save();
          if (isHovered) {
            ctx.filter = 'brightness(1.12)';
          }
          ctx.drawImage(spriteToDraw, sx, sy, 64, 64);
          ctx.restore();

          ctx.font = '9px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#000000';
          ctx.fillText(npc.indicator, cx + 1, sy - 9);
          ctx.fillStyle = '#f2c94c';
          ctx.fillText(npc.indicator, cx, sy - 10);

          ctx.font = '13px "VT323", monospace';
          ctx.fillStyle = '#000000';
          ctx.fillText(npc.name, cx + 1, sy + 1);
          ctx.fillStyle = isHovered ? '#ffe455' : '#ffffff';
          ctx.fillText(npc.name, cx, sy);

          if (npc.speechTimer > 0 && npc.speechText) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, npc.speechTimer / 0.5);
            ctx.font = '13px "VT323", monospace';
            const padX = 8;
            const bw = Math.min(260, ctx.measureText(npc.speechText).width + padX * 2);
            const bh = 22;
            const bx = Math.floor(cx - bw / 2);
            const by = Math.floor(sy - 44);
            ctx.fillStyle = 'rgba(18, 14, 24, 0.9)';
            ctx.strokeStyle = '#c89b3c';
            ctx.lineWidth = 1.4;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = '#f5e7c4';
            ctx.textAlign = 'center';
            ctx.fillText(npc.speechText, cx, by + 15, bw - 10);
            ctx.restore();
          }
        }
      });
    });

    // 5. QUEUE MONSTERS INTO Y-SORT LIST
    this.world.monsters.forEach((m) => {
      ySortList.push({
        sortY: m.y + 12,
        draw: () => {
          const frame = Math.abs(Math.floor(m.animTime * 5.5)) % 2;
          const spriteArr = sp[m.sprite] || sp.mob_skeleton;
          const img = spriteArr[frame] || spriteArr[0];
          const drawSize = m.isBoss ? 110 : (m.type === 'bone_tower' ? 78 : (m.type === 'goblin' ? 56 : 64));
          const cx = m.x - this.cam.x;
          const cy = m.y - this.cam.y;

          ctx.save();
          const ringRx = m.isBoss ? 28 : 15;
          const ringRy = m.isBoss ? 11 : 6.5;
          ctx.fillStyle = m.isBoss ? 'rgba(255, 40, 40, 0.25)' : 'rgba(235, 45, 45, 0.16)';
          ctx.strokeStyle = m.isBoss ? 'rgba(255, 120, 40, 0.85)' : (m.type === 'bone_tower' ? 'rgba(216, 66, 255, 0.85)' : 'rgba(255, 75, 75, 0.65)');
          ctx.lineWidth = m.isBoss ? 2 : 1.3;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 4, ringRx, ringRy, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          ctx.save();
          if (m.frozenTimer > 0) {
            ctx.filter = 'hue-rotate(170deg) brightness(1.35)';
          } else if (m.hitFlash > 0) {
            ctx.filter = 'brightness(2.5)';
          }
          ctx.translate(cx, cy - drawSize * 0.34);
          if (m.flipX) ctx.scale(-1, 1);
          ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          ctx.restore();

          const bw = m.isBoss ? 58 : 30;
          const bx = cx - bw / 2;
          const by = cy - drawSize * 0.80;
          ctx.fillStyle = '#0d0404';
          ctx.fillRect(bx - 1, by - 1, bw + 2, 5);
          ctx.fillStyle = m.isBoss ? '#ff6b2b' : '#e52d27';
          ctx.fillRect(bx, by, Math.max(1, (m.hp / m.maxHp) * bw), 3);
        }
      });
    });

    // 6. QUEUE PLAYER HERO INTO Y-SORT LIST WITH MOVEMENT, I-FRAME & SKILL ANIMATIONS
    const p = this.player;
    ySortList.push({
      sortY: p.y + 12,
      draw: () => {
        const walkFrames = sp.hero_walk || sp.hero;
        const idleFrames = sp.hero_idle || sp.hero;
        const attackFrames = sp.hero_attack;
        const wwFrames = sp.hero_whirlwind;
        const walkSpeed = walkFrames.length <= 2 ? 5.2 : (walkFrames.length <= 4 ? 7.5 : 10);
        const wIdx = Math.abs(Math.floor((p.walkAnimTime || 0) * walkSpeed)) % walkFrames.length;
        const iIdx = Math.abs(Math.floor(p.animTime * 3.5)) % idleFrames.length;
        let heroImg = (p.isMoving ? walkFrames[wIdx] : idleFrames[iIdx]) || walkFrames[0];

        if (!this.deathSequence) {
          if (p.whirlwindAnimTimer > 0) {
            const wwProg = 1 - p.whirlwindAnimTimer / 0.36;
            if (wwFrames && wwFrames.length >= 4) {
              heroImg = wwFrames[Math.floor(wwProg * 8) % wwFrames.length] || heroImg;
            } else if (attackFrames && attackFrames.length >= 3) {
              heroImg = attackFrames[1 + (Math.floor(wwProg * 8) % 2)] || heroImg;
            }
          } else if (p.slashAnimTimer > 0 && attackFrames && attackFrames.length >= 4) {
            const maxT = Math.max(0.08, p.slashAnimDuration || 0.24);
            const prog = Math.max(0, Math.min(1, 1 - p.slashAnimTimer / maxT));
            const aIdx = prog < 0.20 ? 0 : (prog < 0.55 ? 1 : (prog < 0.82 ? 2 : 3));
            heroImg = attackFrames[aIdx] || heroImg;
          }
        }

        const drawSize = 68;
        const cx = p.x - this.cam.x;
        const cy = p.y - this.cam.y;

        // 6A. Render Dodge Roll afterimage ghost silhouettes
        if (p.dodgeGhostTrail && p.dodgeGhostTrail.length > 0) {
          p.dodgeGhostTrail.forEach((gh) => {
            const gx = gh.x - this.cam.x;
            const gy = gh.y - this.cam.y;
            const gImg = walkFrames[Math.abs(gh.frame || 0) % walkFrames.length] || walkFrames[0];
            if (!gImg) return;
            ctx.save();
            ctx.globalAlpha = (gh.life / gh.maxLife) * 0.42;
            ctx.filter = 'hue-rotate(175deg) brightness(1.6)';
            ctx.translate(gx, gy - drawSize * 0.34);
            if (gh.flipX) ctx.scale(-1, 1);
            ctx.drawImage(gImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
            ctx.restore();
          });
        }

        // 6B. Hero foot ring (glows cyan when I-Frames are active!)
        ctx.save();
        const hasIFrames = p.iFrameTimer > 0;
        ctx.fillStyle = hasIFrames ? 'rgba(92, 235, 255, 0.35)' : 'rgba(242, 201, 76, 0.20)';
        ctx.strokeStyle = hasIFrames ? '#5ce1ff' : 'rgba(255, 225, 110, 0.85)';
        ctx.lineWidth = hasIFrames ? 2.4 : 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, 17, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (p.castAnimTimer > 0) {
          const prog = 1 - p.castAnimTimer / 0.30;
          ctx.strokeStyle = `rgba(255, 145, 35, ${1 - prog * 0.6})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 5, 24 + prog * 10, 10 + prog * 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (p.frostAnimTimer > 0) {
          const prog = 1 - p.frostAnimTimer / 0.38;
          const rOut = 22 + prog * 70;
          ctx.strokeStyle = `rgba(110, 235, 255, ${1 - prog * 0.7})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + prog * 0.5;
            ctx.moveTo(cx, cy + 4);
            ctx.lineTo(cx + Math.cos(a) * rOut, cy + 4 + Math.sin(a) * rOut * 0.48);
          }
          ctx.stroke();
        }
        ctx.restore();

        // 6C. Compute Hero Pose Transform for Active Skill / Movement
        let offsetX = 0;
        let offsetY = 0;
        let rotAngle = 0;
        let scaleX = p.flipX ? -1 : 1;
        let scaleY = 1;

        if (this.deathSequence) {
          const collapseProg = Math.min(1, this.deathSequence.timer / 0.65);
          const easeOut = 1 - Math.pow(1 - collapseProg, 3);
          // Growing crimson pool underneath fallen hero
          ctx.save();
          ctx.fillStyle = `rgba(130, 10, 18, ${0.55 * easeOut})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 7, 10 + 18 * easeOut, 4 + 7 * easeOut, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          offsetY = easeOut * 12;
          rotAngle = -easeOut * (Math.PI / 2);
        } else if (p.whirlwindAnimTimer > 0) {
          const prog = 1 - p.whirlwindAnimTimer / 0.36;
          const spinPhase = prog * Math.PI * 4;
          if (wwFrames && wwFrames.length >= 4) {
            rotAngle = Math.sin(spinPhase) * 0.08;
            offsetY = -Math.sin(prog * Math.PI) * 6;
          } else {
            scaleX = Math.cos(spinPhase);
            if (Math.abs(scaleX) < 0.22) scaleX = scaleX < 0 ? -0.22 : 0.22;
            rotAngle = Math.sin(spinPhase) * 0.16;
            offsetY = -Math.sin(prog * Math.PI) * 6;
          }
        } else if (p.slashAnimTimer > 0) {
          const maxT = Math.max(0.08, p.slashAnimDuration || 0.24);
          const prog = Math.max(0, Math.min(1, 1 - p.slashAnimTimer / maxT));
          const swingCurve = Math.sin(prog * Math.PI);
          if (attackFrames && attackFrames.length >= 4) {
            offsetX = Math.cos(p.facing) * 6 * swingCurve;
            offsetY = Math.sin(p.facing) * 4 * swingCurve;
          } else {
            offsetX = Math.cos(p.facing) * 8 * swingCurve;
            offsetY = Math.sin(p.facing) * 6 * swingCurve - 2 * swingCurve;
            rotAngle = (0.28 * swingCurve) * (p.slashSwingSign || 1);
            scaleX *= (1 + 0.06 * swingCurve);
          }
        } else if (p.castAnimTimer > 0) {
          const prog = 1 - p.castAnimTimer / 0.30;
          const castCurve = Math.sin(prog * Math.PI);
          offsetX = -Math.cos(p.facing) * 4 * castCurve;
          offsetY = -5 * castCurve;
          rotAngle = -0.14 * castCurve;
        } else if (p.frostAnimTimer > 0) {
          const prog = 1 - p.frostAnimTimer / 0.38;
          offsetY = -Math.sin(prog * Math.PI) * 14;
          scaleY = prog > 0.65 ? 0.92 : 1.06;
        } else if (p.isMoving) {
          offsetY = -Math.abs(Math.sin((p.walkAnimTime || 0) * 5.2 * Math.PI)) * 2.5;
        }

        ctx.save();
        ctx.translate(cx + offsetX, cy + offsetY - drawSize * 0.34);
        ctx.scale(scaleX, scaleY);
        if (rotAngle !== 0) ctx.rotate(rotAngle);
        if (this.deathSequence) {
          ctx.filter = 'grayscale(100%) brightness(0.62) contrast(1.15)';
        } else if (p.iFrameTimer > 0) {
          ctx.filter = 'brightness(1.45) drop-shadow(0px 0px 8px #5ce1ff)';
        } else if (p.frostAnimTimer > 0) {
          ctx.filter = 'brightness(1.25) drop-shadow(0px 0px 6px #5ce1ff)';
        } else if (p.castAnimTimer > 0) {
          ctx.filter = 'brightness(1.2) drop-shadow(0px 0px 6px #ff7b1c)';
        }
        ctx.drawImage(heroImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();

        if (this.deathSequence) {
          const collapseProg = Math.min(1, this.deathSequence.timer / 0.65);
          const easeOut = 1 - Math.pow(1 - collapseProg, 3);
          // Growing crimson pool underneath fallen hero
          ctx.save();
          ctx.fillStyle = `rgba(130, 10, 18, ${0.55 * easeOut})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 7, 10 + 18 * easeOut, 4 + 7 * easeOut, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          offsetY = easeOut * 12;
          rotAngle = -easeOut * (Math.PI / 2);
        }
      }
    });

    // EXECUTE Y-SORTED RENDER PASS
    ySortList.sort((a, b) => a.sortY - b.sortY);
    for (let i = 0; i < ySortList.length; i++) {
      ySortList[i].draw();
    }

    // 7. RENDER SLASH ARCS, PROJECTILES, AND PARTICLES
    this.slashEffects.forEach((s) => {
      const sx = s.x - this.cam.x;
      const sy = s.y - this.cam.y;
      const prog = Math.max(0, Math.min(1, 1 - s.timer / s.maxTimer));
      const drawDia = s.radius * 2.207;

      if (s.fullCircle && sp.fx_whirlwind && sp.fx_whirlwind.length >= 4) {
        const fIdx = Math.floor(prog * 8) % sp.fx_whirlwind.length;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(prog * Math.PI * 1.5);
        ctx.globalAlpha = Math.min(1, (s.timer / s.maxTimer) * 1.4);
        ctx.drawImage(sp.fx_whirlwind[fIdx], -drawDia / 2, -drawDia / 2, drawDia, drawDia);
        ctx.restore();
        return;
      }

      if (!s.fullCircle) {
        const slashFrames = s.color === '#ff4a4a'
          ? sp.fx_slash_blood
          : (s.color === '#ffb84d' ? sp.fx_slash_gold : sp.fx_slash);
        if (slashFrames && slashFrames.length >= 4) {
          const fIdx = Math.min(slashFrames.length - 1, Math.floor(prog * slashFrames.length));
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(s.angle);
          if (s.swingSign < 0) ctx.scale(1, -1);
          ctx.globalAlpha = Math.min(1, (s.timer / s.maxTimer) * 1.6);
          ctx.drawImage(slashFrames[fIdx], -drawDia / 2, -drawDia / 2, drawDia, drawDia);
          ctx.restore();
          return;
        }
      }

      // Fallback if sprites are not yet loaded
      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 5;
      ctx.globalAlpha = s.timer / s.maxTimer;
      ctx.beginPath();
      if (s.fullCircle) {
        ctx.arc(sx, sy, s.radius * (1 - (s.timer / s.maxTimer) * 0.25), 0, Math.PI * 2);
      } else {
        ctx.arc(sx, sy, s.radius, s.angle - 1.0, s.angle + 1.0);
      }
      ctx.stroke();
      ctx.restore();
    });

    this.projectiles.forEach((pr) => {
      const sx = Math.floor(pr.x - this.cam.x);
      const sy = Math.floor(pr.y - this.cam.y);
      ctx.save();
      if (pr.isSpectralBlade) {
        // Rotating crescent spectral blade visual
        ctx.translate(sx, sy);
        ctx.rotate(performance.now() * 0.02);
        ctx.strokeStyle = '#d499ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, pr.radius + 2, 0, Math.PI * 1.35);
        ctx.stroke();
      } else {
        ctx.fillStyle = pr.color;
        ctx.beginPath();
        ctx.arc(sx, sy, pr.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      }
      ctx.restore();
    });

    this.particles.forEach((pt) => {
      const sx = Math.floor(pt.x - this.cam.x);
      const sy = Math.floor(pt.y - this.cam.y);
      ctx.fillStyle = pt.color;
      ctx.fillRect(sx, sy, pt.size, pt.size);
    });

    // 8. HD-2D DYNAMIC POINT LIGHTING & DARK FANTASY VIGNETTE
    this.renderLightingOverlay(ctx);

    // 9. GROUND LOOT LABELS
    if (this.showLootLabels) {
      ctx.font = '14px "VT323", monospace';
      ctx.textAlign = 'center';
      this.groundItems.forEach((g) => {
        const sx = Math.floor(g.x - this.cam.x);
        const sy = Math.floor(g.y - g.z - 20 - this.cam.y);
        const w = ctx.measureText(g.name).width + 10;
        const h = 16;
        const rx = sx - Math.floor(w / 2);
        const ry = sy - 12;

        const isHover = (this.mouse.x >= rx && this.mouse.x <= rx + w && this.mouse.y >= ry && this.mouse.y <= ry + h);
        if (isHover) this.hoveredGroundItem = g;

        ctx.fillStyle = isHover ? 'rgba(50, 38, 24, 0.96)' : 'rgba(10, 8, 14, 0.85)';
        ctx.fillRect(rx, ry, w, h);
        ctx.strokeStyle = isHover ? '#f2c94c' : '#4a3c2a';
        ctx.strokeRect(rx + 0.5, ry + 0.5, w - 1, h - 1);

        ctx.fillStyle = g.rarity === 'unique' ? '#ff9933' :
                        (g.rarity === 'rare' ? '#f5e042' :
                        (g.rarity === 'magic' ? '#6e9bff' : '#e6dfd5'));
        ctx.fillText(g.name, sx, sy);
      });
    }

    // 9B. DIRECT ITEM COMPARISON TOOLTIP WHEN HOVERING GROUND LOOT
    const hg = this.hoveredGroundItem;
    if (hg && hg.kind === 'item' && hg.item) {
      if (this.groundTooltipUid !== hg.uid || !this.groundTooltipActive) {
        this.groundTooltipActive = true;
        this.groundTooltipUid = hg.uid;
      }
      window.GameUI.showTooltip(
        hg.item,
        { clientX: this.mouse.x * this.zoom, clientY: this.mouse.y * this.zoom },
        'Klicken zum Aufheben'
      );
    } else if (this.groundTooltipActive) {
      this.groundTooltipActive = false;
      this.groundTooltipUid = null;
      window.GameUI.hideTooltip();
    }

    // 10. FLOATING COMBAT TEXT
    ctx.font = '15px "VT323", monospace';
    ctx.textAlign = 'center';
    this.floatingTexts.forEach((ft) => {
      const sx = Math.floor(ft.x - this.cam.x);
      const sy = Math.floor(ft.y - this.cam.y);
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, sx + 1, sy + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, sx, sy);
    });

    // 11. SPEECH BUBBLE / INTERACTION CURSOR SPRITE WHEN HOVERING AN NPC OR THE TOWN PORTAL
    if ((this.hoveredNPC || this.hoveredPortal) && sp.cursor_speech) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      const bob = Math.sin(performance.now() * 0.008) * 1.5;
      ctx.drawImage(sp.cursor_speech, Math.floor(this.mouse.x - 4), Math.floor(this.mouse.y - 24 + bob), 26, 26);
      ctx.restore();
    }

    this.renderMinimap();
  }

  renderFloorVignette(ctx) {
    const px = this.player.x - this.cam.x;
    const py = this.player.y - this.cam.y;
    const grad = ctx.createRadialGradient(px, py, 110, px, py, 390);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.7, 'rgba(5, 4, 12, 0.22)');
    grad.addColorStop(1, 'rgba(3, 2, 8, 0.52)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }

  renderLightingOverlay(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const flicker = Math.sin(performance.now() * 0.012) * 5;

    this.world.torches.forEach((t) => {
      const sx = t.x - this.cam.x;
      const sy = t.y - 10 - this.cam.y;
      if (sx < -90 || sy < -90 || sx > this.viewW + 90 || sy > this.viewH + 90) return;
      const r = 68 + flicker;
      const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, r);
      g.addColorStop(0, 'rgba(255, 165, 60, 0.22)');
      g.addColorStop(0.5, 'rgba(255, 95, 20, 0.09)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    this.world.props.forEach((pr) => {
      if (pr.type !== 'prop_chapel_shrine') return;
      const sx = pr.x - this.cam.x;
      const sy = pr.y - 18 - this.cam.y;
      if (sx < -80 || sy < -80 || sx > this.viewW + 80 || sy > this.viewH + 80) return;
      const r = 56 + flicker * 0.6;
      const gr = ctx.createRadialGradient(sx, sy, 4, sx, sy, r);
      gr.addColorStop(0, 'rgba(90, 235, 255, 0.24)');
      gr.addColorStop(0.55, 'rgba(40, 165, 235, 0.08)');
      gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    const lightPortals = [];
    if (this.currentScene === 'castle' && this.activeBounty && this.activeBounty.status === 'active' && this.scenes.castle.questPortal) {
      lightPortals.push(this.scenes.castle.questPortal);
    } else if (this.currentScene === 'world' && this.scenes.world.returnPortal) {
      lightPortals.push(this.scenes.world.returnPortal);
    }
    if (this.townPortal.active) {
      lightPortals.push(
        this.currentScene === 'castle'
          ? { x: this.townPortal.townX, y: this.townPortal.townY }
          : { x: this.townPortal.wildX, y: this.townPortal.wildY }
      );
    }
    lightPortals.forEach((pt) => {
      const sx = pt.x - this.cam.x;
      const sy = pt.y - 24 - this.cam.y;
      if (sx < -110 || sy < -110 || sx > this.viewW + 110 || sy > this.viewH + 110) return;
      const r = 82 + flicker;
      const g = ctx.createRadialGradient(sx, sy, 6, sx, sy, r);
      g.addColorStop(0, 'rgba(56, 210, 255, 0.28)');
      g.addColorStop(0.55, 'rgba(20, 110, 245, 0.12)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    this.projectiles.forEach((pr) => {
      const sx = pr.x - this.cam.x;
      const sy = pr.y - this.cam.y;
      const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, 34);
      g.addColorStop(0, pr.fromPlayer ? 'rgba(110, 210, 255, 0.24)' : 'rgba(255, 90, 180, 0.28)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, 34, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Cinematic Death Vignette & Banner Overlay
    if (this.deathSequence) {
      const ds = this.deathSequence;
      const t = Math.min(1, ds.timer / ds.duration);
      ctx.save();
      ctx.setTransform(this.zoom * this.dpr, 0, 0, this.zoom * this.dpr, 0, 0);
      const vGrad = ctx.createRadialGradient(
        this.viewW / 2, this.viewH / 2, this.viewH * 0.14,
        this.viewW / 2, this.viewH / 2, Math.max(this.viewW, this.viewH) * 0.72
      );
      vGrad.addColorStop(0, `rgba(45, 0, 6, ${0.22 * t})`);
      vGrad.addColorStop(0.65, `rgba(75, 0, 10, ${0.58 * t})`);
      vGrad.addColorStop(1, `rgba(4, 0, 2, ${0.88 * t})`);
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, this.viewW, this.viewH);

      if (t > 0.2 && !ds.modalShown) {
        const textAlpha = Math.min(1, (t - 0.2) / 0.45);
        ctx.globalAlpha = textAlpha;
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px "Cinzel", Georgia, serif';
        ctx.fillStyle = '#000000';
        ctx.fillText('DU BIST GESTORBEN', this.viewW / 2 + 2, this.viewH * 0.34 + 2);
        ctx.fillStyle = '#e03e3e';
        ctx.fillText('DU BIST GESTORBEN', this.viewW / 2, this.viewH * 0.34);
        ctx.font = '14px "VT323", monospace';
        ctx.fillStyle = '#d4c3a3';
        ctx.fillText('DIE DUNKELHEIT VERSCHLINGT DEINE SEELE...', this.viewW / 2, this.viewH * 0.34 + 26);
      }
      ctx.restore();
    }
  }

  buildMinimapBase(mw, mh) {
    const base = document.createElement('canvas');
    base.width = mw;
    base.height = mh;
    const bctx = base.getContext('2d');
    const sx = mw / this.world.width;
    const sy = mh / this.world.height;

    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        const t = this.world.tiles[y][x];
        if (t === 4 || t === 5) bctx.fillStyle = '#4a4352';
        else if (t === 1) bctx.fillStyle = '#332d38';
        else if (t === 2) bctx.fillStyle = '#3d2d20';
        else if (t === 3) bctx.fillStyle = '#381822';
        else bctx.fillStyle = '#141f17';
        bctx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy));
      }
    }

    // Highlight dungeon structures on minimap
    if (Array.isArray(this.world.dungeons)) {
      this.world.dungeons.forEach((d) => {
        bctx.strokeStyle = d.isBossSanctum ? '#ff5555' : '#9c6bff';
        bctx.lineWidth = 1;
        bctx.strokeRect(
          Math.floor(d.x1 * sx),
          Math.floor(d.y1 * sy),
          Math.max(3, Math.ceil((d.x2 - d.x1) * sx)),
          Math.max(3, Math.ceil((d.y2 - d.y1) * sy))
        );
      });
    }
    this.minimapBaseCache[this.currentScene] = base;
  }

  renderMinimap() {
    const mctx = this.minimapCtx;
    const mw = this.minimapCanvas.width;
    const mh = this.minimapCanvas.height;
    const cached = this.minimapBaseCache[this.currentScene];
    if (!cached || cached.width !== mw || cached.height !== mh) {
      this.buildMinimapBase(mw, mh);
    }
    mctx.drawImage(this.minimapBaseCache[this.currentScene], 0, 0);

    const sx = mw / this.world.width;
    const sy = mh / this.world.height;

    if (this.currentScene === 'castle' && this.scenes.castle.questPortal) {
      const qp = this.scenes.castle.questPortal;
      mctx.fillStyle = (this.activeBounty && this.activeBounty.status === 'active') ? '#c27aff' : '#6c6282';
      mctx.fillRect(Math.floor((qp.x / 32) * sx) - 2, Math.floor((qp.y / 32) * sy) - 2, 5, 5);
    } else if (this.currentScene === 'world' && this.scenes.world.returnPortal) {
      const rp = this.scenes.world.returnPortal;
      mctx.fillStyle = '#5ce1ff';
      mctx.fillRect(Math.floor((rp.x / 32) * sx) - 2, Math.floor((rp.y / 32) * sy) - 2, 4, 4);
    }

    mctx.fillStyle = '#ffd700';
    this.groundItems.forEach((gi) => {
      if (gi.isDeathGold) {
        mctx.fillRect(Math.floor((gi.x / 32) * sx) - 2, Math.floor((gi.y / 32) * sy) - 2, 4, 4);
      }
    });

    mctx.fillStyle = '#42f56c';
    this.world.npcs.forEach((n) => {
      mctx.fillRect(Math.floor((n.x / 32) * sx) - 1, Math.floor((n.y / 32) * sy) - 1, 3, 3);
    });

    if (this.townPortal.active) {
      mctx.fillStyle = '#38c7ff';
      mctx.fillRect(Math.floor((this.townPortal.wildX / 32) * sx) - 2, Math.floor((this.townPortal.wildY / 32) * sy) - 2, 4, 4);
    }

    this.world.monsters.forEach((m) => {
      mctx.fillStyle = m.isBoss ? '#ff9900' : (m.type === 'bone_tower' ? '#d842ff' : '#ff2e2e');
      const s = m.isBoss ? 4 : 2;
      mctx.fillRect(Math.floor((m.x / 32) * sx) - 1, Math.floor((m.y / 32) * sy) - 1, s, s);
    });

    mctx.fillStyle = '#ffffff';
    mctx.fillRect(Math.floor((this.player.x / 32) * sx) - 2, Math.floor((this.player.y / 32) * sy) - 2, 4, 4);
  }

  loop(now) {
    const rawDt = (now - this.lastTime) / 1000;
    const dt = Math.max(0, Math.min(0.05, Number.isFinite(rawDt) ? rawDt : 0.016));
    this.lastTime = now;
    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }
}

class GameUIController {
  static openStack = [];
  static selectedCharId = null;
  static selectedArchetypeId = ARCHETYPE_DATA[0].id;

  static initMainMenu() {
    const chars = SaveManager.getCharacters();
    const lastId = SaveManager.getLastSelectedId();
    if (chars.length > 0) {
      const found = chars.find((c) => c.id === lastId);
      this.selectedCharId = found ? found.id : chars[0].id;
    } else {
      this.selectedCharId = null;
    }
    this.updateTitleSaveStatus();
    this.showMenuScreen('title');
  }

  static updateTitleSaveStatus() {
    const chars = SaveManager.getCharacters();
    const statusEl = document.getElementById('title-save-status');
    if (!statusEl) return;
    if (chars.length === 0) {
      statusEl.textContent = 'Noch kein Charakter gespeichert – klicke auf SPIEL STARTEN zur Charaktererstellung!';
    } else {
      statusEl.textContent = `Gespeicherte Helden: ${chars.length} / ${SaveManager.MAX_CHARS} verfügbar`;
    }
  }

  static showMenuScreen(screenName) {
    const overlay = document.getElementById('main-menu-overlay');
    if (overlay) overlay.classList.add('active');

    const screens = {
      title: document.getElementById('menu-screen-title'),
      select: document.getElementById('menu-screen-select'),
      create: document.getElementById('menu-screen-create')
    };
    Object.keys(screens).forEach((k) => {
      if (screens[k]) screens[k].classList.toggle('active', k === screenName);
    });

    if (screenName === 'title') {
      this.updateTitleSaveStatus();
    } else if (screenName === 'select') {
      this.renderCharacterSelectList();
    } else if (screenName === 'create') {
      this.renderCharacterCreationForm();
    }
  }

  static onStartButtonClick() {
    window.SFX.init();
    const chars = SaveManager.getCharacters();
    if (chars.length === 0) {
      this.openCharacterCreation();
    } else {
      const lastId = SaveManager.getLastSelectedId();
      const found = chars.find((c) => c.id === lastId);
      this.selectedCharId = found ? found.id : chars[0].id;
      this.showMenuScreen('select');
    }
  }

  static openEscMenu() {
    const g = window.Game;
    if (!g || g.inMainMenu) return;
    const status = document.getElementById('esc-save-status');
    if (status) status.textContent = '';
    this.openPanel('esc-menu');
  }

  static saveGameFromEscMenu() {
    const g = window.Game;
    if (!g) return;
    g.saveCurrentCharacter();
    window.SFX.gold();
    const status = document.getElementById('esc-save-status');
    if (status) {
      const t = new Date();
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      status.textContent = `✔ Spiel gespeichert (${hh}:${mm} Uhr)`;
    }
    g.addSystemLog('Spielstand manuell gespeichert.', 'info');
  }

  static returnToMainMenu() {
    const g = window.Game;
    if (g) {
      g.saveCurrentCharacter();
      g.inMainMenu = true;
      g.keys = {};
    }
    this.openStack.slice().forEach((id) => this.closePanel(id));
    this.hideTooltip();
    if (g && g.activeCharId) {
      this.selectedCharId = g.activeCharId;
    }
    this.showMenuScreen('title');
  }

  static renderCharacterSelectList() {
    const chars = SaveManager.getCharacters();
    const countLabel = document.getElementById('char-select-count-label');
    if (countLabel) {
      countLabel.textContent = `Wähle deinen Streiter (${chars.length} / ${SaveManager.MAX_CHARS} Plätze belegt)`;
    }

    if (chars.length > 0 && !chars.some((c) => c.id === this.selectedCharId)) {
      this.selectedCharId = chars[0].id;
    }

    const listEl = document.getElementById('char-slot-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    chars.forEach((c, idx) => {
      const card = document.createElement('div');
      const isSelected = c.id === this.selectedCharId;
      card.className = `char-slot-card ${isSelected ? 'selected' : ''}`;

      const portraitCanvas = document.createElement('canvas');
      portraitCanvas.width = 48;
      portraitCanvas.height = 48;
      const pctx = portraitCanvas.getContext('2d');
      pctx.imageSmoothingEnabled = true;
      const heroFrames = window.Sprites && window.Sprites.cache
        ? (window.Sprites.cache.hero_idle || window.Sprites.cache.hero)
        : null;
      if (heroFrames && heroFrames[0]) {
        pctx.drawImage(heroFrames[idx % heroFrames.length], 0, 0, 48, 48);
      }

      const eqCount = c.equipment
        ? Object.values(c.equipment).filter(Boolean).length
        : 2;
      const questTier = (c.quest && (c.quest.bountyTier || c.quest.tier)) ? (c.quest.bountyTier || c.quest.tier) : 1;

      const leftDiv = document.createElement('div');
      leftDiv.className = 'char-slot-left';

      const portraitWrap = document.createElement('div');
      portraitWrap.className = 'char-slot-portrait';
      portraitWrap.appendChild(portraitCanvas);

      const infoDiv = document.createElement('div');
      infoDiv.className = 'char-slot-info';
      infoDiv.innerHTML = `
        <div class="char-slot-name-row">
          <span class="char-slot-name">${this.escapeHtml(c.name)}</span>
          <span class="char-slot-badge">${this.escapeHtml(c.archetypeTitle || 'Klingenwächter')}</span>
        </div>
        <div class="char-slot-meta">Stufe <b>${c.level || 1}</b> | Gold: <b>${c.gold ?? 120}</b> | Boss-Quest #<b>${questTier}</b></div>
        <div class="char-slot-submeta">Ausrüstung: ${eqCount}/5 Slots | Inventar: ${(c.inventory || []).filter(Boolean).length}/18 Items</div>
      `;

      leftDiv.appendChild(portraitWrap);
      leftDiv.appendChild(infoDiv);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'char-slot-actions';

      const delBtn = document.createElement('button');
      delBtn.className = 'char-delete-btn';
      delBtn.textContent = 'Löschen';
      delBtn.title = 'Diesen Charakter löschen';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const remaining = SaveManager.deleteCharacter(c.id);
        if (this.selectedCharId === c.id) {
          this.selectedCharId = remaining[0] ? remaining[0].id : null;
        }
        if (remaining.length === 0) {
          this.openCharacterCreation();
        } else {
          this.renderCharacterSelectList();
        }
      });

      actionsDiv.appendChild(delBtn);

      card.appendChild(leftDiv);
      card.appendChild(actionsDiv);

      card.addEventListener('click', () => {
        this.selectedCharId = c.id;
        SaveManager.setLastSelectedId(c.id);
        this.renderCharacterSelectList();
      });

      card.addEventListener('dblclick', () => {
        this.selectedCharId = c.id;
        this.playSelectedCharacter();
      });

      listEl.appendChild(card);
    });

    // Render empty slot placeholders up to 5 slots
    for (let s = chars.length; s < SaveManager.MAX_CHARS; s++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'char-slot-empty';
      emptySlot.textContent = `Freier Helden-Platz #${s + 1} – Klicken für neuen Charakter`;
      emptySlot.addEventListener('click', () => {
        this.openCharacterCreation();
      });
      listEl.appendChild(emptySlot);
    }

    const btnNew = document.getElementById('btn-new-char');
    if (btnNew) {
      btnNew.disabled = chars.length >= SaveManager.MAX_CHARS;
      btnNew.textContent = chars.length >= SaveManager.MAX_CHARS
        ? 'MAX. 5/5 HELDEN ERREICHT'
        : '+ NEUER CHARAKTER';
    }

    const btnPlay = document.getElementById('btn-play-selected');
    if (btnPlay) {
      btnPlay.disabled = !this.selectedCharId || chars.length === 0;
    }
  }

  static openCharacterCreation() {
    const chars = SaveManager.getCharacters();
    if (chars.length >= SaveManager.MAX_CHARS) {
      this.showMenuScreen('select');
      return;
    }
    this.selectedArchetypeId = ARCHETYPE_DATA[0].id;
    this.showMenuScreen('create');
    const nameInput = document.getElementById('char-name-input');
    if (nameInput) {
      if (!nameInput.value.trim()) {
        this.randomizeCharName();
      }
      setTimeout(() => nameInput.focus(), 30);
    }
  }

  static cancelCharacterCreation() {
    const chars = SaveManager.getCharacters();
    if (chars.length > 0) {
      this.showMenuScreen('select');
    } else {
      this.showMenuScreen('title');
    }
  }

  static randomizeCharName() {
    const nameInput = document.getElementById('char-name-input');
    if (!nameInput) return;
    const pick = HERO_NAME_POOL[Math.floor(Math.random() * HERO_NAME_POOL.length)];
    nameInput.value = pick;
    const errEl = document.getElementById('create-error-msg');
    if (errEl) errEl.textContent = '';
  }

  static renderCharacterCreationForm() {
    const grid = document.getElementById('archetype-grid');
    if (!grid) return;
    grid.innerHTML = '';

    ARCHETYPE_DATA.forEach((arch) => {
      const card = document.createElement('div');
      const isSel = arch.id === this.selectedArchetypeId;
      card.className = `archetype-card ${isSel ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="archetype-title">${arch.title}</div>
        <div class="archetype-desc">${arch.desc}</div>
        <div class="archetype-stats">${arch.statsText}</div>
      `;
      card.addEventListener('click', () => {
        this.selectedArchetypeId = arch.id;
        this.renderCharacterCreationForm();
      });
      grid.appendChild(card);
    });

    const selectedArch = ARCHETYPE_DATA.find((a) => a.id === this.selectedArchetypeId) || ARCHETYPE_DATA[0];
    const prevTitle = document.getElementById('create-preview-title');
    if (prevTitle) prevTitle.textContent = selectedArch.title;
    this.updateCreatePreviewCanvas(performance.now() / 1000);
  }

  static updateCreatePreviewCanvas(animTime = 0) {
    const canvas = document.getElementById('char-create-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sp = window.Sprites && window.Sprites.cache;
    if (!sp) return;
    const walkFrames = sp.hero_walk || sp.hero;
    if (!walkFrames || !walkFrames.length) return;
    const frameIdx = Math.abs(Math.floor(animTime * 6)) % walkFrames.length;
    const img = walkFrames[frameIdx] || walkFrames[0];
    if (img) {
      ctx.drawImage(img, 8, 8, 80, 80);
    }
  }

  static confirmCreateCharacter() {
    const chars = SaveManager.getCharacters();
    const errEl = document.getElementById('create-error-msg');
    if (chars.length >= SaveManager.MAX_CHARS) {
      if (errEl) errEl.textContent = 'Maximal 5 Charaktere möglich! Bitte lösche zuerst einen Platz.';
      return;
    }

    const nameInput = document.getElementById('char-name-input');
    const rawName = nameInput ? nameInput.value.trim() : '';
    if (!rawName) {
      if (errEl) errEl.textContent = 'Bitte gib einen Namen für deinen Charakter ein!';
      if (nameInput) nameInput.focus();
      return;
    }

    const created = SaveManager.createNewCharacter(rawName, this.selectedArchetypeId);
    if (!created) return;

    this.selectedCharId = created.id;
    if (nameInput) nameInput.value = '';
    if (errEl) errEl.textContent = '';

    this.startGameWithCharacter(created);
  }

  static playSelectedCharacter() {
    const chars = SaveManager.getCharacters();
    if (chars.length === 0) {
      this.openCharacterCreation();
      return;
    }
    const chosen = chars.find((c) => c.id === this.selectedCharId) || chars[0];
    this.startGameWithCharacter(chosen);
  }

  static startGameWithCharacter(charData) {
    const overlay = document.getElementById('main-menu-overlay');
    if (overlay) overlay.classList.remove('active');
    if (window.Game) {
      window.Game.loadCharacterSave(charData);
    }
  }

  static showDeathModal(droppedGold = 0, lostXp = 0, xpLossPct = 0) {
    const modal = document.getElementById('death-modal');
    const body = document.getElementById('death-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
      <div>Deine Lebenspunkte sind auf 0 gefallen.</div>
      <div class="death-penalty-item">
        <b style="color:#ffd700;">Verlorenes Gold (30%): -${droppedGold} Gold</b><br>
        <span style="color:#cbbba0;">${droppedGold > 0 ? 'Liegt als großer Goldhaufen exakt an deinem Todesort – du kannst es dort wieder einsammeln!' : 'Du hattest kein Gold bei dir.'}</span>
      </div>
      <div class="death-penalty-item" style="border-left-color:#ff6b6b;">
        <b style="color:#ff8080;">Verlorene Erfahrung (${xpLossPct}%): -${lostXp} XP</b><br>
        <span style="color:#cbbba0;">Abzug auf dem Weg zum nächsten Level (dein aktuelles Level bleibt erhalten).</span>
      </div>
      <div style="margin-top:10px; font-size:15px; color:#a89f8d; text-align:center;">
        Wähle deinen Wiederbelebungsort:
      </div>
    `;
    modal.style.display = 'block';
    modal.classList.add('open');
  }

  static respawnAtPortal() {
    this.closeDeathModal();
    if (window.Game) window.Game.respawnPlayer('portal');
  }

  static respawnInCastle() {
    this.closeDeathModal();
    if (window.Game) window.Game.respawnPlayer('castle');
  }

  static closeDeathModal() {
    const modal = document.getElementById('death-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.style.display = 'none';
  }

  static escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  static syncZIndices() {
    this.openStack.forEach((panelId, idx) => {
      const pEl = document.getElementById(panelId);
      if (pEl) pEl.style.zIndex = String(25 + idx);
    });
    const npcEl = document.getElementById('npc-panel');
    const charEl = document.getElementById('char-panel');
    const shopSec = document.getElementById('shop-section');
    const splitActive = Boolean(
      npcEl && charEl && shopSec &&
      npcEl.classList.contains('open') &&
      charEl.classList.contains('open') &&
      shopSec.style.display !== 'none'
    );
    if (npcEl) npcEl.classList.toggle('shop-split', splitActive);
    if (charEl) charEl.classList.toggle('shop-split', splitActive);
  }

  static openPanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    this.openStack = this.openStack.filter((item) => item !== id);
    this.openStack.push(id);
    this.syncZIndices();
    this.hideTooltip();
    this.renderAll();
  }

  static closePanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    this.openStack = this.openStack.filter((item) => item !== id);
    this.syncZIndices();
    this.hideTooltip();
    this.renderAll();
  }

  static togglePanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.classList.contains('open')) {
      this.closePanel(id);
    } else {
      this.openPanel(id);
    }
  }

  static closeTopPanel() {
    this.openStack = this.openStack.filter((id) => {
      const el = document.getElementById(id);
      return el && el.classList.contains('open');
    });
    if (this.openStack.length === 0) return false;
    const lastId = this.openStack[this.openStack.length - 1];
    this.closePanel(lastId);
    return true;
  }

  static closeNpcPanel() {
    this.closePanel('npc-panel');
  }

  static updateHUD() {
    const g = window.Game;
    if (!g) return;
    const p = g.player;

    document.getElementById('hp-orb-fill').style.height = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
    document.getElementById('mp-orb-fill').style.height = `${Math.max(0, (p.mp / p.maxMp) * 100)}%`;
    document.getElementById('hp-text').textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
    document.getElementById('mp-text').textContent = `${Math.floor(p.mp)}/${p.maxMp}`;

    // Low HP (< 30%) Red Screen Tint Overlay
    const hpRatio = p.maxHp > 0 ? p.hp / p.maxHp : 1;
    const isLowHp = !g.inMainMenu && hpRatio < 0.30;
    const lowHpEl = document.getElementById('low-hp-overlay');
    if (lowHpEl) {
      lowHpEl.classList.toggle('active', isLowHp);
      if (isLowHp) {
        const strength = 0.45 + Math.min(1, (0.30 - hpRatio) / 0.25) * 0.45;
        lowHpEl.style.opacity = strength.toFixed(2);
      } else {
        lowHpEl.style.opacity = '0';
      }
    }

    document.getElementById('xp-bar-fill').style.width = `${Math.min(100, (p.xp / p.xpNext) * 100)}%`;
    const ptsBadge = (p.skillPoints > 0 || p.statPoints > 0)
      ? ` [SKILLS (K): ${p.skillPoints} | ATTR (C): ${p.statPoints}]`
      : '';
    const heroLabel = `${(p.name || 'Streiter').toUpperCase()} – ${(p.archetypeTitle || 'Klingenwächter').toUpperCase()}`;
    document.getElementById('xp-bar-label').textContent =
      `LVL ${p.level} ${heroLabel} (${p.xp}/${p.xpNext} XP) | ROLLEN: ${p.dodgeCharges}/${p.maxDodgeCharges}` + ptsBadge;

    const charBtn = document.getElementById('btn-char-hud');
    if (charBtn) {
      const hasStatPts = p.statPoints > 0;
      charBtn.textContent = hasStatPts ? `HELD & INV (C) [+${p.statPoints}]` : 'HELD & INV (C)';
      charBtn.style.borderColor = hasStatPts ? '#f2c94c' : '';
      charBtn.classList.toggle('has-points', hasStatPts);
      charBtn.title = hasStatPts
        ? `${p.statPoints} freie Attributpunkte verfügbar — drücke [C] zum Verteilen!`
        : 'Charakterwerte & Attribute [C]';
    }

    const skillBtn = document.getElementById('btn-skilltree-hud');
    if (skillBtn) {
      const hasSkillPts = p.skillPoints > 0;
      skillBtn.textContent = hasSkillPts ? `SKILLS (K) [+${p.skillPoints}]` : 'SKILLS (K)';
      skillBtn.style.borderColor = hasSkillPts ? '#f2c94c' : '';
      skillBtn.classList.toggle('has-points', hasSkillPts);
    }

    document.getElementById('count-pot-hp').textContent = `${p.potions.hp}/${p.maxPotions}`;
    document.getElementById('count-pot-mp').textContent = `${p.potions.mp}/${p.maxPotions}`;
    const potHpSlot = document.getElementById('potion-slot-hp');
    const potMpSlot = document.getElementById('potion-slot-mp');
    if (potHpSlot) {
      potHpSlot.classList.toggle('empty', p.potions.hp <= 0);
      potHpSlot.classList.toggle('low-hp-hint', isLowHp && p.potions.hp > 0);
    }
    if (potMpSlot) {
      potMpSlot.classList.toggle('empty', p.potions.mp <= 0);
    }

    for (let i = 0; i < 2; i++) {
      const cdEl = document.getElementById(`cd-skill-${i}`);
      if (cdEl) {
        const pct = (p.skillCds[i] / p.skillMaxCds[i]) * 100;
        cdEl.style.height = `${Math.max(0, pct)}%`;
      }
    }

    const whirlSlot = document.getElementById('skill-slot-1');
    const whirlLock = document.getElementById('lock-skill-1');
    const whirlUnlocked = g.hasSkillNode('blade_1');
    if (whirlSlot) {
      whirlSlot.classList.toggle('locked', !whirlUnlocked);
      whirlSlot.classList.toggle('no-mana', whirlUnlocked && p.mp < 12);
    }
    if (whirlLock) whirlLock.style.display = whirlUnlocked ? 'none' : 'block';

    const portalSlot = document.getElementById('portal-slot');
    const portalCdOverlay = document.getElementById('cd-portal');
    const portalCdText = document.getElementById('portal-cd-text');
    const portalCd = g.townPortal.portalCooldown || 0;
    const portalMaxCd = g.townPortal.portalMaxCooldown || 60;
    const cdLeft = Math.ceil(portalCd);
    if (portalSlot) portalSlot.classList.toggle('on-cooldown', cdLeft > 0);
    if (portalCdOverlay) {
      const pct = Math.max(0, Math.min(100, (portalCd / portalMaxCd) * 100));
      portalCdOverlay.style.height = `${pct}%`;
    }
    if (portalCdText) {
      portalCdText.textContent = cdLeft > 0 ? `${cdLeft}` : '';
    }

    document.getElementById('zone-title').textContent = g.world.getZoneName(p.x, p.y);
    const b = g.activeBounty;
    const hState = g.getBountyTierState('horde');
    const bState = g.getBountyTierState('boss');
    let qText = '';
    if (!b) {
      qText = `Die Chroniken (Horde T${hState.selectedTier} | Boss T${bState.selectedTier}): Sprich mit Chronist Aldric in der Burg, um deine nächste Mission zu wählen!`;
    } else if (b.status === 'ready_to_turn_in') {
      qText = `Feldzug Tier ${b.tier} (${b.title}) abgeschlossen! Kehre zu Chronist Aldric zurück!`;
    } else if (b.type === 'boss') {
      qText = `Bounty Tier ${b.tier} – Exekution: Malakor der Entfesselte (${b.currentKills} / ${b.targetKills}) [x${b.difficultyMult.toFixed(2)}]`;
    } else {
      qText = `Bounty Tier ${b.tier} – Horden-Säuberung: ${b.currentKills} / ${b.targetKills} Monster in der Düstermark [x${b.difficultyMult.toFixed(2)}]`;
    }
    document.getElementById('quest-tracker').textContent = qText;
  }

  static renderAll() {
    this.renderInventory();
    this.renderCharStats();
    this.renderSkillTree();
    if (window.Game) {
      window.Game.saveCurrentCharacter();
    }
  }

  static renderSkillTree() {
    const g = window.Game;
    if (!g) return;
    const p = g.player;
    const ptsEl = document.getElementById('skilltree-points-count');
    if (ptsEl) ptsEl.textContent = p.skillPoints;

    const container = document.getElementById('skilltree-content');
    if (!container) return;
    container.innerHTML = '';

    SKILL_TREE_DATA.forEach((branch) => {
      const col = document.createElement('div');
      col.className = `skilltree-branch ${branch.cssClass}`;
      col.innerHTML = `<div class="branch-header">${branch.title}<br><span style="font-family:VT323,monospace; font-size:15px; color:#b8ab90;">${branch.subtitle}</span></div>`;

      branch.nodes.forEach((node) => {
        const curRank = g.getSkillRank(node.id);
        const maxRank = node.maxRank || 1;
        const isMaxed = curRank >= maxRank;
        const isPartiallyUnlocked = curRank > 0;
        const reqRankNeeded = node.reqRank || 1;
        const reqNodeMet = !node.req || g.getSkillRank(node.req) >= reqRankNeeded;
        const reqLevelMet = !node.reqLevel || p.level >= node.reqLevel;
        const cost = node.cost || 1;
        const canUnlock = !isMaxed && reqNodeMet && reqLevelMet && p.skillPoints >= cost;

        const card = document.createElement('div');
        card.className = `skilltree-node ${isMaxed ? 'unlocked' : (canUnlock ? 'available' : (isPartiallyUnlocked ? 'unlocked' : 'locked'))}`;

        let statusLabel = '';
        if (isMaxed) {
          statusLabel = `MAX (${curRank}/${maxRank})`;
        } else if (!reqNodeMet) {
          statusLabel = `Vorstufe ${reqRankNeeded}/${reqRankNeeded} nötig`;
        } else if (!reqLevelMet) {
          statusLabel = `Ab Stufe ${node.reqLevel}`;
        } else {
          statusLabel = `Rang ${curRank}/${maxRank} (${cost} Pkt.)`;
        }

        let btnHtml = '';
        if (canUnlock) {
          const actionVerb = curRank === 0 ? 'FREISCHALTEN' : `AUFWERTEN AUF ${curRank + 1}/${maxRank}`;
          btnHtml = `<button class="node-btn" data-node="${node.id}">${actionVerb} (${cost} Skillpunkt${cost > 1 ? 'e' : ''})</button>`;
        } else if (!isMaxed) {
          const lockReasons = [];
          if (!reqNodeMet) lockReasons.push(`Tier ${node.tier - 1} auf ${reqRankNeeded}/${reqRankNeeded}`);
          if (!reqLevelMet) lockReasons.push(`Stufe ${node.reqLevel}`);
          if (reqNodeMet && reqLevelMet && p.skillPoints < cost) lockReasons.push(`${cost} Skillpunkt${cost > 1 ? 'e' : ''} benötigt`);
          if (lockReasons.length > 0) {
            btnHtml = `<div style="margin-top:6px; font-size:13px; color:#c87a6b;">Voraussetzung: ${lockReasons.join(' & ')}</div>`;
          }
        }

        card.innerHTML = `
          <div class="node-tier"><span>TIER ${node.tier} (Ab Lvl ${node.reqLevel || 1})</span><span>${statusLabel}</span></div>
          <div class="node-title">${node.name} <span style="color:#f2c94c;">[${curRank}/${maxRank}]</span></div>
          <div class="node-desc">${node.desc}</div>
          ${btnHtml}
        `;

        if (canUnlock) {
          card.addEventListener('click', () => {
            g.unlockSkillNode(node.id);
          });
        }
        col.appendChild(card);
      });

      container.appendChild(col);
    });
  }

  static trimInventory(inv) {
    if (!Array.isArray(inv)) return;
    while (inv.length > 0 && !inv[inv.length - 1]) {
      inv.pop();
    }
  }

  static hasInvSpace(p) {
    if (!p || !Array.isArray(p.inventory)) return false;
    let count = 0;
    for (let i = 0; i < p.maxInv; i++) {
      if (p.inventory[i]) count++;
    }
    return count < p.maxInv;
  }

  static addInvItem(p, item) {
    if (!p || !Array.isArray(p.inventory) || !item) return false;
    for (let i = 0; i < p.maxInv; i++) {
      if (!p.inventory[i]) {
        p.inventory[i] = item;
        return true;
      }
    }
    return false;
  }

  static sortInventoryByQuality() {
    const g = window.Game;
    if (!g) return;
    const p = g.player;
    const rarityOrder = { unique: 0, rare: 1, magic: 2, common: 3 };
    const items = p.inventory.filter(Boolean);
    items.sort((a, b) => {
      const ra = rarityOrder[a.rarity] ?? 99;
      const rb = rarityOrder[b.rarity] ?? 99;
      if (ra !== rb) return ra - rb;
      const pa = a.price || 0;
      const pb = b.price || 0;
      if (pa !== pb) return pb - pa;
      return (a.name || '').localeCompare(b.name || '', 'de');
    });
    p.inventory = items;
    if (window.SFX && window.SFX.uiClick) window.SFX.uiClick();
    this.hideTooltip();
    this.renderInventory();
  }

  static handleInventoryDrop(payload, target) {
    const g = window.Game;
    if (!g || !payload || !target) return false;
    const p = g.player;

    if (payload.type === 'inv' && target.type === 'inv') {
      const fromIdx = payload.index;
      const toIdx = target.index;
      if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= p.maxInv || toIdx >= p.maxInv) return false;
      const srcItem = p.inventory[fromIdx] || null;
      if (!srcItem) return false;
      const dstItem = p.inventory[toIdx] || null;
      p.inventory[toIdx] = srcItem;
      p.inventory[fromIdx] = dstItem;
      this.trimInventory(p.inventory);
      if (window.SFX && window.SFX.uiClick) window.SFX.uiClick();
      this.hideTooltip();
      this.renderInventory();
      return true;
    }

    if (payload.type === 'inv' && target.type === 'equip') {
      const fromIdx = payload.index;
      const srcItem = p.inventory[fromIdx];
      if (!srcItem || srcItem.slot !== target.slot) return false;
      const prev = p.equipment[target.slot] || null;
      p.equipment[target.slot] = srcItem;
      p.inventory[fromIdx] = prev;
      this.trimInventory(p.inventory);
      window.SFX.itemDrop(srcItem.rarity);
      g.recalcStats();
      this.hideTooltip();
      this.renderAll();
      return true;
    }

    if (payload.type === 'equip' && target.type === 'inv') {
      const eqItem = p.equipment[payload.slot];
      const toIdx = target.index;
      if (!eqItem || toIdx < 0 || toIdx >= p.maxInv) return false;
      const dstItem = p.inventory[toIdx] || null;
      if (!dstItem) {
        p.inventory[toIdx] = eqItem;
        p.equipment[payload.slot] = null;
      } else if (dstItem.slot === payload.slot) {
        p.equipment[payload.slot] = dstItem;
        p.inventory[toIdx] = eqItem;
      } else if (this.hasInvSpace(p)) {
        p.equipment[payload.slot] = null;
        this.addInvItem(p, eqItem);
      } else {
        return false;
      }
      this.trimInventory(p.inventory);
      window.SFX.itemDrop(eqItem.rarity);
      g.recalcStats();
      this.hideTooltip();
      this.renderAll();
      return true;
    }

    return false;
  }

  static _parseDragPayload(e) {
    if (e && e.dataTransfer) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) return JSON.parse(raw);
      } catch (_err) {
        // Fallback auf _dragPayload unten
      }
    }
    return this._dragPayload || null;
  }

  static renderInventory() {
    const g = window.Game;
    if (!g) return;
    const p = g.player;

    document.getElementById('inv-gold-amount').textContent = p.gold;

    const equipOrder = [
      { slot: 'helm', label: 'Helm' },
      { slot: 'weapon', label: 'Waffe' },
      { slot: 'armor', label: 'Rüstung' },
      { slot: 'ring', label: 'Ring' },
      { slot: 'boots', label: 'Stiefel' }
    ];
    const eqGrid = document.getElementById('equip-grid');
    eqGrid.innerHTML = '';
    equipOrder.forEach(({ slot, label }) => {
      const div = document.createElement('div');
      div.className = `equip-slot equip-slot-${slot}`;
      const item = p.equipment[slot];
      if (item) {
        div.classList.add(`rarity-border-${item.rarity}`);
        div.appendChild(this.makeItemIcon(item.icon));
        div.draggable = true;
        div.addEventListener('dragstart', (e) => {
          const payload = { type: 'equip', slot };
          this._dragPayload = payload;
          div.classList.add('dragging');
          this.hideTooltip();
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(payload));
          }
        });
        div.addEventListener('dragend', () => {
          div.classList.remove('dragging');
          this._dragPayload = null;
        });
        div.addEventListener('mouseenter', (e) => this.showTooltip(item, e, 'Klicken oder Ziehen zum Ablegen'));
        div.addEventListener('mouseleave', () => this.hideTooltip());
        div.addEventListener('click', () => {
          if (!this.hasInvSpace(p)) return;
          this.addInvItem(p, item);
          p.equipment[slot] = null;
          g.recalcStats();
          this.hideTooltip();
          this.renderAll();
        });
      } else {
        div.innerHTML = `<span class="slot-placeholder">${label}</span>`;
      }

      div.addEventListener('dragover', (e) => {
        const payload = this._dragPayload || this._parseDragPayload(e);
        if (!payload || payload.type !== 'inv') return;
        const srcItem = p.inventory[payload.index];
        if (srcItem && srcItem.slot === slot) {
          e.preventDefault();
          div.classList.add('drag-over-valid');
          div.classList.remove('drag-over-invalid');
        } else {
          div.classList.add('drag-over-invalid');
          div.classList.remove('drag-over-valid');
        }
      });
      div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over-valid', 'drag-over-invalid');
      });
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('drag-over-valid', 'drag-over-invalid');
        const payload = this._parseDragPayload(e);
        this.handleInventoryDrop(payload, { type: 'equip', slot });
      });

      eqGrid.appendChild(div);
    });

    const invGrid = document.getElementById('inv-grid');
    invGrid.innerHTML = '';
    for (let i = 0; i < p.maxInv; i++) {
      const div = document.createElement('div');
      div.className = 'inv-slot';
      const item = p.inventory[i];
      if (item) {
        div.classList.add(`rarity-border-${item.rarity}`);
        div.appendChild(this.makeItemIcon(item.icon));
        div.draggable = true;
        div.addEventListener('dragstart', (e) => {
          const payload = { type: 'inv', index: i };
          this._dragPayload = payload;
          div.classList.add('dragging');
          this.hideTooltip();
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(payload));
          }
        });
        div.addEventListener('dragend', () => {
          div.classList.remove('dragging');
          this._dragPayload = null;
        });

        const shopOpen = document.getElementById('npc-panel').classList.contains('open') &&
                         document.getElementById('shop-section').style.display !== 'none';
        const hint = shopOpen ? `Klicken: Verkaufen (+${Math.max(5, Math.floor(item.price * 0.5))} Gold)` : 'Klicken: Ausrüsten | Ziehen: Verschieben';
        div.addEventListener('mouseenter', (e) => this.showTooltip(item, e, hint));
        div.addEventListener('mouseleave', () => this.hideTooltip());
        div.addEventListener('click', () => {
          const isSelling = document.getElementById('npc-panel').classList.contains('open') &&
                            document.getElementById('shop-section').style.display !== 'none';
          if (isSelling) {
            const sellVal = Math.max(5, Math.floor(item.price * 0.5));
            p.gold += sellVal;
            p.inventory[i] = null;
            this.trimInventory(p.inventory);
            window.SFX.gold();
            this.hideTooltip();
            this.renderAll();
          } else {
            const prev = p.equipment[item.slot] || null;
            p.equipment[item.slot] = item;
            p.inventory[i] = prev;
            this.trimInventory(p.inventory);
            window.SFX.itemDrop(item.rarity);
            g.recalcStats();
            this.hideTooltip();
            this.renderAll();
          }
        });
      }

      div.addEventListener('dragover', (e) => {
        const payload = this._dragPayload || this._parseDragPayload(e);
        if (!payload) return;
        if (payload.type === 'inv' && payload.index === i) return;
        e.preventDefault();
        div.classList.add('drag-over');
      });
      div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
      });
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');
        const payload = this._parseDragPayload(e);
        this.handleInventoryDrop(payload, { type: 'inv', index: i });
      });

      invGrid.appendChild(div);
    }
  }

  static renderCharStats() {
    const g = window.Game;
    if (!g) return;
    const p = g.player;
    const container = document.getElementById('char-stats-content');

    const heroName = p.name || 'Streiter';
    const heroClass = p.archetypeTitle || 'Klingenwächter';
    const maxHp = Math.round(p.maxHp || 100);
    const maxMp = Math.round(p.maxMp || 50);

    let html = `
      <div class="char-hero-banner">
        <div>
          <div class="char-hero-name">${heroName}</div>
          <div class="char-hero-sub">${heroClass} • ${p.xp}/${p.xpNext} XP</div>
        </div>
        <div class="char-level-pill">Stufe ${p.level}</div>
      </div>
      <div class="char-kpi-grid">
        <div class="char-kpi-card">
          <span class="char-kpi-label">Leben</span>
          <span class="char-kpi-value" style="color:#f28b82;">${Math.round(p.hp)} / ${maxHp}</span>
        </div>
        <div class="char-kpi-card">
          <span class="char-kpi-label">Mana</span>
          <span class="char-kpi-value" style="color:#7fb3ff;">${Math.round(p.mp)} / ${maxMp}</span>
        </div>
        <div class="char-kpi-card">
          <span class="char-kpi-label">Schaden</span>
          <span class="char-kpi-value" style="color:#f6d98f;">${p.minDmg} - ${p.maxDmg}</span>
        </div>
        <div class="char-kpi-card">
          <span class="char-kpi-label">Rüstung / Krit</span>
          <span class="char-kpi-value">${p.armor} / ${p.critChance}%</span>
        </div>
      </div>
    `;

    if (p.statPoints > 0) {
      html += `<div class="char-points-banner">Freie Attributpunkte: <b>${p.statPoints}</b> (mit + verteilen)</div>`;
    }

    const attrRows = [
      { label: 'Stärke (+Schaden)', val: p.totalStr, statKey: 'baseStr' },
      { label: 'Vitalität (+Leben)', val: p.totalVit, statKey: 'baseVit' },
      { label: 'Energie (+Mana)', val: p.totalEne ?? p.baseEne, statKey: 'baseEne' },
      { label: 'Geschick (+Krit/Rüst)', val: p.totalDex ?? p.baseDex, statKey: 'baseDex' }
    ];

    const combatRows = [
      { label: 'Skillpunkte (K)', val: p.skillPoints },
      { label: 'Angriffsrate', val: `${p.attackSpeed} / Sek.` },
      { label: 'Klingen-Reichweite', val: `${Math.round((p.cleaveRangeMult || 1) * 100)}%` },
      { label: 'Wirbelwind (RM)', val: g.hasSkillNode('blade_1') ? `${Math.round((p.whirlwindDmgMult || 1.15) * 100)}%` : 'Gesperrt [K]' },
      { label: 'Ausweichrollen', val: `${p.maxDodgeCharges} (${p.dodgeMaxCd.toFixed(2)}s CD)` },
      { label: 'Krit-Schaden', val: `${Math.round((p.critDmgMult || 1.85) * 100)}%` },
      { label: 'Manareg', val: `${(p.manaRegen ?? 0.5).toFixed(1)} / Sek.` }
    ];

    const renderGroup = (title, rows) => {
      let out = `<div class="stat-row-group">${title}</div>`;
      rows.forEach((r) => {
        out += `<div class="stat-row"><span>${r.label}</span><span><b>${r.val}</b>`;
        if (r.statKey && p.statPoints > 0) {
          out += ` <button class="stat-add-btn" data-stat="${r.statKey}">+</button>`;
        }
        out += `</span></div>`;
      });
      return out;
    };

    html += renderGroup('Attribute', attrRows);
    html += renderGroup('Kampfwerte & Synergien', combatRows);
    container.innerHTML = html;

    container.querySelectorAll('.stat-add-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-stat');
        if (p.statPoints > 0) {
          p[key] += 1;
          p.statPoints--;
          g.recalcStats();
          this.renderAll();
          this.updateHUD();
        }
      });
    });
  }

  static openNpcDialog(npc) {
    const g = window.Game;
    const p = g.player;
    const title = document.getElementById('npc-name');
    const text = document.getElementById('npc-text');
    const actions = document.getElementById('npc-actions');
    const shopSec = document.getElementById('shop-section');

    this.openPanel('npc-panel');
    title.textContent = `${npc.name} – ${npc.role}`;
    actions.innerHTML = '';
    shopSec.style.display = 'none';

    if (npc.id === 'aldric') {
      const b = g.activeBounty;
      if (!b) {
        g.generateBounties();
        const hState = g.getBountyTierState('horde');
        const bState = g.getBountyTierState('boss');
        text.innerHTML = `"Die Chroniken rufen nach Taten! Wähle deine nächste Mission:<br>• <b>Horden-Säuberung</b>: Tier ${hState.selectedTier} (freigeschaltet bis Tier ${hState.maxTier})<br>• <b>Exekution (Boss)</b>: Tier ${bState.selectedTier} (freigeschaltet bis Tier ${bState.maxTier})"`;

        g.availableBounties.forEach((bounty) => {
          const card = document.createElement('div');
          card.className = 'bounty-card';
          const tierState = g.getBountyTierState(bounty.type);

          if (tierState.maxTier > 1) {
            const tierRow = document.createElement('div');
            tierRow.className = 'bounty-tier-row';
            const lbl = document.createElement('span');
            lbl.textContent = `${bounty.title} Tier wechseln: `;
            tierRow.appendChild(lbl);

            if (tierState.maxTier <= 8) {
              for (let t = 1; t <= tierState.maxTier; t++) {
                const pill = document.createElement('button');
                pill.className = `tier-pill-btn${t === bounty.tier ? ' active' : ''}`;
                pill.textContent = `T${t}`;
                pill.onclick = () => {
                  g.setBountyTier(bounty.type, t);
                  this.openNpcDialog(npc);
                };
                tierRow.appendChild(pill);
              }
            } else {
              const btnPrev = document.createElement('button');
              btnPrev.className = 'tier-pill-btn';
              btnPrev.textContent = '◄';
              btnPrev.onclick = () => {
                g.setBountyTier(bounty.type, Math.max(1, bounty.tier - 1));
                this.openNpcDialog(npc);
              };
              const cur = document.createElement('span');
              cur.textContent = `T${bounty.tier} / T${tierState.maxTier}`;
              const btnNext = document.createElement('button');
              btnNext.className = 'tier-pill-btn';
              btnNext.textContent = '►';
              btnNext.onclick = () => {
                g.setBountyTier(bounty.type, Math.min(tierState.maxTier, bounty.tier + 1));
                this.openNpcDialog(npc);
              };
              tierRow.appendChild(btnPrev);
              tierRow.appendChild(cur);
              tierRow.appendChild(btnNext);
            }
            card.appendChild(tierRow);
          }

          const btn = document.createElement('button');
          btn.className = 'hud-btn bounty-accept-btn';
          const rewardLabel =
            bounty.type === 'boss'
              ? `${bounty.rewardGold} Gold + 1 seltenes/legendäres Item`
              : `${bounty.rewardGold} Gold + 1 magisches/seltenes Item`;
          const targetLabel =
            bounty.type === 'boss'
              ? 'Malakor der Entfesselte (1 Boss-Kill)'
              : `${bounty.targetKills} Monster in der Düstermark`;
          btn.textContent = `[Tier ${bounty.tier}] ${bounty.title}: ${targetLabel} (x${bounty.difficultyMult.toFixed(2)}) — ${rewardLabel}`;
          btn.onclick = () => {
            g.startBounty(bounty);
            this.updateHUD();
            this.closeNpcPanel();
          };
          card.appendChild(btn);
          actions.appendChild(card);
        });
      } else if (b.status === 'ready_to_turn_in') {
        const state = g.getBountyTierState(b.type);
        const unlocksNext = b.tier >= state.maxTier;
        const rewardLabel =
          b.type === 'boss'
            ? `${b.rewardGold} Gold + 1 seltenes/legendäres Item`
            : `${b.rewardGold} Gold + 1 magisches/seltenes Item`;
        const progressNote = unlocksNext
          ? `Damit wird <b>Tier ${b.tier + 1}</b> für <b>${b.title}</b> freigeschaltet!`
          : `Dein freigeschaltetes Maximum für <b>${b.title}</b> bleibt <b>Tier ${state.maxTier}</b>.`;
        text.innerHTML = `"Ruhmreicher Sieg auf <b>Tier ${b.tier}</b>! Du hast <b>${b.title}</b> (${b.currentKills} / ${b.targetKills}) erfolgreich erfüllt.<br><br>Deine Belohnung liegt bereit: <b>${rewardLabel}</b>.<br>${progressNote}"`;

        const btnClaim = document.createElement('button');
        btnClaim.className = 'hud-btn';
        btnClaim.textContent = 'Belohnung einfordern';
        btnClaim.onclick = () => {
          g.claimActiveBounty();
          this.openNpcDialog(npc);
        };
        actions.appendChild(btnClaim);
      } else {
        const targetLabel =
          b.type === 'boss'
            ? 'Vernichte Boss <b>Malakor den Entfesselten</b> in der Verfluchten Krypta im Osten!'
            : 'Bezwinge die Kreaturen in der <b>Düstermark</b>!';
        text.innerHTML = `"Dein Feldzug auf <b>Tier ${b.tier} (${b.title})</b> läuft!<br>• Fortschritt: <b>${b.currentKills} / ${b.targetKills}</b><br>• Ziel: ${targetLabel}"`;

        const btnTravel = document.createElement('button');
        btnTravel.className = 'hud-btn';
        btnTravel.textContent = 'Sofort in die Düstermark reisen';
        btnTravel.onclick = () => {
          g.changeZone('duestermark');
          this.closeNpcPanel();
        };
        actions.appendChild(btnTravel);

        const btnRespawn = document.createElement('button');
        btnRespawn.className = 'hud-btn';
        btnRespawn.textContent = `Düstermark & Monster für Bounty Tier ${b.tier} neu bevölkern`;
        btnRespawn.onclick = () => {
          g.world.spawnInitialMonsters(b);
          g.addFloatingText(p.x, p.y - 24, `TIER ${b.tier} MONSTER NEU BESCHWOREN!`, '#ff6b6b');
          this.closeNpcPanel();
        };
        actions.appendChild(btnRespawn);

        const btnCancel = document.createElement('button');
        btnCancel.className = 'hud-btn hud-btn-danger';
        btnCancel.textContent = `Aktuelle Mission abbrechen (${b.title} Tier ${b.tier})`;
        btnCancel.onclick = () => {
          g.cancelActiveBounty();
          this.openNpcDialog(npc);
        };
        actions.appendChild(btnCancel);
      }

      const spentPts = g.getSpentSkillPoints();
      const respecCost = g.getRespecCost();
      const btnRespec = document.createElement('button');
      btnRespec.className = 'hud-btn';
      if (spentPts <= 0) {
        btnRespec.disabled = true;
        btnRespec.classList.add('on-cooldown');
        btnRespec.textContent = 'Skill-Tree zurücksetzen (keine Punkte vergeben)';
      } else {
        btnRespec.textContent = `Skill-Tree zurücksetzen (${spentPts} Pkt. – ${respecCost} Gold)`;
      }
      btnRespec.onclick = () => {
        const curSpent = g.getSpentSkillPoints();
        if (curSpent <= 0) {
          g.addFloatingText(p.x, p.y - 24, 'Keine Skillpunkte zum Zurücksetzen vorhanden!', '#ff7b6b');
          return;
        }
        const curCost = g.getRespecCost();
        if (p.gold < curCost) {
          g.addFloatingText(p.x, p.y - 24, `Nicht genug Gold (${curCost} Gold benötigt)!`, '#ff5555');
          return;
        }
        p.gold -= curCost;
        g.respecSkillTree();
        this.openNpcDialog(npc);
      };
      actions.appendChild(btnRespec);
    } else if (npc.id === 'seraphina') {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      g.refillPotionsInTown(true);
      window.SFX.potion();
      text.innerHTML = `"Der Segen der Burgkapelle sei mit dir! Immer wenn du die Festung Rabenstein betrittst, fülle ich deine Heil- und Manatränke automatisch bis zu deiner Gürtel-Kapazität (<b>${p.maxPotions} / 10</b>) auf."`;

      const upgradeCost = g.getPotionCapacityUpgradeCost();
      const btnBelt = document.createElement('button');
      btnBelt.className = 'hud-btn';
      btnBelt.textContent = upgradeCost === null
        ? `Trank-Kapazität auf Maximum (${p.maxPotions}/10)`
        : `Trank-Kapazität dauerhaft +1 erhöhen (${upgradeCost} Gold) [${p.maxPotions} -> ${p.maxPotions + 1}/10]`;
      btnBelt.onclick = () => {
        const curCost = g.getPotionCapacityUpgradeCost();
        if (curCost === null) {
          g.addFloatingText(p.x, p.y - 20, 'Maximale Trank-Kapazität (10/10) erreicht!', '#f2c94c');
          return;
        }
        if (p.gold >= curCost) {
          p.gold -= curCost;
          p.maxPotions++;
          g.refillPotionsInTown(false);
          window.SFX.levelUp();
          this.renderAll();
          this.openNpcDialog(npc);
        } else {
          g.addFloatingText(p.x, p.y - 20, `Nicht genug Gold (${curCost} Gold benötigt)!`, '#ff5555');
        }
      };

      const btnHp = document.createElement('button');
      btnHp.className = 'hud-btn';
      btnHp.textContent = p.potions.hp >= p.maxPotions
        ? `Heiltrank-Vorrat voll (${p.potions.hp}/${p.maxPotions})`
        : `Heiltrank auffüllen (20 Gold) [${p.potions.hp}/${p.maxPotions}]`;
      btnHp.onclick = () => {
        if (p.potions.hp >= p.maxPotions) {
          g.addFloatingText(p.x, p.y - 20, `Trankgürtel voll (max. ${p.maxPotions})!`, '#ff9944');
          return;
        }
        if (p.gold >= 20) {
          p.gold -= 20;
          p.potions.hp = Math.min(p.maxPotions, p.potions.hp + 1);
          window.SFX.gold();
          this.renderAll();
          this.openNpcDialog(npc);
        } else {
          g.addFloatingText(p.x, p.y - 20, 'Nicht genug Gold (20 Gold)!', '#ff5555');
        }
      };

      actions.appendChild(btnBelt);
      actions.appendChild(btnHp);
    } else if (npc.id === 'thorgar') {
      text.innerHTML = `"Willkommen in der Burgschmiede! Beim <b>Glücksspiel (Gamble)</b> brauchst du echtes Glück für seltene Funde – und meine <b>Schmiede-Aufwertung</b> verstärkt nur noch leicht den Grundwert deiner Waffe oder Rüstung (max. +3)."`;
      shopSec.style.display = 'block';
      this.openPanel('char-panel');
      this.openPanel('npc-panel');
      this.renderShopGrid();

      const btnGamble = document.createElement('button');
      btnGamble.className = 'hud-btn';
      btnGamble.textContent = 'Gamble: Zufälliges Item ziehen (90 Gold | Selten 7,5% / Unique 1,5%)';
      btnGamble.onclick = () => {
        if (p.gold < 90) {
          g.addFloatingText(p.x, p.y - 20, 'Nicht genug Gold (90 Gold)!', '#ff5555');
          return;
        }
        if (!this.hasInvSpace(p)) {
          g.addFloatingText(p.x, p.y - 20, 'Inventar voll!', '#ff5555');
          return;
        }
        p.gold -= 90;
        const r = Math.random();
        let rarity = 'common';
        if (r < 0.015) rarity = 'unique';
        else if (r < 0.09) rarity = 'rare';
        else if (r < 0.40) rarity = 'magic';
        const item = window.ItemGenerator.generateItem(p.level, rarity);
        this.addInvItem(p, item);
        window.SFX.itemDrop(item.rarity);
        const colMap = { unique: '#ff9933', rare: '#f5e042', magic: '#5c8aff', common: '#dcdcdc' };
        g.addFloatingText(p.x, p.y - 26, `GEZOGEN: ${item.name}!`, colMap[item.rarity] || '#dcdcdc');
        this.renderAll();
      };

      const wep = p.equipment.weapon;
      const wepRank = wep ? (wep.upgradeRank || 0) : 0;
      const wepCost = wep ? window.ItemGenerator.getUpgradeCost(wep) : 220;
      const btnUpgradeWep = document.createElement('button');
      btnUpgradeWep.className = 'hud-btn';
      btnUpgradeWep.textContent = !wep
        ? 'Ausgerüstete Waffe nachschärfen (keine Waffe)'
        : wepRank >= 3
        ? `Waffe aufwerten (+5% Basis-Schaden) [MAX +3 erreicht]`
        : `Waffe leicht schärfen (+5% Schaden, Stufe ${wepRank + 1}/3 – ${wepCost} Gold)`;
      btnUpgradeWep.onclick = () => {
        if (!p.equipment.weapon) {
          g.addFloatingText(p.x, p.y - 20, 'Keine Waffe ausgerüstet!', '#ff5555');
          return;
        }
        if ((p.equipment.weapon.upgradeRank || 0) >= 3) {
          g.addFloatingText(p.x, p.y - 20, 'Maximale Schmiedestufe (+3) erreicht!', '#ff8855');
          return;
        }
        const cost = window.ItemGenerator.getUpgradeCost(p.equipment.weapon);
        if (p.gold < cost) {
          g.addFloatingText(p.x, p.y - 20, `Nicht genug Gold (${cost} Gold)!`, '#ff5555');
          return;
        }
        p.gold -= cost;
        window.ItemGenerator.upgradeItem(p.equipment.weapon);
        g.recalcStats();
        window.SFX.levelUp();
        g.addFloatingText(p.x, p.y - 26, `LEICHT AUFGEWERTET: ${p.equipment.weapon.name}!`, '#ffdf40');
        this.openNpcDialog(npc);
      };

      const arm = p.equipment.armor;
      const armRank = arm ? (arm.upgradeRank || 0) : 0;
      const armCost = arm ? window.ItemGenerator.getUpgradeCost(arm) : 220;
      const btnUpgradeArmor = document.createElement('button');
      btnUpgradeArmor.className = 'hud-btn';
      btnUpgradeArmor.textContent = !arm
        ? 'Ausgerüstete Rüstung härten (keine Rüstung)'
        : armRank >= 3
        ? `Rüstung aufwerten (+5% Basis-Rüstung) [MAX +3 erreicht]`
        : `Rüstung leicht härten (+5% Rüstung, Stufe ${armRank + 1}/3 – ${armCost} Gold)`;
      btnUpgradeArmor.onclick = () => {
        if (!p.equipment.armor) {
          g.addFloatingText(p.x, p.y - 20, 'Keine Rüstung ausgerüstet!', '#ff5555');
          return;
        }
        if ((p.equipment.armor.upgradeRank || 0) >= 3) {
          g.addFloatingText(p.x, p.y - 20, 'Maximale Schmiedestufe (+3) erreicht!', '#ff8855');
          return;
        }
        const cost = window.ItemGenerator.getUpgradeCost(p.equipment.armor);
        if (p.gold < cost) {
          g.addFloatingText(p.x, p.y - 20, `Nicht genug Gold (${cost} Gold)!`, '#ff5555');
          return;
        }
        p.gold -= cost;
        window.ItemGenerator.upgradeItem(p.equipment.armor);
        g.recalcStats();
        window.SFX.levelUp();
        g.addFloatingText(p.x, p.y - 26, `LEICHT AUFGEWERTET: ${p.equipment.armor.name}!`, '#ffdf40');
        this.openNpcDialog(npc);
      };

      const btnRefresh = document.createElement('button');
      btnRefresh.className = 'hud-btn';
      btnRefresh.textContent = 'Händler-Angebot erneuern (15 Gold)';
      btnRefresh.onclick = () => {
        if (p.gold >= 15) {
          p.gold -= 15;
          g.refreshShop();
          window.SFX.gold();
          this.renderShopGrid();
          this.renderAll();
        }
      };

      actions.appendChild(btnGamble);
      actions.appendChild(btnUpgradeWep);
      actions.appendChild(btnUpgradeArmor);
      actions.appendChild(btnRefresh);
    }
    this.renderAll();
  }

  static renderShopGrid() {
    const g = window.Game;
    const p = g.player;
    const shopGrid = document.getElementById('shop-grid');
    shopGrid.innerHTML = '';

    g.shopInventory.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `inv-slot rarity-border-${item.rarity}`;
      div.appendChild(this.makeItemIcon(item.icon));
      div.addEventListener('mouseenter', (e) => this.showTooltip(item, e, `Kaufen für ${item.price} Gold`));
      div.addEventListener('mouseleave', () => this.hideTooltip());
      div.addEventListener('click', () => {
        if (p.gold < item.price) {
          g.addFloatingText(p.x, p.y - 20, 'Nicht genug Gold!', '#ff5555');
          return;
        }
        if (!this.hasInvSpace(p)) {
          g.addFloatingText(p.x, p.y - 20, 'Inventar voll!', '#ff5555');
          return;
        }
        p.gold -= item.price;
        this.addInvItem(p, item);
        g.shopInventory.splice(idx, 1);
        window.SFX.gold();
        this.hideTooltip();
        this.renderShopGrid();
        this.renderAll();
      });
      shopGrid.appendChild(div);
    });
  }

  static makeItemIcon(spriteKey) {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    c.className = 'slot-icon';
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    if (window.Sprites.cache[spriteKey]) {
      ctx.drawImage(window.Sprites.cache[spriteKey], 0, 0, 32, 32);
    }
    return c;
  }

  static buildItemTooltipBody(item, actionHint = '', headerTag = '') {
    if (!item) return '';
    let baseLine = '';
    if ((item.maxDmg || 0) > 0) baseLine = `Schaden: ${item.minDmg || 0} bis ${item.maxDmg}`;
    else if ((item.armor || 0) > 0) baseLine = `Rüstung: ${item.armor}`;

    const lvlText = item.itemLevel ? ` (Item-Stufe ${item.itemLevel})` : '';
    const propCount = Object.keys(item.mods || {}).length;
    const affixesHtml = (Array.isArray(item.modLines) ? item.modLines : []).map((l) => `<div class="tt-affix">${l}</div>`).join('');
    const loreHtml = item.lore ? `<div class="tt-unique-lore">${item.lore}</div>` : '';
    const tagHtml = headerTag ? `<div class="tt-col-tag">${headerTag}</div>` : '';
    const hintHtml = actionHint ? `<br><span style="color:#a89f8d; font-size:15px;">${actionHint}</span>` : '';

    return `
      ${tagHtml}
      <div class="tt-name rarity-${item.rarity || 'common'}">${item.name || 'Gegenstand'}</div>
      <div class="tt-type">${item.typeName || 'Ausrüstung'}${lvlText} · ${propCount} Eigenschaft${propCount === 1 ? '' : 'en'}</div>
      <div class="tt-base">${baseLine}</div>
      ${affixesHtml}
      ${loreHtml}
      <div class="tt-price">Wert: ${item.price ?? 0} Gold${hintHtml}</div>
    `;
  }

  static buildCompareSummary(item, equipped) {
    if (!item || !window.ItemGenerator || typeof window.ItemGenerator.compareItems !== 'function') {
      return '';
    }
    const cmp = window.ItemGenerator.compareItems(item, equipped || null);
    const fmt = (v) => (v > 0 ? `+${v}` : `${v}`);
    const cls = (v) => (v > 0 ? 'tt-delta-pos' : (v < 0 ? 'tt-delta-neg' : 'tt-delta-zero'));

    let verdictHtml = '';
    if (!cmp.hasEquipped) {
      verdictHtml = `<div class="tt-verdict better">▲ SLOT LEER – KLARE VERBESSERUNG</div>`;
    } else if (cmp.scoreDiff > 0) {
      verdictHtml = `<div class="tt-verdict better">▲ BESSER (Kampfwert ${fmt(cmp.scoreDiff)})</div>`;
    } else if (cmp.scoreDiff < 0) {
      verdictHtml = `<div class="tt-verdict worse">▼ SCHLECHTER (Kampfwert ${fmt(cmp.scoreDiff)})</div>`;
    } else {
      verdictHtml = `<div class="tt-verdict equal">≈ GLEICHWERTIG</div>`;
    }

    const rows = [];
    if ((item.maxDmg || 0) > 0 || (equipped && (equipped.maxDmg || 0) > 0)) {
      rows.push(`<div class="${cls(cmp.dmgDiff)}">Ø Schaden: ${fmt(cmp.dmgDiff)} <span class="tt-delta-sub">(Min ${fmt(cmp.newMinDiff)} / Max ${fmt(cmp.newMaxDiff)})</span></div>`);
    }
    if ((item.armor || 0) > 0 || (equipped && (equipped.armor || 0) > 0)) {
      rows.push(`<div class="${cls(cmp.armorDiff)}">Rüstung: ${fmt(cmp.armorDiff)}</div>`);
    }
    (cmp.statDeltas || []).forEach((d) => {
      if (d.isBinary) {
        if (d.diff > 0) rows.push(`<div class="tt-delta-pos">NEU: ${d.label}</div>`);
        else if (d.diff < 0) rows.push(`<div class="tt-delta-neg">VERLIERT: ${d.label}</div>`);
        else rows.push(`<div class="tt-delta-zero">${d.label} (gleich)</div>`);
      } else {
        rows.push(`<div class="${cls(d.diff)}">${d.label}: ${fmt(d.diff)}${d.unit}</div>`);
      }
    });
    if (cmp.hasEquipped) {
      const pc = cmp.propCountNew - cmp.propCountOld;
      rows.push(`<div class="tt-delta-zero">Eigenschaften: ${cmp.propCountNew} vs. ${cmp.propCountOld} (${fmt(pc)})</div>`);
    }

    return `
      <div class="tt-compare-summary">
        ${verdictHtml}
        <div class="tt-delta-list">${rows.join('')}</div>
      </div>
    `;
  }

  static showTooltip(item, ev, actionHint = '', opts = {}) {
    const tt = document.getElementById('item-tooltip');
    if (!tt || !item) return;
    tt.style.display = 'block';

    const g = window.Game;
    const eqMap = (g && g.player && g.player.equipment) ? g.player.equipment : null;
    const allowCompare = Boolean(opts && opts.compare !== false && eqMap && item.slot);
    const equipped = allowCompare ? (eqMap[item.slot] || null) : null;
    const isEquippedItself = Boolean(
      equipped && (equipped === item || (equipped.uid && item.uid && equipped.uid === item.uid))
    );

    if (allowCompare && !isEquippedItself) {
      tt.classList.add('compare');
      const newCol = this.buildItemTooltipBody(item, actionHint, 'NEUES ITEM');
      const slotName = (window.ItemGenerator && typeof window.ItemGenerator.slotLabel === 'function')
        ? window.ItemGenerator.slotLabel(item.slot)
        : (item.slot || 'Item');
      const eqCol = equipped
        ? this.buildItemTooltipBody(equipped, '', 'AKTUELL ANGELEGT')
        : `<div class="tt-col-tag">AKTUELL ANGELEGT</div><div class="tt-empty-slot">– ${slotName}-Slot ist leer –</div>`;
      tt.innerHTML = `
        ${this.buildCompareSummary(item, equipped)}
        <div class="tt-compare-wrap">
          <div class="tt-col">${newCol}</div>
          <div class="tt-col tt-col-equipped">${eqCol}</div>
        </div>
      `;
    } else {
      tt.classList.remove('compare');
      tt.innerHTML = this.buildItemTooltipBody(item, actionHint, isEquippedItself ? 'ANGELEGT' : '');
    }

    const w = tt.offsetWidth || 290;
    const h = tt.offsetHeight || 220;
    const clientX = (ev && typeof ev.clientX === 'number') ? ev.clientX : 200;
    const clientY = (ev && typeof ev.clientY === 'number') ? ev.clientY : 200;
    const x = Math.max(6, Math.min((window.innerWidth || 1280) - w - 8, clientX + 14));
    const y = Math.max(6, Math.min((window.innerHeight || 720) - h - 8, clientY + 14));
    tt.style.left = `${x}px`;
    tt.style.top = `${y}px`;
  }

  static hideTooltip() {
    const tt = document.getElementById('item-tooltip');
    if (tt) tt.style.display = 'none';
  }
  static initLoadingBar() {
    const box = document.getElementById('asset-loading-box');
    const bar = document.getElementById('asset-loading-bar');
    const text = document.getElementById('asset-loading-text');
    const startBtn = document.getElementById('btn-main-start');
    const sprites = window.Sprites;
    if (!box || !bar || !text || !sprites) return;

    const finishLoading = () => {
      bar.style.width = '100%';
      text.textContent = 'Bereit!';
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.classList.remove('is-loading');
        startBtn.textContent = 'SPIEL STARTEN';
      }
      setTimeout(() => {
        box.classList.add('loaded');
      }, 320);
    };

    if (sprites.ready) {
      finishLoading();
      return;
    }

    if (startBtn) {
      startBtn.disabled = true;
      startBtn.classList.add('is-loading');
      startBtn.textContent = 'LÄDT...';
    }

    sprites.onProgress((loaded, total) => {
      const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 100;
      bar.style.width = `${pct}%`;
      text.textContent = `Lade Grafiken & Welt... ${loaded}/${total} (${pct}%)`;
    });

    sprites.onReady(() => {
      finishLoading();
    });

    // Sicherheits-Fallback, falls ein Browser ein Event verschluckt
    setTimeout(() => {
      if (!box.classList.contains('loaded')) finishLoading();
    }, 5000);
  }
}

window.GameUI = GameUIController;
window.addEventListener('DOMContentLoaded', () => {
  GameUIController.initLoadingBar();
  window.Game = new HackAndSlayGame();
});
