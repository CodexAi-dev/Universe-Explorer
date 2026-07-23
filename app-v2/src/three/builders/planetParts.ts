/**
 * Planet atmosphere shell and ring system.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'

export function createAtmosphere(planet: THREE.Mesh, data: any): void {
      const atmosphereSize = data.size * 1.05;
      const geometry = new THREE.SphereGeometry(atmosphereSize, 32, 32);

      const material = new THREE.MeshBasicMaterial({
          color: data.atmosphereColor,
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      planet.add(atmosphere);
}

export function createRings(planet: THREE.Mesh, name: string, data: any): void {
      const ringInner = data.size * 1.4;
      const ringOuter = data.size * 2.4;

      // Create ring texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      const gradient = ctx.createLinearGradient(0, 0, 512, 0);

      if (name === 'saturn') {
          gradient.addColorStop(0, 'rgba(200, 166, 90, 0)');
          gradient.addColorStop(0.1, 'rgba(200, 166, 90, 0.8)');
          gradient.addColorStop(0.2, 'rgba(180, 150, 80, 0.3)');
          gradient.addColorStop(0.3, 'rgba(200, 166, 90, 0.9)');
          gradient.addColorStop(0.5, 'rgba(220, 190, 120, 0.7)');
          gradient.addColorStop(0.7, 'rgba(200, 166, 90, 0.5)');
          gradient.addColorStop(0.9, 'rgba(180, 150, 80, 0.3)');
          gradient.addColorStop(1, 'rgba(160, 130, 70, 0)');
      } else {
          // Uranus has fainter rings
          gradient.addColorStop(0, 'rgba(100, 100, 150, 0)');
          gradient.addColorStop(0.2, 'rgba(100, 100, 150, 0.3)');
          gradient.addColorStop(0.8, 'rgba(100, 100, 150, 0.2)');
          gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 64);

      // Add ring detail lines
      for (let i = 0; i < 50; i++) {
          const x = Math.random() * 512;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
          ctx.fillRect(x, 0, 1, 64);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.rotation = Math.PI / 2;

      const geometry = new THREE.RingGeometry(ringInner, ringOuter, 64);

      // Fix UV mapping for ring
      const pos = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const dist = Math.sqrt(x * x + y * y);
          uv.setXY(i, (dist - ringInner) / (ringOuter - ringInner), 0.5);
      }

      const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: name === 'saturn' ? 0.9 : 0.4
      });

      const rings = new THREE.Mesh(geometry, material);
      rings.rotation.x = Math.PI / 2;

      // Add tilt for Uranus rings
      if (name === 'uranus') {
          rings.rotation.y = Math.PI / 2;
      }

      planet.add(rings);
      planet.userData.rings = rings;
}
