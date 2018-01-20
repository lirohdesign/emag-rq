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
    crypt_key: ""
    }
};
module.exports = config;

//https://stackoverflow.com/questions/22348705/best-way-to-store-db-config-in-node-js-express-app
