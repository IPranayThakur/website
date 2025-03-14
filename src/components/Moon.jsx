import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import moonTextureImg from '../assets/moon.jpg';

const Moon = () => {
  const mountRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and when resizing
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard breakpoint for mobile
    };
    
    // Run on mount
    checkMobile();
    
    // Current div reference
    const currentRef = mountRef.current;
    if (!currentRef) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup - orthographic camera for consistent perspective
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -3 * aspect, 3 * aspect, 3, -3, 0.1, 1000
    );
    camera.position.z = 3;
    
    // High-quality renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      precision: 'highp'
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    currentRef.appendChild(renderer.domElement);
    
    // Create moon texture with improved settings
    const textureLoader = new THREE.TextureLoader();
    const moonTexture = textureLoader.load(moonTextureImg, texture => {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
    });
    
    // Moon geometry - adjust size based on device
    const moonSize = window.innerWidth < 768 ? 1.8 : 2.5; // Smaller moon for mobile
    const moonGeometry = new THREE.SphereGeometry(moonSize, 128, 128);
    
    // Material settings
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.5,
      metalness: 0.0,
      // Base color settings - will be adjusted for mobile
      emissive: new THREE.Color(0x111111),
      emissiveIntensity: 0.05,
      displacementMap: moonTexture,
      displacementScale: 0.01,
      displacementBias: -0.005
    });
    
    // Create and store the moon's original color
    const desktopEmissiveColor = new THREE.Color(0x111111);
    const mobileEmissiveColor = new THREE.Color(0x1a1a1a); // Slightly darker for mobile
    
    // Color adjustment for mobile to increase contrast
    const adjustMoonColor = () => {
      if (window.innerWidth < 768) {
        // Mobile: adjust colors to contrast with silver text
        moonMaterial.emissive = mobileEmissiveColor;
        moonMaterial.emissiveIntensity = 0.08; // Slightly brighter
        moonMaterial.color = new THREE.Color(0x9a9a9a); // Slightly darker than b3b1b1
      } else {
        // Desktop: original colors
        moonMaterial.emissive = desktopEmissiveColor;
        moonMaterial.emissiveIntensity = 0.05;
        moonMaterial.color = new THREE.Color(0xffffff); // Default white, texture provides the color
      }
    };
    
    // Run color adjustment on init
    adjustMoonColor();
    
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);
    
    // Position the moon based on device type
    const positionMoon = () => {
      if (window.innerWidth < 768) {
        // Mobile: Position at top
        moon.position.set(0, 3, 0);
      } else {
        // Desktop: Position at left
        const newAspect = window.innerWidth / window.innerHeight;
        moon.position.set(-newAspect * 3, 0, 0);
      }
    };
    
    positionMoon();
    
    // Lighting setup - adjust for mobile/desktop
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-5, 0, 5);
    scene.add(rimLight);
    
    // Front light
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight);
    
    // Extra top light for mobile - only activate in mobile mode
    const topLight = new THREE.DirectionalLight(0x3a3a3a, 0);
    topLight.position.set(0, 5, 1);
    scene.add(topLight);
    
    // Animation state for transitions
    let targetPosition = new THREE.Vector3();
    moon.position.clone(targetPosition);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Rotate moon slowly
      moon.rotation.y += 0.002;
      
      // Smooth position transition
      moon.position.lerp(targetPosition, 0.05);
      
      // Adjust top light intensity based on viewport width
      const targetIntensity = window.innerWidth < 768 ? 0.5 : 0;
      topLight.intensity += (targetIntensity - topLight.intensity) * 0.05;
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      const newAspect = window.innerWidth / window.innerHeight;
      camera.left = -3 * newAspect;
      camera.right = 3 * newAspect;
      camera.updateProjectionMatrix();
      
      // Check if mobile and update state
      checkMobile();
      
      // Set target position for smooth transition
      if (window.innerWidth < 768) {
        // Mobile: top position
        targetPosition.set(0, 3, 0);
      } else {
        // Desktop: left position
        targetPosition.set(-newAspect * 3, 0, 0);
      }
      
      // Also adjust moon size based on screen size
      moon.scale.setScalar(window.innerWidth < 768 ? 0.72 : 1);
      
      // Adjust moon color based on device type
      adjustMoonColor();
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentRef.contains(renderer.domElement)) {
        currentRef.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
      moonGeometry.dispose();
      moonMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default Moon;