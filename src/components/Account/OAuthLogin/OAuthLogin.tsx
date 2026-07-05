import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import messages from './OAuthLogin.messages';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import './OAuthLogin.css';

const OAuthLogin: React.FC = () => {
  const user = useAppStore((state) => state.userData as any);
  const navigate = useNavigate();
  const location = useLocation();
  const { type = '' } = useParams();

  const query = useMemo(() => location.search || '', [location.search]);
  const [hasErrors, setHasErrors] = useState(() => query.includes('error='));

  const handleError = useCallback(() => {
    setHasErrors(true);
    setTimeout(() => {
      navigate('/login-signup', { replace: true });
    }, 3000);
  }, [navigate]);

  useEffect(() => {
    if (user?.email) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    if (hasErrors) {
      handleError();
      return;
    }

    if (!user?.email) {
      const loginWithOAuth = async (): Promise<void> => {
        try {
          await useAuthStore
            .getState()
            .login({ email: type, password: query, type });
        } catch {
          handleError();
        }
      };

      void loginWithOAuth();
    }
  }, [handleError, hasErrors, query, type, user]);

  return (
    <div className="OAuthContainer">
      {!hasErrors && <FormattedMessage {...messages.loading} />}
      {hasErrors && <FormattedMessage {...messages.errorMessage} />}
    </div>
  );
};

export default OAuthLogin;
