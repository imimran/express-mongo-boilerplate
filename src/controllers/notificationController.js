import Notification from "../models/Notification.js";
import { paginatedResult } from "../utils/pagination.js";

// response msg
const notificationNotFoundMsg = "Notification Not Found!";

// helper function

// routes
export const getAll = async (req, res, next) => {
  const { page, limit, sort, searchTerm } = req.body;
  Object.keys(sort).forEach((el) => {
    // eslint-disable-next-line radix
    sort[el] = parseInt(sort[el]);
  });

  try {
    const conditions = {};
    if (searchTerm) {
      conditions.$or = [
        {
          status: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          recipient: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          schedule: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }

    const [result] = await paginatedResult({
      model: Notification,
      filter: conditions,
      selectField: {
        content: 0,
      },
      populate: [
        {
          foreignModel: "users",
          foreignModelField: "_id",
          keyToPopulate: "user_id",
          selectField: {
            fullName: 1,
            email: 1,
            mobile: 1,
          },
          renameKey: "userInfo",
          single: true,
        },
      ],
      page,
      limit,
      sort,
    });

    if (result.error) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: result.error,
          data: [],
        },
      });
    }

    return res.locals.send("All Notification Info!", result);
  } catch (err) {
    return next(err);
  }
};

export const get = async (req, res, next) => {
  const { notificationId } = req.query;

  try {
    const notification = await Notification.findById(notificationId).populate(
      "user_id",
      "fullName email mobile",
    );

    if (!notification) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: notificationNotFoundMsg,
          data: [],
        },
      });
    }
    return res.locals.send("Notification Found!", notification);
  } catch (err) {
    return next(err);
  }
};
