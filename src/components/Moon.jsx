import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import moonTextureImg from '../assets/moon.jpg';

const Moon = () => {
  const mountRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and when resizing
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      return mobile;
    };
    
    // Run on mount
    const isMobileView = checkMobile();
    
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
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Calculate target position based on current viewport
    const getTargetPosition = (isMobile, aspect) => {
      if (isMobile) {
        return new THREE.Vector3(0, 3, 0); // Top center for mobile
      } else {
        return new THREE.Vector3(-aspect * 3, 0, 0); // Left side for desktop
      }
    };
    
    // Calculate final position
    const finalPosition = getTargetPosition(isMobileView, aspect);
    
    // Create moon texture with improved settings
    const textureLoader = new THREE.TextureLoader();
    const moonTexture = textureLoader.load(moonTextureImg, texture => {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
    });
    
    // Moon geometry - adjust size based on device
    const moonSize = isMobileView ? 1.8 : 2.5;
    const moonGeometry = new THREE.SphereGeometry(moonSize, 128, 128);
    
    // Material settings
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.5,
      metalness: 0.0,
      displacementMap: moonTexture,
      displacementScale: 0.01,
      displacementBias: -0.005
    });
    
    // Create and store the moon's original color
    const desktopEmissiveColor = new THREE.Color(0x111111);
    const mobileEmissiveColor = new THREE.Color(0x1a1a1a);
    
    // Color adjustment for moon
    const adjustMoonColor = (isMobile) => {
      if (isMobile) {
        moonMaterial.emissive = mobileEmissiveColor;
        moonMaterial.emissiveIntensity = 0.08;
        moonMaterial.color = new THREE.Color(0x9a9a9a);
      } else {
        moonMaterial.emissive = desktopEmissiveColor;
        moonMaterial.emissiveIntensity = 0.05;
        moonMaterial.color = new THREE.Color(0xffffff);
      }
    };
    
    // Apply initial color before rendering
    adjustMoonColor(isMobileView);
    
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    
    // Start at center with slight scale effect
    moon.position.set(0, 0, 0);
    moon.scale.set(0.9, 0.9, 0.9);
    scene.add(moon);
    
    // Animation parameters
    const targetPosition = new THREE.Vector3().copy(finalPosition);
    const targetScale = isMobileView ? 0.72 : 1;
    
    // Opacity animation for fade-in effect
    moonMaterial.transparent = true;
    moonMaterial.opacity = 0;
    
    // Track animation state
    const animationState = {
      initialAnimationComplete: false,
      initialAnimationProgress: 0
    };
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-5, 0, 5);
    scene.add(rimLight);
    
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight);
    
    const topLight = new THREE.DirectionalLight(0x3a3a3a, isMobileView ? 0.5 : 0);
    topLight.position.set(0, 5, 1);
    scene.add(topLight);
    
    // Add to DOM
    currentRef.appendChild(renderer.domElement);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Handle initial animation from center to final position
      if (!animationState.initialAnimationComplete) {
        // Gradually increase progress
        animationState.initialAnimationProgress += 0.015;
        
        if (animationState.initialAnimationProgress >= 1) {
          animationState.initialAnimationComplete = true;
          animationState.initialAnimationProgress = 1;
        }
        
        // Ease function for smoother animation (cubic ease-out)
        const eased = 1 - Math.pow(1 - animationState.initialAnimationProgress, 3);
        
        // Move from center to final position with easing
        moon.position.x = THREE.MathUtils.lerp(0, targetPosition.x, eased);
        moon.position.y = THREE.MathUtils.lerp(0, targetPosition.y, eased);
        
        // Scale up slightly as it moves
        const scaleValue = THREE.MathUtils.lerp(0.9, targetScale, eased);
        moon.scale.set(scaleValue, scaleValue, scaleValue);
        
        // Fade in
        moonMaterial.opacity = THREE.MathUtils.lerp(0, 1, eased);
      } else {
        // Regular position updates after initial animation
        moon.position.lerp(targetPosition, 0.05);
      }
      
      // Rotate moon slowly regardless of animation state
      moon.rotation.y += 0.002;
      
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
      const isMobile = checkMobile();
      
      // Set target position for smooth transition
      const newPosition = getTargetPosition(isMobile, newAspect);
      targetPosition.copy(newPosition);
      
      // Adjust target scale based on screen size
      const newScale = isMobile ? 0.72 : 1;
      
      // Adjust moon color based on device type
      adjustMoonColor(isMobile);
      
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