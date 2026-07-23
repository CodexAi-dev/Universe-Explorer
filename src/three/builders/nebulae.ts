/**
 * Layered particle/filament nebula construction.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'
import { createNebulaGlowTexture } from './glows'

export function getNebulaType(key: string): string {
      // Assign types to known nebulae
      const types: Record<string, string> = {
          'orion': 'emission',
          'crab': 'planetary',
          'eagle': 'emission',
          'helix': 'planetary',
          'horsehead': 'dark',
          'carina': 'emission',
          'lagoon': 'emission',
          'ring': 'planetary',
          'pillars': 'emission'
      };
      return types[key] || 'emission';
}

export function createNebulaGasLayer(group: THREE.Group, scale: number, count: number, color: THREE.Color, minOpacity: number, maxOpacity: number): void {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
          // Create more natural gas distribution
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          // Use multiple octaves of noise for realistic distribution
          const noiseScale = 3;
          const r = Math.pow(Math.random(), 0.25) * scale;
          const turbulence = (Math.sin(theta * noiseScale) * Math.cos(phi * noiseScale * 0.7)) * 0.3;

          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * (1 + turbulence);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * (0.6 + turbulence * 0.5);
          positions[i * 3 + 2] = r * Math.cos(phi) * (1 + turbulence);

          // Color variation
          const brightness = minOpacity + Math.random() * (maxOpacity - minOpacity);
          colors[i * 3] = color.r * brightness * (0.8 + Math.random() * 0.4);
          colors[i * 3 + 1] = color.g * brightness * (0.8 + Math.random() * 0.4);
          colors[i * 3 + 2] = color.b * brightness * (0.8 + Math.random() * 0.4);

          sizes[i] = 1 + Math.random() * 5;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
          size: 4,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
      });

      group.add(new THREE.Points(geometry, material));
}

export function createNebulaFilaments(group: THREE.Group, scale: number, baseColor: THREE.Color, glowColor: THREE.Color): void {
      // Create tendril-like gas filaments
      const filamentCount = 15;

      for (let f = 0; f < filamentCount; f++) {
          const points = [];
          const startAngle = Math.random() * Math.PI * 2;
          const length = scale * (0.5 + Math.random() * 0.8);

          for (let i = 0; i <= 30; i++) {
              const t = i / 30;
              const angle = startAngle + t * (Math.random() - 0.5) * 2;
              const r = t * length;
              const wobble = Math.sin(t * Math.PI * 4) * scale * 0.1;

              points.push(new THREE.Vector3(
                  Math.cos(angle) * r + wobble,
                  (Math.random() - 0.5) * scale * 0.3 * t,
                  Math.sin(angle) * r + wobble
              ));
          }

          const curve = new THREE.CatmullRomCurve3(points);
          const tubeGeometry = new THREE.TubeGeometry(curve, 30, scale * 0.03 * (1 + Math.random()), 8, false);

          const color = Math.random() > 0.5 ? baseColor : glowColor;
          const tubeMaterial = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.3 + Math.random() * 0.2,
              blending: THREE.AdditiveBlending
          });

          group.add(new THREE.Mesh(tubeGeometry, tubeMaterial));
      }
}

export function createNebulaDenseRegions(group: THREE.Group, scale: number, color: THREE.Color, count: number): void {
      for (let i = 0; i < count; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI - Math.PI / 2;
          const r = Math.random() * scale * 0.8;

          const x = r * Math.cos(phi) * Math.cos(theta);
          const y = r * Math.sin(phi);
          const z = r * Math.cos(phi) * Math.sin(theta);

          const knotSize = scale * (0.1 + Math.random() * 0.15);

          // Dense gas knot
          const knotGlow = new THREE.SpriteMaterial({
              map: createNebulaGlowTexture(color.getStyle(), '#ffffff'),
              transparent: true,
              blending: THREE.AdditiveBlending,
              opacity: 0.5 + Math.random() * 0.3
          });
          const knot = new THREE.Sprite(knotGlow);
          knot.position.set(x, y, z);
          knot.scale.set(knotSize, knotSize, 1);
          group.add(knot);
      }
}

export function createEmissionKnots(group: THREE.Group, scale: number, color: THREE.Color): void {
      // Bright HII region knots
      const knotCount = 12;

      for (let i = 0; i < knotCount; i++) {
          const pos = new THREE.Vector3(
              (Math.random() - 0.5) * scale,
              (Math.random() - 0.5) * scale * 0.5,
              (Math.random() - 0.5) * scale
          );

          // Bright emission point
          const geometry = new THREE.SphereGeometry(scale * 0.02, 8, 8);
          const material = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.8
          });
          const knot = new THREE.Mesh(geometry, material);
          knot.position.copy(pos);
          group.add(knot);

          // Knot glow
          const glowMat = new THREE.SpriteMaterial({
              map: createNebulaGlowTexture(color.getStyle(), '#ffffff'),
              transparent: true,
              blending: THREE.AdditiveBlending,
              opacity: 0.6
          });
          const glow = new THREE.Sprite(glowMat);
          glow.position.copy(pos);
          glow.scale.set(scale * 0.1, scale * 0.1, 1);
          group.add(glow);
      }
}

export function createNebulaStars(group: THREE.Group, scale: number, count: number): void {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * scale * 1.5;
          positions[i * 3 + 1] = (Math.random() - 0.5) * scale * 0.8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * scale * 1.5;

          // Young hot stars (blue-white)
          const temp = Math.random();
          colors[i * 3] = 0.8 + temp * 0.2;
          colors[i * 3 + 1] = 0.9 + temp * 0.1;
          colors[i * 3 + 2] = 1.0;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
          size: 2,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
      });

      group.add(new THREE.Points(geometry, material));
}

export function createNebulaCore(group: THREE.Group, scale: number, color: THREE.Color): void {
      // Central illumination
      const glowMat = new THREE.SpriteMaterial({
          map: createNebulaGlowTexture(color.getStyle(), '#ffffff'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          opacity: 0.6
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(scale, scale, 1);
      group.add(glow);
}

export function createNebulaShell(group: THREE.Group, scale: number, color: THREE.Color, opacity: number): void {
      // Spherical shell for planetary nebulae
      const geometry = new THREE.SphereGeometry(scale, 64, 64);
      const material = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: opacity * 0.3,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          wireframe: false
      });

      const shell = new THREE.Mesh(geometry, material);
      group.add(shell);

      // Add gas particles on shell surface
      const particleCount = 2000;
      const particleGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = scale * (0.9 + Math.random() * 0.2);

          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);

          colors[i * 3] = color.r * (0.7 + Math.random() * 0.5);
          colors[i * 3 + 1] = color.g * (0.7 + Math.random() * 0.5);
          colors[i * 3 + 2] = color.b * (0.7 + Math.random() * 0.5);
      }

      particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
          size: 2,
          vertexColors: true,
          transparent: true,
          opacity: opacity,
          blending: THREE.AdditiveBlending
      });

      group.add(new THREE.Points(particleGeom, particleMat));
}

export function createBipolarJets(group: THREE.Group, scale: number, color: THREE.Color): void {
      // Jets shooting from central star
      for (let dir = -1; dir <= 1; dir += 2) {
          const points = [];
          for (let i = 0; i <= 20; i++) {
              const t = i / 20;
              const spread = t * scale * 0.3;
              points.push(new THREE.Vector3(
                  (Math.random() - 0.5) * spread * 0.3,
                  dir * t * scale * 0.8,
                  (Math.random() - 0.5) * spread * 0.3
              ));
          }

          const curve = new THREE.CatmullRomCurve3(points);
          const geometry = new THREE.TubeGeometry(curve, 20, scale * 0.05, 8, false);
          const material = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.4,
              blending: THREE.AdditiveBlending
          });
          group.add(new THREE.Mesh(geometry, material));
      }
}

export function createDustLanes(group: THREE.Group, scale: number): void {
      // Dark dust lanes crossing the nebula
      for (let i = 0; i < 5; i++) {
          const geometry = new THREE.PlaneGeometry(scale * (0.5 + Math.random()), scale * 0.1);
          const material = new THREE.MeshBasicMaterial({
              color: 0x110500,
              transparent: true,
              opacity: 0.5,
              side: THREE.DoubleSide
          });

          const lane = new THREE.Mesh(geometry, material);
          lane.position.set(
              (Math.random() - 0.5) * scale * 0.5,
              (Math.random() - 0.5) * scale * 0.3,
              (Math.random() - 0.5) * scale * 0.5
          );
          lane.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
          );
          group.add(lane);
      }
}

export function createEmissionNebula(group: THREE.Group, data: any): void {
      // Multi-layered emission nebula with gas clouds and stars
      const baseColor = new THREE.Color(data.color);
      const glowColor = new THREE.Color(data.glowColor);

      // Layer 1: Outer diffuse gas cloud
      createNebulaGasLayer(group, data.scale * 1.2, 5000, baseColor, 0.15, 0.3);

      // Layer 2: Main nebula body with filaments
      createNebulaFilaments(group, data.scale, baseColor, glowColor);

      // Layer 3: Dense core regions
      createNebulaDenseRegions(group, data.scale * 0.6, glowColor, 8);

      // Layer 4: Bright emission knots
      createEmissionKnots(group, data.scale, glowColor);

      // Embedded young stars
      createNebulaStars(group, data.scale, 50);

      // Central illumination source
      createNebulaCore(group, data.scale * 0.8, glowColor);
}

export function createPlanetaryNebula(group: THREE.Group, data: any): void {
      const baseColor = new THREE.Color(data.color);
      const glowColor = new THREE.Color(data.glowColor);

      // Outer shell
      createNebulaShell(group, data.scale, baseColor, 0.4);

      // Inner shell (different color)
      const innerColor = new THREE.Color(data.glowColor).offsetHSL(0.1, 0, 0);
      createNebulaShell(group, data.scale * 0.6, innerColor, 0.6);

      // Central white dwarf star
      const starGeometry = new THREE.SphereGeometry(data.scale * 0.05, 16, 16);
      const starMaterial = new THREE.MeshBasicMaterial({
          color: 0xaaccff,
          transparent: false
      });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      group.add(star);

      // Star glow
      const starGlow = new THREE.SpriteMaterial({
          map: createNebulaGlowTexture('#aaccff', '#ffffff'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          opacity: 0.8
      });
      const glowSprite = new THREE.Sprite(starGlow);
      glowSprite.scale.set(data.scale * 0.3, data.scale * 0.3, 1);
      group.add(glowSprite);

      // Bipolar jets (for some planetary nebulae)
      createBipolarJets(group, data.scale, glowColor);
}

export function createReflectionNebula(group: THREE.Group, data: any): void {
      const baseColor = new THREE.Color(data.color);

      // Blue-ish scattered light cloud
      createNebulaGasLayer(group, data.scale, 3000, baseColor, 0.25, 0.5);

      // Illuminating stars
      createNebulaStars(group, data.scale, 20);

      // Dust lanes
      createDustLanes(group, data.scale);
}

export function createDarkNebula(group: THREE.Group, data: any): void {
      // Dark nebula absorbs background light
      const particleCount = 4000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = Math.pow(Math.random(), 0.4) * data.scale;

          // Irregular shape
          const irregularity = 0.5 + Math.random() * 0.5;
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * irregularity;
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * irregularity * 0.7;
          positions[i * 3 + 2] = r * Math.cos(phi) * irregularity;

          // Very dark reddish-brown
          colors[i * 3] = 0.1 + Math.random() * 0.05;
          colors[i * 3 + 1] = 0.05 + Math.random() * 0.03;
          colors[i * 3 + 2] = 0.02 + Math.random() * 0.02;

          sizes[i] = 2 + Math.random() * 4;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
          size: 5,
          vertexColors: true,
          transparent: true,
          opacity: 0.7,
          sizeAttenuation: true
      });

      group.add(new THREE.Points(geometry, material));

      // Faint rim illumination
      const rimGlow = new THREE.SpriteMaterial({
          map: createNebulaGlowTexture('#331100', '#000000'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          opacity: 0.2
      });
      const rim = new THREE.Sprite(rimGlow);
      rim.scale.set(data.scale * 2.5, data.scale * 1.5, 1);
      group.add(rim);
}
