import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  component: React.ComponentType<Record<string, unknown>>;
  isLogged: boolean;
  to?: string;
}

interface RedirectIfLoggedProps {
  component: React.ComponentType<Record<string, unknown>>;
  isLogged: boolean;
  to?: string;
}

export const PrivateRoute: FC<PrivateRouteProps> = ({
  component: Component,
  isLogged,
  to = '/login-signup',
}) => {
  return isLogged ? <Component /> : <Navigate to={to} replace />;
};

export const RedirectIfLogged: FC<RedirectIfLoggedProps> = ({
  component: Component,
  isLogged,
  to = '/',
}) => {
  return isLogged ? <Navigate to={to} replace /> : <Component />;
};

export const RedirectIfNeedSubscribe: FC<RedirectIfLoggedProps> = ({
  component: Component,
  isLogged,
  to = '/',
}) => {
  return isLogged ? <Navigate to={to} replace /> : <Component />;
};
