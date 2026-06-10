import React from 'react';

const PrivacyPolicyScreen: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>POLÍTICA DE PRIVACIDAD</h1>
                <p style={styles.subtitle}>Última actualización: 10 de Junio de 2026</p>

                <hr style={styles.divider} />

                <p style={styles.paragraph}>
                    This Privacy Notice for <strong>Ariana Porroche Llorén</strong> (doing business as <strong>A-Darts</strong>) ('<strong>we</strong>', '<strong>us</strong>' or '<strong>our</strong>'),
                    describes how and why we might access, collect, store, use, and/or share (<strong>'process'</strong>)
                    your personal information when you use our services (<strong>'Services'</strong>), including when you:
                </p>

                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        Visit our website at{' '}
                        <a href="https://a-darts.com/" target="_blank" rel="noreferrer" style={styles.link}>
                            https://a-darts.com/
                        </a>{' '}
                        or any website of ours that links to this Privacy Notice.
                    </li>
                    <li style={styles.listItem}>
                        Use <strong>A-Darts</strong>. A-Darts is an all-in-one tournament management platform designed to handle dart competitions.
                        The web application processes registered user data to facilitate tournament creation, player registrations, bracket scheduling, and live match scoring.
                    </li>
                    <li style={styles.listItem}>
                        Engage with us in other related ways, including any marketing or events.
                    </li>
                </ul>

                {/* <blockquote style={styles.blockquote}>
                    <strong>A-Darts</strong> is an all-in-one tournament management platform designed to handle dart competitions.
                    The web application processes registered user data to facilitate tournament creation, player registrations,
                    bracket scheduling, and live match scoring.
                </blockquote> */}

                <p style={styles.paragraph}>
                    <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices.
                    We are responsible for making decisions about how your personal information is processed.
                    If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns,
                    please contact us at{' '}
                    <a href="mailto:a.darts.dev@gmail.com" style={styles.link}>a.darts.dev@gmail.com</a>.
                </p>

                <h2 style={styles.sectionTitle}>SUMMARY OF KEY POINTS</h2>
                <p style={styles.paragraph}>
                    We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention,
                    and to comply with the law. We do not process sensitive personal information, nor do we collect information from third parties.
                </p>

                <h2 style={styles.sectionTitle}>1. WHAT INFORMATION DO WE COLLECT?</h2>
                <p style={styles.paragraph}>
                    We collect personal information that you voluntarily provide to us when you register on the Services or when you contact us.
                    The personal information we collect includes:
                </p>
                <ul style={styles.list}>
                    <li style={styles.listItem}>Email addresses</li>
                    <li style={styles.listItem}>Passwords</li>
                    <li style={styles.listItem}>Aliases / Player nicknames</li>
                </ul>
                <p style={styles.paragraph}>
                    We do not process any sensitive personal information.
                </p>

                <h2 style={styles.sectionTitle}>2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
                <p style={styles.paragraph}>
                    We process your personal information for a variety of reasons to operate and improve the tournament platform, including:
                </p>
                <ul style={styles.list}>
                    <li style={styles.listItem}>To deliver and facilitate delivery of services to users (such as brackets and scoring).</li>
                    <li style={styles.listItem}>To administer prize draws and competitions.</li>
                    <li style={styles.listItem}>To send administrative information to users (such as updates or password resets).</li>
                    <li style={styles.listItem}>To respond to user inquiries and offer support.</li>
                    <li style={styles.listItem}>To protect our Services from security threats or fraud.</li>
                    <li style={styles.listItem}>To evaluate and improve our Services, products, marketing, and user experience.</li>
                    <li style={styles.listItem}>To comply with our legal obligations.</li>
                </ul>

                <h2 style={styles.sectionTitle}>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
                <p style={styles.paragraph}>
                    We do not sell your personal information. We only share data with trusted third-party vendor categories necessary to run the application under secure contracts:
                </p>
                <ul style={styles.list}>
                    <li style={styles.listItem}><strong>Email Delivery Services:</strong> We disclose data to <strong>Resend</strong> exclusively to dispatch transactional platform emails.</li>
                </ul>

                <h2 style={styles.sectionTitle}>4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
                <p style={styles.paragraph}>
                    We use cookies and/or web beacons to maintain your active user session and facilitate account features. For further information about how we use these technologies, please review our Cookie Policy available at{' '}
                    <a href="https://a-darts.com/cookies-policy" target="_blank" rel="noreferrer" style={styles.link}>https://a-darts.com/cookies-policy</a>.
                </p>

                <h2 style={styles.sectionTitle}>5. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
                <p style={styles.paragraph}>
                    We retain your personal information for as long as you maintain an active user account with us. Once you close or request the deletion of your account, your identifier credentials will be removed in accordance with our data clearance standards.
                </p>

                <h2 style={styles.sectionTitle}>6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
                <p style={styles.paragraph}>
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please remember that no electronic transmission over the internet can be guaranteed 100% secure.
                </p>

                <h2 style={styles.sectionTitle}>7. DO WE COLLECT INFORMATION FROM MINORS?</h2>
                <p style={styles.paragraph}>
                    We do not knowingly solicit data from or market to children under 18 years of age. We do not intentionally target our Services to minors.
                </p>

                <h2 style={styles.sectionTitle}>8. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
                <p style={styles.paragraph}>
                    You always retain the right to review, update, change, or request the deletion of your personal data. You can perform these operations by logging in to your account settings directly, or by contacting us using the details provided below.
                </p>

                <h2 style={styles.sectionTitle}>9. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
                <p style={styles.paragraph}>
                    If you have questions or comments about this notice, you may contact our privacy management team at:
                </p>
                <div style={styles.contactBlock}>
                    <p style={{ ...styles.paragraph, margin: '0.2rem 0' }}><strong>Ariana Porroche Llorén (A-Darts)</strong></p>
                    <p style={{ ...styles.paragraph, margin: '0.2rem 0' }}>Zaragoza, Spain 50014</p>
                    <p style={{ ...styles.paragraph, margin: '0.2rem 0' }}>Email: <a href="mailto:a.darts.dev@gmail.com" style={styles.link}>a.darts.dev@gmail.com</a></p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 140px)',
        backgroundColor: '#0f1115',
    },
    card: {
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#1a1d24',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        textAlign: 'left',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        margin: '0 0 0.5rem 0',
        color: '#ffffff',
        lineHeight: '1.2',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#a0aec0',
        margin: '0 0 1.5rem 0',
    },
    divider: {
        border: '0',
        height: '1px',
        backgroundColor: '#2d3748',
        margin: '1.5rem 0',
    },
    sectionTitle: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#ffffff',
        marginTop: '2rem',
        marginBottom: '1rem',
        borderBottom: '1px solid #2d3748',
        paddingBottom: '0.5rem',
    },
    paragraph: {
        fontSize: '1rem',
        color: '#cbd5e0',
        lineHeight: '1.6',
        marginBottom: '1.2rem',
    },
    blockquote: {
        borderLeft: '4px solid #C4E866',
        backgroundColor: '#232934',
        padding: '1rem',
        margin: '1.5rem 0',
        borderRadius: '0 8px 8px 0',
        color: '#e2e8f0',
        fontSize: '1rem',
        lineHeight: '1.5',
    },
    list: {
        paddingLeft: '1.5rem',
        marginBottom: '1.5rem',
    },
    listItem: {
        fontSize: '1rem',
        color: '#cbd5e0',
        lineHeight: '1.6',
        marginBottom: '0.5rem',
    },
    link: {
        color: '#C4E866',
        textDecoration: 'none',
        fontWeight: '500',
    },
    contactBlock: {
        backgroundColor: '#232934',
        padding: '1.2rem',
        borderRadius: '8px',
        marginTop: '1rem',
        borderLeft: '4px solid #cbd5e0'
    }
};

export default PrivacyPolicyScreen;
