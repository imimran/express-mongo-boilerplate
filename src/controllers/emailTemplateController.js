import EmailTemplate from "../models/EmailTemplate.js";
import slugify from "../utils/slugify.js";
import { paginatedResult } from "../utils/pagination.js";

const tempNotFound = "Email template not found";
const tempAlreadyExists = "A template with this name already exists";

export const get = async (req, res, next) => {
  const { id } = req.params;

  try {
    const emailTemplate = await EmailTemplate.findById(id);
    if (!emailTemplate) {
      // throw new NotFoundError(tempNotFound);
      return res.json({
        status: 200,
        data: {
          success: false,
          message: tempNotFound,
          data: [],
        },
      });
    }
    return res.locals.send("Email template found", emailTemplate);
  } catch (err) {
    return next(err);
  }
};

export const getAll = async (req, res, next) => {
  const { page, limit, sort, searchTerm } = req.body;

  try {
    const filter = {};
    if (searchTerm) {
      filter.$or = [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }
    const [data] = await paginatedResult({
      model: EmailTemplate,
      filter,
      page,
      limit,
      sort,
    });

    return res.locals.send("All email template", data);
  } catch (err) {
    return next(err);
  }
};

export const create = async (req, res, next) => {
  const { name, subject, content, variables, status } = req.body;

  try {
    // slugify the name
    const slugifyName = slugify(name, "_");
    // check already exists with this name
    const templateAlreadyExists = await EmailTemplate.exists({
      name: slugifyName,
    });
    if (templateAlreadyExists) {
      // throw new BadRequestError(tempAlreadyExists);
      return res.json({
        status: 200,
        data: {
          success: false,
          message: tempAlreadyExists,
          data: [],
        },
      });
    }
    const emailTemplate = await EmailTemplate.create({
      name: slugifyName,
      subject,
      content,
      variables,
      status,
      created_by: req.user._id,
      updated_by: req.user._id,
    });
    return res.locals.send(
      "Email template successfully created",
      emailTemplate,
    );
  } catch (err) {
    return next(err);
  }
};

export const update = async (req, res, next) => {
  const { id } = req.params;

  try {
    // find the template to update
    const emailTemplate = await EmailTemplate.findById(id);
    if (!emailTemplate) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: tempNotFound,
          data: [],
        },
      });
    }
    if (req.body.name) {
      // slugify the name
      req.body.name = slugify(req.body.name, "_");
      // check already exists with this name
      const templateAlreadyExists = await EmailTemplate.exists({
        _id: { $nin: [emailTemplate._id] },
        name: req.body.name,
      });
      if (templateAlreadyExists) {
        return res.json({
          status: 200,
          data: {
            success: false,
            message: tempAlreadyExists,
            data: [],
          },
        });
      }
    }

    emailTemplate.set(req.body);
    await emailTemplate.save();
    return res.locals.send(
      "Email template successfully updated",
      emailTemplate,
    );
  } catch (err) {
    return next(err);
  }
};

export const remove = async (req, res, next) => {
  const { id } = req.params;

  try {
    const emailTemplate = await EmailTemplate.findById(id);
    if (!emailTemplate) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: tempNotFound,
          data: [],
        },
      });
    }

    await EmailTemplate.deleteOne({ _id: id });
    return res.locals.send("Email template successfully removed");
  } catch (err) {
    return next(err);
  }
};
