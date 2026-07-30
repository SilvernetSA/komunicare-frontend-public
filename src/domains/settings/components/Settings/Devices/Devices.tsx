import DeleteIcon from '@mui/icons-material/Delete';
import LaptopIcon from '@mui/icons-material/Laptop';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import moment from 'moment';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import messages from './Devices.messages';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useSettingsStore } from '@/domains/settings/stores/settingsStore';
import FullScreenDialog from '@/domains/shared/components/UI/FullScreenDialog/FullScreenDialog';
import './Devices.css';

interface Device {
  _id: string;
  deviceId: string;
  lastLogind: string;
  [key: string]: unknown;
}

const isMobileUserAgent = (userAgent: string): boolean =>
  /Android|iPhone|iPad|Mobile/i.test(userAgent);

const parseUserAgent = (userAgent: string): string => {
  let os = 'Desconocido';
  let browser = 'Desconocido';
  let device = 'Desconocido';

  if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android [\d\.]+/);
    os = match ? match[0] : 'Android';
  } else if (userAgent.includes('Windows')) {
    const match = userAgent.match(/Windows NT [\d\.]+/);
    os = match ? match[0] : 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X [\d_]+/);
    os = match ? match[0].replace(/_/g, '.') : 'Mac OS X';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }

  if (userAgent.includes('Chrome')) {
    const match = userAgent.match(/Chrome\/[\d\.]+/);
    browser = match ? match[0].replace('/', ' ') : 'Chrome';
  } else if (userAgent.includes('Safari') && userAgent.includes('Version')) {
    const match = userAgent.match(/Version\/[\d\.]+/);
    browser = match ? match[0].replace('Version/', 'Safari ') : 'Safari';
  } else if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/[\d\.]+/);
    browser = match ? match[0].replace('/', ' ') : 'Firefox';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    browser = 'Internet Explorer';
  }

  const deviceMatch = userAgent.match(
    /(Nexus|iPhone|iPad|Galaxy|Pixel|OnePlus|Huawei|Xiaomi|Motorola|Sony|HTC)\s?[\w\d\-]+/,
  );
  if (deviceMatch) {
    device = deviceMatch[0];
  } else if (userAgent.includes('Mobile')) {
    device = 'Dispositivo Móvil';
  } else {
    device = 'PC o desconocido';
  }

  return `${browser} | ${os} | ${device}`;
};

const Devices: React.FC = () => {
  const navigate = useNavigate();
  const userData = useAppStore((state) => state.userData);
  const persistSettings = useSettingsStore((state) => state.persistSettings);

  const initialDevices: Device[] = (userData as any)?.settings?.devices || [];
  const [devices, setDevices] = useState<Device[]>(initialDevices);

  const updateDevicesList = (devicesList: Device[]) => {
    void persistSettings({ devices: devicesList as any });
  };

  const handleDelete = (id: string) => {
    setDevices((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <FullScreenDialog
      open
      title={<FormattedMessage {...messages.devices} />}
      onClose={() => navigate(-1)}
      onSubmit={() => updateDevicesList(devices)}
    >
      <div className="Devices__body">
        {devices.length === 0 ? (
          <div className="Devices__empty">
            <FormattedMessage {...messages.devices} />
          </div>
        ) : (
          devices.map((device) => {
            const mobile = isMobileUserAgent(device.deviceId || '');
            return (
              <div className="Devices__card" key={device._id}>
                <div
                  className={`Devices__icon${mobile ? ' Devices__icon--mobile' : ''}`}
                >
                  {mobile ? (
                    <SmartphoneIcon fontSize="inherit" />
                  ) : (
                    <LaptopIcon fontSize="inherit" />
                  )}
                </div>
                <div className="Devices__info">
                  <div className="Devices__primary">
                    {parseUserAgent(device.deviceId || '')}
                  </div>
                  <div className="Devices__secondary">
                    {moment(device.lastLogind).format('DD/MM/YYYY / HH:mm')}
                  </div>
                </div>
                <button
                  className="Devices__delete-btn"
                  onClick={() => handleDelete(device._id)}
                  aria-label="Eliminar dispositivo"
                >
                  <DeleteIcon fontSize="inherit" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </FullScreenDialog>
  );
};

export default Devices;
