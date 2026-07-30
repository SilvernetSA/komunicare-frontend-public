import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { activateAccountOnce } from './activateAccountOnce';
import { useUserStore } from '@/domains/user/stores/userStore';
import './Activate.css';

interface ActivationStatus {
  message?: string;
  [key: string]: unknown;
}

/**
 * Activate component for account activation
 * This component handles the activation of a user account using the URL parameter
 */
const Activate: React.FC = () => {
  const [isActivating, setIsActivating] = useState<boolean>(true);
  const [activationStatus, setActivationStatus] = useState<ActivationStatus>(
    {},
  );
  const navigate = useNavigate();
  const activateAccount = useUserStore((state) => state.activateAccount);
  const { url } = useParams<{ url: string }>();

  useEffect(() => {
    if (!url) {
      setIsActivating(false);
      setActivationStatus({ message: 'Invalid activation URL' });
      return;
    }

    let isMounted = true;
    let redirectTimeout: ReturnType<typeof setTimeout> | undefined;

    const activate = async (): Promise<void> => {
      try {
        const status = await activateAccountOnce(url, activateAccount);
        if (!isMounted) {
          return;
        }
        setActivationStatus(status);
        redirectTimeout = setTimeout(() => {
          navigate('/login-signup', { replace: true });
        }, 1000);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setActivationStatus(error as ActivationStatus);
      } finally {
        if (isMounted) {
          setIsActivating(false);
        }
      }
    };

    void activate();

    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [url, activateAccount, navigate]);

  return (
    <div className="Activate">
      {isActivating ? (
        'Activating your account...'
      ) : (
        <Fragment>
          {activationStatus.message}
          <br />
          <Link to="/login-signup" className="Activate_home">
            Login
          </Link>
        </Fragment>
      )}
    </div>
  );
};

export default Activate;
