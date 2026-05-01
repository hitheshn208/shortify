const {customAlphabet} = require("nanoid");

exports.getOtp = customAlphabet("1234567890", 6);