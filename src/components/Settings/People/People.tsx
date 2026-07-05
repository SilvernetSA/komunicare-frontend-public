import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';

import messages from './People.messages';
import './People.css';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { UserData } from '../../../types/app';
import FullScreenDialog from '../../UI/FullScreenDialog/FullScreenDialog';
import UserIcon from '../../UI/UserIcon/UserIcon';

// ─── Component ─────────────────────────────────────────────────────────────────

const People: React.FC = () => {
  const navigate = useNavigate();

  const userData = useAppStore((state) => state.userData) as UserData;
  const unloggedUserLocation = useAppStore(
    (state) => state.unloggedUserLocation,
  );
  const saveUserProfile = useAppStore((state) => state.saveUserProfile);

  const userIsLogged = !!userData?.email;
  const user = userIsLogged ? userData : ({} as Partial<UserData>);

  const location = userIsLogged
    ? {
        country: user?.location?.country,
        countryCode: user?.location?.countryCode,
      }
    : {
        country: (unloggedUserLocation as any)?.country,
        countryCode: (unloggedUserLocation as any)?.countryCode,
      };

  const [name, setName] = useState(user.name || '');
  const [email] = useState(user.email || '');
  const [birthdate, setBirthdate] = useState((user as any).birthdate || '');

  const handleSubmit = async () => {
    try {
      await saveUserProfile({ name, email, birthdate });
    } catch {
      // handle silently
    }
  };

  const handleLogout = () => {
    void useAuthStore.getState().logout();
  };

  return (
    <div className="People">
      <FullScreenDialog
        open
        title={<FormattedMessage {...messages.people} />}
        onClose={() => navigate(-1)}
        onSubmit={handleSubmit}
        disableSubmit={!userIsLogged}
      >
        <div className="People__body">
          {/* ── Profile hero ─────────────────────────────────────────────── */}
          <div className="People__hero">
            <div className="People__avatar-wrap">
              <UserIcon />
            </div>
            <div className="People__hero-info">
              <div className="People__hero-name">{name || '—'}</div>
              {email && <div className="People__hero-email">{email}</div>}
            </div>
            <div className="People__logout-btn">
              <Button
                disabled={!userIsLogged}
                variant="outlined"
                color="primary"
                onClick={handleLogout}
                component={Link}
                to="/"
              >
                <FormattedMessage {...messages.logout} />
              </Button>
            </div>
          </div>

          {/* ── Name ─────────────────────────────────────────────────────── */}
          <div className="People__field-card">
            <span className="People__field-label">
              <FormattedMessage {...messages.name} />
            </span>
            <TextField
              disabled={!userIsLogged}
              id="user-name"
              value={name}
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
              placeholder={messages.nameSecondary.defaultMessage}
              InputLabelProps={{ shrink: false }}
              label=""
            />
          </div>

          {/* ── Email (read-only) ─────────────────────────────────────────── */}
          <div className="People__field-card">
            <span className="People__field-label">
              <FormattedMessage {...messages.email} />
            </span>
            <TextField
              disabled
              id="user-email"
              value={email}
              variant="outlined"
              InputLabelProps={{ shrink: false }}
              label=""
            />
          </div>

          {/* ── Birthdate ─────────────────────────────────────────────────── */}
          <div className="People__field-card">
            <span className="People__field-label">
              <FormattedMessage {...messages.birthdate} />
            </span>
            <TextField
              disabled={!userIsLogged}
              id="user-birthdate"
              type="date"
              value={birthdate}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              label=""
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          {/* ── Location (read-only, only if available) ────────────────────── */}
          {location?.country && (
            <div className="People__field-card">
              <span className="People__field-label">
                <FormattedMessage {...messages.location} />
              </span>
              <TextField
                disabled
                id="user-location"
                value={location.country}
                variant="outlined"
                InputLabelProps={{ shrink: false }}
                label=""
                inputProps={{ 'country-code': location.countryCode }}
              />
            </div>
          )}
        </div>
      </FullScreenDialog>
    </div>
  );
};

export default People;
