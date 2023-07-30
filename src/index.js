import mongoose from "mongoose";
import logger from "./libs/logger.js";
import "dotenv/config.js";

// mongoose.set("debug", true);
mongoose.set("debug", (coll, method, query, doc, options) => {
  const queryStr = JSON.stringify(query);
  let docStr = JSON.stringify({ session: true });
  if (!doc.session) {
    docStr = JSON.stringify(doc);
  }
  const optionsStr = JSON.stringify(options || {});

  logger.debug(`${coll}.${method}(${queryStr}, ${optionsStr}, ${docStr});`);
});

import server from "./app.js";

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("MongoDB Connected!");
    import("./libs/agenda.js");

    if (process.env.SEED_DB === "true") {
      import("./seeds/index.js");
    }
    return server.listen({ port });
  })
  .then(() => console.log(`Server Started at http://localhost:${port}`))
  .catch((err) => {
    logger.error(err);
    return process.exit(1);
  });
