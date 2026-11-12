// Level & World Builder: Szene 1 = Festung Rabenstein (Burg), Szene 2 = Die Düstermark (10x Wildnis + Dungeons + Krypta)
const TILE_SIZE = 32;
const CASTLE_W = 29;
const CASTLE_H = 24;
const MAP_W = 200;
const MAP_H = 140;

// Tile Types:
// 0 = grass, 1 = cobble, 2 = dirt path, 3 = sanctum floor, 4 = stone wall (solid), 5 = dead tree (solid)
class WorldMap {
  constructor(sceneType = 'world') {
    this.sceneType = sceneType;
    this.isCastleScene = sceneType === 'castle';
    this.width = this.isCastleScene ? CASTLE_W : MAP_W;
    this.height = this.isCastleScene ? CASTLE_H : MAP_H;
    this.tiles = [];
    this.variants = [];
    this.torches = [];
    this.props = []; // Chests, barrels, fountain
    this.npcs = [];
    this.monsters = [];
    this.dungeons = [];

    if (this.isCastleScene) {
      this.townBounds = { x1: 4, x2: 24, y1: 2, y2: 21 };
      this.spawnPoint = { x: 13.8 * TILE_SIZE, y: 13.4 * TILE_SIZE };
      this.respawnPoint = { x: 13.8 * TILE_SIZE, y: 13.4 * TILE_SIZE };
      this.defaultPortalTown = { x: 17.6 * TILE_SIZE, y: 11.6 * TILE_SIZE };
      this.questPortal = { x: 21.4 * TILE_SIZE, y: 11.6 * TILE_SIZE, radius: 24 };
      this.tilemapScale = 2; // Crisp 64px/tile for the compact castle scene (1856x1536)
    } else {
      this.townBounds = null;
      this.returnPortal = { x: 10.5 * TILE_SIZE, y: 69.5 * TILE_SIZE, radius: 24 };
      this.duestermarkGate = { x: 14.5 * TILE_SIZE, y: 69.5 * TILE_SIZE };
      this.defaultPortalWild = { x: 14.5 * TILE_SIZE, y: 69.5 * TILE_SIZE };
      this.kryptaEntrance = { x: 169 * TILE_SIZE, y: 69.5 * TILE_SIZE };
      this.bossSpawn = { x: 183.5 * TILE_SIZE, y: 69.5 * TILE_SIZE };
      this.tilemapScale = 1; // 32px/tile for the 200x140 world map (6400x4480px)
    }

    this.seed = (Date.now() ^ 0x9e3779b9) >>> 0;
    this._rngState = this.seed;
    this.worldPacks = [];
    this.tilemapCanvas = null;
    this.buildLevel();

    if (window.Sprites) {
      window.Sprites.onReady(() => this.buildSeamlessTilemap());
    }
  }

  setSeed(seed) {
    this.seed = (seed >>> 0) || 1;
    this._rngState = this.seed;
  }

  rand() {
    let t = (this._rngState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  randInt(min, max) {
    return Math.floor(this.rand() * (max - min + 1)) + min;
  }

  pick(arr) {
    return arr[Math.floor(this.rand() * arr.length)];
  }

  shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  regenerateWorld(seed = null, activeBounty = null) {
    if (this.isCastleScene) return;
    const nextSeed = seed != null ? seed : ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0);
    this.setSeed(nextSeed);
    this.buildLevel();
    this.spawnInitialMonsters(activeBounty);
    if (window.Sprites) {
      window.Sprites.onReady(() => this.buildSeamlessTilemap());
    }
  }

  // Helper: effective ground terrain under tile (so walls inside Town/Dungeons/Sanctum blend with their floor)
  getEffectiveGround(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
    const t = this.tiles[y][x];
    if (t === 1 || t === 2 || t === 3) return t;
    if (t === 4) {
      if (this.isCastleScene && this.townBounds) {
        const tb = this.townBounds;
        if (x >= tb.x1 && x <= tb.x2 && y >= tb.y1 && y <= tb.y2) return 1; // Town wall sits on cobblestone
      }
      if (!this.isCastleScene) {
        if (x >= 6 && x <= 15 && y >= 65 && y <= 74) return 1; // Arrival shrine cobble
        for (let i = 0; i < this.dungeons.length; i++) {
          const d = this.dungeons[i];
          if (x >= d.x1 && x <= d.x2 && y >= d.y1 && y <= d.y2) {
            return d.floorType || 3;
          }
        }
      }
    }
    return 0; // Grass
  }

  buildSeamlessTilemap() {
    const sp = window.Sprites.cache;
    if (!sp.sheet_tile_grass || !sp.sheet_tile_dirt || !sp.sheet_tile_cobble || !sp.sheet_tile_sanctum) return;

    const S = TILE_SIZE * this.tilemapScale; // 32px per tile at scale 1
    const uvScale = 128 / S;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = this.width * S;
    mapCanvas.height = this.height * S;
    const ctx = mapCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. BASE LAYER: Continuous seamless Grass across the entire world (4x4 tile blocks = zero tile grid!)
    const blockPx = S * 4;
    for (let by = 0; by < mapCanvas.height; by += blockPx) {
      for (let bx = 0; bx < mapCanvas.width; bx += blockPx) {
        ctx.drawImage(sp.sheet_tile_grass, 0, 0, 512, 512, bx, by, blockPx, blockPx);
      }
    }

    // Subtle world-space moss & shadow blotches to break up 4x4 grass repetition organically
    ctx.save();
    for (let y = 0; y < this.height; y += 3) {
      for (let x = 0; x < this.width; x += 3) {
        const h = ((x * 73 + y * 151 + (x ^ y) * 31) % 100);
        if (h < 22) {
          ctx.fillStyle = h < 11 ? 'rgba(18, 34, 16, 0.14)' : 'rgba(8, 12, 10, 0.12)';
          ctx.beginPath();
          ctx.ellipse(x * S + S * 1.5, y * S + S * 1.5, S * 2.2, S * 1.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // Helper: scale each 512x512 sheet to exact 4x4 world tile block size (blockPx x blockPx) for seamless createPattern repeat
    const makePatternCanvas = (srcSheet) => {
      const pc = document.createElement('canvas');
      pc.width = blockPx;
      pc.height = blockPx;
      const pctx = pc.getContext('2d');
      pctx.imageSmoothingEnabled = true;
      pctx.imageSmoothingQuality = 'high';
      pctx.drawImage(srcSheet, 0, 0, 512, 512, 0, 0, blockPx, blockPx);
      return pc;
    };

    // Reusable full-map layer canvas for organic, corner-free terrain masking
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = mapCanvas.width;
    layerCanvas.height = mapCanvas.height;
    const lctx = layerCanvas.getContext('2d');
    lctx.imageSmoothingEnabled = true;
    lctx.imageSmoothingQuality = 'high';

    const hash2 = (ax, ay, salt = 0) => {
      const n = Math.sin(ax * 127.1 + ay * 311.7 + salt * 74.7) * 43758.5453123;
      return n - Math.floor(n);
    };

    // 2. OVERLAY TERRAIN LAYERS WITH ORGANIC NOISE-WARPED SILHOUETTES (ZERO SQUARE EDGES!)
    const layers = [
      { id: 2, sheet: sp.sheet_tile_dirt, isSoftDirt: true },
      { id: 1, sheet: sp.sheet_tile_cobble, isStoneEdge: true, stonePalette: ['#4a434f', '#3c3642', '#574f5c', '#332d38'] },
      { id: 3, sheet: sp.sheet_tile_sanctum, isStoneEdge: true, stonePalette: ['#4a2531', '#3b1c26', '#592e3b', '#2e141c'] }
    ];

    const hasTerrain = (tx, ty, id) => {
      const g = this.getEffectiveGround(tx, ty);
      // Dirt also connects smoothly under Cobblestone and Sanctum gates
      if (id === 2 && (g === 1 || g === 3)) return true;
      return g === id;
    };

    const drawSoftBlob = (targetCtx, cx, cy, r, feather = 0.45) => {
      if (typeof targetCtx.createRadialGradient === 'function') {
        const g = targetCtx.createRadialGradient(cx, cy, r * (1 - feather), cx, cy, r);
        g.addColorStop(0, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.65, 'rgba(255, 255, 255, 0.85)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        targetCtx.fillStyle = g;
      } else {
        targetCtx.fillStyle = '#ffffff';
      }
      targetCtx.beginPath();
      targetCtx.arc(cx, cy, r, 0, Math.PI * 2);
      targetCtx.fill();
    };

    layers.forEach(({ id, sheet, isSoftDirt, isStoneEdge, stonePalette }) => {
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);

      const borderTiles = [];

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (!hasTerrain(x, y, id)) continue;

          const hasN  = hasTerrain(x, y - 1, id);
          const hasNE = hasTerrain(x + 1, y - 1, id);
          const hasE  = hasTerrain(x + 1, y, id);
          const hasSE = hasTerrain(x + 1, y + 1, id);
          const hasS  = hasTerrain(x, y + 1, id);
          const hasSW = hasTerrain(x - 1, y + 1, id);
          const hasW  = hasTerrain(x - 1, y, id);
          const hasNW = hasTerrain(x - 1, y - 1, id);

          const isInterior = hasN && hasNE && hasE && hasSE && hasS && hasSW && hasW && hasNW;
          const cx = (x + 0.5) * S;
          const cy = (y + 0.5) * S;

          if (isInterior) {
            lctx.fillStyle = '#ffffff';
            lctx.fillRect(x * S - 0.5, y * S - 0.5, S + 1, S + 1);
            continue;
          }

          borderTiles.push({ x, y, cx, cy, hasN, hasE, hasS, hasW });

          const jx = (hash2(x, y, id + 1) - 0.5) * S * 0.24;
          const jy = (hash2(x, y, id + 2) - 0.5) * S * 0.24;
          const rMain = S * ((isSoftDirt ? 0.86 : 0.66) + hash2(x, y, id + 3) * 0.16);
          const feather = isSoftDirt ? 0.58 : 0.34;

          // Center organic blob
          drawSoftBlob(lctx, cx + jx, cy + jy, rMain, feather);

          // Bridge blobs to connected E, S, SE neighbors to round all inner/outer corners naturally
          if (hasE) {
            const bx = cx + S * 0.5 + (hash2(x, y, 11) - 0.5) * S * 0.14;
            const by = cy + (hash2(x, y, 12) - 0.5) * S * 0.18;
            drawSoftBlob(lctx, bx, by, S * (isSoftDirt ? 0.78 : 0.62), feather);
          }
          if (hasS) {
            const bx = cx + (hash2(x, y, 13) - 0.5) * S * 0.18;
            const by = cy + S * 0.5 + (hash2(x, y, 14) - 0.5) * S * 0.14;
            drawSoftBlob(lctx, bx, by, S * (isSoftDirt ? 0.78 : 0.62), feather);
          }
          if (hasE && hasS && hasSE) {
            const bx = cx + S * 0.5;
            const by = cy + S * 0.5;
            drawSoftBlob(lctx, bx, by, S * (isSoftDirt ? 0.72 : 0.58), feather);
          }

          // Fine high-frequency peripheral tufts/splats on exposed sides (zero coarse blobs!)
          const splatDirs = [
            [!hasN, 0, -1],
            [!hasS, 0, 1],
            [!hasW, -1, 0],
            [!hasE, 1, 0]
          ];
          splatDirs.forEach(([exposed, dx, dy], dIdx) => {
            if (!exposed) return;
            const count = isSoftDirt ? 6 : 4;
            for (let k = 0; k < count; k++) {
              const tang = ((k + 0.5) / count - 0.5) * S * 0.96 + (hash2(x * 3 + k, y * 5 + dIdx, 21) - 0.5) * S * 0.28;
              const push = S * ((isSoftDirt ? 0.44 : 0.36) + hash2(x + k, y + dIdx, 22) * (isSoftDirt ? 0.32 : 0.22));
              const sx = cx + dx * push + (dy !== 0 ? tang : 0);
              const sy = cy + dy * push + (dx !== 0 ? tang : 0);
              const sr = S * ((isSoftDirt ? 0.11 : 0.12) + hash2(x + dIdx, y + k, 23) * 0.13);
              drawSoftBlob(lctx, sx, sy, sr, isSoftDirt ? 0.52 : 0.38);
            }
          });
        }
      }

      // Fill the organic silhouette with the seamless repeating terrain texture
      lctx.globalCompositeOperation = 'source-in';
      const patCanvas = makePatternCanvas(sheet);
      const pat = typeof lctx.createPattern === 'function' ? lctx.createPattern(patCanvas, 'repeat') : null;
      if (pat) {
        lctx.fillStyle = pat;
        lctx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      } else {
        for (let by = 0; by < layerCanvas.height; by += blockPx) {
          for (let bx = 0; bx < layerCanvas.width; bx += blockPx) {
            lctx.drawImage(patCanvas, 0, 0, blockPx, blockPx, bx, by, blockPx, blockPx);
          }
        }
      }
      lctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(layerCanvas, 0, 0);

      // Add fine grass-blade tufts & dirt pebbles along dirt-grass borders
      if (isSoftDirt) {
        ctx.save();
        const sc = this.tilemapScale;
        borderTiles.forEach(({ x, y, cx, cy, hasN, hasE, hasS, hasW }) => {
          const edges = [
            [!hasN, 0, -1],
            [!hasS, 0, 1],
            [!hasW, -1, 0],
            [!hasE, 1, 0]
          ];
          edges.forEach(([exposed, dx, dy], eIdx) => {
            if (!exposed) return;
            // Small dirt clods & pebbles on the outer edge
            for (let k = 0; k < 5; k++) {
              const along = ((k + 0.5) / 5 - 0.5) * S * 0.96 + (hash2(x + k, y, eIdx + 61) - 0.5) * S * 0.22;
              const out = S * (0.44 + hash2(x, y + k, eIdx + 62) * 0.30);
              const px = cx + dx * out + (dy !== 0 ? along : 0);
              const py = cy + dy * out + (dx !== 0 ? along : 0);
              const pr = (1.1 + hash2(x + k, y + eIdx, 63) * 1.5) * sc;
              ctx.fillStyle = (k % 2 === 0) ? 'rgba(54, 40, 26, 0.72)' : 'rgba(74, 56, 38, 0.65)';
              ctx.beginPath();
              ctx.arc(px, py, pr, 0, Math.PI * 2);
              ctx.fill();
            }
            // Tiny crisp pixel grass tufts overlapping the dirt edge
            for (let k = 0; k < 4; k++) {
              const along = ((k + 0.5) / 4 - 0.5) * S * 0.9 + (hash2(x, y + k, eIdx + 71) - 0.5) * S * 0.24;
              const out = S * (0.48 + hash2(x + k, y, eIdx + 72) * 0.26);
              const gx = cx + dx * out + (dy !== 0 ? along : 0);
              const gy = cy + dy * out + (dx !== 0 ? along : 0);
              ctx.fillStyle = (k % 2 === 0) ? '#1c361a' : '#2a4a24';
              const bw = Math.max(1, Math.round(1.2 * sc));
              const bh = Math.max(2, Math.round(2.8 * sc));
              ctx.fillRect(Math.round(gx - bw), Math.round(gy - bh), bw, bh);
              ctx.fillRect(Math.round(gx + bw * 0.5), Math.round(gy - bh * 0.8), bw, bh);
            }
          });
        });
        ctx.restore();
      }

      // Paint textured chiseled border cobblestones / edge stones & gravel along exposed stone rims
      if (isStoneEdge && stonePalette) {
        ctx.save();
        const sc = this.tilemapScale;
        const stonePat = typeof ctx.createPattern === 'function' ? ctx.createPattern(patCanvas, 'repeat') : null;
        borderTiles.forEach(({ x, y, cx, cy, hasN, hasE, hasS, hasW }) => {
          const edges = [
            [!hasN, 0, -1],
            [!hasS, 0, 1],
            [!hasW, -1, 0],
            [!hasE, 1, 0]
          ];
          edges.forEach(([exposed, dx, dy], eIdx) => {
            if (!exposed) return;
            const count = 4;
            for (let k = 0; k < count; k++) {
              const along = ((k + 0.5) / count - 0.5) * S * 0.96 + (hash2(x + k, y, eIdx + 40) - 0.5) * S * 0.16;
              const out = S * (0.38 + hash2(x, y + k, eIdx + 41) * 0.18);
              const sx = cx + dx * out + (dy !== 0 ? along : 0);
              const sy = cy + dy * out + (dx !== 0 ? along : 0);
              const rw = S * (0.12 + hash2(x + k, y + eIdx, 42) * 0.08);
              const rh = S * (0.09 + hash2(x + eIdx, y + k, 43) * 0.06);
              const ang = (hash2(x, y, k * 7 + eIdx) - 0.5) * 0.65;

              // Build irregular 6-vertex stone polygon
              const pts = [];
              for (let v = 0; v < 6; v++) {
                const va = (v / 6) * Math.PI * 2;
                const vr = 0.78 + hash2(x * 7 + v, y * 11 + k, eIdx + 50) * 0.34;
                pts.push([Math.cos(va) * rw * vr, Math.sin(va) * rh * vr]);
              }

              ctx.save();
              ctx.translate(sx, sy);
              ctx.rotate(ang);

              // Soft drop shadow
              ctx.fillStyle = 'rgba(0, 0, 0, 0.44)';
              ctx.beginPath();
              pts.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px + sc, py + 1.5 * sc) : ctx.lineTo(px + sc, py + 1.5 * sc)));
              ctx.closePath();
              ctx.fill();

              // Textured stone body sampled from real cobble/sanctum pattern
              ctx.beginPath();
              pts.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
              ctx.closePath();
              ctx.fillStyle = stonePat || stonePalette[(x * 5 + y * 3 + k + eIdx) % stonePalette.length];
              ctx.fill();
              // Subtle per-stone tint variation + dark mortar outline + top bevel
              ctx.fillStyle = (k % 2 === 0) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)';
              ctx.fill();
              ctx.strokeStyle = '#151118';
              ctx.lineWidth = Math.max(1, 1.0 * sc);
              ctx.stroke();
              ctx.restore();

              // Tiny gravel pebble & moss fleck tucked beside the curb stone
              if (k % 2 === 0) {
                const gx = sx + (hash2(x, k, 81) - 0.5) * S * 0.26;
                const gy = sy + dy * (rh * 1.15) + (hash2(y, k, 82) - 0.5) * S * 0.14;
                ctx.fillStyle = (x + k) % 3 === 0 ? 'rgba(34, 58, 30, 0.7)' : 'rgba(65, 58, 70, 0.8)';
                ctx.beginPath();
                ctx.arc(gx, gy, (1.2 + hash2(x + k, y, 83) * 1.1) * sc, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        });
        ctx.restore();
      }
    });

    // 3. BAKE SOFT AMBIENT OCCLUSION GROUND SHADOWS AROUND WALLS
    const aoPad = Math.round(4 * this.tilemapScale);
    const aoH = Math.round(9 * this.tilemapScale);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] === 4) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fillRect(x * S - aoPad, (y + 1) * S - aoPad, S + aoPad * 2, aoH);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fillRect(x * S - aoPad / 2, (y + 1) * S - aoPad / 2, S + aoPad, aoH * 0.65);
        }
      }
    }

    this.tilemapCanvas = mapCanvas;
  }

  buildDungeonStructure(cfg) {
    const { x1, y1, x2, y2, floorType = 3, entrances = [], pillars = [], torches = [] } = cfg;
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const isWall = (x === x1 || x === x2 || y === y1 || y === y2);
        const isEntrance = entrances.some((e) => x >= e.x1 && x <= e.x2 && y >= e.y1 && y <= e.y2);
        if (isWall && !isEntrance) {
          this.tiles[y][x] = 4;
        } else {
          this.tiles[y][x] = floorType;
        }
      }
    }
    pillars.forEach(([px, py]) => {
      if (this.tiles[py] && this.tiles[py][px] !== undefined) {
        this.tiles[py][px] = 4;
      }
    });
    torches.forEach(([tx, ty]) => {
      const px = Math.round(tx * TILE_SIZE + 16);
      const py = Math.round(ty * TILE_SIZE + 16);
      if (!this.isSolidTile(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE))) {
        this.torches.push({ x: px, y: py, radius: 11, solid: true });
      }
    });
    this.dungeons.push({
      id: cfg.id,
      name: cfg.name,
      zoneLabel: cfg.zoneLabel,
      x1,
      y1,
      x2,
      y2,
      floorType,
      dangerLevel: cfg.dangerLevel || 2,
      isBossSanctum: !!cfg.isBossSanctum
    });
  }

  buildLevel() {
    this.dungeons = [];
    this.torches = [];
    this.props = [];
    this.npcs = [];
    this.monsters = [];
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      this.variants[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = 0;
        this.variants[y][x] = (x * 7 + y * 13) % 4;
        // Outer border trees/walls
        if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
          this.tiles[y][x] = 5;
        }
      }
    }

    if (this.isCastleScene) {
      this.buildCastleLevel();
    } else {
      this.buildWorldLevel();
    }
  }

  buildCastleLevel() {
    // FESTUNG RABENSTEIN (ORGANISCHE BASTION-BURG - SEPARATE SZENE)
    const tb = this.townBounds;
    const isInsideBastion = (x, y) => {
      if (x < tb.x1 || x > tb.x2 || y < tb.y1 || y > tb.y2) return false;
      // Abgeschrägte Bastions-Ecken statt hartem Rechteck
      if (x === tb.x1 && (y === tb.y1 || y === tb.y2)) return false;
      if (x === tb.x2 && (y === tb.y1 || y === tb.y2)) return false;
      return true;
    };

    // 1) Innenhof-Basis: Naturboden/Erde + moosige Gras-Inseln in ruhigen Ecken
    for (let y = tb.y1; y <= tb.y2; y++) {
      for (let x = tb.x1; x <= tb.x2; x++) {
        if (!isInsideBastion(x, y)) continue;
        // Prüfen, ob Nachbar außerhalb der Bastion liegt -> Außenmauer
        const wallEdge =
          !isInsideBastion(x - 1, y) || !isInsideBastion(x + 1, y) ||
          !isInsideBastion(x, y - 1) || !isInsideBastion(x, y + 1);
        if (wallEdge) {
          this.tiles[y][x] = 4;
        } else {
          // Organischer Boden-Mix aus Erde (2) und Grasflächen (0)
          const cornerGrass =
            (x <= 12 && y >= 15) || // Kapellen-Kräutergarten im Südwesten
            (x >= 18 && y <= 6) ||  // Nordost-Grünfläche neben Bergfried
            (x >= 17 && y >= 17);   // Südost-Ecke
          this.tiles[y][x] = cornerGrass ? 0 : 2;
        }
      }
    }

    // 2) Organische Kopfsteinpflaster-Plätze & geschwungene Wege im Burghof
    const paintDisc = (cx, cy, rx, ry, tileId) => {
      for (let y = tb.y1 + 1; y < tb.y2; y++) {
        for (let x = tb.x1 + 1; x < tb.x2; x++) {
          if (this.tiles[y][x] === 4) continue;
          const d = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
          if (d <= 1.0) this.tiles[y][x] = tileId;
        }
      }
    };
    paintDisc(14.0, 11.6, 4.4, 3.2, 1); // Zentraler Brunnenplatz
    paintDisc(15.5, 6.2, 3.6, 2.5, 1);  // Bergfried-Vorplatz
    paintDisc(8.2, 8.0, 2.8, 2.4, 1);   // Schmiede-Arbeitsplatz
    paintDisc(8.2, 15.2, 2.6, 2.2, 1);  // Kapellen-Vorplatz
    paintDisc(21.2, 11.6, 3.3, 3.5, 1); // Großer Portal-Alkovenplatz
    paintDisc(21.4, 11.6, 1.8, 1.9, 3); // Runenstein-Altar direkt unter dem Quest-Portal

    // Geschwungene Pflaster- & Erdwege zwischen den Gebäuden
    for (let x = 8; x <= 21; x++) {
      const py = Math.round(11.4 + Math.sin(x * 0.45) * 0.6);
      this.tiles[py][x] = 1;
      if (this.tiles[py + 1][x] !== 4) this.tiles[py + 1][x] = 1;
    }
    for (let y = 7; y <= 16; y++) {
      if (this.tiles[y][8] !== 4) this.tiles[y][8] = 1;
      if (this.tiles[y][9] !== 4) this.tiles[y][9] = 1;
    }
    for (let y = 6; y <= 12; y++) {
      if (this.tiles[y][15] !== 4) this.tiles[y][15] = 1;
    }

    // 3) Organische Bäume außerhalb der Burgmauer (mit kleinem Lichtungs-Puffer um die Mauer)
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (x >= tb.x1 - 1 && x <= tb.x2 + 1 && y >= tb.y1 - 1 && y <= tb.y2 + 1) continue;
        const hash = (x * 41 + y * 67 + (x ^ y) * 19) % 100;
        if (hash < 24) this.tiles[y][x] = 5;
      }
    }

    // 4) Fackeln organisch entlang der Wege, Gebäude, Garten & symmetrischer Portal-Alkoven
    const castleTorches = [
      [5.4, 8.6], [12.8, 8.4], [20.6, 5.6], [11.0, 13.4],
      [5.4, 15.0], [14.6, 16.2],
      // Zeremonielle Fackeln rund um das Quest-Portal (ohne Statuen, Türme oder Portal zu verdecken)
      [17.6, 9.4], [17.6, 14.0], [22.0, 8.2], [22.0, 14.8]
    ];
    castleTorches.forEach(([tx, ty]) => {
      const px = Math.round(tx * TILE_SIZE + 16);
      const py = Math.round(ty * TILE_SIZE + 16);
      if (!this.isSolidTile(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE))) {
        this.torches.push({ x: px, y: py, radius: 11, solid: true });
      }
    });

    // 5) Burggebäude: Bergfried, Burgschmiede, Burgkapelle (realistisch skaliert passend zu NPCs)
    this.props.push({
      type: 'castle_keep',
      x: 15.5 * TILE_SIZE,
      y: 5.8 * TILE_SIZE,
      w: 168,
      h: 226,
      halfW: 68,
      halfH: 34,
      radius: 52,
      solid: true
    });
    this.props.push({
      type: 'castle_smithy',
      x: 8.8 * TILE_SIZE,
      y: 6.8 * TILE_SIZE,
      w: 138,
      h: 184,
      halfW: 54,
      halfH: 30,
      radius: 42,
      solid: true
    });
    this.props.push({
      type: 'castle_chapel',
      x: 8.8 * TILE_SIZE,
      y: 15.8 * TILE_SIZE,
      w: 132,
      h: 238,
      halfW: 52,
      halfH: 32,
      radius: 42,
      solid: true
    });

    // 6) Detail-Requisiten & realistische Burghof-Assets
    this.props.push({
      type: 'prop_smithy_rack',
      x: 11.6 * TILE_SIZE,
      y: 8.8 * TILE_SIZE,
      w: 52,
      h: 57,
      radius: 16,
      solid: true
    });
    [12.0, 19.0].forEach((bx) => {
      this.props.push({
        type: 'prop_keep_banner',
        x: bx * TILE_SIZE,
        y: 6.4 * TILE_SIZE,
        w: 22,
        h: 72,
        radius: 10,
        solid: true
      });
    });
    this.props.push({
      type: 'prop_chapel_shrine',
      x: 11.6 * TILE_SIZE,
      y: 16.2 * TILE_SIZE,
      w: 44,
      h: 67,
      radius: 16,
      solid: true
    });

    // Versorgungs-/Händlerwagen in der südöstlichen Hofecke (klar getrennt von den Kräuterbeeten)
    this.props.push({
      type: 'prop_supply_wagon',
      x: 17.6 * TILE_SIZE,
      y: 18.8 * TILE_SIZE,
      w: 88,
      h: 78,
      radius: 26,
      solid: true
    });

    // Zwei gotische Ritter-Wächterstatuen flankieren den Quest-Portal-Platz ohne Verdeckung
    [9.1, 14.1].forEach((sy) => {
      this.props.push({
        type: 'prop_knight_statue',
        x: 19.1 * TILE_SIZE,
        y: sy * TILE_SIZE,
        w: 44,
        h: 82,
        radius: 15,
        solid: true
      });
    });

    // Zwei Kräuter- & Rosenbeete im westlichen Kapellen-Garten
    [
      [11.4, 18.2],
      [7.8, 19.2]
    ].forEach(([gx, gy]) => {
      this.props.push({
        type: 'prop_herb_garden',
        x: gx * TILE_SIZE,
        y: gy * TILE_SIZE,
        w: 76,
        h: 58,
        radius: 22,
        solid: true
      });
    });

    // Zierfässer rund um Schmiede & Versorgungswagen (mit Abstand zu allen Props)
    [[5.2, 11.2], [5.2, 12.6], [15.0, 19.0], [19.8, 19.0]].forEach(([bx, by]) => {
      this.props.push({
        type: 'barrel',
        x: bx * TILE_SIZE + 16,
        y: by * TILE_SIZE + 16,
        broken: false
      });
    });

    // 7) 6 Wachtürme an den Bastions-Ecken & am Portal-Vorbau
    [
      [5.0, 3.6],
      [23.8, 3.6],
      [5.0, 20.6],
      [23.8, 20.6],
      [24.0, 8.6],
      [24.0, 14.6]
    ].forEach(([tx, ty]) => {
      this.props.push({
        type: 'castle_tower',
        x: tx * TILE_SIZE,
        y: ty * TILE_SIZE,
        w: 76,
        h: 163,
        radius: 24,
        solid: true
      });
    });

    // Heilbrunnen auf dem zentralen Platz
    this.props.push({
      type: 'fountain',
      x: 13.8 * TILE_SIZE,
      y: 11.2 * TILE_SIZE,
      radius: 26,
      solid: true
    });

    // NPCs in Festung Rabenstein
    this.npcs = [
      {
        id: 'aldric',
        name: 'Chronist Aldric',
        role: 'Hüter der Schriften & Questgeber',
        sprite: 'npc_elder',
        x: 15.5 * TILE_SIZE,
        y: 7.4 * TILE_SIZE,
        indicator: '!'
      },
      {
        id: 'thorgar',
        name: 'Meisterschmied Thorgar',
        role: 'Rüst- & Waffenschmied',
        sprite: 'npc_smith',
        x: 8.8 * TILE_SIZE,
        y: 8.6 * TILE_SIZE,
        indicator: '$'
      },
      {
        id: 'seraphina',
        name: 'Priesterin Seraphina',
        role: 'Heilerin der Burgkapelle',
        sprite: 'npc_healer',
        x: 8.8 * TILE_SIZE,
        y: 17.3 * TILE_SIZE,
        indicator: '+'
      }
    ];
  }

  buildWorldLevel() {
    this._rngState = this.seed || 1;
    this.worldPacks = [];
    const roadTiles = new Set();
    const markRoad = (x, y) => {
      if (x < 2 || x >= this.width - 2 || y < 2 || y >= this.height - 2) return;
      this.tiles[y][x] = 2;
      roadTiles.add(`${x},${y}`);
    };
    const paintRoadBrush = (cx, cy, radius = 1) => {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= radius + 1) {
            markRoad(cx + dx, cy + dy);
          }
        }
      }
    };

    // 1. BUILD WESTERN ARRIVAL SHRINE (Ankunftsschrein der Düstermark, x: 6..15, y: 65..74)
    for (let y = 65; y <= 74; y++) {
      for (let x = 6; x <= 15; x++) {
        this.tiles[y][x] = 1; // Cobblestone Waypoint Platform
      }
    }
    [[6, 65], [15, 65], [6, 74], [15, 74]].forEach(([px, py]) => {
      this.tiles[py][px] = 4; // 4 Eckpfeiler
    });

    // 2. PROCEDURAL WINDING ROYAL ROAD & CROSSROADS
    const kryptaCenterY = this.randInt(50, 88);
    const kyrH = 26;
    const kyrY1 = kryptaCenterY - Math.floor(kyrH / 2);
    const kyrY2 = kyrY1 + kyrH;
    const kyrX1 = 172;
    const kyrX2 = 193;

    // Update dynamic Boss-Krypta anchors for portals & boss spawn
    this.kryptaEntrance = { x: 169 * TILE_SIZE, y: kryptaCenterY * TILE_SIZE };
    this.bossSpawn = { x: 183.5 * TILE_SIZE, y: kryptaCenterY * TILE_SIZE };

    // Winding Königsstraße from Arrival Shrine (x: 15, y: 69) to Krypta (x: 172, y: kryptaCenterY)
    const roadYAtX = new Array(this.width).fill(69);
    const amp1 = (this.rand() * 2 - 1) * 9;
    const amp2 = (this.rand() * 2 - 1) * 5;
    const phase1 = this.rand() * Math.PI * 2;
    const phase2 = this.rand() * Math.PI * 2;
    for (let x = 15; x <= kyrX1; x++) {
      const t = (x - 15) / (kyrX1 - 15);
      const baseLine = 69.5 + (kryptaCenterY - 69.5) * t;
      const envelope = Math.sin(t * Math.PI); // 0 at both endpoints
      const wave = (Math.sin(t * Math.PI * 2.2 + phase1) * amp1 + Math.sin(t * Math.PI * 4.5 + phase2) * amp2) * envelope;
      const ry = Math.max(24, Math.min(this.height - 25, Math.round(baseLine + wave)));
      roadYAtX[x] = ry;
      paintRoadBrush(x, ry, 1);
      if (x > 15 && Math.abs(roadYAtX[x] - roadYAtX[x - 1]) > 1) {
        const step = roadYAtX[x] > roadYAtX[x - 1] ? 1 : -1;
        for (let yy = roadYAtX[x - 1]; yy !== roadYAtX[x]; yy += step) {
          paintRoadBrush(x, yy, 1);
        }
      }
    }

    // 3 randomized North-South Crossroads
    const crossDefs = [
      { baseX: this.randInt(38, 48), yTop: this.randInt(20, 29), yBot: this.randInt(110, 118) },
      { baseX: this.randInt(88, 102), yTop: this.randInt(18, 27), yBot: this.randInt(112, 120) },
      { baseX: this.randInt(136, 150), yTop: this.randInt(22, 33), yBot: this.randInt(106, 116) }
    ];
    const crossRoads = [];
    crossDefs.forEach((cd) => {
      const roadMap = new Map();
      const crossPhase = this.rand() * Math.PI * 2;
      const crossAmp = (this.rand() * 2 - 1) * 3.5;
      for (let y = cd.yTop; y <= cd.yBot; y++) {
        const t = (y - cd.yTop) / (cd.yBot - cd.yTop);
        const rx = Math.round(cd.baseX + Math.sin(t * Math.PI * 2 + crossPhase) * crossAmp);
        roadMap.set(y, rx);
        paintRoadBrush(rx, y, 1);
      }
      crossRoads.push({ ...cd, roadMap });
    });

    // Helper: connect a dungeon entrance cleanly to a target road coordinate
    const carveSpurPath = (sx, sy, tx, ty) => {
      let cx = sx;
      let cy = sy;
      while (cy !== ty) {
        paintRoadBrush(cx, cy, 1);
        cy += cy < ty ? 1 : -1;
      }
      while (cx !== tx) {
        paintRoadBrush(cx, cy, 1);
        cx += cx < tx ? 1 : -1;
      }
      paintRoadBrush(tx, ty, 1);
    };

    // 3. PROCEDURAL MINI-DUNGEONS (6-7 Dungeons) + DIE VERFLUCHTE KRYPTA
    const dungeonNamePool = this.shuffle([
      'Blutkeller-Ruine',
      'Alte Wachturm-Bastion',
      'Schattenkrypta im Moor',
      'Katakomben des Nordens',
      'Vergessener Grabtempel',
      'Knochenfestung der Kultisten',
      'Verfallenes Blutkloster',
      'Beinhaus der Verdammten',
      'Eiserne Zitadelle',
      'Sanktum der Asche'
    ]);

    const overlapsExisting = (x1, y1, x2, y2, pad = 4) => {
      if (x1 < 18 + pad && y2 > 62 - pad && y1 < 77 + pad) return true; // Arrival Shrine
      if (x2 > kyrX1 - pad && y2 > kyrY1 - pad && y1 < kyrY2 + pad) return true; // Boss Krypta
      for (let i = 0; i < this.dungeons.length; i++) {
        const d = this.dungeons[i];
        if (x1 <= d.x2 + pad && x2 >= d.x1 - pad && y1 <= d.y2 + pad && y2 >= d.y1 - pad) {
          return true;
        }
      }
      return false;
    };

    const sectorSpecs = [
      { cxMin: 34, cxMax: 52, cyMin: 14, cyMax: 28, wMin: 15, wMax: 19, hMin: 12, hMax: 16, danger: 2, side: 'north', crossIdx: 0 },
      { cxMin: 34, cxMax: 52, cyMin: 112, cyMax: 124, wMin: 15, wMax: 19, hMin: 12, hMax: 16, danger: 2, side: 'south', crossIdx: 0 },
      { cxMin: 62, cxMax: 80, cyMin: 42, cyMax: 54, wMin: 14, wMax: 18, hMin: 11, hMax: 14, danger: 2, side: 'center', crossIdx: -1 },
      { cxMin: 86, cxMax: 108, cyMin: 12, cyMax: 24, wMin: 18, wMax: 23, hMin: 14, hMax: 18, danger: 3, side: 'north', crossIdx: 1 },
      { cxMin: 86, cxMax: 108, cyMin: 114, cyMax: 126, wMin: 18, wMax: 23, hMin: 14, hMax: 18, danger: 3, side: 'south', crossIdx: 1 },
      { cxMin: 134, cxMax: 156, cyMin: 14, cyMax: 28, wMin: 18, wMax: 23, hMin: 14, hMax: 18, danger: 4, side: 'north', crossIdx: 2 },
      { cxMin: 134, cxMax: 156, cyMin: 110, cyMax: 124, wMin: 18, wMax: 23, hMin: 14, hMax: 18, danger: 4, side: 'south', crossIdx: 2 }
    ];

    let nameIdx = 0;
    sectorSpecs.forEach((spec, idx) => {
      // Optional slight chance (15%) to skip the 3rd center dungeon for layout variety
      if (idx === 2 && this.rand() < 0.18) return;

      for (let attempt = 0; attempt < 8; attempt++) {
        const w = this.randInt(spec.wMin, spec.wMax);
        const h = this.randInt(spec.hMin, spec.hMax);
        const cx = this.randInt(spec.cxMin, spec.cxMax);
        const cy = this.randInt(spec.cyMin, spec.cyMax);
        const x1 = Math.max(20, Math.min(162 - w, cx - Math.floor(w / 2)));
        const y1 = Math.max(5, Math.min(this.height - 6 - h, cy - Math.floor(h / 2)));
        const x2 = x1 + w;
        const y2 = y1 + h;

        if (overlapsExisting(x1, y1, x2, y2, 4)) continue;

        const dName = dungeonNamePool[nameIdx % dungeonNamePool.length];
        nameIdx++;
        const dId = `proc_dungeon_${idx}_${this.seed}`;
        const floorType = this.rand() < 0.72 ? 3 : 1;

        // Place entrance facing the road
        const entMidX = Math.floor((x1 + x2) / 2);
        const openSouth = spec.side === 'north' || (spec.side === 'center' && y2 < roadYAtX[entMidX]);
        const entY = openSouth ? y2 : y1;
        const entrances = [{ x1: entMidX - 1, x2: entMidX + 2, y1: entY, y2: entY }];

        // Interior pillars
        const pxOff = Math.max(3, Math.floor(w * 0.24));
        const pyOff = Math.max(3, Math.floor(h * 0.28));
        const pillars = [
          [x1 + pxOff, y1 + pyOff],
          [x2 - pxOff, y1 + pyOff],
          [x1 + pxOff, y2 - pyOff],
          [x2 - pxOff, y2 - pyOff]
        ];
        const torches = [
          [entMidX - 1.6, openSouth ? entY - 0.8 : entY + 0.8],
          [entMidX + 2.6, openSouth ? entY - 0.8 : entY + 0.8],
          [x1 + pxOff - 0.6, y1 + pyOff - 0.5],
          [x2 - pxOff + 0.6, y2 - pyOff + 0.5]
        ];

        this.buildDungeonStructure({
          id: dId,
          name: dName,
          zoneLabel: `DUNGEON: ${dName.toUpperCase()} (STUFE ${spec.danger})`,
          x1, y1, x2, y2,
          floorType,
          dangerLevel: spec.danger,
          entrances,
          pillars,
          torches
        });

        // Connect dungeon entrance to nearest road
        if (spec.crossIdx >= 0 && crossRoads[spec.crossIdx]) {
          const cr = crossRoads[spec.crossIdx];
          const targetY = openSouth ? Math.max(entY + 1, cr.yTop + 2) : Math.min(entY - 1, cr.yBot - 2);
          const targetX = cr.roadMap.get(targetY) || cr.baseX;
          carveSpurPath(entMidX, openSouth ? entY + 1 : entY - 1, targetX, targetY);
        } else {
          const targetY = roadYAtX[entMidX] || 69;
          carveSpurPath(entMidX, openSouth ? entY + 1 : entY - 1, entMidX, targetY);
        }

        // Dungeon loot chest + barrels + monster packs inside!
        const chestY = openSouth ? y1 + 3 : y2 - 3;
        this.props.push({
          type: 'chest',
          x: entMidX * TILE_SIZE + 16,
          y: chestY * TILE_SIZE + 16,
          opened: false,
          forcedRarity: spec.danger >= 3 || this.rand() < 0.65 ? 'rare' : 'magic'
        });
        this.props.push({
          type: 'barrel',
          x: (x1 + 3) * TILE_SIZE + 16,
          y: (y1 + 3) * TILE_SIZE + 16,
          broken: false
        });
        this.props.push({
          type: 'barrel',
          x: (x2 - 3) * TILE_SIZE + 16,
          y: (y2 - 3) * TILE_SIZE + 16,
          broken: false
        });

        // 3-4 Dungeon Monster Packs guaranteed inside interior bounds
        const midY = Math.floor((y1 + y2) / 2);
        this.worldPacks.push({ x: entMidX, y: midY, type: spec.danger >= 4 ? 'cultist' : 'skeleton', count: 4 + (spec.danger >= 3 ? 1 : 0), lvl: spec.danger });
        this.worldPacks.push({ x: x1 + Math.max(4, pxOff), y: midY + (openSouth ? -2 : 2), type: spec.danger >= 3 ? 'cultist' : 'goblin', count: 4, lvl: spec.danger });
        this.worldPacks.push({ x: x2 - Math.max(4, pxOff), y: midY, type: 'bone_tower', count: 1, lvl: spec.danger });
        if (w >= 18) {
          this.worldPacks.push({ x: entMidX, y: chestY + (openSouth ? 2 : -2), type: 'skeleton', count: 4, lvl: spec.danger });
        }
        break;
      }
    });

    // 3h) DIE VERFLUCHTE KRYPTA (Boss-Sanktum im fernen Osten, dynamisches Y)
    this.buildDungeonStructure({
      id: 'verfluchte_krypta',
      name: 'Die Verfluchte Krypta',
      zoneLabel: 'DIE VERFLUCHTE KRYPTA (GEFAHR: BOSS)',
      x1: kyrX1, y1: kyrY1, x2: kyrX2, y2: kyrY2,
      floorType: 3,
      dangerLevel: 5,
      isBossSanctum: true,
      entrances: [{ x1: kyrX1, x2: kyrX1, y1: kryptaCenterY - 2, y2: kryptaCenterY + 2 }],
      pillars: [
        [kyrX1 + 5, kyrY1 + 5], [kyrX2 - 5, kyrY1 + 5],
        [kyrX1 + 5, kyrY2 - 5], [kyrX2 - 5, kyrY2 - 5],
        [kyrX1 + 10, kyrY1 + 7], [kyrX1 + 10, kyrY2 - 7]
      ],
      torches: [
        [kyrX1 - 1.4, kryptaCenterY - 2.6], [kyrX1 - 1.4, kryptaCenterY + 2.6],
        [kyrX1 + 4.2, kyrY1 + 4.4], [kyrX1 + 4.2, kyrY2 - 4.4],
        [kyrX2 - 5.6, kyrY1 + 4.4], [kyrX2 - 5.6, kyrY2 - 4.4],
        [kyrX2 - 2.5, kryptaCenterY - 3.2], [kyrX2 - 2.5, kryptaCenterY + 3.2]
      ]
    });

    // Boss Krypta Chests, Barrels & Guard Packs
    this.props.push({ type: 'chest', x: (kyrX2 - 3) * TILE_SIZE + 16, y: (kyrY1 + 4) * TILE_SIZE + 16, opened: false, forcedRarity: 'rare' });
    this.props.push({ type: 'chest', x: (kyrX2 - 3) * TILE_SIZE + 16, y: (kyrY2 - 4) * TILE_SIZE + 16, opened: false, forcedRarity: 'rare' });
    this.props.push({ type: 'barrel', x: (kyrX1 + 2) * TILE_SIZE + 16, y: (kyrY1 + 3) * TILE_SIZE + 16, broken: false });
    this.props.push({ type: 'barrel', x: (kyrX1 + 2) * TILE_SIZE + 16, y: (kyrY2 - 3) * TILE_SIZE + 16, broken: false });

    this.worldPacks.push({ x: kyrX1 + 4, y: kryptaCenterY - 4, type: 'cultist', count: 2, lvl: 4 });
    this.worldPacks.push({ x: kyrX1 + 4, y: kryptaCenterY + 4, type: 'cultist', count: 2, lvl: 4 });
    this.worldPacks.push({ x: kyrX1 + 8, y: kryptaCenterY - 9, type: 'bone_tower', count: 1, lvl: 4 });
    this.worldPacks.push({ x: kyrX1 + 8, y: kryptaCenterY + 9, type: 'bone_tower', count: 1, lvl: 4 });
    this.worldPacks.push({ x: kyrX1 + 14, y: kryptaCenterY - 5, type: 'skeleton', count: 4, lvl: 4 });
    this.worldPacks.push({ x: kyrX1 + 14, y: kryptaCenterY + 5, type: 'skeleton', count: 4, lvl: 4 });

    // 3i) Procedural Roadside Stone Ruins / Shrines across the Wilderness
    const miniRuins = [];
    for (let i = 0; i < 6 && miniRuins.length < 5; i++) {
      const rx = this.randInt(26, 162);
      const ryBase = roadYAtX[rx] || 69;
      const offsetY = (this.rand() < 0.5 ? -1 : 1) * this.randInt(12, 26);
      const ry = Math.max(8, Math.min(this.height - 9, ryBase + offsetY));
      if (overlapsExisting(rx - 3, ry - 3, rx + 3, ry + 3, 2)) continue;
      let nearRoad = false;
      for (let dy = -3; dy <= 3 && !nearRoad; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (roadTiles.has(`${rx + dx},${ry + dy}`)) nearRoad = true;
        }
      }
      if (nearRoad) continue;
      miniRuins.push([rx, ry]);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          this.tiles[ry + dy][rx + dx] = 1;
        }
      }
      this.tiles[ry - 2][rx - 2] = 4;
      this.tiles[ry - 2][rx + 2] = 4;
      this.tiles[ry + 2][rx - 2] = 4;
      this.tiles[ry + 2][rx + 2] = 4;
      this.torches.push({ x: rx * TILE_SIZE + 16, y: ry * TILE_SIZE + 16, radius: 11, solid: true });
      if (miniRuins.length <= 3) {
        this.props.push({
          type: 'chest',
          x: (rx + 1) * TILE_SIZE + 16,
          y: ry * TILE_SIZE + 16,
          opened: false,
          forcedRarity: 'magic'
        });
      }
      const lvl = rx < 60 ? 2 : rx < 120 ? 3 : 4;
      this.worldPacks.push({ x: rx, y: ry + 4, type: this.pick(['skeleton', 'cultist', 'goblin']), count: 4, lvl });
    }

    // 4. ORGANIC PROCEDURAL SCATTER: TREES & RUIN PILLARS
    const isNearStructureOrRoad = (x, y) => {
      if (x >= 4 && x <= 18 && y >= 62 && y <= 77) return true; // Arrival Shrine
      for (let i = 0; i < this.dungeons.length; i++) {
        const d = this.dungeons[i];
        if (x >= d.x1 - 2 && x <= d.x2 + 2 && y >= d.y1 - 2 && y <= d.y2 + 2) return true;
      }
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (roadTiles.has(`${x + dx},${y + dy}`)) return true;
        }
      }
      for (let i = 0; i < miniRuins.length; i++) {
        if (Math.abs(x - miniRuins[i][0]) <= 3 && Math.abs(y - miniRuins[i][1]) <= 3) return true;
      }
      return false;
    };

    const grovePhaseX = this.rand() * 10;
    const grovePhaseY = this.rand() * 10;
    for (let y = 2; y < this.height - 2; y++) {
      for (let x = 2; x < this.width - 2; x++) {
        if (this.tiles[y][x] !== 0) continue;
        if (isNearStructureOrRoad(x, y)) continue;
        const groveBias = (Math.sin(x * 0.14 + grovePhaseX) + Math.cos(y * 0.16 + grovePhaseY)) * 0.035;
        const roll = this.rand();
        if (roll < 0.075 + groveBias) {
          this.tiles[y][x] = 5; // Dead Tree
        } else if (roll > 0.991) {
          this.tiles[y][x] = 4; // Ruined Stone Pillar
        }
      }
    }

    // 5. TORCH BRAZIERS (Ankunftsschrein + prozedurale Straßenränder)
    [[7.2, 66.2], [13.8, 66.2], [7.2, 72.8], [13.8, 72.8]].forEach(([tx, ty]) => {
      this.torches.push({ x: Math.round(tx * TILE_SIZE + 16), y: Math.round(ty * TILE_SIZE + 16), radius: 11, solid: true });
    });
    for (let x = 24; x <= 166; x += 13) {
      const ry = roadYAtX[x] || 69;
      const side = (x % 26 === 0) ? -2.2 : 2.2;
      const tx = Math.round(x * TILE_SIZE + 16);
      const ty = Math.round((ry + side) * TILE_SIZE + 16);
      const gx = Math.floor(tx / TILE_SIZE);
      const gy = Math.floor(ty / TILE_SIZE);
      if (!this.isSolidTile(gx, gy)) {
        this.torches.push({ x: tx, y: ty, radius: 11, solid: true });
      }
    }

    // 6. EXTRA WILDERNESS CHESTS, BARRELS & ROAD/CLEARING MONSTER PACKS
    for (let i = 0; i < 4; i++) {
      const cx = this.randInt(26, 162);
      const cy = this.randInt(14, this.height - 15);
      if (!this.isSolidTile(cx, cy) && !isNearStructureOrRoad(cx, cy)) {
        this.props.push({
          type: 'chest',
          x: cx * TILE_SIZE + 16,
          y: cy * TILE_SIZE + 16,
          opened: false,
          forcedRarity: i >= 2 ? 'magic' : null
        });
      }
    }
    for (let i = 0; i < 14; i++) {
      const bx = this.randInt(22, 166);
      const by = (roadYAtX[bx] || 69) + (this.rand() < 0.5 ? -3 : 3);
      if (by > 4 && by < this.height - 4 && !this.isSolidTile(bx, by)) {
        this.props.push({ type: 'barrel', x: bx * TILE_SIZE + 16, y: by * TILE_SIZE + 16, broken: false });
      }
    }

    // Road Monster Packs (West -> East difficulty progression)
    for (let x = 24; x <= 164; x += 14) {
      const ry = roadYAtX[x] || 69;
      const lvl = x < 55 ? 1 : x < 100 ? 2 : x < 140 ? 3 : 4;
      const mType = lvl === 1 ? this.pick(['goblin', 'skeleton']) : this.pick(['skeleton', 'cultist', 'goblin', 'bone_tower']);
      const count = mType === 'bone_tower' ? (lvl >= 3 ? 2 : 1) : this.randInt(4, 6);
      this.worldPacks.push({ x, y: ry + this.randInt(-2, 2), type: mType, count, lvl });
    }

    // Crossroad & Wilderness Clearing Packs
    for (let i = 0; i < 14; i++) {
      const wx = this.randInt(24, 164);
      const wy = this.randInt(10, this.height - 12);
      if (this.isSolidTile(wx, wy)) continue;
      if (wx < 20 && Math.abs(wy - 69) < 10) continue;
      const lvl = wx < 55 ? 1 : wx < 100 ? 2 : wx < 140 ? 3 : 4;
      const mType = lvl === 1 ? this.pick(['goblin', 'skeleton']) : this.pick(['goblin', 'skeleton', 'cultist']);
      this.worldPacks.push({ x: wx, y: wy, type: mType, count: this.randInt(4, 6), lvl });
    }

    // 7. SPAWN MONSTERS IN WILDERNESS, DUNGEONS & SANCTUM
    this.spawnInitialMonsters();
  }

  spawnInitialMonsters(activeBounty = null) {
    this.monsters = [];
    if (this.isCastleScene) return;

    const bounty = activeBounty || (window.Game && window.Game.activeBounty) || null;
    // Ohne aktive Quest ("active") dürfen KEINE Gegner im Spiel sein
    if (!bounty || bounty.status !== 'active') {
      return;
    }
    const baseTierLvl = Math.max(1, bounty.tier || 1);
    const packs = this.worldPacks && this.worldPacks.length > 0 ? this.worldPacks : [
      { x: 28, y: 69, type: 'goblin', count: 5, lvl: 1 },
      { x: 45, y: 69, type: 'skeleton', count: 5, lvl: 2 }
    ];

    packs.forEach((p) => {
      for (let i = 0; i < p.count; i++) {
        const ox = p.count === 1 ? 0 : (i % 3) * 34 - 34 + (Math.random() * 14 - 7);
        const oy = p.count === 1 ? 0 : Math.floor(i / 3) * 34 - 17 + (Math.random() * 14 - 7);
        const mx = p.x * TILE_SIZE + ox;
        const my = p.y * TILE_SIZE + oy;
        if (!this.isSolidAtPixel(mx, my)) {
          this.monsters.push(this.createMonster(p.type, mx, my, p.lvl + (baseTierLvl - 1), bounty));
        }
      }
    });

    // Spawn Boss Malakor ONLY when an Execution ('boss') quest is active
    if (bounty && bounty.type === 'boss') {
      this.spawnBoss(4 + baseTierLvl, bounty);
    }
  }

  spawnBoss(level = 5, activeBounty = null) {
    if (this.isCastleScene) return null;
    // Remove existing boss if any before spawning fresh quest boss
    this.monsters = this.monsters.filter((m) => !m.isBoss);
    const bounty = activeBounty || (window.Game && window.Game.activeBounty) || null;
    if (!bounty || bounty.type !== 'boss' || bounty.status !== 'active') {
      return null;
    }
    const boss = this.createMonster('boss', this.bossSpawn.x, this.bossSpawn.y, level, bounty);
    this.monsters.push(boss);
    return boss;
  }

  spawnSingleWildernessMonster(level = 1, playerX = 0, playerY = 0, activeBounty = null) {
    if (this.isCastleScene) return null;
    const bounty = activeBounty || (window.Game && window.Game.activeBounty) || null;
    if (!bounty || bounty.status !== 'active') {
      return null;
    }
    const types = ['goblin', 'goblin', 'skeleton', 'skeleton', 'cultist', 'bone_tower'];
    const type = types[Math.floor(Math.random() * types.length)];
    const playerInTown = this.isTown(playerX, playerY);
    for (let attempt = 0; attempt < 30; attempt++) {
      let mx, my;
      if (playerInTown) {
        const tx = 24 + Math.floor(Math.random() * 142);
        const ty = 8 + Math.floor(Math.random() * (this.height - 16));
        mx = tx * TILE_SIZE + 16;
        my = ty * TILE_SIZE + 16;
      } else {
        const ang = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 580;
        mx = Math.max(22 * TILE_SIZE, Math.min((this.width - 5) * TILE_SIZE, playerX + Math.cos(ang) * dist));
        my = Math.max(4 * TILE_SIZE, Math.min((this.height - 4) * TILE_SIZE, playerY + Math.sin(ang) * dist));
      }
      if (this.isTown(mx, my)) continue;
      if (this.isSolidAtPixel(mx, my, 16)) continue;
      if (Math.hypot(mx - playerX, my - playerY) < 220) continue; // Spawn outside immediate player melee range
      const mob = this.createMonster(type, mx, my, level, bounty);
      this.monsters.push(mob);
      return mob;
    }
    return null;
  }

  createMonster(type, x, y, level = 1, activeBounty = null) {
    const bounty = activeBounty || (window.Game && window.Game.activeBounty) || null;
    const diffMult = bounty ? (bounty.difficultyMult || 1.0) : 1.0;
    const bTier = bounty ? (bounty.tier || 1) : 1;

    const configs = {
      goblin: {
        name: 'Gefallener Goblin',
        sprite: 'mob_goblin',
        hp: 40 + level * 16,
        dmg: 6 + level * 2,
        speed: 92,
        xp: 8 * level,
        radius: 12,
        attackRange: 28,
        attackCd: 1.0
      },
      skeleton: {
        name: 'Auferstandenes Skelett',
        sprite: 'mob_skeleton',
        hp: 58 + level * 20,
        dmg: 9 + level * 3,
        speed: 74,
        xp: 12 * level,
        radius: 13,
        attackRange: 30,
        attackCd: 1.15
      },
      cultist: {
        name: 'Blutkultist (Shotgun-Fächer)',
        sprite: 'mob_cultist',
        hp: 48 + level * 18,
        dmg: 10 + level * 3,
        speed: 62,
        xp: 16 * level,
        radius: 13,
        attackRange: 220,
        ranged: true,
        pattern: 'fan5',
        attackCd: 2.1
      },
      bone_tower: {
        name: 'Knochenturm (Spirale)',
        sprite: 'mob_bone_tower',
        hp: 85 + level * 26,
        dmg: 9 + level * 2,
        speed: 0,
        xp: 22 * level,
        radius: 16,
        attackRange: 290,
        ranged: true,
        pattern: 'spiral',
        attackCd: 0.28
      },
      boss: {
        name: 'MALAKOR DER ENTFESSELTE',
        sprite: 'mob_boss',
        hp: 680 + Math.max(0, level - 5) * 160,
        dmg: 22 + Math.max(0, level - 5) * 4,
        speed: 76,
        xp: 140 + Math.max(0, level - 5) * 40,
        radius: 20,
        attackRange: 44,
        attackCd: 1.25,
        isBoss: true
      }
    };

    const cfg = configs[type];
    const scaledHp = Math.max(1, Math.round(cfg.hp * diffMult));
    const scaledDmg = Math.max(1, Math.round(cfg.dmg * diffMult));
    let attackCd = cfg.attackCd;
    let bossCdMult = 1.0;
    let radialProjectileCount = 8;

    if (cfg.isBoss && bounty && bounty.type === 'boss') {
      // Spezial-Danmaku für Exekution-Bounty: Cooldown sinkt um 5% pro Tier (max 50%), +1 Nova-Projektil pro Tier
      bossCdMult = Math.max(0.5, 1 - bTier * 0.05);
      attackCd = Number((cfg.attackCd * bossCdMult).toFixed(2));
      radialProjectileCount = 8 + (bTier - 1);
    }

    return {
      uid: 'mob_' + Math.random().toString(36).slice(2, 9),
      type,
      name: cfg.name,
      sprite: cfg.sprite,
      level,
      x,
      y,
      vx: 0,
      vy: 0,
      hp: scaledHp,
      maxHp: scaledHp,
      dmg: scaledDmg,
      damage: scaledDmg,
      speed: cfg.speed,
      xp: cfg.xp,
      radius: cfg.radius,
      attackRange: cfg.attackRange,
      attackCd,
      bossCdMult,
      radialProjectileCount,
      ranged: !!cfg.ranged,
      pattern: cfg.pattern || null,
      spiralAngle: 0,
      bossPhase: 0,
      bossSpiralTimer: 0,
      isBoss: !!cfg.isBoss,
      cdTimer: Math.random() * 0.6,
      specialTimer: 2.8 * bossCdMult,
      frozenTimer: 0,
      hitFlash: 0,
      animTime: Math.random() * 10
    };
  }

  isTown(x, y) {
    return this.isCastleScene;
  }

  getZoneName(x, y) {
    if (this.isTown(x, y)) return 'FESTUNG RABENSTEIN (SICHERE BURG)';
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    for (let i = 0; i < this.dungeons.length; i++) {
      const d = this.dungeons[i];
      if (tx >= d.x1 && tx <= d.x2 && ty >= d.y1 && ty <= d.y2) {
        return d.zoneLabel || d.name;
      }
    }
    return 'DIE DÜSTERMARK (WILDNIS)';
  }

  isSolidTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return true;
    const t = this.tiles[ty][tx];
    return t === 4 || t === 5;
  }

  isSolidAtPixel(px, py, radius = 10) {
    const points = [
      [px - radius, py - radius],
      [px + radius, py - radius],
      [px - radius, py + radius],
      [px + radius, py + radius]
    ];
    for (const [x, y] of points) {
      const tx = Math.floor(x / TILE_SIZE);
      const ty = Math.floor(y / TILE_SIZE);
      if (this.isSolidTile(tx, ty)) return true;
    }
    for (const p of this.props) {
      if (p.solid) {
        if (p.halfW && p.halfH) {
          if (Math.abs(px - p.x) < p.halfW + radius && Math.abs(py - (p.y - p.halfH * 0.35)) < p.halfH + radius) {
            return true;
          }
        } else {
          const cx = p.type === 'fountain' ? p.x + 32 : p.x;
          const cy = p.type === 'fountain' ? p.y + 28 : p.y;
          const dx = px - cx;
          const dy = py - cy;
          if (Math.hypot(dx, dy) < p.radius + radius) return true;
        }
      }
    }
    for (const t of this.torches) {
      if (t.solid === false) continue;
      const dx = px - t.x;
      const dy = py - t.y;
      if (Math.hypot(dx, dy) < (t.radius || 11) + radius) return true;
    }
    return false;
  }
}

window.TILE_SIZE = TILE_SIZE;
window.WorldMap = WorldMap;

