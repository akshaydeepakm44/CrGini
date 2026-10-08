import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import MetricsSection from './MetricsSection';
import ServiceChannels from './ServiceChannels';
import HowItWorks from './HowItWorks';
import SpecialistSection from './SpecialistSection';
import FeaturedServices from './FeaturedServices';
import ClientExperienceJourney from './ClientExperienceJourney';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import '../../styles/landing-redesign.css';

/**
 * LandingPage Main Component
 * Modern public digital marketing website for CreativeGini with light aesthetic,
 * interactive growth ecosystem, natural scrolling, and clean component structure.
 */
export default function LandingPage({
  user,
  onSignIn,
  onGetStarted,
  onGoToDashboard
}) {
  const containerRef = useRef(null);

  // Set up natural IntersectionObserver scroll reveals
  useEffect(() => {
    // Ensure document scroll is enabled and natural
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const revealElements = containerRef.current?.querySelectorAll('.cg-reveal-section');
    if (revealElements) {
      revealElements.forEach((el) => observer.observe(el));
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSelectService = (service) => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectChannel = (channel) => {
    if (user) {
      onGoToDashboard && onGoToDashboard();
    } else {
      onSignIn && onSignIn();
    }
  };

  return (
    <div ref={containerRef} className="cg-landing-root">
      {/* Soft Ambient Glow Gradients & Texture */}
      <div className="cg-ambient-canvas" aria-hidden="true">
        <div className="cg-ambient-blob-1" />
        <div className="cg-ambient-blob-2" />
        <div className="cg-ambient-blob-3" />
      </div>
      <div className="cg-grid-overlay" aria-hidden="true" />

      {/* Sticky Header */}
      <Navbar
        user={user}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted || onSignIn}
        onGoToDashboard={onGoToDashboard}
      />

      {/* Hero Section with Interactive Growth Ecosystem */}
      <HeroSection
        onGetStarted={onGetStarted || onSignIn}
        onExploreServices={() => {
          const el = document.getElementById('services');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Section 2: Trust / Metrics */}
      <div className="cg-reveal-section">
        <MetricsSection />
      </div>

      {/* Section 3: Services (Boosting & Digitalising Channels) */}
      <div className="cg-reveal-section">
        <ServiceChannels onSelectChannel={handleSelectChannel} />
      </div>

      {/* Section 4: How It Works (4-Step Workflow) */}
      <div className="cg-reveal-section">
        <HowItWorks />
      </div>

      {/* Section 5: Specialist Ecosystem (Human Experts) */}
      <div className="cg-reveal-section">
        <SpecialistSection />
      </div>

      {/* Section 6: Featured Core Services */}
      <div className="cg-reveal-section">
        <FeaturedServices
          onExploreService={(srv) => {
            if (user) {
              onGoToDashboard && onGoToDashboard();
            } else {
              onSignIn && onSignIn();
            }
          }}
        />
      </div>

      {/* Section 7: Client Experience Process Journey (Scroll-Driven Stacking Cards) */}
      <ClientExperienceJourney
        onExplorePlatform={() => {
          if (user) {
            onGoToDashboard && onGoToDashboard();
          } else {
            onSignIn && onSignIn();
          }
        }}
        onExploreService={handleSelectService}
      />

      {/* Section 8: Final High-Converting CTA */}
      <div className="cg-reveal-section">
        <FinalCTA
          onGetStarted={onGetStarted || onSignIn}
          onExploreServices={() => {
            const el = document.getElementById('services');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Comprehensive Multi-Column Footer */}
      <Footer
        onSignIn={onSignIn}
        onGetStarted={onGetStarted || onSignIn}
      />
    </div>
  );
}
