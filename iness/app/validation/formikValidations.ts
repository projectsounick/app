import * as Yup from "yup";
export const validationSchemaForLogin = Yup.object().shape({
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Must be exactly 10 digits"),
});
