import React from 'react';
import '../assets/container.css';
import styles from './login.module.css';
import image from '../assets/me.png';

import Divider from './Divider/Divider';
// @ts-ignore
import Helmet from 'react-helmet';
import PasswordLogin from './PasswordLogin/PasswordLogin';
import QRLogin from './QRLogin/QRLogin';

const Login: React.FC = () => {
    return (
        <div className='rootContainer'>
            <div className={`container ${styles.container}`}>
                <Helmet>
                    <title>Login</title>
                </Helmet>

                <div className={styles.info}>
                    <div className={styles.logo}>
                        <div className={styles.logoCircle}></div>
                    </div>
                    <div>
                        <h1 className={styles.title}>
                            Inicio de sesion con codigo QR en tu aplicacion ¡Hoy mismo!
                        </h1>
                        <span className={styles.subtitle}>
                            Este es un proyecto que realmente disfrute crear puesto que es mi
                            caracteristica favorita en las aplicaciones web modernas.
                        </span>
                    </div>

                    <div className={styles.quoteContainer}>
                        <span className={styles.quoteContainerText}>
                            ¿No entiendes este proyecto? ¡No hay problema! Yo mismo te lo explico,
                            puedes ver un video donde explico la funcionalidad detras de este proyecto
                            dando click aqui.
                        </span>
                        <div className={styles.santiContainer}>
                            <img src={image} alt="Santiago" className={styles.picture} />
                            <div className={styles.santiInfoContainer}>
                                <span className={styles.name}>Santiago Zapata</span>
                                <span className={styles.role}>Desarrollador web</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.login}>
                    <PasswordLogin />
                    <Divider />
                    <QRLogin />
                </div>

            </div>
        </div>
    )
}

export default Login;
