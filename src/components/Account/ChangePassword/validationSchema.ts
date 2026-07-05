import * as yup from 'yup';

interface FormValues {
  password: string;
  passwordRepeat: string;
}

const validationSchema: yup.SchemaOf<FormValues> = yup.object({
  password: yup
    .string()
    .min(6, 'Password has to be longer than 6 characters!')
    .required('New Password is required!'),
  passwordRepeat: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Password repeat is required!'),
});

export default validationSchema;
