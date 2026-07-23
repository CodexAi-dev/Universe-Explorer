/**
 * Value-noise helpers used by the high-detail surface painters.
 * Ported verbatim from the v1 `SolarSystem` class methods of the same names.
 */

export function smoothNoise(x: number, y: number, seed: number): number {
      const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
      return n - Math.floor(n);
}

export function fractalNoise(x: number, y: number, octaves: number, persistence: number): number {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;

      for (let i = 0; i < octaves; i++) {
          total += smoothNoise(x * frequency, y * frequency, i * 1000) * amplitude;
          maxValue += amplitude;
          amplitude *= persistence;
          frequency *= 2;
      }

      return total / maxValue;
}

/** `_opacity` is part of the v1 signature but was never used by the body. */
export function generateNoise(ctx: CanvasRenderingContext2D, size: number, scale: number, _opacity: number): void {
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * scale;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }

      ctx.putImageData(imageData, 0, 0);
}
