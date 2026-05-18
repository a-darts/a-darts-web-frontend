import React, { useState } from 'react';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import { useToast } from '../../../context/ToastContext';
import { getFederationFlag } from '../../../utils/tournament.utils';

interface MockPlayer {
  id: string;
  alias: string;
  fullName: string;
  federation: string;
  federationYear: number;
  ppd: number;
  category: 'A' | 'B' | 'C' | 'Pro';
}

const mockPlayersData: MockPlayer[] = [
  { id: 'p1', alias: 'DardoVeloz', fullName: 'Carlos Gómez Ruíz', federation: 'Madrid', federationYear: 2024, ppd: 24.5, category: 'A' },
  { id: 'p2', alias: 'DianaMaster', fullName: 'Elena Martínez Vega', federation: 'Cataluña', federationYear: 2023, ppd: 28.2, category: 'Pro' },
  { id: 'p3', alias: 'BullseyeKing', fullName: 'Javier López Soler', federation: 'Andalucía', federationYear: 2025, ppd: 21.0, category: 'B' },
  { id: 'p4', alias: 'Triple20', fullName: 'Marcos Alonso Sanz', federation: 'Valencia', federationYear: 2024, ppd: 26.8, category: 'A' },
  { id: 'p5', alias: 'DartsQueen', fullName: 'Sofia Castro Ortiz', federation: 'Galicia', federationYear: 2025, ppd: 19.5, category: 'C' }
];

const AdminPlayersTab: React.FC = () => {
  const { showToast } = useToast();
  const [playerQuery, setPlayerQuery] = useState('');

  const triggerDemoToast = (action: string) => {
    showToast(`Acción "${action}" no disponible en modo demostración.`, 'info');
  };

  const filtered = mockPlayersData.filter(p =>
    p.alias.toLowerCase().includes(playerQuery.toLowerCase()) ||
    p.fullName.toLowerCase().includes(playerQuery.toLowerCase()) ||
    p.federation.toLowerCase().includes(playerQuery.toLowerCase())
  );

  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <div style={styles.viewHeaderLeft}>
          <h2 style={styles.viewTitle}>Jugadores Federados</h2>
          <p style={styles.viewSub}>Control de estadísticas, federaciones y categorías de los jugadores oficiales.</p>
        </div>
        <div style={styles.searchWrapper}>
          <SearchInput value={playerQuery} onChange={setPlayerQuery} placeholder="Buscar por alias, nombre o federación..." />
        </div>
      </div>

      <div style={styles.playersGrid}>
        {filtered.map(p => (
          <div key={p.id} style={styles.playerCard}>
            <div style={styles.playerCardHeader}>
              <div style={styles.playerCardInfo}>
                <h3 style={styles.playerAlias}>{p.alias}</h3>
                <span style={styles.playerFullName}>{p.fullName}</span>
              </div>
              <span style={styles.categoryBadge}>{p.category}</span>
            </div>

            <div style={styles.playerCardBody}>
              <div style={styles.playerStatRow}>
                <span style={styles.playerStatLabel}>Federación</span>
                <div style={styles.playerFederationVal}>
                  {getFederationFlag(p.federation) && (
                    <img src={getFederationFlag(p.federation) || ''} alt="Flag" style={styles.flagIcon} />
                  )}
                  <span>{p.federation}</span>
                </div>
              </div>
              <div style={styles.playerStatRow}>
                <span style={styles.playerStatLabel}>Año de Alta</span>
                <span style={styles.playerStatVal}>{p.federationYear}</span>
              </div>
              <div style={styles.playerStatRow}>
                <span style={styles.playerStatLabel}>Media PPD</span>
                <span style={styles.playerStatValHighlight}>{p.ppd} pts</span>
              </div>
            </div>

            <div style={styles.playerCardFooter}>
              <Button variant="secondary" size="small" onClick={() => triggerDemoToast('Ver ficha')} style={{ flex: 1 }}>
                Ver ficha
              </Button>
              <Button variant="secondary" size="small" onClick={() => triggerDemoToast('Editar estadísticas')} style={{ flex: 1 }}>
                Editar estad.
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={styles.emptyGridBox}>
            <Icon name="UserMinus" size={48} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }} />
            <p>No hay jugadores registrados que coincidan con el criterio.</p>
          </div>
        )}
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
  searchWrapper: {
    width: '100%',
    maxWidth: '360px',
    minWidth: '240px',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '18px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transition: 'all 0.25s ease',
  },
  playerCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  playerCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  playerAlias: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  playerFullName: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  categoryBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg)',
    background: 'rgba(196, 232, 102, 0.1)',
    border: '1px solid rgba(196, 232, 102, 0.2)',
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
  },
  playerCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
  },
  playerStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  playerStatLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  playerStatVal: {
    color: '#ffffff',
    fontWeight: '600',
  },
  playerStatValHighlight: {
    color: 'var(--btn-primary-bg)',
    fontWeight: '700',
  },
  playerFederationVal: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ffffff',
    fontWeight: '600',
  },
  flagIcon: {
    width: '18px',
    height: '12px',
    objectFit: 'cover',
    borderRadius: '2px',
  },
  playerCardFooter: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.75rem',
    marginTop: 'auto',
  },
  emptyGridBox: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.95rem',
    border: '1px dashed rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
  },
};

export default AdminPlayersTab;
