// Modern Pixel-Art Sprite & Seamless Autotile Tilemap Manager
class SpriteAtlas {
  constructor() {
    this.cache = {};
    this.autotileCache = {};
    this.images = {};
    this.loadedCount = 0;
    this.totalToLoad = 0;
    this.ready = false;
    this.onReadyCallbacks = [];
    this.onProgressCallbacks = [];

    this.initProceduralFallbacks();
    this.loadGeneratedAssets();
  }

  onReady(cb) {
    if (this.ready) cb();
    else this.onReadyCallbacks.push(cb);
  }

  onProgress(cb) {
    if (this.totalToLoad > 0) cb(this.loadedCount, this.totalToLoad);
    if (!this.ready) this.onProgressCallbacks.push(cb);
  }

  _notifyLoadStep() {
    this.onProgressCallbacks.forEach((cb) => cb(this.loadedCount, this.totalToLoad));
    if (this.loadedCount >= this.totalToLoad) {
      this.ready = true;
      this.onProgressCallbacks = [];
      this.onReadyCallbacks.forEach((cb) => cb());
      this.onReadyCallbacks = [];
    }
  }

  createCanvas(w = 64, h = 64) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { c, ctx };
  }

  px(ctx, x, y, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  loadGeneratedAssets() {
    const manifest = {
      hero: 'assets/characters/hero.png?v=6',
      hero_walk: 'assets/characters/hero_walk.png?v=2',
      hero_attack: 'assets/characters/hero_attack.png?v=1',
      hero_whirlwind: 'assets/characters/hero_whirlwind.png?v=1',
      fx_slash: 'assets/effects/fx_slash.png?v=1',
      fx_whirlwind: 'assets/effects/fx_whirlwind.png?v=1',
      goblin: 'assets/monsters/goblin.png?v=6',
      skeleton: 'assets/monsters/skeleton.png?v=6',
      cultist: 'assets/monsters/cultist.png?v=6',
      boss: 'assets/monsters/boss.png?v=6',
      bone_tower: 'assets/monsters/bone_tower.png?v=1',
      npc_elder: 'assets/characters/npc_elder.png?v=6',
      npc_smith: 'assets/characters/npc_smith.png?v=6',
      npc_healer: 'assets/characters/npc_healer.png?v=6',
      fountain: 'assets/props/fountain.png?v=6',
      tree: 'assets/props/tree.png?v=6',
      castle_tower: 'assets/buildings/castle_tower.png?v=7',
      castle_keep: 'assets/buildings/castle_keep.png?v=8',
      castle_smithy: 'assets/buildings/castle_smithy.png?v=8',
      castle_chapel: 'assets/buildings/castle_chapel.png?v=8',
      prop_smithy_rack: 'assets/props/prop_smithy_rack.png?v=1',
      prop_keep_banner: 'assets/props/prop_keep_banner.png?v=1',
      prop_chapel_shrine: 'assets/props/prop_chapel_shrine.png?v=1',
      prop_supply_wagon: 'assets/props/prop_supply_wagon.png?v=1',
      prop_knight_statue: 'assets/props/prop_knight_statue.png?v=1',
      prop_herb_garden: 'assets/props/prop_herb_garden.png?v=1',
      prop_torch: 'assets/props/prop_torch.png?v=1',
      tile_cobble: 'assets/tiles/tile_cobble.png?v=6',
      tile_grass: 'assets/tiles/tile_grass.png?v=6',
      tile_dirt: 'assets/tiles/tile_dirt.png?v=6',
      tile_sanctum: 'assets/tiles/tile_sanctum.png?v=6',
      tile_wall: 'assets/tiles/tile_wall.png?v=7',
      tile_wall_v: 'assets/tiles/tile_wall_v.png?v=1',
      portal: 'assets/props/portal.png?v=2'
    };

    const keys = Object.keys(manifest);
    this.totalToLoad = keys.length;

    keys.forEach((key) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        this.loadedCount++;
        this.bakeAssetIntoAtlas(key, img);
        this._notifyLoadStep();
      };
      img.onerror = () => {
        this.loadedCount++;
        this._notifyLoadStep();
      };
      img.src = manifest[key];
    });
  }

  bakeAssetIntoAtlas(key, img) {
    if (key.startsWith('tile_')) {
      if (key === 'tile_wall' || key === 'tile_wall_v') {
        this.cache[key] = img;
        return;
      }
      // Store full 512x512 seamless sheet for continuous world-space UV mapping & autotiling
      this.cache[`sheet_${key}`] = img;

      const half = Math.floor(img.width / 2);
      const variants = [];
      const coords = [[0, 0], [half, 0], [0, half], [half, half]];
      coords.forEach(([sx, sy]) => {
        const { c, ctx } = this.createCanvas(half, half);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, half, half, 0, 0, half, half);
        variants.push(c);
      });
      this.cache[key] = variants;
      return;
    }

    if (key.startsWith('castle_') || key.startsWith('prop_')) {
      this.cache[key] = img;
      return;
    }

    if (key === 'portal') {
      // 2x4 Grid (4 columns x 2 rows = 8 frames, pre-baked RGBA transparent PNG 1024x576):
      // Row 0 (Frames 0..3): Opening Intro (Rune circle -> erupting blue magic -> vertical aura -> forming core)
      // Row 1 (Frames 4..7): Active Portal Loop (Rotating sapphire/cyan vortex, glowing runes & sparks)
      // Note: Uses pure drawImage + source-in compositing (no getImageData) so it never taints on file:// URLs!
      const cols = 4;
      const rows = 2;
      const cellW = Math.floor(img.width / cols);
      const cellH = Math.floor(img.height / rows);
      const frames = [];
      const highlightFrames = [];

      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const { c, ctx } = this.createCanvas(cellW, cellH);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, col * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH);
          frames.push(c);

          // Build crisp yellow-outlined highlight version (matching NPC hover highlight)
          const { c: silC, ctx: silCtx } = this.createCanvas(cellW, cellH);
          silCtx.imageSmoothingEnabled = true;
          silCtx.drawImage(c, 0, 0);
          silCtx.globalCompositeOperation = 'source-in';
          silCtx.fillStyle = 'rgba(255, 228, 85, 0.9)';
          silCtx.fillRect(0, 0, cellW, cellH);

          const { c: hlC, ctx: hlCtx } = this.createCanvas(cellW, cellH);
          hlCtx.imageSmoothingEnabled = true;
          hlCtx.imageSmoothingQuality = 'high';
          hlCtx.save();
          hlCtx.globalAlpha = 0.55;
          const offsets = [
            [-4, 0], [4, 0], [0, -4], [0, 4],
            [-3, -3], [3, -3], [-3, 3], [3, 3]
          ];
          offsets.forEach(([ox, oy]) => {
            hlCtx.drawImage(silC, ox, oy);
          });
          hlCtx.restore();
          hlCtx.drawImage(c, 0, 0);
          highlightFrames.push(hlC);
        }
      }

      this.cache.portal_frames = frames;
      this.cache.portal_frames_highlight = highlightFrames;
      return;
    }

    if (key === 'fountain') {
      const { c, ctx } = this.createCanvas(512, 512);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(256, 440, 210, 72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(img, 16, 8, 480, 480);
      this.cache.obj_fountain = c;
      return;
    }

    if (key === 'tree') {
      const { c, ctx } = this.createCanvas(512, 512);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(256, 465, 145, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(img, 0, 0, 512, 495);
      this.cache.tile_tree = c;
      return;
    }

    if (key.startsWith('npc_')) {
      const { c, ctx } = this.createCanvas(512, 512);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(256, 475, 130, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(img, 16, 12, 480, 480);
      this.cache[key] = c;

      // Build soft yellow-outlined highlight version for NPC hover
      const { c: silC, ctx: silCtx } = this.createCanvas(512, 512);
      silCtx.imageSmoothingEnabled = true;
      silCtx.drawImage(img, 16, 12, 480, 480);
      silCtx.globalCompositeOperation = 'source-in';
      silCtx.fillStyle = 'rgba(255, 228, 85, 0.95)';
      silCtx.fillRect(0, 0, 512, 512);

      const { c: hlC, ctx: hlCtx } = this.createCanvas(512, 512);
      hlCtx.imageSmoothingEnabled = true;
      hlCtx.imageSmoothingQuality = 'high';
      hlCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      hlCtx.beginPath();
      hlCtx.ellipse(256, 475, 130, 38, 0, 0, Math.PI * 2);
      hlCtx.fill();

      const offsets = [
        [-11, 0], [11, 0], [0, -11], [0, 11],
        [-8, -8], [8, -8], [-8, 8], [8, 8]
      ];
      offsets.forEach(([ox, oy]) => {
        hlCtx.drawImage(silC, ox, oy);
      });
      hlCtx.drawImage(img, 16, 12, 480, 480);
      this.cache[`${key}_highlight`] = hlC;
      return;
    }

    if (key === 'hero') {
      const sz = 512;
      // 4-frame Idle Breathing Cycle
      this.cache.hero_idle = [0, 1, 2, 3].map((f) => {
        const { c, ctx } = this.createCanvas(sz, sz);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const phase = (f / 4) * Math.PI * 2;
        const breatheY = Math.round(Math.sin(phase) * 5);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.beginPath();
        ctx.ellipse(sz / 2, sz - 34, sz * 0.28, sz * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Planted lower legs/boots (clip out left-side sword & cape region x<200, y<425 so sword never splits)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(200, 330);
        ctx.lineTo(sz, 330);
        ctx.lineTo(sz, sz);
        ctx.lineTo(0, sz);
        ctx.lineTo(0, 425);
        ctx.lineTo(200, 425);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, sz, sz, 12, 12, sz - 24, sz - 24);
        ctx.restore();

        // Breathing upper body, cape & ENTIRE sword (including blade tip down to y=425 on left side)
        ctx.save();
        ctx.translate(0, breatheY);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sz, 0);
        ctx.lineTo(sz, 338);
        ctx.lineTo(200, 338);
        ctx.lineTo(200, 425);
        ctx.lineTo(0, 425);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, sz, sz, 12, 12, sz - 24, sz - 24);
        ctx.restore();
        return c;
      });

      // 8-frame Dynamic Walk/Run Stride Cycle (fallback only if hero_walk.png hasn't loaded)
      if (!this.images.hero_walk) {
        this.cache.hero_walk = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
          const { c, ctx } = this.createCanvas(sz, sz);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const phase = (f / 8) * Math.PI * 2;
          const stride = Math.sin(phase);            // -1 .. +1 alternating left/right leg
          const bounce = Math.abs(Math.sin(phase));  // 0 .. 1 two bounces per full cycle

          // Dynamic ground shadow that contracts slightly on high stride
          ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
          ctx.beginPath();
          ctx.ellipse(sz / 2, sz - 34, sz * (0.28 - bounce * 0.03), sz * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();

          // 1. Animated Lower Body & Greaves (clip out left-side sword blade x<200, y<425)
          ctx.save();
          ctx.translate(sz / 2 + stride * 12, 395 - bounce * 15);
          ctx.transform(1, 0, stride * 0.16, 1, 0, 0);
          ctx.beginPath();
          ctx.moveTo(200 - sz / 2, -75);
          ctx.lineTo(sz / 2, -75);
          ctx.lineTo(sz / 2, 120);
          ctx.lineTo(-sz / 2, 120);
          ctx.lineTo(-sz / 2, 30);
          ctx.lineTo(200 - sz / 2, 30);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, 0, sz, sz, -(sz - 24) / 2, -395 + 12, sz - 24, sz - 24);
          ctx.restore();

          // 2. Animated Upper Torso, Cape & ENTIRE Sword (moves as one rigid piece)
          ctx.save();
          const bobY = -bounce * 18;
          const armSwingX = Math.cos(phase) * 9;
          ctx.translate(sz / 2 + armSwingX, 210 + bobY);
          ctx.rotate(0.055 + Math.sin(phase * 2) * 0.03);
          ctx.beginPath();
          ctx.moveTo(-sz / 2, -210);
          ctx.lineTo(sz / 2, -210);
          ctx.lineTo(sz / 2, 126);
          ctx.lineTo(200 - sz / 2, 126);
          ctx.lineTo(200 - sz / 2, 215);
          ctx.lineTo(-sz / 2, 215);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, 0, sz, sz, -(sz - 24) / 2, -210 + 12, sz - 24, sz - 24);
          ctx.restore();

          return c;
        });
        this.cache.hero = this.cache.hero_walk;
      }
      return;
    }

    if (key === 'hero_walk' || key === 'hero_attack' || key === 'hero_whirlwind') {
      const sz = 512;
      const cols = 2;
      const rows = 2;
      const cellW = Math.floor(img.width / cols);
      const cellH = Math.floor(img.height / rows);
      const frames = [];

      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const { c, ctx } = this.createCanvas(sz, sz);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
          ctx.beginPath();
          ctx.ellipse(sz / 2, sz - 34, sz * 0.28, sz * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(img, col * cellW, r * cellH, cellW, cellH, 0, 0, sz, sz);
          frames.push(c);
        }
      }

      this.cache[key] = frames;
      if (key === 'hero_walk') {
        this.cache.hero = frames;
      }
      return;
    }

    if (key === 'fx_slash' || key === 'fx_whirlwind') {
      const sz = 512;
      const cols = 2;
      const rows = 2;
      const cellW = Math.floor(img.width / cols);
      const cellH = Math.floor(img.height / rows);
      const frames = [];

      const makeTinted = (srcCanvas, tintColor) => {
        const { c: tc, ctx: tctx } = this.createCanvas(sz, sz);
        tctx.drawImage(srcCanvas, 0, 0);
        tctx.globalCompositeOperation = 'source-atop';
        tctx.fillStyle = tintColor;
        tctx.fillRect(0, 0, sz, sz);
        return tc;
      };

      const bloodFrames = [];
      const goldFrames = [];

      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const { c, ctx } = this.createCanvas(sz, sz);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, col * cellW, r * cellH, cellW, cellH, 0, 0, sz, sz);
          frames.push(c);

          if (key === 'fx_slash') {
            bloodFrames.push(makeTinted(c, 'rgba(255, 58, 58, 0.75)'));
            goldFrames.push(makeTinted(c, 'rgba(255, 184, 64, 0.72)'));
          }
        }
      }

      this.cache[key] = frames;
      if (key === 'fx_slash') {
        this.cache.fx_slash_blood = bloodFrames;
        this.cache.fx_slash_gold = goldFrames;
      }
      return;
    }

    if (key === 'bone_tower') {
      const sz = 512;
      this.cache.mob_bone_tower = [0, 1].map((frame) => {
        const { c, ctx } = this.createCanvas(sz, sz);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Ground shadow under pedestal
        ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
        ctx.beginPath();
        ctx.ellipse(sz / 2, sz - 24, sz * 0.30, sz * 0.085, 0, 0, Math.PI * 2);
        ctx.fill();

        // Planted stone & rib-bone spire body (y: 120..512)
        ctx.drawImage(img, 0, 120, sz, sz - 120, 8, 120, sz - 16, sz - 128);

        // Hovering arcane crystal & glowing rune crown (y: 0..124) bobs + pulses on frame 1
        ctx.save();
        if (frame === 1) {
          ctx.filter = 'brightness(1.22) drop-shadow(0px 0px 8px #e242ff)';
        }
        const crystalBobY = frame === 1 ? -10 : 0;
        ctx.drawImage(img, 0, 0, sz, 124, 8, 8 + crystalBobY, sz - 16, 124);
        ctx.restore();

        return c;
      });
      return;
    }

    const mapKey = {
      goblin: { name: 'mob_goblin' },
      skeleton: { name: 'mob_skeleton' },
      cultist: { name: 'mob_cultist' },
      boss: { name: 'mob_boss' }
    }[key];

    if (mapKey) {
      const sz = 512;
      this.cache[mapKey.name] = [0, 1].map((frame) => {
        const { c, ctx } = this.createCanvas(sz, sz);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.beginPath();
        ctx.ellipse(sz / 2, sz - 34, sz * 0.28, sz * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        const bobY = frame === 1 ? -14 : 0;
        const stretchH = frame === 1 ? sz - 30 : sz - 20;
        ctx.drawImage(img, 12, 12 + bobY, sz - 24, stretchH);
        return c;
      });
    }
  }

  // Generates a smooth, organic 8-neighbor autotile alpha mask (64x64) for seamless terrain transitions
  // mask bits: 1=N, 2=NE, 4=E, 8=SE, 16=S, 32=SW, 64=W, 128=NW
  getAutotileMask(mask, seed = 0) {
    const key = `${mask}_${seed % 4}`;
    if (this.autotileCache[key]) return this.autotileCache[key];

    const S = 64;
    const { c, ctx } = this.createCanvas(S, S);
    const imgData = ctx.createImageData(S, S);
    const data = imgData.data;

    const hasN  = !!(mask & 1);
    const hasNE = !!(mask & 2);
    const hasE  = !!(mask & 4);
    const hasSE = !!(mask & 8);
    const hasS  = !!(mask & 16);
    const hasSW = !!(mask & 32);
    const hasW  = !!(mask & 64);
    const hasNW = !!(mask & 128);

    // Wider, softer transition border in pixels (out of 64)
    const border = 24;

    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        let alpha = 1.0;

        // Smooth continuous wave along outer edges so adjacent border tiles match seamlessly
        const waveN = Math.sin((px / S) * Math.PI * 2) * 2.2 + Math.cos((px / S) * Math.PI * 4) * 1.1;
        const waveS = Math.sin((px / S) * Math.PI * 2 + 1.3) * 2.2 + Math.cos((px / S) * Math.PI * 4) * 1.1;
        const waveW = Math.sin((py / S) * Math.PI * 2 + 0.7) * 2.2 + Math.cos((py / S) * Math.PI * 4) * 1.1;
        const waveE = Math.sin((py / S) * Math.PI * 2 + 2.1) * 2.2 + Math.cos((py / S) * Math.PI * 4) * 1.1;

        // Distance from the 4 cardinal edges where neighbor is missing
        if (!hasN && py < border + waveN) {
          alpha = Math.min(alpha, Math.max(0, py / (border + waveN)));
        }
        if (!hasS && py >= S - (border + waveS)) {
          alpha = Math.min(alpha, Math.max(0, (S - 1 - py) / (border + waveS)));
        }
        if (!hasW && px < border + waveW) {
          alpha = Math.min(alpha, Math.max(0, px / (border + waveW)));
        }
        if (!hasE && px >= S - (border + waveE)) {
          alpha = Math.min(alpha, Math.max(0, (S - 1 - px) / (border + waveE)));
        }

        // Rounded outer corners when two adjacent cardinal neighbors are missing
        if (!hasN && !hasW && px < border && py < border) {
          const d = Math.hypot(border - px, border - py);
          alpha = Math.min(alpha, Math.max(0, 1 - d / border));
        }
        if (!hasN && !hasE && px >= S - border && py < border) {
          const d = Math.hypot(px - (S - 1 - border), border - py);
          alpha = Math.min(alpha, Math.max(0, 1 - d / border));
        }
        if (!hasS && !hasW && px < border && py >= S - border) {
          const d = Math.hypot(border - px, py - (S - 1 - border));
          alpha = Math.min(alpha, Math.max(0, 1 - d / border));
        }
        if (!hasS && !hasE && px >= S - border && py >= S - border) {
          const d = Math.hypot(px - (S - 1 - border), py - (S - 1 - border));
          alpha = Math.min(alpha, Math.max(0, 1 - d / border));
        }

        // Concave inner corners when both cardinal neighbors exist, but the diagonal neighbor is missing
        if (hasN && hasW && !hasNW && px < border && py < border) {
          const d = Math.hypot(px, py);
          if (d < border) alpha = Math.min(alpha, d / border);
        }
        if (hasN && hasE && !hasNE && px >= S - border && py < border) {
          const d = Math.hypot(S - 1 - px, py);
          if (d < border) alpha = Math.min(alpha, d / border);
        }
        if (hasS && hasW && !hasSW && px < border && py >= S - border) {
          const d = Math.hypot(px, S - 1 - py);
          if (d < border) alpha = Math.min(alpha, d / border);
        }
        if (hasS && hasE && !hasSE && px >= S - border && py >= S - border) {
          const d = Math.hypot(S - 1 - px, S - 1 - py);
          if (d < border) alpha = Math.min(alpha, d / border);
        }

        // Subtle organic pebble/tuft noise only inside the feathered transition band (0.04 < alpha < 0.92)
        if (alpha > 0.04 && alpha < 0.92) {
          const nx = Math.floor(px / 2);
          const ny = Math.floor(py / 2);
          const hash = Math.sin((nx * 12.9898 + ny * 78.233 + seed * 3.17)) * 43758.5453;
          const noise = (hash - Math.floor(hash)) - 0.5;
          // Attenuate noise near connected edges so adjacent tiles stay 100% seamless
          const edgeDist = Math.min(px, py, S - 1 - px, S - 1 - py) / 10;
          const noiseAmp = 0.28 * Math.min(1, edgeDist);
          alpha = Math.max(0, Math.min(1, alpha + noise * noiseAmp));
        }

        // Quintic smootherstep for buttery-smooth natural terrain blending
        alpha = alpha * alpha * alpha * (alpha * (alpha * 6 - 15) + 10);

        const idx = (py * S + px) * 4;
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.autotileCache[key] = c;
    return c;
  }

  initProceduralFallbacks() {
    this.buildTilesFallback();
    this.buildObjects();
    this.buildIcons();
  }

  buildTilesFallback() {
    const makeSolidTile = (c1, c2) => {
      const { c, ctx } = this.createCanvas(64, 64);
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = c2;
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillRect(34, 34, 24, 24);
      return c;
    };
    this.cache.tile_cobble = [makeSolidTile('#2f2b33', '#3d3842')];
    this.cache.tile_grass = [makeSolidTile('#18241b', '#213024')];
    this.cache.tile_dirt = [makeSolidTile('#33271e', '#403126')];
    this.cache.tile_sanctum = [makeSolidTile('#24151c', '#361d28')];
    this.cache.tile_wall = makeSolidTile('#3c3642', '#5c5563');
    this.cache.tile_wall_v = makeSolidTile('#3c3642', '#5c5563');
    this.cache.tile_tree = makeSolidTile('rgba(0,0,0,0)', '#223d2a');
    this.cache.obj_fountain = makeSolidTile('#3692d9', '#78ccff');

    const dummyChar = makeSolidTile('rgba(0,0,0,0)', '#aeb8c7');
    this.cache.hero = [dummyChar, dummyChar];
    this.cache.hero_idle = [dummyChar, dummyChar, dummyChar, dummyChar];
    this.cache.hero_walk = [dummyChar, dummyChar, dummyChar, dummyChar];
    this.cache.hero_attack = [dummyChar, dummyChar, dummyChar, dummyChar];
    this.cache.hero_whirlwind = [dummyChar, dummyChar, dummyChar, dummyChar];
    this.cache.fx_slash = [];
    this.cache.fx_slash_blood = [];
    this.cache.fx_slash_gold = [];
    this.cache.fx_whirlwind = [];
    this.cache.castle_tower = this.buildCastleTowerFallback();
    this.cache.castle_keep = makeSolidTile('#3c3642', '#8a2b2b');
    this.cache.castle_smithy = makeSolidTile('#3c3642', '#d96b27');
    this.cache.castle_chapel = makeSolidTile('#3c3642', '#4a78a8');
    this.cache.prop_smithy_rack = makeSolidTile('#3c3642', '#9c6838');
    this.cache.prop_keep_banner = makeSolidTile('#3c3642', '#9e2424');
    this.cache.prop_chapel_shrine = makeSolidTile('#3c3642', '#42a8cc');
    this.cache.prop_supply_wagon = makeSolidTile('#3c3642', '#8a5d3b');
    this.cache.prop_knight_statue = makeSolidTile('#3c3642', '#707888');
    this.cache.prop_herb_garden = makeSolidTile('#3c3642', '#3c6e47');
    this.cache.prop_torch = null;
    this.cache.mob_goblin = [dummyChar, dummyChar];
    this.cache.mob_skeleton = [dummyChar, dummyChar];
    this.cache.mob_cultist = [dummyChar, dummyChar];
    this.cache.mob_bone_tower = this.buildBoneTowerFrames();
    this.cache.mob_boss = [dummyChar, dummyChar];
    this.cache.npc_elder = dummyChar;
    this.cache.npc_smith = dummyChar;
    this.cache.npc_healer = dummyChar;
  }

  buildCastleTowerFallback() {
    const { c, ctx } = this.createCanvas(64, 128);
    this.px(ctx, 14, 108, 'rgba(0,0,0,0.45)', 36, 12);
    this.px(ctx, 16, 48, '#3f3a45', 32, 68);
    this.px(ctx, 18, 50, '#56505e', 28, 62);
    this.px(ctx, 12, 38, '#4a4452', 40, 14);
    // Battlements
    for (let x = 12; x < 52; x += 8) {
      this.px(ctx, x, 32, '#696273', 6, 8);
    }
    // Red slate conical roof
    for (let row = 0; row < 28; row++) {
      const half = Math.max(1, Math.floor((row / 28) * 18));
      this.px(ctx, 32 - half, 6 + row, row % 4 === 0 ? '#6e1d26' : '#8c2834', half * 2, 1);
    }
    // Glowing arrow slit
    this.px(ctx, 29, 64, '#ffaa33', 6, 14);
    this.px(ctx, 30, 66, '#ffe57f', 4, 10);
    return c;
  }

  buildBoneTowerFrames() {
    return [0, 1].map((f) => {
      const { c, ctx } = this.createCanvas(64, 64);
      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      ctx.beginPath();
      ctx.ellipse(32, 56, 20, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark stone & bone pedestal
      this.px(ctx, 14, 46, '#231e29', 36, 10);
      this.px(ctx, 16, 44, '#3e3747', 32, 8);
      this.px(ctx, 18, 34, '#6b6257', 28, 12);
      this.px(ctx, 20, 22, '#9e9282', 24, 16);
      this.px(ctx, 22, 12, '#cfc2b0', 20, 14);

      // Rib-like bone spikes on sides
      for (let i = 0; i < 3; i++) {
        const ry = 20 + i * 8;
        this.px(ctx, 14, ry, '#b8ab99', 6, 3);
        this.px(ctx, 44, ry, '#b8ab99', 6, 3);
      }

      // Necromantic skull crown at top (bobs slightly with frame)
      const by = f === 1 ? 7 : 9;
      this.px(ctx, 21, by, '#e8dec8', 22, 14);
      this.px(ctx, 23, by - 2, '#f5ebd6', 18, 4);
      // Glowing purple/crimson eye sockets & arcane core
      const glow = f === 1 ? '#ff3877' : '#c842ff';
      this.px(ctx, 25, by + 4, '#180c1e', 5, 5);
      this.px(ctx, 34, by + 4, '#180c1e', 5, 5);
      this.px(ctx, 26, by + 5, glow, 3, 3);
      this.px(ctx, 35, by + 5, glow, 3, 3);

      // Floating Danmaku rune crystals around tower
      const crystalY = f === 1 ? 14 : 17;
      this.px(ctx, 9, crystalY, glow, 4, 6);
      this.px(ctx, 51, crystalY, glow, 4, 6);
      this.px(ctx, 30, 29, glow, 4, 8);
      return c;
    });
  }

  buildObjects() {
    this.cache.obj_torch = [0, 1].map((f) => {
      const { c, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(24, 42, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      this.px(ctx, 18, 26, '#2b2930', 12, 15);
      this.px(ctx, 20, 26, '#484552', 6, 14);
      this.px(ctx, 14, 22, '#3a3742', 20, 5);
      this.px(ctx, 16, 23, '#635e70', 16, 2);
      this.px(ctx, 16, 12 + (f ? 2 : 0), '#cc2900', 16, 10);
      this.px(ctx, 18, 8 + (f ? 0 : 2), '#ff6600', 12, 12);
      this.px(ctx, 20, 6 + (f ? 1 : 0), '#ffaa00', 8, 11);
      this.px(ctx, 22, 10, '#ffff99', 4, 7);
      this.px(ctx, f ? 19 : 27, f ? 3 : 4, '#ffcc33', 2, 2);
      return c;
    });

    this.cache.obj_chest_closed = (() => {
      const { c, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(6, 38, 36, 6);
      this.px(ctx, 8, 16, '#3d2210', 32, 24);
      this.px(ctx, 10, 18, '#6e401f', 28, 20);
      this.px(ctx, 10, 18, '#8f562c', 28, 7);
      this.px(ctx, 8, 24, '#b8861b', 32, 3);
      this.px(ctx, 11, 16, '#9e7419', 4, 24);
      this.px(ctx, 33, 16, '#9e7419', 4, 24);
      this.px(ctx, 21, 22, '#ffd952', 6, 7);
      this.px(ctx, 23, 24, '#1a120b', 2, 3);
      return c;
    })();

    this.cache.obj_chest_open = (() => {
      const { c, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(6, 38, 36, 6);
      this.px(ctx, 8, 22, '#3d2210', 32, 18);
      this.px(ctx, 10, 22, '#1a0d05', 28, 7);
      this.px(ctx, 13, 21, '#f2c94c', 22, 5);
      this.px(ctx, 17, 20, '#fff394', 12, 3);
      this.px(ctx, 8, 11, '#593318', 32, 9);
      this.px(ctx, 8, 18, '#b8861b', 32, 2);
      return c;
    })();

    this.cache.obj_barrel = (() => {
      const { c, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(24, 41, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      this.px(ctx, 12, 11, '#4a2c16', 24, 29);
      this.px(ctx, 14, 11, '#784925', 20, 29);
      this.px(ctx, 17, 11, '#965e32', 11, 29);
      this.px(ctx, 12, 16, '#3e424a', 24, 3);
      this.px(ctx, 12, 31, '#3e424a', 24, 3);
      this.px(ctx, 16, 16, '#6c7380', 10, 2);
      this.px(ctx, 16, 31, '#6c7380', 10, 2);
      return c;
    })();
  }

  buildIcons() {
    this.cache.icon_sword = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      for (let i = 0; i < 16; i++) {
        this.px(ctx, 9 + i, 21 - i, '#6e85a1', 4, 4);
        this.px(ctx, 9 + i, 20 - i, '#dcebff', 2, 2);
      }
      this.px(ctx, 6, 19, '#d49b24', 10, 3);
      this.px(ctx, 8, 17, '#ffe77a', 4, 3);
      this.px(ctx, 4, 23, '#6e3b1c', 5, 5);
      return c;
    })();

    this.cache.icon_axe = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      for (let i = 0; i < 18; i++) {
        this.px(ctx, 6 + i, 24 - i, '#6e4221', 3, 3);
      }
      this.px(ctx, 14, 4, '#6e7887', 13, 13);
      this.px(ctx, 17, 6, '#c7d4e6', 9, 9);
      this.px(ctx, 20, 8, '#ffffff', 5, 5);
      return c;
    })();

    this.cache.icon_armor = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 5, 5, '#474f5c', 22, 22);
      this.px(ctx, 7, 7, '#8592a6', 18, 18);
      this.px(ctx, 10, 9, '#c7d4e8', 12, 11);
      this.px(ctx, 12, 5, '#141117', 8, 4);
      this.px(ctx, 8, 21, '#e0ac32', 16, 3);
      return c;
    })();

    this.cache.icon_helm = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 12, 2, '#c91e29', 8, 5);
      this.px(ctx, 7, 7, '#5c6575', 18, 19);
      this.px(ctx, 9, 9, '#b0bed1', 14, 10);
      this.px(ctx, 10, 17, '#14161f', 12, 3);
      this.px(ctx, 15, 11, '#e0ac32', 2, 12);
      return c;
    })();

    this.cache.icon_ring = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 9, 11, '#b88214', 14, 14);
      this.px(ctx, 10, 12, '#f5cc45', 12, 12);
      this.px(ctx, 13, 15, '#141117', 6, 6);
      this.px(ctx, 12, 7, '#b8142c', 8, 6);
      this.px(ctx, 14, 8, '#ff5c77', 4, 3);
      return c;
    })();

    this.cache.icon_boots = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 8, 6, '#59361b', 10, 18);
      this.px(ctx, 10, 8, '#8a562d', 7, 14);
      this.px(ctx, 8, 19, '#754824', 17, 7);
      this.px(ctx, 8, 24, '#2b1b0e', 17, 3);
      return c;
    })();

    this.cache.icon_pot_hp = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 13, 4, '#c7a46b', 6, 4);
      this.px(ctx, 11, 8, '#9bc1d9', 10, 4);
      this.px(ctx, 7, 12, '#8f1119', 18, 15);
      this.px(ctx, 9, 13, '#d9212c', 14, 12);
      this.px(ctx, 11, 15, '#ff7a82', 5, 6);
      return c;
    })();

    this.cache.icon_pot_mp = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 13, 4, '#c7a46b', 6, 4);
      this.px(ctx, 11, 8, '#9bc1d9', 10, 4);
      this.px(ctx, 7, 12, '#11378f', 18, 15);
      this.px(ctx, 9, 13, '#2162d9', 14, 12);
      this.px(ctx, 11, 15, '#7ab5ff', 5, 6);
      return c;
    })();

    this.cache.icon_gold = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 6, 16, '#9e6b0f', 20, 9);
      this.px(ctx, 8, 12, '#e0a824', 16, 10);
      this.px(ctx, 11, 10, '#ffe366', 10, 8);
      this.px(ctx, 13, 12, '#ffffff', 4, 3);
      return c;
    })();

    this.cache.skill_whirlwind = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 4, 13, '#4da6ff', 24, 6);
      this.px(ctx, 7, 8, '#a6d8ff', 18, 4);
      this.px(ctx, 7, 20, '#a6d8ff', 18, 4);
      this.px(ctx, 10, 14, '#ffffff', 12, 3);
      return c;
    })();

    this.cache.skill_fireball = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 5, 5, '#b81d13', 22, 22);
      this.px(ctx, 8, 8, '#ff6a00', 16, 16);
      this.px(ctx, 11, 11, '#ffcf40', 10, 10);
      this.px(ctx, 13, 13, '#ffffff', 6, 6);
      return c;
    })();

    this.cache.skill_frostnova = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      this.px(ctx, 14, 3, '#38c7ff', 4, 26);
      this.px(ctx, 3, 14, '#38c7ff', 26, 4);
      this.px(ctx, 8, 8, '#99ebff', 16, 16);
      this.px(ctx, 12, 12, '#ffffff', 8, 8);
      return c;
    })();

    this.cache.icon_portal = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      // Stone rune base
      this.px(ctx, 6, 25, '#3b4252', 20, 4);
      this.px(ctx, 8, 24, '#56c2ff', 16, 2);
      // Outer cyan portal ring
      this.px(ctx, 10, 3, '#5ce1ff', 12, 3);
      this.px(ctx, 7, 6, '#38c7ff', 4, 18);
      this.px(ctx, 21, 6, '#38c7ff', 4, 18);
      this.px(ctx, 10, 22, '#5ce1ff', 12, 3);
      // Deep sapphire inner swirl
      this.px(ctx, 10, 6, '#143d96', 12, 16);
      this.px(ctx, 12, 8, '#1f6bff', 8, 12);
      this.px(ctx, 13, 11, '#7ce8ff', 6, 6);
      this.px(ctx, 15, 13, '#ffffff', 2, 2);
      return c;
    })();

    // Pixel-Art Speech Bubble Cursor Sprite (32x32) for NPC Hover
    this.cache.cursor_speech = (() => {
      const { c, ctx } = this.createCanvas(32, 32);
      // Dark outer pixel border of speech bubble
      this.px(ctx, 4, 3, '#1a1410', 22, 18);
      this.px(ctx, 2, 5, '#1a1410', 26, 14);
      // Tail border
      this.px(ctx, 6, 21, '#1a1410', 8, 3);
      this.px(ctx, 4, 24, '#1a1410', 6, 3);
      this.px(ctx, 2, 27, '#1a1410', 4, 2);

      // Golden-parchment outer rim
      this.px(ctx, 5, 4, '#f2c94c', 20, 16);
      this.px(ctx, 3, 6, '#f2c94c', 24, 12);
      this.px(ctx, 7, 20, '#f2c94c', 6, 3);
      this.px(ctx, 5, 23, '#f2c94c', 4, 3);

      // Warm cream inner fill
      this.px(ctx, 6, 5, '#fff8e7', 18, 14);
      this.px(ctx, 4, 7, '#fff8e7', 22, 10);
      this.px(ctx, 8, 19, '#fff8e7', 4, 3);
      this.px(ctx, 6, 22, '#fff8e7', 3, 2);

      // Three animated-style dialogue dots "..." inside bubble
      this.px(ctx, 8, 11, '#3b2d20', 3, 3);
      this.px(ctx, 14, 11, '#3b2d20', 3, 3);
      this.px(ctx, 20, 11, '#3b2d20', 3, 3);
      return c;
    })();
    this.cache.cursor_speech_url = this.cache.cursor_speech.toDataURL('image/png');
  }
}

window.Sprites = new SpriteAtlas();
