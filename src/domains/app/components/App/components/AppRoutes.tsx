import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import Analytics from '@/domains/app/components/Analytics/Analytics';
import {
  PrivateRoute,
  RedirectIfLogged,
} from '@/domains/app/components/App/components/AppRouteGuards';
import NotFound from '@/domains/app/components/NotFound/NotFound';
import BoardContainer from '@/domains/board/Board';
import Settings from '@/domains/settings/components/Settings/Settings.routes';
import Activate from '@/domains/user/components/Activate/Activate';
import AuthScreen from '@/domains/user/components/AuthScreen/AuthScreen.component';
import ChangePassword from '@/domains/user/components/ChangePassword/ChangePassword';
import OAuthLogin from '@/domains/user/components/OAuthLogin/OAuthLogin';
import WelcomeScreen from '@/domains/user/components/WelcomeScreen/WelcomeScreen';

// Redirects legacy /board/:id?c=X URLs to the new /communicator/X/board/:id shape.
const LegacyBoardRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const communicatorId = searchParams.get('c');
  if (id && communicatorId) {
    return (
      <Navigate to={`/communicator/${communicatorId}/board/${id}`} replace />
    );
  }
  return <Navigate to="/" replace />;
};

interface AppRoutesProps {
  isLogged: boolean;
  isDownloadingLang: boolean;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  isLogged,
  isDownloadingLang,
}) => (
  <Routes>
    <Route
      path="/login-signup"
      element={
        <RedirectIfLogged component={AuthScreen} isLogged={isLogged} to="/" />
      }
    />
    <Route path="/settings/*" element={<Settings />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/activate/:url" element={<Activate />} />
    <Route path="/reset/:userid/:url" element={<ChangePassword />} />
    <Route path="/login/:type/callback" element={<OAuthLogin />} />
    <Route path="/board/:id" element={<LegacyBoardRedirect />} />
    <Route
      path="/communicator/:communicatorId"
      element={<PrivateRoute isLogged={isLogged} component={BoardContainer} />}
    />
    <Route
      path="/communicator/:communicatorId/board/:boardId"
      element={<PrivateRoute isLogged={isLogged} component={BoardContainer} />}
    />
    {isDownloadingLang && (
      <Route path="/" element={<Navigate to="/settings/language" replace />} />
    )}
    <Route
      path="/"
      element={isLogged ? <BoardContainer /> : <WelcomeScreen />}
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
