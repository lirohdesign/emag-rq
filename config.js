var config = {
development: {
    //url to be used in link generation
    url: 'http://localhost:8080/',
    //redis connection settings
    database: {
        host:   '',
        port:   '',
        db:     ''
    },
    //crypt key
    crypt_key: "w$^DhPeB$Hu&*t3xT87KdBjVaNzKE%NGYw7sPxRdWFp4"
},
production: {
    //url to be used in link generation
    url: 'http://emag-rq.herokuapp.com/',
    //redis connection settings
    database: {
        host: '',
        port: '',
        db:     ''
    },
    //crypt key
    crypt_key: "w$^DhPeB$Hu&*t3xT87KdBjVaNzKE%NGYw7sPxRdWFp4"
  },
cognito_schema: {
  _id: String,
  Form: {
    Id: String,
    InternalName: String,
    Name: String
  },
  $version: Number,
  $etag: String,
  Gamename: String,
  Startlocation: String,
  DescriptionForStart: String,
  Gamelogic: String,
  Email: String,
  Id: String,
  Entry: {
    AdminLink: String,
    CustomerCard: String,
    DateCreated: Date,
    DateSubmitted: Date,
    DateUpdated: Date,
    EditLink: String,
    LastPageViewed: String,
    Number: Number,
    Order: String,
    Origin: {
      City: String,
      CountryCode: String,
      IpAddress: String,
      IsImported: String,
      Region: String,
      Timezone: String,
      UserAgent: String
      },
    PaymentToken: String,
    Status: String,
    Timestamp: Date,
    Version: Number,
    ViewLink: String
    },
  GameData: [
    {
      Id: String,
      CodeLocation: String,
      CluesToFindThisItem: [
        {
          Id: String,
          Description: String,
          ItemNumber: Number
        }
      ],
      Timeallocated: Number,
      Photolink: String,
      ItemNumber: Number
    }
  ]
}
};
module.exports = config;



//https://stackoverflow.com/questions/22348705/best-way-to-store-db-config-in-node-js-express-app
