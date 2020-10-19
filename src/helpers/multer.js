const multer = require("multer");
const path = require("path");
const uuid = require("uuid").v4;

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "tmp"),
  filename: function (req, file, cb) {
    const name = uuid();
    const ext = path.parse(file.originalname).ext;
    cb(null, name + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
