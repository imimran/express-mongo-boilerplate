import ejs from "ejs";
import Notification from "../models/Notification.js";
import logger from "../libs/logger.js";
import { sendEmail } from "../libs/sendEmail.js";
import { emailTemplate } from "../templates/emailTemplate.js";

const multiDocSender = async (notificationDocs, count, max) => {
  if (!max) {
    max = process.env.PER_CRON_JOB_SEND_NOTIFICATION;
  }
  for (let i = 0; i < notificationDocs.length; i++) {
    if (count >= max) {
      break;
    }

    try {
      const { recipient, subject, content } = notificationDocs[i];

      await sendEmail(recipient, subject, content);
      notificationDocs[i].status = "Success";
      notificationDocs[i].notes.push({
        status: notificationDocs[i].status,
        process_time: new Date(),
        message: "Successfully Sent!",
      });

      notificationDocs[i].process_date = Date.now();
      count++;
    } catch (err) {
      logger.error("Error in multiDocSender --> ", err);
      notificationDocs[i].status = "Failed";
      if (notificationDocs[i].notes.length < 5) {
        notificationDocs[i].notes.push({
          status: notificationDocs[i].status,
          process_time: new Date(),
          message: err.message,
        });
      } else {
        notificationDocs[i].notes.shift();
        notificationDocs[i].notes.push({
          status: notificationDocs[i].status,
          process_time: new Date(),
          message: err.message,
        });
      }
    }
    try {
      await notificationDocs[i].save();
      logger.info("Notification updated!");
    } catch (e) {
      logger.error("Notification update failed --> ", e);
    }
  }
  return count;
};

export const createBulkEmailNotification = async (notificationObjectArray) => {
  // create content
  const modNotificationObjectArray = [];
  for (const {
    user_id,
    recipient,
    subject,
    body,
    data,
    schedule,
  } of notificationObjectArray) {
    const content = await ejs.render(emailTemplate(body, subject), data);
    const notification = {
      user_id,
      recipient,
      subject,
      content,
      type: "email",
      schedule,
    };
    modNotificationObjectArray.push(notification);
  }

  return Notification.insertMany(modNotificationObjectArray);
};

export const sendEmailNotification = async () => {
  try {
    let count = 0;

    const failedDocsExists = await Notification.exists({
      status: "Failed",
    });
    if (failedDocsExists) {
      const failedDocs = await Notification.find({
        status: "Failed",
      });
      count = await multiDocSender(failedDocs, count);
      logger.info(`Number of Failed Notification Sent: ${count}`);
    }

    if (count < process.env.PER_CRON_JOB_SEND_NOTIFICATION) {
      const pendingDocsExists = await Notification.exists({
        status: "Pending",
      });
      if (pendingDocsExists) {
        const pendingEmergDocs = await Notification.find({
          status: "Pending",
          schedule: "emergency",
        });
        if (pendingEmergDocs.length > 0) {
          count = await multiDocSender(pendingEmergDocs, count);
          logger.info(
            `Number of Pending Emergency Notification Sent: ${count}`,
          );
        }
        if (count < process.env.PER_CRON_JOB_SEND_NOTIFICATION) {
          const pendingRegDocs = await Notification.find({
            status: "Pending",
            schedule: "regular",
          });
          if (pendingRegDocs.length > 0) {
            count = await multiDocSender(pendingRegDocs, count);
            logger.info(
              `Number of Pending Regular Notification Sent: ${count}`,
            );
          }
          if (count < process.env.PER_CRON_JOB_SEND_NOTIFICATION) {
            const pendingSchDocs = await Notification.find({
              status: "Pending",
              schedule: "scheduled",
            });
            if (pendingSchDocs.length > 0) {
              count = await multiDocSender(pendingSchDocs, count);
              logger.info(
                `Number of Pending Scheduled Notification Sent: ${count}`,
              );
            }
          }
        }
      }
    }
    logger.info(`Total ${count} Email Sent!`);
    return;
  } catch (err) {
    logger.error("Error from sendEmailNotification method -> ", err);
  }
};

export const sendEmergencyEmailNotification = async () => {
  try {
    let count = 0;

    const pendingEmergDocsExists = await Notification.exists({
      status: "Pending",
      schedule: "emergency",
    });
    if (pendingEmergDocsExists) {
      const pendingEmergDocs = await Notification.find({
        status: "Pending",
        schedule: "emergency",
      });
      count = await multiDocSender(
        pendingEmergDocs,
        count,
        process.env.PER_CRON_JOB_SEND_EMERGENCY_NOTIFICATION,
      );
      logger.info(
        `Number of Total Pending Emergency Notification Sent: ${count}`,
      );
    }
    logger.info(`Total ${count} Emergency Email Sent!`);
    return;
  } catch (err) {
    logger.error("Error from sendEmergencyEmailNotification method -> ", err);
  }
};
