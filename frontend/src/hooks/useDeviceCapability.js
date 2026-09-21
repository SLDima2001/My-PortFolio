import { useEffect, useRef, useState } from 'react';

/**
 * Detects device GPU/CPU capability to decide whether to
 * render heavy WebGL effects or fall back to CSS animations.
 */
export function useDeviceCapability() {
  const [capability, setCapability] = useState({
    isLowSpec: false,
    isMobile: false,
    pixelRatio: 1,
    canWebGL: true,
  });

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    // Heuristic: low-spec if fewer than 4 CPU cores or DPR > 2 on a small screen
    const cores = navigator.hardwareConcurrency || 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isLowSpec = cores <= 2 || (isMobile && dpr < 1.5);

    // Quick WebGL support check
    let canWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      canWebGL = !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      );
    } catch (_) {}

    setCapability({
      isLowSpec: isLowSpec || !canWebGL,
      isMobile,
      pixelRatio: isLowSpec ? 1 : Math.min(dpr, 2),
      canWebGL,
    });
  }, []);

  return capability;
}
