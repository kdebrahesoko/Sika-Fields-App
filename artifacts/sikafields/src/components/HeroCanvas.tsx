import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroCanvasProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function HeroCanvas({ containerRef }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const grainCanvas = grainCanvasRef.current;
    if (!canvas || !grainCanvas) return;

    const ctx = canvas.getContext("2d");
    const grainCtx = grainCanvas.getContext("2d");
    if (!ctx || !grainCtx) return;

    const density = " .:-=+*#%@";

    const params = {
      rotation: 0,
      atmosphereShift: 0,
      glitchIntensity: 0,
      glitchFrequency: 0,
    };

    const tweens: gsap.core.Tween[] = [];

    tweens.push(
      gsap.to(params, {
        rotation: Math.PI * 2,
        duration: 25,
        repeat: -1,
        ease: "none",
      })
    );

    tweens.push(
      gsap.to(params, {
        atmosphereShift: 1,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    );

    tweens.push(
      gsap.to(params, {
        glitchIntensity: 1,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        repeatDelay: Math.random() * 4 + 2,
      })
    );

    tweens.push(
      gsap.to(params, {
        glitchFrequency: 1,
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: "none",
      })
    );

    const generateFilmGrain = (width: number, height: number, intensity = 0.15) => {
      const imageData = grainCtx.createImageData(width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 1] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 2] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 3] = Math.abs(grain) * 3;
      }
      return imageData;
    };

    const drawGlitchedOrb = (
      centerX: number,
      centerY: number,
      radius: number,
      hue: number,
      glitchIntensity: number
    ) => {
      ctx.save();

      const shouldGlitch = Math.random() < 0.08 && glitchIntensity > 0.5;
      const glitchOffset = shouldGlitch ? (Math.random() - 0.5) * 18 * glitchIntensity : 0;
      const glitchScale = shouldGlitch ? 1 + (Math.random() - 0.5) * 0.25 * glitchIntensity : 1;

      if (shouldGlitch) {
        ctx.translate(glitchOffset, glitchOffset * 0.8);
        ctx.scale(glitchScale, 1 / glitchScale);
      }

      const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.6);
      orbGradient.addColorStop(0, `hsla(${hue + 10}, 100%, 90%, 0.85)`);
      orbGradient.addColorStop(0.2, `hsla(${hue + 20}, 80%, 70%, 0.6)`);
      orbGradient.addColorStop(0.5, `hsla(${hue}, 65%, 40%, 0.35)`);
      orbGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = orbGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerRadius = radius * 0.28;
      ctx.fillStyle = `hsla(${hue + 25}, 100%, 90%, 0.75)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();

      if (shouldGlitch) {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `hsla(${hue + 60}, 100%, 55%, ${0.5 * glitchIntensity})`;
        ctx.beginPath();
        ctx.arc(centerX + glitchOffset * 0.5, centerY, centerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${hue - 60}, 100%, 55%, ${0.4 * glitchIntensity})`;
        ctx.beginPath();
        ctx.arc(centerX - glitchOffset * 0.5, centerY, centerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = `rgba(100, 255, 180, ${0.55 * glitchIntensity})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const y = centerY - radius + Math.random() * radius * 2;
          ctx.beginPath();
          ctx.moveTo(centerX - radius + Math.random() * 20, y);
          ctx.lineTo(centerX + radius - Math.random() * 20, y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(0, 255, 128, ${0.35 * glitchIntensity})`;
        for (let i = 0; i < 3; i++) {
          const bx = centerX - radius + Math.random() * radius * 2;
          const by = centerY - radius + Math.random() * radius * 2;
          const bs = Math.random() * 10 + 2;
          ctx.fillRect(bx, by, bs, bs);
        }
      }

      ctx.strokeStyle = `hsla(${hue + 20}, 75%, 65%, 0.55)`;
      ctx.lineWidth = 1.5;

      if (shouldGlitch) {
        const segments = 8;
        for (let i = 0; i < segments; i++) {
          const startAngle = (i / segments) * Math.PI * 2;
          const endAngle = ((i + 1) / segments) * Math.PI * 2;
          const ringRadius = radius * 1.2 + (Math.random() - 0.5) * 10 * glitchIntensity;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (shouldGlitch && Math.random() < 0.25) {
        ctx.globalCompositeOperation = "difference";
        ctx.fillStyle = `rgba(200, 255, 220, ${0.7 * glitchIntensity})`;
        for (let i = 0; i < 3; i++) {
          const barY = centerY - radius + Math.random() * radius * 2;
          const barH = Math.random() * 4 + 1;
          ctx.fillRect(centerX - radius, barY, radius * 2, barH);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.restore();
    };

    let running = true;

    function render() {
      if (!running || !canvas || !grainCanvas || !ctx || !grainCtx) return;

      timeRef.current += 0.016;
      const time = timeRef.current;

      const width = (canvas.width = grainCanvas.width = window.innerWidth);
      const height = (canvas.height = grainCanvas.height = window.innerHeight);

      ctx.fillStyle = "#0a1a0f";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.22;

      const hue = 130 + params.atmosphereShift * 50;

      const bgGradient = ctx.createRadialGradient(
        centerX, centerY - 60, 0,
        centerX, centerY, Math.max(width, height) * 0.9
      );
      bgGradient.addColorStop(0, `hsla(${hue + 20}, 70%, 30%, 0.5)`);
      bgGradient.addColorStop(0.25, `hsla(${hue}, 55%, 18%, 0.4)`);
      bgGradient.addColorStop(0.6, `hsla(${hue - 15}, 40%, 10%, 0.3)`);
      bgGradient.addColorStop(1, "rgba(5, 12, 8, 0.95)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      drawGlitchedOrb(centerX, centerY, radius, hue, params.glitchIntensity);

      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const spacing = 10;
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      for (let i = 0; i < cols && i < 140; i++) {
        for (let j = 0; j < rows && j < 90; j++) {
          const x = (i - cols / 2) * spacing + centerX;
          const y = (j - rows / 2) * spacing + centerY;
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius && Math.random() > 0.42) {
            const z = Math.sqrt(Math.max(0, radius * radius - dx * dx - dy * dy));
            const angle = params.rotation;
            const rotZ = dx * Math.sin(angle) + z * Math.cos(angle);
            const brightness = (rotZ + radius) / (radius * 2);

            if (rotZ > -radius * 0.3) {
              const charIndex = Math.floor(brightness * (density.length - 1));
              let char = density[charIndex];

              if (dist < radius * 0.8 && params.glitchIntensity > 0.8 && Math.random() < 0.25) {
                const glitchChars = ["█", "▓", "▒", "░", "▄", "▀", "■", "□"];
                char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
              }

              const alpha = Math.max(0.18, brightness * 0.9);
              ctx.fillStyle = `rgba(160, 255, 180, ${alpha})`;
              ctx.fillText(char, x, y);
            }
          }
        }
      }

      grainCtx.clearRect(0, 0, width, height);
      const grainIntensity = 0.18 + Math.sin(time * 10) * 0.025;
      const grainImageData = generateFilmGrain(width, height, grainIntensity);
      grainCtx.putImageData(grainImageData, 0, 0);

      if (params.glitchIntensity > 0.5) {
        grainCtx.globalCompositeOperation = "screen";
        for (let i = 0; i < 150; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 2.5 + 0.5;
          const opacity = Math.random() * 0.4 * params.glitchIntensity;
          grainCtx.fillStyle = `rgba(100, 255, 160, ${opacity})`;
          grainCtx.beginPath();
          grainCtx.arc(x, y, size, 0, Math.PI * 2);
          grainCtx.fill();
        }
      }

      grainCtx.globalCompositeOperation = "screen";
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5 + 0.5;
        grainCtx.fillStyle = `rgba(180, 255, 200, ${Math.random() * 0.2})`;
        grainCtx.beginPath();
        grainCtx.arc(x, y, size, 0, Math.PI * 2);
        grainCtx.fill();
      }

      grainCtx.globalCompositeOperation = "multiply";
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.5 + 0.5;
        grainCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        grainCtx.beginPath();
        grainCtx.arc(x, y, size, 0, Math.PI * 2);
        grainCtx.fill();
      }

      grainCtx.globalCompositeOperation = "source-over";

      frameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      running = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={grainCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "overlay", opacity: 0.55 }}
      />
    </div>
  );
}
