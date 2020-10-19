const fs = require("fs").promises;

module.exports = async (sourse, destination) => {
  try {
    await fs.rename(sourse, destination);
  } catch (error) {
    console.warn(error);
    await fs.copyFile(sourse, destination);
    await fs.unlink(sourse);
  }
};
