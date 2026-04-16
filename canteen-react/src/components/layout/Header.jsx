import '../../css/Header.css';

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
      <div className="top-header__right">
        <div className="top-header__date" aria-label="Today">
          {dateLabel}
        </div>
      </div>
    </header>
  );
};

export default Header;
