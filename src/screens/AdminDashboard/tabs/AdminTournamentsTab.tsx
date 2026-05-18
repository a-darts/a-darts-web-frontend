import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';

interface MockTournament {
  id: string;
  name: string;
  format: 'K.O. DIRECTO' | 'DOBLE ELIMINACIÓN' | 'LIGA';
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'FINISHED';
  participantsCount: number;
  maxParticipants: number;
  startDate: string;
}

const mockTournamentsData: MockTournament[] = [
  { id: 't1', name: 'I Open Nacional A-Darts', format: 'K.O. DIRECTO', status: 'PUBLISHED', participantsCount: 16, maxParticipants: 32, startDate: '2026-06-15' },
  { id: 't2', name: 'Liga de Invierno 501', format: 'LIGA', status: 'IN_PROGRESS', participantsCount: 12, maxParticipants: 12, startDate: '2026-01-10' },
  { id: 't3', name: 'Torneo Benéfico de Darts', format: 'K.O. DIRECTO', status: 'DRAFT', participantsCount: 4, maxParticipants: 16, startDate: '2026-07-22' },
  { id: 't4', name: 'Masters Absoluto 2026', format: 'DOBLE ELIMINACIÓN', status: 'FINISHED', participantsCount: 8, maxParticipants: 8, startDate: '2026-05-01' }
];

const AdminTournamentsTab: React.FC = () => {
  const navigate = useNavigate();
  const [tournamentQuery, setTournamentQuery] = useState('');

  const filtered = mockTournamentsData.filter(t =>
    t.name.toLowerCase().includes(tournamentQuery.toLowerCase()) ||
    t.format.toLowerCase().includes(tournamentQuery.toLowerCase())
  );

  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <div style={styles.viewHeaderLeft}>
          <h2 style={styles.viewTitle}>Panel de Torneos</h2>
          <p style={styles.viewSub}>Configura cuadrantes, cambia estados de torneos y accede a la gestión de las partidas.</p>
        </div>
        <div style={styles.viewHeaderRight}>
          <Button variant="primary" size="medium" leftIcon="Plus" onClick={() => navigate('/torneos')}>
            Nuevo torneo
          </Button>
        </div>
      </div>

      <div style={styles.tournamentsFilterRow}>
        <div style={styles.searchWrapper}>
          <SearchInput value={tournamentQuery} onChange={setTournamentQuery} placeholder="Buscar por nombre de torneo..." />
        </div>
      </div>

      <div style={styles.tableResponsive}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>Torneo</th>
              <th style={styles.th}>Formato</th>
              <th style={styles.th}>Participantes</th>
              <th style={styles.th}>Fecha Inicio</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={styles.trBody}>
                <td style={styles.td}>
                  <span style={styles.tournamentNameLink} onClick={() => navigate(`/torneos/${t.id}`)}>
                    {t.name}
                  </span>
                </td>
                <td style={styles.td}>{t.format}</td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '600' }}>{t.participantsCount}</span> / {t.maxParticipants}
                </td>
                <td style={styles.td}>{t.startDate}</td>
                <td style={styles.td}>
                  <span style={
                    t.status === 'IN_PROGRESS' ? styles.activeBadge :
                      t.status === 'PUBLISHED' ? styles.publishedBadge :
                        t.status === 'FINISHED' ? styles.finishedBadge : styles.suspendedBadge
                  }>
                    {t.status === 'IN_PROGRESS' ? 'En Juego' :
                      t.status === 'PUBLISHED' ? 'Publicado' :
                        t.status === 'FINISHED' ? 'Finalizado' : 'Borrador'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionGroup}>
                    <button onClick={() => navigate(`/torneos/${t.id}`)} style={styles.actionBtn} title="Administrar torneo">
                      <Icon name="ExternalLink" size={16} />
                    </button>
                    <button onClick={() => navigate(`/torneos/${t.id}/edit`)} style={styles.actionBtn} title="Editar torneo">
                      <Icon name="Edit3" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={styles.emptyTableTd}>
                  No hay torneos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  viewHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  viewHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  viewHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  viewTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-title)',
  },
  viewSub: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
    lineHeight: '1.5',
  },
  tournamentsFilterRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  searchWrapper: {
    width: '100%',
    maxWidth: '360px',
    minWidth: '240px',
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  th: {
    padding: '1.2rem 1.5rem',
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '700',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background 0.2s ease',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.01)',
    },
  },
  td: {
    padding: '1.2rem 1.5rem',
    color: 'rgba(255, 255, 255, 0.8)',
    verticalAlign: 'middle',
  },
  emptyTableTd: {
    padding: '3rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.95rem',
  },
  tournamentNameLink: {
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    ':hover': {
      color: 'var(--btn-primary-bg)',
    },
  },
  activeBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(196, 232, 102, 0.1)',
    border: '1px solid rgba(196, 232, 102, 0.2)',
    color: '#C4E866',
    letterSpacing: '0.5px',
  },
  publishedBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    letterSpacing: '0.5px',
  },
  finishedBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    color: '#f87171',
    letterSpacing: '0.5px',
  },
  suspendedBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.5px',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
    outline: 'none',
  },
};

export default AdminTournamentsTab;
