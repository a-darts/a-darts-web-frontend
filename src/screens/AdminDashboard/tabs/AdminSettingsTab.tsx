import React, { useState } from 'react';
import Button from '../../../components/Button';
import { useToast } from '../../../context/ToastContext';

const AdminSettingsTab: React.FC = () => {
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState({
    openRegistration: true,
    allowExternalPlayers: false,
    systemEmail: 'admin@adarts.com',
    defaultSetsFormat: 'Best of 3',
    maintenanceMode: false
  });

  const handleSaveSettings = () => {
    showToast('Configuración del sistema guardada con éxito.', 'success');
  };

  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <div style={styles.viewHeaderLeft}>
          <h2 style={styles.viewTitle}>Configuración del Sistema</h2>
          <p style={styles.viewSub}>Establece parámetros globales para inscripciones, notificaciones y mantenimiento.</p>
        </div>
      </div>

      <div style={styles.settingsForm}>
        {/* Setting Row 1 */}
        <div style={styles.settingsRow}>
          <div style={styles.settingsLabelCol}>
            <h4 style={styles.settingHeading}>Registro Público</h4>
            <p style={styles.settingDesc}>Permite que cualquier persona pueda registrarse como usuario ordinario.</p>
          </div>
          <div style={styles.settingsFieldCol}>
            <label style={styles.switchLabel}>
              <input
                type="checkbox"
                checked={settings.openRegistration}
                onChange={(e) => setSettings({ ...settings, openRegistration: e.target.checked })}
                style={styles.switchInput}
              />
              <div style={styles.switchTrack(settings.openRegistration)}>
                <div style={styles.switchThumb(settings.openRegistration)} />
              </div>
            </label>
          </div>
        </div>

        {/* Setting Row 2 */}
        <div style={styles.settingsRow}>
          <div style={styles.settingsLabelCol}>
            <h4 style={styles.settingHeading}>Inscripción de Externos</h4>
            <p style={styles.settingDesc}>Permite la inscripción de jugadores no federados en torneos públicos.</p>
          </div>
          <div style={styles.settingsFieldCol}>
            <label style={styles.switchLabel}>
              <input
                type="checkbox"
                checked={settings.allowExternalPlayers}
                onChange={(e) => setSettings({ ...settings, allowExternalPlayers: e.target.checked })}
                style={styles.switchInput}
              />
              <div style={styles.switchTrack(settings.allowExternalPlayers)}>
                <div style={styles.switchThumb(settings.allowExternalPlayers)} />
              </div>
            </label>
          </div>
        </div>

        {/* Setting Row 3 */}
        <div style={styles.settingsRow}>
          <div style={styles.settingsLabelCol}>
            <h4 style={styles.settingHeading}>Correo de Soporte</h4>
            <p style={styles.settingDesc}>Cuenta de correo oficial para la resolución de dudas de los jugadores.</p>
          </div>
          <div style={styles.settingsFieldCol}>
            <input
              type="email"
              value={settings.systemEmail}
              onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
              style={styles.settingsInputText}
            />
          </div>
        </div>

        {/* Setting Row 4 */}
        <div style={styles.settingsRow}>
          <div style={styles.settingsLabelCol}>
            <h4 style={styles.settingHeading}>Formato por Defecto</h4>
            <p style={styles.settingDesc}>Formato de sets y piernas estándar para nuevas partidas.</p>
          </div>
          <div style={styles.settingsFieldCol}>
            <select
              value={settings.defaultSetsFormat}
              onChange={(e) => setSettings({ ...settings, defaultSetsFormat: e.target.value })}
              style={styles.settingsSelect}
            >
              <option value="Best of 3">Al mejor de 3 (Best of 3)</option>
              <option value="Best of 5">Al mejor de 5 (Best of 5)</option>
              <option value="Best of 7">Al mejor de 7 (Best of 7)</option>
            </select>
          </div>
        </div>

        {/* Setting Row 5 */}
        <div style={styles.settingsRow}>
          <div style={styles.settingsLabelCol}>
            <h4 style={styles.settingHeading}>Modo Mantenimiento</h4>
            <p style={styles.settingDesc}>Bloquea temporalmente el acceso general de usuarios y pausa las partidas en directo.</p>
          </div>
          <div style={styles.settingsFieldCol}>
            <label style={styles.switchLabel}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                style={styles.switchInput}
              />
              <div style={styles.switchTrack(settings.maintenanceMode)}>
                <div style={styles.switchThumb(settings.maintenanceMode)} />
              </div>
            </label>
          </div>
        </div>

        {/* Action Row */}
        <div style={styles.settingsActionsRow}>
          <Button variant="primary" size="large" leftIcon="Save" onClick={handleSaveSettings}>
            Guardar Configuración
          </Button>
        </div>
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
  settingsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '750px',
    width: '100%',
  },
  settingsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  settingsLabelCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    flex: '1',
    minWidth: '280px',
  },
  settingHeading: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  settingDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.4)',
    margin: 0,
    lineHeight: '1.5',
  },
  settingsFieldCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: '200px',
  },
  switchLabel: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute',
  },
  switchTrack: (checked: boolean) => ({
    width: '46px',
    height: '24px',
    borderRadius: '100px',
    backgroundColor: checked ? 'rgba(196, 232, 102, 0.2)' : 'rgba(255, 255, 255, 0.06)',
    border: `1px solid ${checked ? 'rgba(196, 232, 102, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  }),
  switchThumb: (checked: boolean) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: checked ? '#C4E866' : 'rgba(255, 255, 255, 0.4)',
    position: 'absolute',
    top: '3px',
    left: checked ? '25px' : '3px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: checked ? '0 0 10px rgba(196, 232, 102, 0.5)' : 'none',
  }),
  settingsInputText: {
    width: '100%',
    height: '42px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '0 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.25s ease',
  },
  settingsSelect: {
    width: '100%',
    height: '42px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '0 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  settingsActionsRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '1rem',
  },
};

export default AdminSettingsTab;
