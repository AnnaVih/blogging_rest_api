module.exports = {
    getDBConnection() {
      return `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@ds213645.mlab.com:13645/${process.env.MONGODB_DEFAULT_DATABASE}`;
    }
  }
  