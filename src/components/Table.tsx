import React from 'react';

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
}

const Table = <T extends { id: string | number }>({
  data,
  columns,
  loading,
  emptyMessage = 'No hay datos disponibles'
}: TableProps<T>) => {
  if (loading) {
    return <div style={styles.message}>Cargando datos...</div>;
  }

  if (data.length === 0) {
    return <div style={styles.message}>{emptyMessage}</div>;
  }

  return (
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
  );
};

const styles: { [key: string]: React.CSSProperties } = {
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
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
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
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.95rem',
  },
};

export default Table;
