import yup from "yup";

const minErr = (n) => `Must be minimum ${n} character long`;
const strTypeErr = "Must be a string";

export const updateSchema = yup.object().shape({
  firstName: yup
    .string()
    .typeError(strTypeErr)
    .required("FirstName is required"),
  lastName: yup.string().typeError(strTypeErr),
  image: yup.string().typeError(strTypeErr).url(),
  gender: yup
    .string()
    .typeError(strTypeErr)
    .oneOf(["", "Male", "Female", "Other"]),
  dob: yup
    .string()
    .typeError(strTypeErr)
    .test("futureDate", "Cannot be future date", (val) => {
      if (val) {
        const currentTime = new Date();
        return new Date(val) < currentTime;
      }
      return true;
    }),
  occupation: yup.string().typeError(strTypeErr),
  organization: yup.string().typeError(strTypeErr),
  phone: yup.string().typeError(strTypeErr).required(),
});

export const updateByAdminSchema = yup.object().shape({
  user_id: yup.string().required("UserID is required."),
  fullName: yup.string().typeError(strTypeErr),
  firstName: yup.string().typeError(strTypeErr),
  lastName: yup.string().typeError(strTypeErr),
  image: yup.string().typeError(strTypeErr).url(),
  gender: yup
    .string()
    .typeError(strTypeErr)
    .oneOf(["", "Male", "Female", "Other"]),
  dob: yup
    .string()
    .typeError(strTypeErr)
    .test("futureDate", "Cannot be future date", (val) => {
      if (val) {
        const currentTime = new Date();
        return new Date(val) < currentTime;
      }
      return true;
    }),
  occupation: yup.string().typeError(strTypeErr),
  organization: yup.string().typeError(strTypeErr),
});

export const createSchema = yup.object().shape({
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
  role: yup.string().typeError(strTypeErr).required("Role is required."),
  phone: yup.string().typeError(strTypeErr).required("Phone is required."),
});

export const activeUserSchema = yup.object().shape({
  user_id: yup.string().typeError(strTypeErr).required("User ID is required"),
  status: yup.string().typeError(strTypeErr).required(),
});
