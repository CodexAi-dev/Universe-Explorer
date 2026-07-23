/**
 * Sun surface texture, layered glow, corona and solar wind.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'
import { PLANET_DATA } from '../../data/planets'

export function createRealisticSunTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Base gradient - photosphere
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#fff8dc');
      gradient.addColorStop(0.2, '#ffdd44');
      gradient.addColorStop(0.5, '#ffaa00');
      gradient.addColorStop(0.8, '#ff8800');
      gradient.addColorStop(1, '#ff6600');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Solar granulation (convection cells) - thousands of them
      for (let i = 0; i < 5000; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 12 + 3;

          // Brighter cell center
          const cellGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
          cellGrad.addColorStop(0, `rgba(255, ${240 + Math.random() * 15}, ${200 + Math.random() * 55}, ${0.3 + Math.random() * 0.3})`);
          cellGrad.addColorStop(0.7, `rgba(255, ${200 + Math.random() * 40}, ${100 + Math.random() * 50}, ${0.15 + Math.random() * 0.15})`);
          cellGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');

          ctx.fillStyle = cellGrad;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
      }

      // Sunspots with penumbra and umbra
      const sunspotCount = 5 + Math.floor(Math.random() * 8);
      for (let i = 0; i < sunspotCount; i++) {
          const x = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
          const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
          const radius = Math.random() * 50 + 20;

          // Penumbra (outer region)
          const penumbra = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
          penumbra.addColorStop(0, '#553311');
          penumbra.addColorStop(0.5, '#774422');
          penumbra.addColorStop(1, 'rgba(150, 100, 50, 0)');
          ctx.fillStyle = penumbra;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Umbra (dark core)
          ctx.fillStyle = '#221100';
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
      }

      // Bright faculae (bright patches near sunspots)
      for (let i = 0; i < 30; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(255, 255, 230, ${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(x, y, Math.random() * 40 + 10, Math.random() * 20 + 5, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
      }

      // Supergranulation pattern
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          const startX = Math.random() * canvas.width;
          const startY = Math.random() * canvas.height;
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
              startX + (Math.random() - 0.5) * 200,
              startY + (Math.random() - 0.5) * 100,
              startX + (Math.random() - 0.5) * 200,
              startY + (Math.random() - 0.5) * 100,
              startX + (Math.random() - 0.5) * 300,
              startY + (Math.random() - 0.5) * 150
          );
          ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
}

export function createSolarProminence(baseAngle: number): THREE.Mesh {
      const points = [];
      const height = Math.random() * 6 + 3;
      const spread = Math.random() * 0.4 + 0.2;

      for (let i = 0; i <= 30; i++) {
          const t = i / 30;
          const angle = baseAngle + (t - 0.5) * spread;
          const r = PLANET_DATA.sun.size + Math.sin(t * Math.PI) * height;
          points.push(new THREE.Vector3(
              Math.cos(angle) * r,
              Math.sin(angle) * r,
              Math.sin(t * Math.PI) * 2
          ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 30, 0.3, 8, false);
      const material = new THREE.MeshBasicMaterial({
          color: 0xff4400,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending
      });

      return new THREE.Mesh(geometry, material);
}
