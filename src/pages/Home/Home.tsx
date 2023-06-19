import React, { useEffect } from 'react';
import styles from './home.module.css';
import { useSnapshot } from 'valtio';
import { authState, setIsAuthenticated, setUser } from '../../lib/authstore';
import { axiosInstance } from '../../lib/axios';
import { getProfilePictureUrl, loggedInUser } from '../../data/urls';

// @ts-ignore
import Helmet from 'react-helmet';

const Home: React.FC = () => {
    const snap = useSnapshot(authState);
    const profilePicture = getProfilePictureUrl(snap.user.profilePicture);

    const logout = () => {
        setIsAuthenticated(false);
        setUser({id: '', username: '', profilePicture: ''});
        localStorage.clear();
    }

    useEffect(() => {
      if(snap.user.id !== '') {
        return;
      }

      axiosInstance
        .get(loggedInUser)
        .then(({data}) => setUser(data))
        .catch((e) => console.log(e));
    }, [snap.user]);

    return (
        <div className={styles.rootContainer}>
            <Helmet>
                <title>{snap.user.username} | Perfil</title>
            </Helmet>

            <div className={styles.menu}></div>

            <div className={styles.container}>    
                <div className={styles.welcomeContainer}>
                    <div>
                        <h1 className={styles.title}>Bienvenido(a),</h1>
                        <span className={styles.username}>{snap.user.username}</span>
                    </div>
                    <img 
                        className={styles.profilePicture}
                        src={profilePicture} 
                        alt="User's profile" 
                    />
                </div>

                <div className={styles.informationContainer}>
                    <p>
                    ¡Felicitaciones! Has sido autenticado exitosamente, en esta pantalla podrás ver toda tu información, claro, si tuvieses alguna {":)"}
                    </p>
                </div>

                <div className={styles.informationContainer}>
                    <p>
                        ¿No te parece un proyecto muy completo? Bien, puedes ir a revisar otros
                        proyectos en mi portafolio, de seguro veras uno que te interese {":D"}
                    </p>
                </div>

                <div className={styles.button} onClick={logout}>
                    <span>Cerrar sesion</span>
                </div>

            </div>
        </div>
    )
}

export default Home;
