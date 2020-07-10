'use strict'
var User = require('../models/user');
var  bcrypt = require ('bcrypt-nodejs');
var jwt = require('../services/jwt');

const { text } = require('body-parser');
var auth = require('../middlewares/authenticated');

function commands(req,res){
    let params = req.body; //En la variable almacenamos lo que recibamos del body.
    let arrUserData = Object.values(params); //Convertimos el objeto a arrgelo y almacenamos en variable.
    arrUserData = arrUserData.toString().toLowerCase();
    let user = new User();
    let reply = arrUserData.split(" "); //Casteamos el arreglo y lo dividimos.
    
    
 
   
  

    switch(reply[0]){
        case 'register':

            if (params.command == reply[1] != null && reply[2] != null && reply[3] != null && reply[4] != null) {
                User.findOne({ $or: [{ username: reply[2] }, { email: reply[3] }] }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor.' });
                    } else if (userFind) {
                        res.send({ message: 'tweet o correo ya utilizado.' });
                    } else {
                        user.name = reply[1];
                        user.username = reply[2];
                        user.email = reply[3];
                        user.password = reply[4];
    
                        bcrypt.hash(reply[4], null, null, (err, hashPass) => {
                            if (err) {
                                res.status(500).send({ message: 'Error de encriptación' });
                            } else {
                                user.password = hashPass;
    
                                user.save((err, userSaved) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Error en el servidor.' });
                                    } else if (userSaved) {
                                        res.send({ user: userSaved })
                                    } else {
                                        res.status(404).send({ message: 'Erro al guardar el tweet.' });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({ message: 'Ingresa todos los datos' })
            }

        break;

        case 'login':
            if(params.command == reply[1] != null && reply[2] != null){
                User.findOne({ $or: [{ username: reply[1] }]}, (err, userFind)=>{
                    if(err){
                        res.status(500).send({message:'Error general'});
                    }else if(userFind){
                        bcrypt.compare(reply[2], userFind.password,(err ,checkPass)=>{
                            if(err){
                                res.status(500).send({message: 'Error en incriptar tu contraseña'});
                            }else if(checkPass){
                                if( reply[3]== 'true'){
                                    res.send({ token: jwt.createToken(userFind)});
                                }else{
                                    res.send({user: userFind});
                                }
                            }else {
                                res.send({message: 'Tu contraseña es incorrecta'});
                            }
                        });
                    }else{
                        res.send({message:'tweet no encontrado'});
                    }
                });
            }else{
                res.send({message: 'Ingresa tu usaurio y coontraseña correctamente'});
            }
    

        break;

        case 'add_tweet':
            var idUser =  req.user.sub;
            var commands  = req.body.commands;
            params = commands.split(" ");
            if(params[1]){
                params.shift();
        
                    var tweetdes = params.join(" ").toString();
        
                    User.findByIdAndUpdate(idUser, { $push: { tweets: { description: tweetdes} } }, {new: true},(err, tweetFind)=>{
                        if(err){
                           res.status(500).send({ message: 'Error en tu en servidor' });
                         }else if(tweetFind){
                            User.findByIdAndUpdate(idUser,{$inc:{numberTweets: 1}},{new:true},(err,numberTweets)=>{
                                if(err){
                                    res.status(500).send({message:'Error en el servidor'});
                                }else if(numberTweets){
                                    res.status(200).send({message: numberTweets});
    
                                }else{
                                    res.status(404).send({message:'No se ha podido settiar correctamente'});
                                }
                            });
                         }else{
                            res.status(200).send({ tweetFind })
                         }
                    });
        
                }else{
                    res.status(200).send({message: 'Rellene todos los datos necesarios'})
                }
            
        
        

        break;

        case 'edit_tweet':
            var idUser =  req.user.sub;
            var commands  = req.body.commands;
             params = commands.split(" ");
                params.shift();
                var idTweet = params[0]
                params.shift();
                var tweetdes = params.join(" ").toString();
        User.findOneAndUpdate({ _id: idUser, "tweets._id": idTweet }, { "tweets.$.description": tweetdes}, { new: true }, (err, tweetEdit)=>{
                if(err){
                    res.status(500).send({ message: 'Error en tu servidor' });
                }else if(!tweetEdit){
                     res.status(404).send({message: 'No tienes derecho de editar ya que no eres el autor'});
                }else{
                    res.status(200).send({ tweet: tweetEdit });
                }
            });
        
        

        break;

        case 'delete_tweet':
            var idUser =  req.user.sub;
            var commands  = req.body.commands;
            params = commands.split(" ");
        
            User.findOneAndUpdate({"_id": idUser},{$pull: { tweets: {_id: params[1]} }},{new: true},(err, tweetEliminada)=>{
                    if(err){
                    return res.status(500).send({ message: 'Error en la peticion'});
        
                    }else if(tweetEliminada){
                        User.findByIdAndUpdate(idUser,{$inc:{numberTweets: -1}},{new:true},(err,numberTweets)=>{
                            if(err){
                                res.status(500).send({message:'Error en el servidor'});
                            }else if(numberTweets){
                                res.status(200).send({message: numberTweets});

                            }else{
                                res.status(404).send({message:'No se ha podido settiar correctamente'});
                            }
                        });
                  
                    }else{
                        res.status(404).send({message:'Has eliminado el tweet'});
                    }
                });
      
        
        

        break;

        case 'view_tweet':
            var commands  = req.body.commands;
             params = commands.split(" ");
        
        
            User.findOne({username:{$regex: params[1]}},(err, tweets)=>{
                if(err){
                    res.status(500).send({ message: 'Error en la peticion'});
                }else if(!tweets){
                res.status(404).send({ message: 'No se a podido mostrar los tweets'});
        
                 }else{
                    res.status(200).send(tweets.tweets)

                 } 
            })
        
        

        break;

        

        case 'follow':
            if(reply [1] != null){
                if(reply[1]=== req.user.username){
                    res.status(403).send({message:'No te puedes seguir a ti mismo'});
                }
                User.findOne({username: {$regex: reply[1], $options: 'i'}},(err, userFind)=>{
                    if(err){
                        res.status(500).send({message:'Error en tu servidor'});
                        
                    }else if(userFind != null && userFind.followers.length >= 1){
                        for(var i=0; i< userFind.followers.length; i++){
                            let persona  = userFind.followers[i];
                            if(persona == auth.idUser){
                                res.status(404).send({message:'Ya sigues el usario'});
                            }
                        }
                    }else if(userFind == null){
                        res.status(404).send({message:'No se ha encontrado el tweet'});
                    }else{
                        User.findOneAndUpdate({username: reply[1]},{$push:{followers:auth.idUser}},{new:true},(err,userFind)=>{
                            
                            if(err){
                                res.status(500).send({message:'Error en tu servidor'});
                            }else if(userFind){
                              
                                User.findOneAndUpdate({username: reply[1]},{$inc:{numberFollow: 1}},{new:true},(err,numberFollow)=>{
                                    
                                    if(err){
                                        res.send(500).send({message:'Error en el sevidor'});
    
                                    }else if(numberFollow){
                                        User.findByIdAndUpdate(auth.idUser,{$push:{following: reply[1]}},{new:true},(err,followe)=>{
                                            
                                            if(err){
                                                res.status(500).send({message:'Error en el servidor'});
                                            }else if(followe){
                                             User.findByIdAndUpdate(auth.idUser,{$inc:{numberFollowing: 1}},{new: true},(err,numberFollowing)=>{
                                                 if(err){
                                                     res.send(500).send({message:'Error en tu servidor'});
                                                 }else if(numberFollowing){
                                                     res.send({message:' Has segido a '+ reply[1]});
    
                                                 }else{
                                                     res.send(404).send({message:'Error no se ha podido mostar los que sigues'});
                                                 }
                                             })
            
                                            }else{
                                                res.status(404).send({message:'No se ha podido seguir'})
                                            }
                                        });
    
                                    }else{
                                        res.status(404).send({message:'No se ha podido agregar tu follow'});
                                    }
    
                                });
                            }else{
                                res.status(404).send({message:'Error no has podido seguir a ' + reply[1]});
                            }
                        })
                    }
    
                });
    
            }else{
                res.send({message:'Ingrese a la persona que quiere seguir'});
            }
    

        break;

        case 'unfollow':
            if(reply [1] != null){
                User.findOne({username: {$regex: reply[1], $options: 'i'}},(err, userFind)=>{
                    if(err){
                        res.status(500).send({message:'Error en tu servidor'});
                        
                    }else if(userFind != null && userFind.followers.length >= 1){
                        for(var i=0; i< userFind.followers.length; i++){
                            let persona  = userFind.followers[i];
                            if(persona == auth.idUser){
                               User.findOneAndUpdate({username:reply[1]},{$pull:{followers: auth.idUser}},{new:true},(err,userRemo)=>{
                                   if(err){
                                       res.status(500).send({message:'Error en el servidor'});
                                   }else if(userRemo){
                                       User.findOneAndUpdate({username: reply[1]},{$inc:{numberFollow: -1}},{new:true},(err,numberFollow)=>{
                                           if(err){
    
                                           }else if(numberFollow){
                                               User.findByIdAndUpdate(auth.idUser,{$inc: {numberFollowing: -1}},(err,numberFollowing)=>{
                                                   if(err){
                                                       res.status(500).send({message:'Error en el servidor'});
    
                                                   }else if(numberFollowing){
                                                        User.findByIdAndUpdate(auth.idUser,{$pull:{following: reply[1]}},{new:true},(err,followe)=>{
                                                            if(err){
                                                                res.status(500).send({message:'Error en tu servidor'});
    
                                                            }else if(followe){
                                                                res.send({message:'Has dejado de seguir a ' + reply[1]});
    
                                                            }else{
                                                                res.status(404).send({message:'error'});
                                                            }
                                                        })
    
                                                   }else{
                                                       res.status(404).send({message:'error'});
                                                   }
                                               })
    
                                           }else{
                                               res.status(404).send({message:'Error'});
                                           }
                                       })
    
                                   }else{
                                       res.status(404).send({message:'Erro'});
                                   }
                               });
                            }
                        }
                    }else if(userFind == null){
                        res.status(404).send({message:'No se ha encontrado el tweet'});
                    }else{
                        res.status(404).send({message:'No seguis a este tweet ' + reply[1]});
                    }
    
                });
    
            }else{
                res.send({message:'Ingrese a la persona que quiere seguir'});
            }
    

        break;

        case 'profile':
            if(reply[1] != null){
                User.findOne({username: {$regex: reply[1],$options: 'i'}},(err,profileView)=>{
                    if(err){
                        res.status(500).send({message:'Error en tu servidor '});
                    }else if(profileView){
                        User.find({username: reply[1]},{numberTweets:1,name: 1, email:1,numberFollow:1,numberFollowing:1},(err,profileView)=>{
                            if(err){
                                res.status(500).send({message:' Error en tu servidor '});
                            }else{
                                User.populate(profileView,{path: "user"},(err,profileView)=>{
                                    if(err){
                                        res.status(500).send({message:'error en tu servidor'});
                                    }else if(profileView){
                                        res.send({user: reply[1], profileView}); //muestra usaruo de queines
    
                                    }else{
                                        res.status(404).send({message:'No se ha podido ver tu perfil'});
                                    }
                                });
    
                            }
                        }); //sno nos muestra el id del tweet tampaco  la demas info
    
                    }else{
                        res.status(404).send({message:'No se ha encontrado el usario'});
                    }
                });
    
    
    
                
            }else{
                res.status(404).send({message: ' No has ingresado el usario'});
            }
        
        

        break;

    
        default: res.status(404).send({message:'Ingresa una ruata valida'});

        break;


        }



}

module.exports={
    commands
}