import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const SaturnPlanet = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentRef = mountRef.current;
    if (!currentRef) return;

    // Create Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    currentRef.appendChild(renderer.domElement);

    // Procedural Saturn Material
    const saturnMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color("#d2a679") }, // Lighter band
        color2: { value: new THREE.Color("#8c6239") }, // Darker band
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 color1;
        uniform vec3 color2;
        void main() {
          float bands = sin(vUv.y * 50.0) * 0.5 + 0.5;
          gl_FragColor = vec4(mix(color1, color2, bands), 1.0);
        }
      `,
    });

    // Create Saturn Sphere
    const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
    const planet = new THREE.Mesh(planetGeometry, saturnMaterial);

    // Procedural Rings
    const ringGeometry = new THREE.RingGeometry(1.3, 2.5, 128);
    ringGeometry.rotateX(-Math.PI / 2.2); // Tilt rings

    const ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color("#e0c9a6") },
        color2: { value: new THREE.Color("#70593f") },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 color1;
        uniform vec3 color2;
        void main() {
          float ringPattern = smoothstep(0.2, 0.8, sin(vUv.x * 200.0) * 0.5 + 0.5);
          gl_FragColor = vec4(mix(color1, color2, ringPattern), 0.6); // Semi-transparent rings
        }
      `,
      transparent: true,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Group Saturn + Rings
    const saturnGroup = new THREE.Group();
    saturnGroup.add(planet);
    saturnGroup.add(ring);
    scene.add(saturnGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Rotation Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      saturnGroup.rotation.y += 0.003; // Slow rotation
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (currentRef.contains(renderer.domElement)) {
        currentRef.removeChild(renderer.domElement);
      }
      planetGeometry.dispose();
      saturnMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default SaturnPlanet;
