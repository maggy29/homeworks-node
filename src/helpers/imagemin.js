const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const path = require("path");

module.exports = (filename) => {
  const requestFile = `tmp/${filename}`;
  const minImage = imagemin([requestFile], {
    destination: path.join(process.cwd(), "tmp", "minified"),
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });
  return minImage;
};
