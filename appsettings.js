const dbsettings = {
  cashier:{
    user: "postgres",
    host: "localhost",
    database: "hotelstellar",
    password: "testhotel1",
    port:5432,
    /*
      if it's heroku, replacce those with this:
      connectionString : "postgresql://dbuser: ...."
    */
    poolSize:10, /* max number of clients */
    idleTimeoutMillis:30000
  },
  home:{
    user:"postgres",
    host:"localhost",
    database:"hotelstellar",
    password:"devtest1",
    port:5432
  },
  heroku:"postgresql://secret url"
}

module.exports = dbsettings;