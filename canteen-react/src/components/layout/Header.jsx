import { useState } from 'react';
import '../../css/Header.css';
import ThemeToggle from '../common/ThemeToggle';
import UserGuide from '../common/UserGuide';

const Header = ({ title = 'Canteen Financial Management System' }) => {
  const [showGuide, setShowGuide] = useState(false);
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-header" role="banner">
      <div className="top-header__left">
        <div className="top-header__title">{title}</div>
      </div>
      <div className="top-header__right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="top-header__date" aria-label="Today">
          {dateLabel}
        </div>
        <button
          type="button"
          className="help-btn"
          onClick={() => setShowGuide(true)}
          aria-label="Open user guide"
          title="User Guide"
        >
          ?
        </button>
        <ThemeToggle />
      </div>
      <UserGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </header>
  );
};

export default Header;
