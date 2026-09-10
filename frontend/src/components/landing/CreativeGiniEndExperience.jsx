import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CreativeGiniParticles from './animations/CreativeGiniParticles';
import CreativeGiniMagic from './animations/CreativeGiniMagic';
import CreativeGiniCharacter from './animations/CreativeGiniCharacter';

gsap.registerPlugin(ScrollTrigger);

export default function CreativeGiniEndExperience() {
  const containerRef = useRef(null);
  const visualStageRef = useRef(null);

  // Smooth cinematic entrance as user scrolls into finale
  useEffect(() => {
    const container = containerRef.current;
    const stage = visualStageRef.current;
    if (!container || !stage) return;

    let ctx = gsap.context(() => {
      gsap.fromTo(
        stage,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="creativegini-end-experience-section"
      id="creativegini-end-experience"
      style={{
        position: 'relative',
        minHeight: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        overflow: 'hidden',
        padding: '40px 0 20px 0'
      }}
    >
      <div
        ref={visualStageRef}
        className="screen1-visual-stage"
        style={{
          position: 'relative',
          width: '100%',
          height: '460px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible'
        }}
      >
        {/* Dynamic Canvas Particles */}
        <CreativeGiniParticles introProgress={1.0} height={460} />

        {/* Magical Center Portal */}
        <CreativeGiniMagic progress={0.5} />

        {/* Official CreativeGini Gini Character */}
        <CreativeGiniCharacter progress={0.8} />
      </div>
    </section>
  );
}
