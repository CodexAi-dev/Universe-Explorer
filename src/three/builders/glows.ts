/**
 * Radial-gradient sprite textures used for glows and halos.
 * Ported from the v1 `SolarSystem` class methods of the same names.
 */
import * as THREE from 'three'

export function createGlowTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 150, 50, 0.8)');
      gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
}

export function createSunGlowTexture(intensity: number, innerColor: string, outerColor: string): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, innerColor);
      gradient.addColorStop(0.1, innerColor);
      gradient.addColorStop(0.4, outerColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = intensity;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      return new THREE.CanvasTexture(canvas);
}

export function createNebulaGlowTexture(innerColor: string, outerColor: string): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Helper function to convert color to rgba with alpha
      const colorWithAlpha = (color: string, alpha: number): string => {
          // If already rgba, extract and modify
          if (color.startsWith('rgba')) {
              return color.replace(/[\d.]+\)$/, alpha + ')');
          }
          // If rgb, convert to rgba
          if (color.startsWith('rgb(')) {
              return color.replace('rgb(', 'rgba(').replace(')', ', ' + alpha + ')');
          }
          // If hex, convert to rgba
          if (color.startsWith('#')) {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          }
          // Fallback
          return `rgba(128, 128, 128, ${alpha})`;
      };

      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, outerColor);
      gradient.addColorStop(0.2, innerColor);
      gradient.addColorStop(0.5, colorWithAlpha(innerColor, 0.53));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      return new THREE.CanvasTexture(canvas);
}
