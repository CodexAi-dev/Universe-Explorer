/**
 * Low-detail (512x256) procedural planet surface painting.
 * Ported verbatim from the v1 `SolarSystem` class methods of the same names.
 */

export function addCraters(ctx: CanvasRenderingContext2D, count: number): void {
      for (let i = 0; i < count; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 256;
          const radius = Math.random() * 15 + 5;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.3 + 0.1})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x + 2, y + 2, radius - 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(120, 120, 120, ${Math.random() * 0.2})`;
          ctx.fill();
      }
}

export function addCloudBands(ctx: CanvasRenderingContext2D, color: string, opacity: number): void {
      for (let i = 0; i < 10; i++) {
          const y = Math.random() * 256;
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity * Math.random();
          ctx.fillRect(0, y, 512, Math.random() * 30 + 10);
      }
      ctx.globalAlpha = 1;
}

export function addSubtleBands(ctx: CanvasRenderingContext2D, color: string, opacity: number): void {
      for (let i = 0; i < 5; i++) {
          const y = (256 / 6) * (i + 1);
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          ctx.fillRect(0, y - 5, 512, 10);
      }
      ctx.globalAlpha = 1;
}

export function addEarthContinents(ctx: CanvasRenderingContext2D): void {
      // Simplified continent shapes
      ctx.fillStyle = '#228B22';

      // North America
      ctx.beginPath();
      ctx.moveTo(50, 60);
      ctx.lineTo(120, 50);
      ctx.lineTo(130, 100);
      ctx.lineTo(80, 120);
      ctx.lineTo(40, 90);
      ctx.closePath();
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.moveTo(100, 130);
      ctx.lineTo(130, 140);
      ctx.lineTo(120, 200);
      ctx.lineTo(90, 210);
      ctx.lineTo(80, 170);
      ctx.closePath();
      ctx.fill();

      // Europe/Africa
      ctx.beginPath();
      ctx.moveTo(240, 60);
      ctx.lineTo(280, 50);
      ctx.lineTo(300, 90);
      ctx.lineTo(290, 180);
      ctx.lineTo(250, 200);
      ctx.lineTo(230, 140);
      ctx.closePath();
      ctx.fill();

      // Asia
      ctx.beginPath();
      ctx.moveTo(300, 40);
      ctx.lineTo(420, 50);
      ctx.lineTo(450, 100);
      ctx.lineTo(400, 130);
      ctx.lineTo(320, 110);
      ctx.closePath();
      ctx.fill();

      // Australia
      ctx.beginPath();
      ctx.moveTo(400, 160);
      ctx.lineTo(450, 155);
      ctx.lineTo(460, 190);
      ctx.lineTo(420, 200);
      ctx.lineTo(390, 180);
      ctx.closePath();
      ctx.fill();
}

export function addJupiterBands(ctx: CanvasRenderingContext2D): void {
      const colors = ['#d8ca9d', '#c4a67a', '#b89d6a', '#d4b88a', '#e0c8a0', '#c0986a'];
      const bandHeight = 256 / colors.length;

      colors.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, i * bandHeight, 512, bandHeight);
      });

      // Great Red Spot
      ctx.fillStyle = '#c75050';
      ctx.beginPath();
      ctx.ellipse(350, 160, 45, 30, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Add some turbulence
      for (let i = 0; i < 30; i++) {
          ctx.fillStyle = `rgba(180, 140, 100, ${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(
              Math.random() * 512,
              Math.random() * 256,
              Math.random() * 20 + 5,
              Math.random() * 8 + 2,
              Math.random() * Math.PI,
              0, Math.PI * 2
          );
          ctx.fill();
      }
}

export function addSaturnBands(ctx: CanvasRenderingContext2D): void {
      const colors = ['#f4d59e', '#e0c080', '#d4b070', '#ecd090', '#f0d898', '#dcc080'];
      const bandHeight = 256 / colors.length;

      colors.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, i * bandHeight, 512, bandHeight);
      });

      // Add subtle band variations
      for (let i = 0; i < 20; i++) {
          ctx.fillStyle = `rgba(200, 160, 100, ${Math.random() * 0.2})`;
          ctx.fillRect(0, Math.random() * 256, 512, Math.random() * 15 + 5);
      }
}
