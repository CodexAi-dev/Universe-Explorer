/**
 * Particle-built galaxy meshes.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'
import { createGlowTexture } from './glows'

export function createSpiralGalaxyMesh(group: THREE.Group, data: any): void {
      const particleCount = 3000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const baseColor = new THREE.Color(data.color);

      for (let i = 0; i < particleCount; i++) {
          const arm = Math.floor(Math.random() * 2);
          const armOffset = arm * Math.PI;
          const distance = Math.random() * data.scale;
          const angle = armOffset + (distance / data.scale) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const height = (Math.random() - 0.5) * (data.scale * 0.1);

          positions[i * 3] = Math.cos(angle) * distance;
          positions[i * 3 + 1] = height;
          positions[i * 3 + 2] = Math.sin(angle) * distance;

          const brightness = 0.5 + Math.random() * 0.5;
          colors[i * 3] = baseColor.r * brightness;
          colors[i * 3 + 1] = baseColor.g * brightness;
          colors[i * 3 + 2] = baseColor.b * brightness;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
          size: 2,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
      });

      group.add(new THREE.Points(geometry, material));

      // Add central glow
      const glowMaterial = new THREE.SpriteMaterial({
          map: createGlowTexture(),
          color: data.color,
          transparent: true,
          blending: THREE.AdditiveBlending,
          opacity: 0.6
      });
      const glow = new THREE.Sprite(glowMaterial);
      glow.scale.set(data.scale * 0.8, data.scale * 0.8, 1);
      group.add(glow);
}

export function createRingGalaxyMesh(group: THREE.Group, data: any): void {
      // Ring geometry
      const ringGeometry = new THREE.TorusGeometry(data.scale * 0.7, data.scale * 0.15, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
          color: data.color,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Central core
      const coreGeometry = new THREE.SphereGeometry(data.scale * 0.2, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffcc,
          transparent: true,
          opacity: 0.7
      });
      group.add(new THREE.Mesh(coreGeometry, coreMaterial));
}

export function createEllipticalGalaxyMesh(group: THREE.Group, data: any): void {
      const particleCount = 2000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const baseColor = new THREE.Color(data.color);

      for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = Math.pow(Math.random(), 0.5) * data.scale;

          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
          positions[i * 3 + 2] = r * Math.cos(phi);

          const brightness = 0.4 + Math.random() * 0.6;
          colors[i * 3] = baseColor.r * brightness;
          colors[i * 3 + 1] = baseColor.g * brightness;
          colors[i * 3 + 2] = baseColor.b * brightness;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
          size: 2,
          vertexColors: true,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending
      });

      group.add(new THREE.Points(geometry, material));
}
