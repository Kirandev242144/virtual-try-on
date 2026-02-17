import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.brand}>
                    <div className={styles.logo}>V-Try.</div>
                    <p className={styles.copyright}>© 2026 Virtual Try-On Inc.</p>
                </div>

                <div className={styles.links}>
                    <div className={styles.column}>
                        <h4>Product</h4>
                        <a href="#">Virtual Try-On</a>
                        <a href="#">AR Viewer</a>
                        <a href="#">Pricing</a>
                    </div>
                    <div className={styles.column}>
                        <h4>Company</h4>
                        <a href="#">About</a>
                        <a href="#">Blog</a>
                        <a href="#">Careers</a>
                    </div>
                    <div className={styles.column}>
                        <h4>Resources</h4>
                        <a href="#">Documentation</a>
                        <a href="#">API Reference</a>
                        <a href="#">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
