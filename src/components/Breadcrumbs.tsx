import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from './Icon';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav style={styles.container}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} style={styles.separator} />
          )}
          {item.path ? (
            <Link to={item.path} style={styles.link}>
              {item.label}
            </Link>
          ) : (
            <span style={styles.current}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.5)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
  current: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
};

export default Breadcrumbs;
