import yup from "yup";

const minErr = "Must be minimum 3 character long"; // ${path}
const strTypeErr = "Must be a string";

export const createSchema = yup.object().shape({
  name: yup.string().typeError(strTypeErr).min(3, minErr).max(255).required(),
  subject: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr)
    .max(255)
    .required(),
  content: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr)
    .max(5000)
    .required(),
  variables: yup
    .array()
    .typeError("Must be an array")
    .of(yup.string().typeError(strTypeErr).required()),
  status: yup.boolean(),
});

export const updateSchema = yup.object().shape({
  name: yup.string().typeError(strTypeErr).min(3, minErr).max(255),
  subject: yup.string().typeError(strTypeErr).min(3, minErr).max(255),
  content: yup.string().typeError(strTypeErr).min(3, minErr).max(5000),
  variables: yup
    .array()
    .typeError("Must be an array")
    .of(yup.string().typeError(strTypeErr)),
  status: yup.boolean(),
});
