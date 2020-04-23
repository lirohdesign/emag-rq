var config = {
development: {
    url: 'http://localhost:8080/',
    database: {
        host:   'ds263448.mlab.com',
        port:   '63448',
        db:     'heroku_5wv92jfn',
        user:   'fAnW6nQ+W9SEDF_L',
        password: 'xC=uB!#RJ^jbt9^g',
        mongodb_connection: "mongodb://fAnW6nQ+W9SEDF_L:xC=uB!#RJ^jbt9^g@ds263448.mlab.com:63448/heroku_5wv92jfn"
    },
    crypt_key: "As2RXGjXDL-3CMzVtj8L#Q^nJm5FFvhth4AzpHXmmAm4BeHFTvXCw!u+xA?%R_gBnkDNHXvfL#Ju*c*mjv25Gu@gqECeKX@VC&Mdzs^g^9guT8AP6F#yUDTNb4dBZ8UW",
    cognito_connection: "mongodb://integromatconnection:Th3M0nst3r@ds263448.mlab.com:63448/heroku_5wv92jfn",
},
production: {
    url: 'http://emag-rq.herokuapp.com/',
    database: {
        host: '',
        port: '',
        mongodb_connection: "mongodb://%SvWA2Qvt7#k%KZ^:PSJ@2MVW3wR3v8%B@ds263448.mlab.com:63448/heroku_5wv92jfn"
    },
    crypt_key: "r#KF4*f+TwkHYkL_JcPyeP?wVQ_#B^MBCVSKrk3&yfsx2fJEf5%HkP2Gh87feKnyH2Q-6URW7Y7&Fm@Bb$Tmws&EjXtGNPy6kdaTHjkQDpLrNLxknrvjKjPQk$drQSY&",
    cognito_connection: "mongodb://integromatconnection:Th3M0nst3r@ds263448.mlab.com:63448/heroku_5wv92jfn",
  }
};
module.exports = config;

//https://stackoverflow.com/questions/22348705/best-way-to-store-db-config-in-node-js-express-app