import Agenda from "agenda";

import logger from "./logger.js";
import C from "../constants.js";

import agendaFns from "../utils/agendaFns.js";

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB,
    collection: "agendaJobs",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  processEvery: C.agendaTimer || "5 seconds",
});

agenda.on("fail", (err, job) =>
  logger.error("Job failed with error --> ", err),
);

for (let i = 0; i < agendaFns.length; i++) {
  const { name, fn } = agendaFns[i];

  agenda.define(name, async (job, done) => {
    logger.warn(`Running '${name}' process...`);
    try {
      await fn(job);
      return done();
    } catch (error) {
      logger.error(`Job running exception from --> ${name}!`, error);
      return done(error);
    }
  });
}

/**
 * Starting agenda
 */
agenda.on("ready", () => {
  if (process.env.NODE_ENV === "development") return;

  for (let i = 0; i < agendaFns.length; i++) {
    const { name, interval } = agendaFns[i];
    agenda.every(interval, name);
  }
  agenda.start();
  logger.info("Agenda started!");
});

export default agenda;
