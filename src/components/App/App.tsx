import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import Helmet from 'react-helmet';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';

import registerServiceWorker from '../../registerServiceWorker';
import { useAppStore } from '../../store/appStore';
import { useLanguageStore } from '../../store/languageStore';
import { useNotificationStore } from '../../store/notificationStore';
import Activate from '../Account/Activate/Activate';
import ChangePassword from '../Account/ChangePassword/ChangePassword';
import OAuthLogin from '../Account/OAuthLogin/OAuthLogin';
import Analytics from '../Analytics/Analytics';
import AuthScreen, {
  RedirectIfLogged,
  PrivateRoute,
} from '../AuthScreen/AuthScreen.component';
import BoardContainer from '../Board/Board';
import NotFound from '../NotFound/NotFound';
import Notifications from '../Notifications/Notifications';
import PremiumRequiredModal from '../PremiumFeature/PremiumRequiredModal';
import TrialRemainingModal from '../PremiumFeature/TrialRemainingModal';
import { DISPLAY_SIZE_STANDARD } from '../Settings/Display/Display.constants';
import Settings from '../Settings/Settings.wrapper';
import WelcomeScreen from '../WelcomeScreen/WelcomeScreen';
import './App.css';

const App: React.FC = () => {
  const navigate = useNavigate();
  const dir = useLanguageStore((state) => state.dir);
  const lang = useLanguageStore((state) => state.lang);
  const isDownloadingLang = useLanguageStore(
    (state) => state.downloadingLang.isdownloading,
  );
  const isFirstVisit = useAppStore((state) => state.isFirstVisit);
  const displaySettings = useAppStore((state) => state.displaySettings);
  const userData = useAppStore((state) => state.userData);
  const isLogged = !!(userData as any)?.email;
  const userId = String((userData as any)?.id || '');
  const updateUserDataFromAPI = useAppStore((state) => state.refreshUserData);
  const updateLoggedUserLocation = useAppStore(
    (state) => state.fetchLoggedUserLocation,
  );
  const updateUnloggedUserLocation = useAppStore(
    (state) => state.fetchUnloggedUserLocation,
  );
  const lastRefreshedUserIdRef = useRef<string>('');
  const prevIsLoggedRef = useRef(isLogged);

  useEffect(() => {
    const handleNewContentAvailable = () => {
      useNotificationStore
        .getState()
        .showNotification(
          'New content is available; please refresh.',
          'refresh',
        );
    };

    const handleContentCached = () => {
      useNotificationStore
        .getState()
        .showNotification('Content is cached for offline use.');
    };

    registerServiceWorker(handleNewContentAvailable, handleContentCached);
  }, []);

  useEffect(() => {
    const localizeUser = async () => {
      if (isLogged && userId) {
        if (lastRefreshedUserIdRef.current !== userId) {
          await updateUserDataFromAPI();
          lastRefreshedUserIdRef.current = userId;
        }
        updateLoggedUserLocation();
        return;
      }

      lastRefreshedUserIdRef.current = '';
      updateUnloggedUserLocation();
    };

    void localizeUser();
  }, [
    isLogged,
    userId,
    updateUserDataFromAPI,
    updateLoggedUserLocation,
    updateUnloggedUserLocation,
  ]);

  // Redirect to login when the user explicitly logs out (isLogged: true → false)
  useEffect(() => {
    const wasLogged = prevIsLoggedRef.current;
    prevIsLoggedRef.current = isLogged;
    if (wasLogged && !isLogged) {
      navigate('/login-signup', { replace: true });
    }
  }, [isLogged, navigate]);

  const uiSize = displaySettings.uiSize || DISPLAY_SIZE_STANDARD;
  const fontSize = displaySettings.fontSize || DISPLAY_SIZE_STANDARD;
  const classes = [
    'Komunicare__DisplaySettings',
    `Komunicare__UISize__${uiSize}`,
    `Komunicare__FontSize__${fontSize}`,
  ];

  const htmlElement = document.getElementsByTagName('html')[0];
  htmlElement.className = classes.join(' ');

  return (
    <div
      className={classNames('App', {
        'is-dark': displaySettings.darkThemeActive,
      })}
    >
      <Helmet>
        <html lang={lang} dir={dir} />
      </Helmet>

      <Notifications />
      <Routes>
        <Route
          path="/login-signup"
          element={
            <RedirectIfLogged
              component={AuthScreen}
              isLogged={isLogged}
              to="/"
            />
          }
        />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/activate/:url" element={<Activate />} />
        <Route path="/reset/:userid/:url" element={<ChangePassword />} />
        <Route path="/login/:type/callback" element={<OAuthLogin />} />
        <Route
          path="/board/:id"
          element={
            <PrivateRoute isLogged={isLogged} component={BoardContainer} />
          }
        />
        {isDownloadingLang && (
          <Route
            path="/"
            element={<Navigate to="/settings/language" replace />}
          />
        )}
        <Route
          path="/"
          element={
            isFirstVisit && !isLogged ? <WelcomeScreen /> : <BoardContainer />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PremiumRequiredModal />
      <TrialRemainingModal />
    </div>
  );
};

export default App;
