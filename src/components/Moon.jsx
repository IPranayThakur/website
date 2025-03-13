import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import moonTextureImg from '../assets/moon.jpg';

const Moon = () => {
  const mountRef = useRef(null);

  useEffect(() => {
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
    
    // Moon geometry - larger sphere with high detail
    const moonGeometry = new THREE.SphereGeometry(2.5, 128, 128); // Increased size and detail
    
    // Material settings - darker as in your original code
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.5,
      metalness: 0.0,
      emissive: new THREE.Color(0x111111), // Darker self-illumination
      emissiveIntensity: 0.05, // Lower intensity for darker appearance
      displacementMap: moonTexture,
      displacementScale: 0.01, // Subtle displacement for texture detail
      displacementBias: -0.005
    });
    
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);
    
    // Position the moon at the left edge of the viewport
    moon.position.set(-aspect * 3, 0, 0);
    
    // Lighting setup - reduced to match your darker preference
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Same as your code
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Same as your code
    directionalLight.position.set(5, 3, 5); // Coming from right side now
    scene.add(directionalLight);
    
    // Rim light - kept from your code
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-5, 0, 5);
    scene.add(rimLight);
    
    // Front light - kept from your code
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Rotate moon slowly
      moon.rotation.y += 0.0010;
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      const newAspect = window.innerWidth / window.innerHeight;
      camera.left = -3 * newAspect;
      camera.right = 3 * newAspect;
      camera.updateProjectionMatrix();
      
      // Reposition the moon on resize - now on left side
      moon.position.set(-newAspect * 3, 0, 0);
      
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