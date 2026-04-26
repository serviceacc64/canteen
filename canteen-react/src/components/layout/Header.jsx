import '../../css/Header.css';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ title = 'Canteen Financial Management System' }) => {
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
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
