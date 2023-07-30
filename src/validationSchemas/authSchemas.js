import yup from "yup";

const minErr = (n) => `Must be minimum ${n} character long`;
const strTypeErr = "Must be a string";

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const registerPasswordValidation = yup
  .string()
  .typeError(strTypeErr)
  .min(6, minErr(6))
  .max(255)
  .required();

export const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr(3))
    .max(255)
    .required(),
  email: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr(3))
    .max(255)
    .email("Invalid email address")
    .required(),
  password: registerPasswordValidation,
  phone: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .min(11, "Phone must be at least 11 characters")
    .max(11, "Phone must be at 11 characters")
    .typeError(strTypeErr),
});

export const changePasswordSchema = yup.object().shape({
  newPassword: registerPasswordValidation,
});

export const reverifySchema = yup.object().shape({
  email: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr(3))
    .max(255)
    .email("Invalid email address")
    .required(),
});
