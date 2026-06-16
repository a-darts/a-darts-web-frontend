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
                    <a href="mailto:contacto@a-darts.com" style={styles.link}>contacto@a-darts.com</a>.
                </p>

                <h2 style={styles.sectionTitle}>SUMMARY OF KEY POINTS</h2>
                <p style={styles.paragraph}>
                    This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics
                    by clicking the link following each key point or by using our table of contents below to find the section you are looking for.
                </p>

                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal
                        information depending on how you interact with us and the Services, the choices you make, and the products and features you use.
                        Learn more about personal information you disclose to us.
                    </li>


                    <li style={styles.listItem}>
                        <strong>Do we process any sensitive personal information?</strong> Some of the information may be considered 'special' or
                        'sensitive' in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs.
                        We do not process sensitive personal information.
                    </li>

                    <li style={styles.listItem}>
                        <strong>Do web collect any information from third parties?</strong> We do not collect any information from third parties.
                    </li>

                    <li style={styles.listItem}>
                        <strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services,
                        communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other
                        purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about how we
                        process your information.
                    </li>

                    <li style={styles.listItem}>
                        <strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific
                        situations and with specific third parties. Learn more about when and with whom we share your personal information.
                    </li>

                    <li style={styles.listItem}>
                        <strong>How do we keep your information safe?</strong> We have adequate organisational and technical processes and procedures
                        in place to protect your personal information. However, no electronic transmission over the internet or information storage
                        technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other
                        unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your
                        information. Learn more about how we keep your information safe.
                    </li>

                    <li style={styles.listItem}>
                        <strong>What are your rights?</strong>Depending on where you are located geographically, the applicable privacy law may mean
                        you have certain rights regarding your personal information. Learn more about your privacy rights.
                    </li>

                    <li style={styles.listItem}>
                        <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by visiting{' '}
                        <a href="https://a-darts.com/" target="_blank" rel="noreferrer" style={styles.link}>
                            https://a-darts.com/
                        </a>
                        , or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
                    </li>
                </ul>

                <p style={styles.paragraph}>
                    Want to learn more about what we do with any information we collect? Review the Privacy Notice in full.
                </p>

                <h2 style={styles.sectionTitle}>TABLE OF CONTENTS</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href="#section-1" style={styles.sectionLink}>
                        1. What information do we collect?
                    </a>
                    <a href="#section-2" style={styles.sectionLink}>
                        2. How do we process your information?
                    </a>
                    <a href="#section-3" style={styles.sectionLink}>
                        3. When and with whom do we share your personal information?
                    </a>
                    <a href="#section-4" style={styles.sectionLink}>
                        4. Do we use cookies and other tracking technologies?
                    </a>
                    <a href="#section-5" style={styles.sectionLink}>
                        5. How long do we keep your information?
                    </a>
                    <a href="#section-6" style={styles.sectionLink}>
                        6. How do we keep your information safe?
                    </a>
                    <a href="#section-7" style={styles.sectionLink}>
                        7. Do we collect information from minors?
                    </a>
                    <a href="#section-8" style={styles.sectionLink}>
                        8. What are your privacy rights?
                    </a>
                    <a href="#section-9" style={styles.sectionLink}>
                        9. Controls for do-not-track features
                    </a>
                    <a href="#section-10" style={styles.sectionLink}>
                        10. Do we make updates to this notice?
                    </a>
                    <a href="#section-11" style={styles.sectionLink}>
                        11. How can you contact us about this notice?
                    </a>
                    <a href="#section-12" style={styles.sectionLink}>
                        12. How can you review, update, or delete the data we collect from you?
                    </a>
                </div>


                <h2 id="section-1" style={styles.sectionTitle}>1. WHAT INFORMATION DO WE COLLECT?</h2>

                <p style={styles.paragraph}>
                    <strong>Personal information you disclose to us</strong>
                </p>
                <p style={styles.paragraph}>
                    <strong>In short:</strong> We collect personal information that you provide to us.
                </p>
                <p style={styles.paragraph}>
                    We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in
                    obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise
                    when you contact us.
                </p>
                <p style={styles.paragraph}>
                    <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of
                    your interactions with us and the Services, the choices you make, and the products and features you use. The personal information
                    we collect may include the following:
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Email addresses</li>
                        <li style={styles.listItem}>Passwords</li>
                        <li style={styles.listItem}>Aliases / Player nicknames</li>
                    </ul>
                </p>
                <p style={styles.paragraph}>
                    <strong>Sensitive Information:</strong> We do not process sensitive information.
                </p>
                <p style={styles.paragraph}>
                    All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
                </p>


                <h2 id="section-2" style={styles.sectionTitle}>2. HOW DO WE PROCESS YOUR INFORMATION?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security
                    and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
                </p>
                <p style={styles.paragraph}>
                    <strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong>
                </p>
                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        <strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong>
                        We may process your information so you can create and log in to your account, as well as keep your account in working order.
                    </li>
                    <li style={styles.listItem}>
                        <strong>To deliver and facilitate delivery of services to users.</strong>
                        We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.
                    </li>
                    <li style={styles.listItem}>
                        <strong>To send administrative information to you.</strong>
                        We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.
                    </li>
                    <li style={styles.listItem}>
                        <strong>To protect our Services.</strong>
                        We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.
                    </li>
                    <li style={styles.listItem}>
                        <strong>To administer prize draws and competitions.</strong>
                        We may process your information to administer prize draws and competitions.
                    </li>
                    <li style={styles.listItem}>
                        <strong>To evaluate and improve our Services, products, marketing, and your experience. </strong>
                        We may process your information when we believe it is necessary to identify usage trends, determine the effectiveness of our promotional
                        campaigns, and to evaluate and improve our Services, products, marketing, and your experience.
                    </li>
                    <li style={styles.listItem}>
                        <strong>To comply with our legal obligations.</strong>
                        We may process your information to comply with our legal obligations, respond to legal requests, and exercise, establish, or defend our legal rights.
                    </li>
                </ul>


                <h2 id="section-3" style={styles.sectionTitle}>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.
                </p>
                <p style={styles.paragraph}>
                    <strong>Vendors, Consultants, and Other Third-Party Service Providers.</strong> We may share your data with third-party vendors, service providers,
                    contractors, or agents ('third parties') who perform services for us or on our behalf and require access to such information to do that work.
                    We have contracts in place with our third parties, which are designed to help safeguard your personal information. This means that they cannot do
                    anything with your personal information unless we have instructed them to do it. They will also not share your personal information with any organisation
                    apart from us. They also commit to protect the data they hold on our behalf and to retain it for the period we instruct.
                </p>
                <p style={styles.paragraph}>
                    The third parties we may share personal information with are as follows:
                    <ul style={styles.list}>
                        <li style={styles.listItem}>
                            <strong>Email Delivery Services:</strong> Resend
                        </li>
                    </ul>
                </p>
                <p style={styles.paragraph}>
                    We also may need to share your personal information in the following situations:
                    <ul style={styles.list}>
                        <li style={styles.listItem}>
                            <strong>Bussiness Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of
                            company assets, financing, or acquisition of all or a portion of our business to another company.
                        </li>
                    </ul>
                </p>


                <h2 id="section-4" style={styles.sectionTitle}>4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.
                </p>
                <p style={styles.paragraph}>
                    We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services.
                    Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences,
                    and assist with basic site functions.
                </p>
                <p style={styles.paragraph}>
                    We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help
                    manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication
                    preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests
                    which may appear either on our Services or on other websites.
                </p>
                <p style={styles.paragraph}>
                    Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice:{' '}
                    <a href="https://a-darts.com/cookies-policy" target="_blank" rel="noreferrer" style={styles.link}>https://a-darts.com/cookies-policy</a>.
                </p>


                <h2 id="section-5" style={styles.sectionTitle}>5. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice unless otherwise required by law.
                </p>
                <p style={styles.paragraph}>
                    We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period
                    is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal
                    information for longer than the period of time in which users have an account with us.
                </p>
                <p style={styles.paragraph}>
                    When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not
                    possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate
                    it from any further processing until deletion is possible.
                </p>


                <h2 id="section-6" style={styles.sectionTitle}>6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> We aim to protect your personal information through a system of organisational and technical security measures.
                </p>
                <p style={styles.paragraph}>
                    We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we
                    process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology
                    can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to
                    defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information,
                    transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
                </p>

                <p style={styles.paragraph}>
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                    However, please remember that no electronic transmission over the internet can be guaranteed 100% secure.
                </p>


                <h2 id="section-7" style={styles.sectionTitle}>7. DO WE COLLECT INFORMATION FROM MINORS?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.
                </p>
                <p style={styles.paragraph}>
                    We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using
                    the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of
                    the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable
                    measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at{' '}
                    <a href="mailto:contacto@a-darts.com" style={styles.link}>contacto@a-darts.com</a>.
                </p>


                <h2 id="section-8" style={styles.sectionTitle}>8. WHAT ARE YOUR PRIVACY RIGHTS?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.
                </p>
                <p style={styles.paragraph}>
                    <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent
                    depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the
                    contact details provided in the section{' '}
                    <a href="#section-11" style={styles.sectionLink}>
                        11. How can you contact us about this notice?
                    </a> below.
                </p>
                <p style={styles.paragraph}>
                    However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing
                    of your personal information conducted in reliance on lawful processing grounds other than consent.
                </p>
                <p style={styles.paragraph}>
                    <strong>Account Information</strong>
                </p>
                <p style={styles.paragraph}>
                    If you would at any time like to review or change the information in your account or terminate your account, you can:
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Log in to your account settings and update your user account.</li>
                        <li style={styles.listItem}>Contact us using the contact information provided.</li>
                    </ul>
                </p>
                <p style={styles.paragraph}>
                    Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some
                    information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal
                    requirements.
                </p>
                <p style={styles.paragraph}>
                    <strong>Cookies and similar technologies:</strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your
                    browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our
                    Services. For further information, please see our Cookie Notice:{' '}
                    <a href="https://a-darts.com/cookies-policy" target="_blank" rel="noreferrer" style={styles.link}>https://a-darts.com/cookies-policy</a>.
                </p>
                <p style={styles.paragraph}>
                    If you have questions or comments about your privacy rights, you may email us at{' '}
                    <a href="mailto:contacto@a-darts.com" style={styles.link}>contacto@a-darts.com</a>.
                </p>


                <h2 id="section-9" style={styles.sectionTitle}>9. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>

                <p style={styles.paragraph}>
                    Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ('DNT') feature or setting you can activate to signal your
                    privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognising
                    and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates
                    your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in
                    a revised version of this Privacy Notice.
                </p>


                <h2 id="section-10" style={styles.sectionTitle}>10. DO WE MAKE UPDATES TO THIS NOTICE?</h2>

                <p style={styles.paragraph}>
                    <strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.
                </p>

                <p style={styles.paragraph}>
                    We may update this Privacy Notice from time to time. The updated version will be indicated by an updated 'Revised' date at the top of this Privacy Notice.
                    If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.
                    We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.
                </p>


                <h2 id="section-11" style={styles.sectionTitle}>11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>

                <p style={styles.paragraph}>
                    If you have questions or comments about this notice, you may email us at{' '}
                    <a href="mailto:contacto@a-darts.com" style={styles.link}>contacto@a-darts.com</a>{' '}
                    or contact us by post at:
                </p>
                <div style={styles.contactBlock}>
                    <p style={{ ...styles.paragraph, margin: '0.2rem 0' }}><strong>Ariana Porroche Llorén (A-Darts)</strong></p>
                    <p style={{ ...styles.paragraph, margin: '0.2rem 0' }}>Zaragoza, Spain 50014</p>
                    <p style={{ ...styles.paragraph, margin: '0.2rem 0' }}>Email: <a href="mailto:contacto@a-darts.com" style={styles.link}>contacto@a-darts.com</a></p>
                </div>


                <h2 id="section-12" style={styles.sectionTitle}>12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>

                <p style={styles.paragraph}>
                    You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your
                    personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some
                    circumstances by applicable law. To request to review, update, or delete your personal information, please visit:{' '}
                    <a href="https://a-darts.com/" target="_blank" rel="noreferrer" style={styles.link}>https://a-darts.com/</a>.
                </p>
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
    sectionLink: {
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
