import React from 'react';
import styles from './divider.module.css';

const Divider: React.FC = () => {
    return (
        <div className={styles.dividerContainer}>
            <div className={styles.line}></div>
            <span className={styles.contineWithQR}>o continua con un codigo QR</span>
            <div className={styles.line}></div>
        </div>
    )
}

export default Divider;
