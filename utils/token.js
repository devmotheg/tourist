/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const crypto = require("crypto");

// Executed in the threadpool by utilizing multiple CPU cores!
exports.random = () =>
  crypto.randomBytes(process.env.TOKEN_BYTES - "0").toString("hex");

exports.hash = token => crypto.createHash("sha256").update(token).digest("hex");
