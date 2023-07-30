/* eslint-disable no-unused-expressions */
import User from "../models/User.js";

(async () => {
  // find admin
  const foundAdmin = await User.findOne({ role: "admin" });

  // if not find any admin then create admin
  if (!foundAdmin) {
    User.create({
      firstName: "admin",
      fullName: "admin",
      email: "admin@wbd.com",
      password: "123456",
      role: "admin",
      verified: true,
      phone: "01710000000",
      image: "https://ui-avatars.com/api/?name=" + "admin" + "&size=128",
    });
  }
})();
