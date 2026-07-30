import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import { IntlShape, FormattedMessage } from 'react-intl';

import messages from './CommunicatorDialog.messages';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';

interface CommunicatorDialogButtonsProps {
  onSearch: (searchValue: string) => void;
  onCreateCommunicator?: () => void;
  intl?: IntlShape;
  dark?: boolean;
  searchValue?: string;
  isSearchOpen?: boolean;
  openSearchBar?: () => void;
}

const CommunicatorDialogButtons: React.FC<CommunicatorDialogButtonsProps> = ({
  intl,
  searchValue = '',
  isSearchOpen = false,
  openSearchBar,
  onCreateCommunicator,
  dark = false,
  onSearch,
}) => {
  const [menu, setMenu] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const searchInput = document.getElementById(
        'communicator-dialog-buttons-search',
      );
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isSearchOpen]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    onSearch(searchValue);
  };

  return (
    <div
      className={classNames(
        'CommunicatorDialogButtons__container',
        dark ? 'is-dark' : '',
      )}
    >
      {isSearchOpen && (
        <div className="CommunicatorDialogButtons__searchInput">
          <TextField
            id="communicator-dialog-buttons-search"
            value={searchValue}
            onChange={handleSearch}
            margin="dense"
            variant="outlined"
          />
        </div>
      )}
      {!isSearchOpen && (
        <div className="CommunicatorDialogButtons__searchButton">
          <IconButton
            label={intl ? intl.formatMessage(messages.search) : 'Search'}
            onClick={openSearchBar}
            size="large"
          >
            <SearchIcon />
          </IconButton>
        </div>
      )}
      {onCreateCommunicator && (
        <div className="CommunicatorDialogButtons__createButton">
          <IconButton
            label="Create Communicator"
            onClick={onCreateCommunicator}
            size="large"
          >
            <AddIcon />
          </IconButton>
        </div>
      )}
      <div className="CommunicatorDialogButtons__menu">
        <IconButton
          label={intl ? intl.formatMessage(messages.menu) : 'Menu'}
          onClick={(event) => setMenu(event.currentTarget)}
          size="large"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="communicator-dialog-buttons-menu"
          anchorEl={menu}
          open={Boolean(menu)}
          onClose={() => setMenu(null)}
        >
          <MenuItem>
            <a
              href="https://www.komuni.care/terms-of-use/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage {...messages.termsOfService} />
            </a>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default CommunicatorDialogButtons;
