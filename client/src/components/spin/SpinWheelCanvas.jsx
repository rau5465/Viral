import React, { useRef, useEffect, useState, useCallback } from 'react';

// Web Audio API Synthesizer for realistic mechanical wheel clicks & fanfare
const playWheelSound = (type, soundEnabled = true) => {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 300, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.28);
      });
    }
  } catch (_e) {
    // Audio might fail if user has not interacted
  }
};

const SpinWheelCanvas = ({
  segments,
  isSpinning,
  targetSliceIndex,
  onSpinFinish,
  soundEnabled = true,
  size = 380,
}) => {
  const canvasRef = useRef(null);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef(null);
  const [pointerBounce, setPointerBounce] = useState(false);
  const lastTickSliceRef = useRef(-1);

  const numSegments = segments.length || 8;
  const sliceAngle = (2 * Math.PI) / numSegments;

  // Draw the entire wheel on canvas
  const drawWheel = useCallback(
    (angle) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 20;

      ctx.clearRect(0, 0, size, size);

      // 1. Outer Decorative Rim with LED Dots
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00eefd';
      ctx.shadowColor = 'rgba(0, 238, 253, 0.4)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // Outer LED Bulbs (24 dots)
      const numBulbs = 24;
      for (let i = 0; i < numBulbs; i++) {
        const bulbAngle = (i * 2 * Math.PI) / numBulbs;
        const bx = centerX + (radius + 8) * Math.cos(bulbAngle);
        const by = centerY + (radius + 8) * Math.sin(bulbAngle);

        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, 2 * Math.PI);
        const isBulbLit = (i + Math.floor(angle * 3)) % 2 === 0;
        ctx.fillStyle = isBulbLit ? '#fde502' : '#ffffff';
        ctx.shadowColor = isBulbLit ? '#fde502' : '#ffffff';
        ctx.shadowBlur = isBulbLit ? 8 : 2;
        ctx.fill();
        ctx.restore();
      }

      // 2. Wheel Segments
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      segments.forEach((seg, i) => {
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;

        // Slice Path
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = seg.color || '#3a86ff';
        ctx.fill();

        // Border between segments
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.stroke();

        // Segment text label
        ctx.save();
        ctx.rotate(startA + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = seg.textColor || '#ffffff';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText(seg.label, radius - 26, 0);
        ctx.restore();
      });

      // 3. Center Metallic Hub
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, 2 * Math.PI);
      const hubGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 36);
      hubGrad.addColorStop(0, '#fde502');
      hubGrad.addColorStop(0.7, '#d4af37');
      hubGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = hubGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Center Icon / FAR Text
      ctx.fillStyle = '#0a0d14';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FAR', 0, 0);

      ctx.restore();
    },
    [segments, size, sliceAngle]
  );

  // Initialize Canvas & redraw when segments change
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Handle Spin Animation with Deceleration Curve
  useEffect(() => {
    if (!isSpinning || targetSliceIndex === null || targetSliceIndex === undefined) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pointer is positioned at 12 o'clock (-PI / 2 or 3*PI/2)
    // To land targetSliceIndex under the top pointer:
    // angle = (3 * Math.PI / 2) - (targetSliceIndex * sliceAngle + sliceAngle / 2)
    const pointerOffset = (3 * Math.PI) / 2;
    const targetSliceMidAngle = targetSliceIndex * sliceAngle + sliceAngle / 2;
    let targetRelativeAngle = pointerOffset - targetSliceMidAngle;

    // Normalize angle
    while (targetRelativeAngle < 0) targetRelativeAngle += 2 * Math.PI;

    // Add 6 to 8 full revolutions for excitement
    const fullSpins = 6 * 2 * Math.PI;
    const startAngle = currentAngleRef.current % (2 * Math.PI);
    let delta = targetRelativeAngle - startAngle;
    if (delta < 0) delta += 2 * Math.PI;

    const totalAngleToSpin = fullSpins + delta;
    const finalAngle = currentAngleRef.current + totalAngleToSpin;

    const startTime = performance.now();
    const duration = 4800; // 4.8 seconds

    // Easing function: cubic-bezier deceleration
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3.2);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const newAngle = currentAngleRef.current + totalAngleToSpin * easedProgress;
      drawWheel(newAngle);

      // Track pointer ticks
      // Check which slice is currently passing under the pointer (3*PI/2)
      const normalizedAngle = (newAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const angleUnderPointer = (pointerOffset - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
      const currentSlice = Math.floor(angleUnderPointer / sliceAngle) % numSegments;

      if (currentSlice !== lastTickSliceRef.current) {
        lastTickSliceRef.current = currentSlice;
        playWheelSound('tick', soundEnabled);
        setPointerBounce(true);
        setTimeout(() => setPointerBounce(false), 50);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentAngleRef.current = finalAngle;
        playWheelSound('win', soundEnabled);
        if (onSpinFinish) {
          onSpinFinish(targetSliceIndex);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning, targetSliceIndex, sliceAngle, numSegments, onSpinFinish, soundEnabled, drawWheel]);

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      {/* Top Pointer Needle pointing down at 12 o'clock */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: `translateX(-50%) ${pointerBounce ? 'rotate(-10deg)' : 'rotate(0deg)'}`,
          transformOrigin: 'top center',
          transition: 'transform 0.05s ease',
          zIndex: 10,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))',
          pointerEvents: 'none',
        }}
      >
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
          <path
            d="M17 40L4 12C2 8 5 2 10 2H24C29 2 32 8 30 12L17 40Z"
            fill="#ff006e"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <circle cx="17" cy="12" r="5" fill="#fde502" />
        </svg>
      </div>

      {/* Wheel Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          display: 'block',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default SpinWheelCanvas;
