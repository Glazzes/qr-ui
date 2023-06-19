import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './qrlogin.module.css';

import axios, { AxiosError } from 'axios';

import { QRCode } from '../../types/qrcode';
import { User } from '../../types/user';
import { browserName, browserVersion, osName, osVersion } from 'react-device-detect';
import { QRCodeSVG } from 'qrcode.react';
import {v4 as uuid} from 'uuid';
import { deleteSourceUrl, getEventSourceUrl, getProfilePictureUrl, qrLogin } from '../../data/urls';
import { setAccessToken, setIsAuthenticated } from '../../lib/authstore';
import { axiosInstance } from '../../lib/axios';
import { DisplayUserEvent } from '../../types/displayevent';
import { COUNNTDOWN_SECONDS } from '../../data/constants';
import { Events } from '../../data/enums';
import { IoInformationCircle } from 'react-icons/io5';


const deviceId = uuid();
const emptyUser: User = {
    id: '',
    username: '',
    profilePicture: ''
}

const QRLogin: React.FC = () => {
    const qrContainerRef = useRef<HTMLDivElement>(null);
    const elapsedTime = useRef<number>(0);

    const [user, setUser] = useState<User>(emptyUser);
    const [countDown, setCountDown] = useState<string>('3:00');

    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timer>();
    const [restartInterval, setRestartInterval] = useState<NodeJS.Timer>();

    const [eventSource, setEventSource] = useState(() => {
        const url = getEventSourceUrl(deviceId);
        return new EventSource(url);
    });

    const [qrCode, setQrCode] = useState<QRCode>(() => {
        const os = `${osName}${osVersion === 'none' ? '' : ' ' + osVersion}`;
        const deviceName = `${browserName} ${browserVersion}`;
    
        return {
          issuedFor: '',
          mobileId: '',
          deviceId,
          deviceName,
          ipAddress: '',
          location: '',
          os
        }
    });

    const restart = useCallback(() => {
        const url = deleteSourceUrl(qrCode.deviceId);
        axiosInstance.delete(url);

        const newId = uuid();
        setQrCode(qr => ({...qr, deviceId: newId, issuedFor: '', mobileId: ''}));
        setCountDown('3:00');
        setEventSource(prev => {
          prev.close();
          const newUrl = getEventSourceUrl(newId);
          return new EventSource(newUrl)
        });

        translate("left");
        clearCountDownInterval();
    }, [qrCode]);

    const displayCurrentUser = (e: {data: string}) => {
      const {user, mobileId} = JSON.parse(e.data) as DisplayUserEvent;
      user.profilePicture = getProfilePictureUrl(user.profilePicture);

      elapsedTime.current = 0;

      setUser(user);
      setQrCode((qr) => ({...qr, issuedFor: user.id, mobileId}));
      
      translate("right")
      clearRestartInterval();
  }

    const clearCountDownInterval = () => {
      setCountdownInterval(prev => {
        if(prev) clearInterval(prev);
        return undefined;
      });
    }

    const assignCountDownInterval = () => {
        clearCountDownInterval();

        const interval = setInterval(() => {
          const acutalTime = COUNNTDOWN_SECONDS - elapsedTime.current;
          const minutes = Math.floor(acutalTime / 60);
          const seconds = acutalTime % 60;
          setCountDown(`${minutes}:${seconds > 9 ? seconds : '0' + seconds}`);

          if(elapsedTime.current > COUNNTDOWN_SECONDS) {
            restart();
            return;
          }

          elapsedTime.current++;
        }, 1000)
  
        setCountdownInterval(interval);      
    }

    const clearRestartInterval = () => {
      setRestartInterval(prev => {
        if(prev) clearInterval(prev);
        return undefined;
      })
    }

    const assignRestartInterval = () => {
      clearRestartInterval();
  
      const interval = setInterval(restart, COUNNTDOWN_SECONDS * 1000);
      setRestartInterval(interval);
    }

    const translate = (direction: "left" | "right") => {
      if(qrContainerRef.current) {
        if(direction === "right") {
          qrContainerRef.current.classList.add(styles.showRight);
        }

        if(direction === "left") {
          qrContainerRef.current.classList.remove(styles.showRight);
        }
      }
    }

    const login = useCallback(() => {
      axiosInstance
        .post(qrLogin, qrCode)
        .then(response => {
          const accessToken = response.headers['authorization'];
          const refreshToken = response.headers['refresh-token'];
   
          if (accessToken && refreshToken) {
            localStorage.setItem('tokens', JSON.stringify({accessToken, refreshToken}));
            setAccessToken(accessToken);
            setIsAuthenticated(true);
          } else {
            alert('Login successfull but no access token was present');
          }
      })
      .catch((e) => console.log(e, 'fail'));
    }, [qrCode]);

    useEffect(() => {
      assignRestartInterval();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const displayUserCallback = (e: {data: string}) => {
          displayCurrentUser(e);
          assignCountDownInterval();
        }

        const cancelLoginCallback = () => {
          restart();
          assignRestartInterval();
        }

        eventSource.addEventListener(Events.DISPLAY_USER, displayUserCallback);
        eventSource.addEventListener(Events.PERFORM_LOGIN, login);
        eventSource.addEventListener(Events.CANCEL_LOGIN, cancelLoginCallback);
    
        return () => {
          eventSource.removeEventListener(Events.DISPLAY_USER, displayUserCallback);
          eventSource.removeEventListener(Events.PERFORM_LOGIN, login);
          eventSource.removeEventListener(Events.CANCEL_LOGIN, cancelLoginCallback);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventSource, login, restart]);

    useEffect(() => {
        const fetchUserIp = async () => {
            try{
                const {data} = await axios.get('https://ipapi.co/json/');
                    setQrCode((qr) => ({
                    ...qr,
                    ipAddress: data.ip,
                    location: `${data.city}, ${data.country_name}`,
                    })
                );
            }catch(e) {
                const response = (e as AxiosError).response;
                console.log(response);
            }
        }
    
        fetchUserIp();
    }, []);

    return (
        <div>

            <div className={styles.qrRootContainer}>
              <div ref={qrContainerRef} className={styles.qrContainer}>

                <div className={styles.qrWrapper}>
                    <div className={styles.titleContainer}>
                        <span className={styles.title}>Codigo QR</span>
                        <div className={styles.button}>
                            <span>Descargar aplicacion</span>
                        </div>
                    </div>

                    <div className={styles.loginContainer}>
                        <div className={styles.qtBackgroundContainer}>
                          <QRCodeSVG
                              className={styles.qr}
                              value={JSON.stringify(qrCode)}
                              includeMargin={false}
                              fgColor={'#2C3639'}
                          />
                        </div>

                        <div className={styles.itemList}>
                            <div className={styles.hstack}>
                              <IoInformationCircle color='#065ad8' size={20} className={styles.itemIcon} />
                              <span className={styles.itemText}>Usa la aplicacion movil para inciar sesion con el codigo QR</span>
                            </div>
                            
                            <div className={styles.hstack}>
                              <IoInformationCircle color='#065ad8' size={20} className={styles.itemIcon} />
                              <span className={styles.itemText}>Obtendras un nuevo codigo cada tres minutos</span>
                            </div>
                        </div>
                    </div>
                    
                </div>

                <div className={styles.qrWrapper}>
                    <div className={styles.titleContainer}>
                        <span className={styles.title}>¿No eres tu?</span>
                        <div className={styles.button} onClick={() => {
                          restart();
                          assignRestartInterval();
                        }}>
                            <span>Probemos de nuevo</span>
                        </div>
                    </div>

                    <div className={styles.loggedContainer}>
                      <div className={styles.pictureContainer}>
                          <div className={styles.test}>
                            <img 
                              src={user.profilePicture} 
                              alt="User profile" 
                              className={styles.picture} 
                            />
                          </div>
                      </div>

                      <div className={styles.itemList}>
                        <div className={styles.hstack}>
                          <IoInformationCircle color='#065ad8' size={20} className={styles.itemIcon} />
                          <span className={styles.itemText}>
                            Estas a punto de iniciar sesion como <span className={styles.accentuated}>{user.username}</span>
                          </span>
                        </div>
                            
                        <div className={styles.hstack}>
                          <IoInformationCircle color='#065ad8' size={20} className={styles.itemIcon} />
                          <span className={styles.itemText}>
                            Esta sesion se cerrera automaticamente si no la activas en <span className={styles.accentuated}>{countDown}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                </div>

              </div>
            </div>

        </div>
    )
}

export default QRLogin;
