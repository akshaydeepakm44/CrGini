import React from 'react';

export default function Footer() {
  return (
    <footer className="creativegini-main-footer" id="landing-footer">
      <div className="footer-top-ambient-glow" />

      <div className="footer-container footer-minimal-container">
        {/* Brand & Developer Credit */}
        <div className="footer-logo-row">
          <img
            src="/logo.png"
            alt="CreativeGini"
            className="footer-full-logo-img"
          />
          <div className="footer-logo-divider" />
          <a
            href="https://www.datai2i.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-developer-credit"
            title="Visit DATAI2I - https://www.datai2i.com/"
          >
            <span className="developed-by-label">Developed by</span>
            <span className="datai2i-badge">
              <img
                src="/datai2i-logo.png"
                alt="DATAI2I"
                className="footer-datai2i-logo-img"
              />
            </span>
          </a>
        </div>

        {/* Copyright */}
        <div className="footer-copy-text">
          © {new Date().getFullYear()} CreativeGini. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
