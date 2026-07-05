import React from 'react';
import MUITextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

interface TextFieldProps {
  className?: string;
  error?: boolean | string | number;
  [key: string]: any;
}

const TextField = ({
  className = '',
  error = false,
  ...props
}: TextFieldProps) => (
  <FormControl className={className} error={!!error}>
    <MUITextField error={!!error} {...props} />
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

export default TextField;
