require('dotenv').config({ debug: process.env.DEBUG })

const env = process.env.NODE_ENV;

const development = {
    url: 'http://localhost:',
    port: 8080,
    database: {
        mongo: process.env.DEV_DB,
        redis: process.env.REDIS_URL
    },
    crypt_key: process.env.DEV_CRYPT_KEY}
const production = {
    url: 'http://emag-rq.herokuapp.com/',
    port: process.env.PORT,
    database: {
        mongo:   process.env.PRO_DB,
        redis: process.env.REDIS_URL
    },
    crypt_key: process.env.PRO_CRYPT_KEY};

const config = {
    development,
    production
   };

module.exports = config[env];

//https://stackoverflow.com/questions/22348705/best-way-to-store-db-config-in-node-js-express-app
//https://gist.github.com/jeserodz/fef32a3052ca502b01a9
//https://codingsans.com/blog/node-config-best-practices
