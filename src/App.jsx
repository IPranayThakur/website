import React, { useEffect, useRef } from 'react';
import { ChevronDown, Download, Github, Linkedin, Mail } from 'lucide-react';
import { ProjectCard } from './components/ProjectCard';
import SaturnPlanet from './components/SaturnPlanet';
import Moon from './components/Moon';

function App() {
  const starFieldRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    // Create stars
    if (starFieldRef.current) {
      const field = starFieldRef.current;
      field.innerHTML = '';
      
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2;
        const delay = Math.random() * 3;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animation = `twinkle ${2 + Math.random()}s infinite ${delay}s`;
        
        field.appendChild(star);
      }
    }

    // Scroll effect for name
    const handleScroll = () => {
      if (nameRef.current) {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.5;
        nameRef.current.style.transform = `translate3d(0, ${rate}px, 0) rotateX(${rate * 0.05}deg)`;
      }
    };

    // Add cursor-based glow effect for the name
    const nameElement = nameRef.current;
    if (nameElement) {
      const handleMouseMove = (e) => {
        const rect = nameElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        const nameText = nameElement.querySelector('.name-text');
        if (nameText) {
          nameText.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, #FFFFFF 0%, #C0C0C0 50%, #A0A0A0 100%)`;
          nameText.style.webkitBackgroundClip = 'text';
          nameText.style.backgroundClip = 'text';
          nameText.style.color = 'transparent';
        }
      };

      const handleMouseLeave = () => {
        const nameText = nameElement.querySelector('.name-text');
        if (nameText) {
          nameText.style.background = 'linear-gradient(to right, #C0C0C0, #E8E8E8)';
          nameText.style.webkitBackgroundClip = 'text';
          nameText.style.backgroundClip = 'text';
          nameText.style.color = 'transparent';
        }
      };

      nameElement.addEventListener('mousemove', handleMouseMove);
      nameElement.addEventListener('mouseleave', handleMouseLeave);
    }

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (nameElement) {
        nameElement.removeEventListener('mousemove', handleMouseMove);
        nameElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Saturn planet */}
      {/* <SaturnPlanet /> */}
      
      {/* Star field */}
      <div ref={starFieldRef} className="star-field"></div>
      <Moon />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div ref={nameRef} className="name-container mb-4">
            <h1 className="name-text text-6xl md:text-8xl font-bold tracking-wider">
              PRANAY THAKUR
            </h1>
          </div>
          <p className="text-gray-100 text-xl mb-8">
            Full Stack Developer
          </p>
        </div>
        <button
          onClick={() => scrollToSection('work')}
          className="scroll-button bg-white/10 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
        >
          Explore My Work
          <ChevronDown />
        </button>
      </div>

      {/* Tech Stack Section */}
      <section id="work" className="relative z-10 py-20 px-4 md:px-8">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Tech Stack</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
            { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
            { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
            { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
            { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
            { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
          ].map((tech) => (
            <div key={tech.name} className="flex flex-col items-center">
              <img
                src={tech.icon}
                alt={tech.name}
                className="w-16 h-16 tech-icon mb-2"
              />
              <span className="text-white">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative z-10 py-20 px-4 md:px-8">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Projects</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <ProjectCard
            title="Lang Switch Core"
            description="An npm backend package deployed from the ground up on Amazon EC2 using LibreTranslate which supports Translation Caching."
            technologies={['Node', 'AWS', 'Linux']}
            imageUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
            githubUrl="https://github.com/npmLangSwitch/npmlangswitch/tree/main/langswitch-core"
            // liveUrl="https://example.com"
          />
          <ProjectCard
            title="Lang Switch React"
            description="An demonstration of how Lang Switch can be used in your react application to streamline translations and used cached translations in your build."
            technologies={['React', 'TypeScript', 'Tailwind']}
            imageUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
            githubUrl="https://github.com/npmLangSwitch/npmlangswitch/tree/main/langswitch-react"
            // liveUrl="https://example.com"
          />
          {/* Add more ProjectCard components here as needed */}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-20 px-4 md:px-8">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Get In Touch</h2>
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center gap-8 mb-8">
            <a href="https://github.com/IPranayThakur" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400 transition-colors">
              <Github size={32} />
            </a>
            <a href="https://www.linkedin.com/in/pranay-t-6700891b2/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400 transition-colors">
              <Linkedin size={32} />
            </a>
            <a href="mailto:pranaythakur@pm.me" className="text-white hover:text-gray-400 transition-colors">
              <Mail size={32} />
            </a>
          </div>
          <a
            href="https://drive.google.com/uc?export=download&id=1YVPXKVAMfW0fX3RnWW63siFqksUhh5VC"
            download
            className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all"
          >
            <Download size={20} />
            Download Resume
          </a>
        </div>
      </section>
    </div>
  );
}

export default App;