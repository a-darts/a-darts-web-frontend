import React from 'react';
import Button from './Button';
import Icon from './Icon';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const Table = <T extends { id: string | number }>({
  data,
  columns,
  loading,
  emptyMessage = 'No hay datos disponibles',
  pagination
}: TableProps<T>) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Icon
          name="Loader"
          size={32}
          className="btn-icon animate-spin"
        />
        <div style={styles.loadingText}>Cargando datos...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return <div style={styles.message}>{emptyMessage}</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              {columns.map((column) => (
                <th key={column.header} style={styles.th}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                style={{
                  ...styles.tr,
                  backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'
                }}
              >
                {columns.map((column) => (
                  <td key={column.header} style={styles.td}>
                    {column.render ? column.render(item, index) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={styles.paginationRow}>
          <span style={styles.paginationText}>
            Mostrando página <strong>{pagination.currentPage}</strong> de <strong>{pagination.totalPages}</strong>
          </span>
          <div style={styles.paginationButtons}>
            <Button
              variant="secondary"
              size="small"
              leftIcon="ChevronLeft"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="small"
              rightIcon="ChevronRight"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  container: {
    width: '100%',
    overflowX: 'auto',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  headerRow: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  th: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  td: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontWeight: '400',
  },
  tr: {
    transition: 'background 0.2s ease',
  },
  message: {
    padding: '4rem 2rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '0.95rem',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  paginationText: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    margin: '2rem',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
};

export default Table;
