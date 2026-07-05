import type { Board } from './board';
import type { Communicator } from './communicator';
import type { Location } from './location';
import type { Settings } from './settings';

export type UserLocation = Location & {
  ip?: string;
};

export interface UserData {
  id?: string;
  name?: string;
  email: string;
  role?: string;
  birthdate?: Date | string;
  provider?: string;
  locale?: string;
  password?: string;
  lastlogin?: Date | string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
  location?: UserLocation;
  isFirstLogin?: boolean;
  isByBackOffice?: boolean;
  communicators?: Communicator[];
  boards?: Board[];
  settings?: Settings;
  isAdmin?: boolean;
  authToken?: string;
}
