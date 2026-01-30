import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Setup Scene
    const scene = new THREE.Scene();
    
    // Camera - Zoomed out to 8 (was 5) to fit inside circle without touching borders
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Group to hold our custom geometry
    const group = new THREE.Group();
    scene.add(group);

    // Material - Technical / Brutalist
    const materialOrange = new THREE.MeshBasicMaterial({ color: 0xF25C33 }); // Accent
    const materialSolid = new THREE.MeshBasicMaterial({ color: 0x1A1A1A }); // Ink

    // 1. Central Core - A stack of shifting plates
    const plateGeo = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const plates: THREE.Mesh[] = [];
    const plateCount = 8;
    
    for (let i = 0; i < plateCount; i++) {
        const plate = new THREE.Mesh(plateGeo, i % 2 === 0 ? materialSolid : materialOrange);
        plate.position.y = (i - plateCount/2) * 0.3;
        // Initial scale
        plate.scale.set(1 - Math.abs(i - plateCount/2)*0.2, 1, 1 - Math.abs(i - plateCount/2)*0.2);
        plates.push(plate);
        group.add(plate);
    }

    // Animation Loop
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;

      // Animate Plates (Wave effect)
      plates.forEach((plate, i) => {
          plate.rotation.y = Math.sin(time + i * 0.5) * 0.5;
          // Breathing scale effect
          const baseScale = 1 - Math.abs(i - plateCount/2)*0.15;
          const pulse = Math.sin(time * 2 + i) * 0.1;
          plate.scale.x = baseScale + pulse;
          plate.scale.z = baseScale + pulse;
      });
      
      // Gentle floating of entire group
      group.position.y = Math.sin(time * 0.5) * 0.1;
      group.rotation.y = time * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full flex items-center justify-center filter drop-shadow-xl" />;
};
