/**
 * High-detail (2048x2048) surface painting used by Surface View.
 * Ported verbatim from the v1 `SolarSystem` class methods of the same names.
 */
import { generateNoise } from './noise'

/** Continent outlines are `[x, y]` pairs in 0..1 of the texture size. */
export type ContinentPoint = [number, number]

export function drawContinent(ctx: CanvasRenderingContext2D, points: ContinentPoint[], color: string, size: number): void {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(points[0][0] * size / 1024, points[0][1] * size / 1024);
      for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0] * size / 1024, points[i][1] * size / 1024);
      }
      ctx.closePath();
      ctx.fill();

      // Add terrain variation
      for (let i = 0; i < 30; i++) {
          const px = points[Math.floor(Math.random() * points.length)];
          ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${100 + Math.random() * 60}, ${60 + Math.random() * 40}, 0.4)`;
          ctx.beginPath();
          ctx.arc(px[0] * size / 1024 + (Math.random() - 0.5) * 100, px[1] * size / 1024 + (Math.random() - 0.5) * 100, Math.random() * 30 + 5, 0, Math.PI * 2);
          ctx.fill();
      }
}

export function drawRealisticContinent(ctx: CanvasRenderingContext2D, points: ContinentPoint[], size: number, biomeType: string): void {
      // Draw continental shelf first
      ctx.fillStyle = 'rgba(40, 100, 140, 0.25)';
      ctx.beginPath();
      const shelfPoints = points.map(p => [p[0] * size / 1024, p[1] * size / 1024]);
      ctx.moveTo(shelfPoints[0][0], shelfPoints[0][1]);
      for (let i = 1; i < shelfPoints.length; i++) {
          ctx.lineTo(shelfPoints[i][0], shelfPoints[i][1]);
      }
      ctx.closePath();
      ctx.lineWidth = 30;
      ctx.strokeStyle = 'rgba(40, 100, 140, 0.2)';
      ctx.stroke();
      ctx.fill();

      // Base continent color by biome
      let baseColor, mountainColor, lowlandColor, desertColor;
      switch (biomeType) {
          case 'tropical':
              baseColor = '#228b22';
              mountainColor = '#1a6b1a';
              lowlandColor = '#2d8b2d';
              desertColor = '#c4a35a';
              break;
          case 'african':
              baseColor = '#8b7355';
              mountainColor = '#6b5344';
              lowlandColor = '#228b22';
              desertColor = '#daa520';
              break;
          case 'australian':
              baseColor = '#cd853f';
              mountainColor = '#8b4513';
              lowlandColor = '#9acd32';
              desertColor = '#daa520';
              break;
          case 'asian':
              baseColor = '#4a7c4a';
              mountainColor = '#8b8b8b';
              lowlandColor = '#228b22';
              desertColor = '#c2b280';
              break;
          default: // temperate
              baseColor = '#3d7a3d';
              mountainColor = '#5a5a5a';
              lowlandColor = '#4a8a4a';
              desertColor = '#9b8b5a';
      }

      // Fill continent with base color
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(points[0][0] * size / 1024, points[0][1] * size / 1024);
      for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0] * size / 1024, points[i][1] * size / 1024);
      }
      ctx.closePath();
      ctx.fill();

      // Add terrain variations within continent
      const centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length * size / 1024;
      const centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length * size / 1024;

      // Mountain ranges
      for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 60;
          ctx.fillStyle = `rgba(${parseInt(mountainColor.slice(1, 3), 16)}, ${parseInt(mountainColor.slice(3, 5), 16)}, ${parseInt(mountainColor.slice(5, 7), 16)}, ${0.4 + Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(centerX + Math.cos(angle) * dist, centerY + Math.sin(angle) * dist, Math.random() * 25 + 10, Math.random() * 15 + 5, angle, 0, Math.PI * 2);
          ctx.fill();
      }

      // Lowlands and forests
      for (let i = 0; i < 25; i++) {
          const px = points[Math.floor(Math.random() * points.length)];
          ctx.fillStyle = `rgba(${parseInt(lowlandColor.slice(1, 3), 16)}, ${parseInt(lowlandColor.slice(3, 5), 16)}, ${parseInt(lowlandColor.slice(5, 7), 16)}, ${0.3 + Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.arc(px[0] * size / 1024 + (Math.random() - 0.5) * 80, px[1] * size / 1024 + (Math.random() - 0.5) * 80, Math.random() * 20 + 5, 0, Math.PI * 2);
          ctx.fill();
      }

      // Deserts (only for certain biomes)
      if (biomeType === 'african' || biomeType === 'australian' || biomeType === 'asian') {
          for (let i = 0; i < 10; i++) {
              ctx.fillStyle = `rgba(${parseInt(desertColor.slice(1, 3), 16)}, ${parseInt(desertColor.slice(3, 5), 16)}, ${parseInt(desertColor.slice(5, 7), 16)}, ${0.4 + Math.random() * 0.3})`;
              ctx.beginPath();
              ctx.ellipse(centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 60, Math.random() * 40 + 20, Math.random() * 25 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
              ctx.fill();
          }
      }
}

export function drawEarthClouds(ctx: CanvasRenderingContext2D, size: number): void {
      // Weather systems - cyclones and fronts
      for (let i = 0; i < 8; i++) {
          const cx = Math.random() * size;
          const cy = Math.random() * size;
          const radius = Math.random() * 150 + 80;

          // Spiral cloud pattern for weather systems
          ctx.save();
          ctx.translate(cx, cy);
          for (let j = 0; j < 20; j++) {
              const angle = (j / 20) * Math.PI * 3;
              const r = (j / 20) * radius;
              ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - j * 0.01})`;
              ctx.beginPath();
              ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r, 30 + Math.random() * 20, 10 + Math.random() * 10, angle, 0, Math.PI * 2);
              ctx.fill();
          }
          ctx.restore();
      }

      // Scattered clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let i = 0; i < 120; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 60 + 15, Math.random() * 25 + 8, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
      }

      // Cloud bands along trade winds
      for (let y = size * 0.2; y < size * 0.8; y += size * 0.15) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.1})`;
          ctx.fillRect(0, y + (Math.random() - 0.5) * 50, size, 30 + Math.random() * 40);
      }
}

export function drawMercurySurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Gray, heavily cratered surface
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
      gradient.addColorStop(0, '#8a8a8a');
      gradient.addColorStop(1, '#5a5a5a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add many craters
      for (let i = 0; i < 500; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const radius = Math.random() * 40 + 5;

          // Crater rim (lighter)
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.3})`;
          ctx.fill();

          // Crater floor (darker)
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.5 + 0.3})`;
          ctx.fill();

          // Shadow
          ctx.beginPath();
          ctx.arc(x + radius * 0.2, y + radius * 0.2, radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(40, 40, 40, 0.3)`;
          ctx.fill();
      }

      // Add surface cracks/ridges
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * size, Math.random() * size);
          ctx.lineTo(Math.random() * size, Math.random() * size);
          ctx.stroke();
      }
}

export function drawVenusSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Thick cloudy atmosphere - swirling yellows and oranges
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#e6c87a');
      gradient.addColorStop(0.5, '#d4a843');
      gradient.addColorStop(1, '#c49a3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add swirling cloud patterns
      for (let i = 0; i < 100; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.random() * Math.PI * 2);

          ctx.beginPath();
          ctx.ellipse(0, 0, Math.random() * 150 + 50, Math.random() * 30 + 10, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${200 + Math.random() * 55}, ${180 + Math.random() * 40}, ${100 + Math.random() * 50}, ${Math.random() * 0.3 + 0.1})`;
          ctx.fill();

          ctx.restore();
      }

      // Add atmospheric haze bands
      for (let y = 0; y < size; y += 80) {
          ctx.fillStyle = `rgba(255, 220, 150, ${Math.random() * 0.15})`;
          ctx.fillRect(0, y, size, 40 + Math.random() * 40);
      }
}

export function drawEarthSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Deep ocean base with gradient
      const oceanGradient = ctx.createLinearGradient(0, 0, size, size);
      oceanGradient.addColorStop(0, '#0a3d62');
      oceanGradient.addColorStop(0.3, '#1e5f8a');
      oceanGradient.addColorStop(0.6, '#1a4d7c');
      oceanGradient.addColorStop(1, '#0c3d5f');
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, size, size);

      // Add realistic ocean depth variations and currents
      for (let i = 0; i < 300; i++) {
          const depth = Math.random();
          ctx.fillStyle = `rgba(${10 + depth * 30}, ${40 + depth * 50}, ${80 + depth * 60}, ${0.2 + depth * 0.2})`;
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 120 + 30, Math.random() * 60 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
      }

      // Continental shelf (lighter water near coasts - drawn first)
      ctx.fillStyle = 'rgba(40, 120, 160, 0.3)';

      // Detailed continents with realistic geography
      // North America with mountain ranges and varied terrain
      drawRealisticContinent(ctx, [
          [80, 100], [160, 60], [250, 50], [320, 80], [350, 150], [340, 250],
          [300, 320], [220, 360], [150, 340], [100, 280], [60, 200]
      ], size, 'temperate');

      // Central America
      drawRealisticContinent(ctx, [
          [200, 360], [240, 350], [260, 400], [240, 450], [200, 420]
      ], size, 'tropical');

      // South America with Amazon and Andes
      drawRealisticContinent(ctx, [
          [200, 450], [280, 420], [320, 480], [340, 580], [300, 700], [240, 750],
          [180, 720], [160, 620], [180, 520]
      ], size, 'tropical');

      // Africa with Sahara and rainforest
      drawRealisticContinent(ctx, [
          [460, 180], [560, 160], [620, 200], [640, 300], [620, 450], [560, 550],
          [480, 580], [440, 500], [420, 350], [430, 250]
      ], size, 'african');

      // Europe with varied terrain
      drawRealisticContinent(ctx, [
          [440, 80], [520, 60], [600, 80], [620, 140], [580, 190], [500, 200], [450, 160]
      ], size, 'temperate');

      // Asia - massive continent with diverse terrain
      drawRealisticContinent(ctx, [
          [600, 60], [750, 40], [900, 60], [980, 120], [1000, 220], [960, 320],
          [880, 380], [780, 400], [680, 360], [620, 280], [600, 180]
      ], size, 'asian');

      // India
      drawRealisticContinent(ctx, [
          [700, 280], [760, 260], [780, 340], [740, 420], [680, 400], [680, 320]
      ], size, 'tropical');

      // Australia
      drawRealisticContinent(ctx, [
          [800, 480], [900, 460], [960, 500], [980, 580], [920, 640], [840, 620], [780, 560]
      ], size, 'australian');

      // Antarctica
      ctx.fillStyle = '#e8f0f8';
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 40, size * 0.45, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ice texture on Antarctica
      for (let i = 0; i < 100; i++) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, size - 40 + (Math.random() - 0.5) * 60, Math.random() * 30 + 5, Math.random() * 10 + 3, 0, 0, Math.PI * 2);
          ctx.fill();
      }

      // Arctic ice cap
      ctx.fillStyle = '#e8f4f8';
      ctx.beginPath();
      ctx.ellipse(size / 2, 30, size * 0.35, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Realistic cloud cover with weather patterns
      drawEarthClouds(ctx, size);

      // Add subtle noise for texture
      generateNoise(ctx, size, 15, 0.1);
}

export function drawMarsSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Red desert base
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
      gradient.addColorStop(0, '#c1440e');
      gradient.addColorStop(0.5, '#a33a0c');
      gradient.addColorStop(1, '#8b2500');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add terrain variations with different colored regions
      for (let i = 0; i < 400; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const terrainType = Math.random();
          let color;

          if (terrainType < 0.3) {
              // Dark volcanic plains
              color = `rgba(100, 45, 20, ${0.2 + Math.random() * 0.3})`;
          } else if (terrainType < 0.6) {
              // Rusty orange highlands
              color = `rgba(180, 90, 40, ${0.2 + Math.random() * 0.3})`;
          } else {
              // Tan/ochre regions
              color = `rgba(200, 150, 80, ${0.15 + Math.random() * 0.2})`;
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(x, y, Math.random() * 80 + 20, Math.random() * 50 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
      }

      // Add many craters of varying sizes
      for (let i = 0; i < 350; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const radius = Math.random() * 35 + 3;
          const depth = Math.random();

          // Crater rim (lighter, raised)
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160, 80, 40, ${0.3 + depth * 0.3})`;
          ctx.fill();

          // Crater floor (darker)
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80, 35, 15, ${0.3 + depth * 0.3})`;
          ctx.fill();

          // Shadow on one side
          ctx.beginPath();
          ctx.arc(x + radius * 0.15, y + radius * 0.15, radius * 0.65, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(50, 20, 10, 0.25)`;
          ctx.fill();
      }

      // Olympus Mons (largest volcano in solar system)
      const olympusX = size * 0.25;
      const olympusY = size * 0.35;
      // Outer caldera
      ctx.beginPath();
      ctx.arc(olympusX, olympusY, 150, 0, Math.PI * 2);
      const olympusGrad = ctx.createRadialGradient(olympusX, olympusY, 0, olympusX, olympusY, 150);
      olympusGrad.addColorStop(0, '#5a1800');
      olympusGrad.addColorStop(0.4, '#7a2000');
      olympusGrad.addColorStop(0.7, '#8a3010');
      olympusGrad.addColorStop(1, '#a04020');
      ctx.fillStyle = olympusGrad;
      ctx.fill();
      // Central caldera
      ctx.beginPath();
      ctx.arc(olympusX, olympusY, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#3a1000';
      ctx.fill();
      // Cliff edge highlight
      ctx.strokeStyle = 'rgba(180, 100, 60, 0.4)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(olympusX - 10, olympusY - 10, 145, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();

      // Tharsis volcanoes (3 smaller volcanoes)
      [[size * 0.35, size * 0.5], [size * 0.32, size * 0.6], [size * 0.38, size * 0.55]].forEach(([vx, vy]) => {
          ctx.beginPath();
          ctx.arc(vx, vy, 60, 0, Math.PI * 2);
          ctx.fillStyle = '#6a2500';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(vx, vy, 25, 0, Math.PI * 2);
          ctx.fillStyle = '#4a1800';
          ctx.fill();
      });

      // Valles Marineris (massive canyon system)
      ctx.save();
      // Main canyon
      ctx.strokeStyle = '#3a1200';
      ctx.lineWidth = 25;
      ctx.beginPath();
      ctx.moveTo(size * 0.15, size * 0.52);
      ctx.bezierCurveTo(size * 0.35, size * 0.48, size * 0.55, size * 0.54, size * 0.85, size * 0.50);
      ctx.stroke();
      // Canyon depth shadow
      ctx.strokeStyle = '#2a0a00';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(size * 0.15, size * 0.525);
      ctx.bezierCurveTo(size * 0.35, size * 0.485, size * 0.55, size * 0.545, size * 0.85, size * 0.505);
      ctx.stroke();
      // Branch canyons
      ctx.strokeStyle = '#4a1500';
      ctx.lineWidth = 10;
      for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const startX = size * (0.25 + i * 0.12);
          ctx.moveTo(startX, size * 0.50);
          ctx.lineTo(startX + (Math.random() - 0.5) * 80, size * 0.50 + (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 40));
          ctx.stroke();
      }
      ctx.restore();

      // North polar ice cap with layers
      const polarGrad = ctx.createRadialGradient(size / 2, 60, 0, size / 2, 60, 350);
      polarGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      polarGrad.addColorStop(0.3, 'rgba(240, 248, 255, 0.85)');
      polarGrad.addColorStop(0.6, 'rgba(200, 220, 240, 0.5)');
      polarGrad.addColorStop(1, 'rgba(180, 160, 140, 0)');
      ctx.fillStyle = polarGrad;
      ctx.beginPath();
      ctx.ellipse(size / 2, 60, 350, 100, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ice cap layers
      ctx.strokeStyle = 'rgba(200, 210, 220, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.ellipse(size / 2, 60, 300 - i * 50, 80 - i * 12, 0, 0, Math.PI * 2);
          ctx.stroke();
      }

      // South polar cap (smaller)
      const southPolarGrad = ctx.createRadialGradient(size / 2, size - 40, 0, size / 2, size - 40, 200);
      southPolarGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      southPolarGrad.addColorStop(0.5, 'rgba(230, 240, 250, 0.6)');
      southPolarGrad.addColorStop(1, 'rgba(180, 160, 140, 0)');
      ctx.fillStyle = southPolarGrad;
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 40, 200, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dust storm patterns
      ctx.fillStyle = 'rgba(220, 180, 140, 0.15)';
      for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 120 + 40, Math.random() * 40 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
      }

      // Add surface texture noise
      generateNoise(ctx, size, 20, 0.15);
}

export function drawJupiterSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Banded gas giant
      const bands = [
          '#e8d4b8', '#d4a574', '#c49a6c', '#e0c090', '#d4b080',
          '#c8a070', '#dcc898', '#c49464', '#e4d0a0', '#d0a878'
      ];

      const bandHeight = size / bands.length;
      bands.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, i * bandHeight, size, bandHeight + 2);
      });

      // Add turbulent flow patterns
      for (let i = 0; i < 300; i++) {
          const y = Math.random() * size;

          ctx.save();
          ctx.translate(Math.random() * size, y);

          ctx.beginPath();
          ctx.ellipse(0, 0, Math.random() * 60 + 20, Math.random() * 15 + 5, Math.random() * 0.5 - 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${140 + Math.random() * 40}, ${80 + Math.random() * 40}, ${Math.random() * 0.4 + 0.1})`;
          ctx.fill();

          ctx.restore();
      }

      // Great Red Spot
      ctx.save();
      ctx.translate(size * 0.65, size * 0.55);
      ctx.rotate(-0.1);

      // Outer ring
      ctx.beginPath();
      ctx.ellipse(0, 0, 140, 90, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#c06050';
      ctx.fill();

      // Inner swirl
      ctx.beginPath();
      ctx.ellipse(0, 0, 100, 60, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#d07060';
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#b05040';
      ctx.fill();

      ctx.restore();

      // Add swirl lines
      ctx.strokeStyle = 'rgba(255, 240, 220, 0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          const y = Math.random() * size;
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 20, size * 0.7, y + (Math.random() - 0.5) * 20, size, y);
          ctx.stroke();
      }
}

export function drawSaturnSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Subtle banded gas giant
      const bands = [
          '#f4e4c4', '#e8d4a8', '#f0dab0', '#e4d0a0', '#f4e0b8',
          '#e8d4a8', '#f0d8b0', '#e4cca0', '#f4dcb8', '#e8d0a4'
      ];

      const bandHeight = size / bands.length;
      bands.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, i * bandHeight, size, bandHeight + 2);
      });

      // Subtle atmospheric patterns
      for (let i = 0; i < 200; i++) {
          ctx.fillStyle = `rgba(${230 + Math.random() * 25}, ${210 + Math.random() * 25}, ${170 + Math.random() * 30}, ${Math.random() * 0.2})`;
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 80 + 30, Math.random() * 15 + 5, 0, 0, Math.PI * 2);
          ctx.fill();
      }

      // Hexagonal polar storm (Saturn's north pole)
      ctx.strokeStyle = 'rgba(200, 180, 140, 0.5)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const x = size / 2 + Math.cos(angle) * 100;
          const y = 100 + Math.sin(angle) * 100;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
}

export function drawUranusSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Pale blue-green ice giant
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
      gradient.addColorStop(0, '#c4e4e8');
      gradient.addColorStop(0.5, '#a8d4d8');
      gradient.addColorStop(1, '#88c4c8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Subtle cloud bands
      for (let i = 0; i < 20; i++) {
          const y = i * (size / 20);
          ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${220 + Math.random() * 20}, ${220 + Math.random() * 20}, ${Math.random() * 0.2})`;
          ctx.fillRect(0, y, size, size / 20);
      }

      // Sparse cloud features
      for (let i = 0; i < 50; i++) {
          ctx.fillStyle = `rgba(220, 240, 250, ${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 40 + 10, Math.random() * 15 + 5, 0, 0, Math.PI * 2);
          ctx.fill();
      }
}

export function drawNeptuneSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Deep blue ice giant
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
      gradient.addColorStop(0, '#5080d0');
      gradient.addColorStop(0.5, '#4070c0');
      gradient.addColorStop(1, '#3060b0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Dynamic storm bands
      for (let i = 0; i < 15; i++) {
          const y = i * (size / 15);
          ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${100 + Math.random() * 40}, ${180 + Math.random() * 40}, ${Math.random() * 0.3})`;
          ctx.fillRect(0, y, size, size / 15);
      }

      // Great Dark Spot
      ctx.save();
      ctx.translate(size * 0.4, size * 0.45);
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 50, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#203860';
      ctx.fill();
      ctx.restore();

      // Bright cloud features
      ctx.fillStyle = 'rgba(200, 220, 255, 0.5)';
      for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 30 + 10, Math.random() * 10 + 5, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
      }

      // High altitude cirrus clouds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          const y = Math.random() * size;
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 30, size * 0.7, y + (Math.random() - 0.5) * 30, size, y);
          ctx.stroke();
      }
}

export function drawSunSurface(ctx: CanvasRenderingContext2D, size: number): void {
      // Solar surface with granulation
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
      gradient.addColorStop(0, '#fff8e0');
      gradient.addColorStop(0.3, '#ffdd44');
      gradient.addColorStop(0.7, '#ff9900');
      gradient.addColorStop(1, '#cc4400');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Solar granulation (convection cells)
      for (let i = 0; i < 2000; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const radius = Math.random() * 15 + 5;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, ${50 + Math.random() * 100}, ${Math.random() * 0.3 + 0.1})`;
          ctx.fill();
      }

      // Sunspots
      for (let i = 0; i < 8; i++) {
          const x = Math.random() * size * 0.6 + size * 0.2;
          const y = Math.random() * size * 0.6 + size * 0.2;
          const radius = Math.random() * 40 + 20;

          // Penumbra
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#884400';
          ctx.fill();

          // Umbra
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#332200';
          ctx.fill();
      }

      // Solar flares
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const startR = size * 0.45;
          ctx.beginPath();
          ctx.moveTo(size / 2 + Math.cos(angle) * startR, size / 2 + Math.sin(angle) * startR);
          ctx.quadraticCurveTo(
              size / 2 + Math.cos(angle + 0.1) * (startR + 50),
              size / 2 + Math.sin(angle + 0.1) * (startR + 50),
              size / 2 + Math.cos(angle + 0.2) * startR,
              size / 2 + Math.sin(angle + 0.2) * startR
          );
          ctx.stroke();
      }
}
