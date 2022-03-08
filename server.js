/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const dotenv = require("dotenv"),
	mongoose = require("mongoose");

const logAndExit = (msg, err, server) => {
	console.log(`${msg} Shutting down...`);
	if (err) console.error(err);
	if (server) server.close(() => process.exit(1));
	else process.exit(1);
};

dotenv.config({ path: "./.env" });

// Listens to the event before any other top-level code runs
process.on("uncaughtException", err => {
	logAndExit("UNCAUGHT SYNCHRONUS EXCEPTION!", err);
});

const app = require("./app");

const DB = process.env.DATABASE.replace(
	/<PASSWORD>/,
	process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
	console.log("DB connection established!");
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}...`);
});

// Runs before the event loop even begins
process.on("unhandledRejection", err => {
	logAndExit("UNHANDLED ASYNCHRONUS REJECTION!", err, server);
});

// Heroku specific signal indicating a restart of the dyno to keep our app in a healthy state
process.on("SIGTERM", () => {
	logAndExit("SIGTERM RECEIVED!", null, server);
});
