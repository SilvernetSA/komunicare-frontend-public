import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import React from 'react';

import './FilterBar.css';

interface FilterOption {
  id: string;
  text: string;
  enabled: boolean;
}

interface FilterBarProps {
  onChange: (option: FilterOption) => void;
  options: FilterOption[];
}

function FilterBar({ onChange, options }: FilterBarProps) {
  return (
    <div className="FilterBar">
      <FormGroup className="FilterBar__FormGroup" row>
        {options.map((opt) => {
          return (
            <FormControlLabel
              control={
                <Switch
                  checked={opt.enabled}
                  onChange={() => {
                    onChange(opt);
                  }}
                  key={opt.id}
                  value={opt.id}
                  color="secondary"
                />
              }
              key={opt.id}
              label={opt.text}
              labelPlacement="bottom"
            />
          );
        })}
      </FormGroup>
    </div>
  );
}

export default FilterBar;
