import { sendEmailNotification } from "./EmailNotification.js";

// const dayBeforeNotification = new Date();
// dayBeforeNotification.setDate(
//   dayBeforeNotification.getDate() - REMOVE_NOTIFICATION_TO,
// );

export default [
  {
    name: "sendEmailFromNotification",
    fn: async (job) => {
      await sendEmailNotification();
    },
    interval: "one minute",
  },
];
