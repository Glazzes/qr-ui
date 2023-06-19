import React, { useState } from 'react';
import styles from './styles.module.css';
import {IoMailOutline, IoLockClosed, IoEye, IoEyeOff} from 'react-icons/io5';

const iconColor = "#9ca1ab";
const iconSize = 20;

const PasswordLogin: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const updateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const toggleShowPassword = () => {
        setShowPassword(sp => !sp);
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainInfoContainer}>
                <h1 className={styles.title}>Inciar sesion</h1>
                <span className={styles.loginMethod}>
                    ¡Bienvenido! Escoge un metodo para iniciar sesion:
                </span>
            </div>

            <form onSubmit={onSubmit} className={styles.formContainer}>
                <div className={styles.textInputContainer}>
                    <IoMailOutline color={iconColor} size={iconSize} />
                    <input 
                        type={"text"}
                        placeholder="Corre electronico"
                        required={true}
                        onChange={updateUsername} 
                        className={styles.textInput}
                    />
                </div>

                <div className={styles.textInputContainer}>
                    <IoLockClosed color={iconColor} size={iconSize} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        onChange={updatePassword} 
                        required={true} 
                        className={styles.textInput} 
                    />
                    {
                        showPassword ? (
                            <IoEyeOff
                                className={styles.cursor}
                                color={iconColor} 
                                size={iconSize} 
                                onClick={toggleShowPassword} 
                            />
                        ): (
                            <IoEye
                                className={styles.cursor}
                                color={iconColor} 
                                size={iconSize} 
                                onClick={toggleShowPassword}
                            />
                        )
                    }
                </div>

                <button className={styles.button}>Iniciar sesion</button>
            </form>
        </div>
    )
}

export default PasswordLogin;
