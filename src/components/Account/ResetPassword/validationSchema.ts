import * as yup from 'yup';

export interface ResetPasswordFormData {
  email: string;
}

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Required'),
});

export default validationSchema;
