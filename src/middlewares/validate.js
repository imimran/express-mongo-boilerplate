import formatYupError from "../utils/formatYupError.js";

export default function validate(schema) {
  return async (req, res, next) => {
    const data = req.body;

    if (!schema) {
      return next(new Error("Please Provide Schema"));
    }

    try {
      await schema.validate(data, { abortEarly: false });
      return next();
    } catch (err) {
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "Validation error",
          error: formatYupError(err),
        },
      });
    }
  };
}
