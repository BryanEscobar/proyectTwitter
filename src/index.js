'use strict'

const mongosedb = require("mongoose")
const app = require("./app")

mongosedb.Promise = global.Promise;
mongosedb.connect('mongodb://localhost:27017/twitter',{userNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false}).then(()=>{
    console.log('Usted se encuentra conectado a la base de Datos')

    app.set('port',process.env.PORT || 3000)
    app.listen(app.get('port'),()=>{
        console.log(`El Servidor esta corriendo por el puerto: ${app.get('port')}`);

    })
}).catch(err => console.log(err))