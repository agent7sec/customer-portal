import React from 'react';
import './SkipLinks.css';

export const SkipLinks: React.FC = () => (
    <nav aria-label="Skip links" className="skip-links">
        <a href="#main-content" className="skip-link">
            Skip to main content
        </a>
        <a href="#main-navigation" className="skip-link">
            Skip to navigation
        </a>
    </nav>
);
