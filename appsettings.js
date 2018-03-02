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
  heroku:{
    user:'phjtaeqyzfyreu',
    host:'ec2-54-243-31-34.compute-1.amazonaws.com',
    database:'d5s7v03mrmqg68',
    password:'986e99a460d7c90428c83e56f22805e3ca14b15b7c8064d3eecf714693f618ae',
    port:5432,
    ssl:true
  },
  server:{
    user:'stellardev',
    host:'hotelstellar',
    password:'devhoteldb90',
    database:'hotelstellardb',
    port:5432,
    ssl:true
  }
}

module.exports = dbsettings;