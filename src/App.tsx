import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import { Home } from './pages';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { authState, setIsAuthenticated, setUser } from './lib/authstore';
import { axiosInstance } from './lib/axios';
import { loggedInUser } from './data/urls';
import { User } from './types/user';
import { AxiosError } from 'axios';

function App() {
  const snap = useSnapshot(authState);

  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    const getUser = async () => {
      try{
        const user = await axiosInstance.get<User>(loggedInUser);
        setIsAuthenticated(true);
        setUser(user.data);
      }catch(e) {
        const response = (e as AxiosError).response!!;
        if(response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
        }
      }finally {
        setIsFetching(false);
      }
    }

    getUser();
  }, []);

  if(isFetching) {
    return <div></div>
  }

  return (
    <div style={{width: "100%", height: "100%"}}>
      <HashRouter>
        {
          snap.isAuthenticated ? (
            <Routes>
              <Route index={true} path='/' Component={Home}  />
              <Route path='/one' element={<p>Sex</p>} />
            </Routes>
          ) : (
            <Routes>
              <Route index={true} path='/' Component={Login} />
            </Routes>
          )
        }
      </HashRouter>
    </div>
  );
}

export default App;
