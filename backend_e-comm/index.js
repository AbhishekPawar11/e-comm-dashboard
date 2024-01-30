const express = require('express');
const app = express();
const port = process.env.PORT ||  5000;
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Models.js/user');
const Product = require('./Models.js/product');
const jwt = require('jsonwebtoken');
const jwtKey = 'Abhi123';
const path = require('path');


 mongoose.connect('mongodb+srv://Abhishek_Pawar:Abhi1108@cluster0fb.ix831qr.mongodb.net/e-comm').then(()=>{
    console.log("database connected");
}).catch((err)=>{
    console.log(err);
})

 app.use(cors());
 app.use(express.json());

 function verifytoken(req,res,next){
        
    let token = req.headers['authorization'];
    if(token){
         jwt.verify(token, jwtKey, (err,valid)=>{
             if(err){
                  res.status(401).send({result:"Please provide valid Token"})
             }else{
                next();
             }
         })
    }else{
        res.send({result:"please add  token with header"})
    }
}

 app.post('/register' , async (req,res)=>{
    let udata = req.body;
    let user = new User(udata);
    let result = await user.save();
       result = result.toObject();
       delete result.password;
       jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
           if(err){
               res.send({"error":"something went wrong"});
           }
           res.send({result , auth : token});
       })
    
    
 })

 app.post("/login", async (req,res)=>{
     if(req.body.password && req.body.email){
     let user  = await User.findOne(req.body).select('-password');
     if(user){
         jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
            if(err){
               res.send({"error":"somethig went wrong"});
            }
            res.send({user , auth:token});

         })
     }else{
        res.send({"error":"user not found"});
     }
    }else{
        res.send({"error":"please enter valid credential"});
    }
 })

  app.post("/addproducts" ,verifytoken, async (req,res)=>{
      let product = new Product(req.body);
      let result = await product.save();
      res.send(result);
  }) 
   
  app.get("/products" ,verifytoken, async (req,res)=>{
       let products = await Product.find({});
       if(products.length>0){
        res.send(products);
       }else{
             res.send({result : "No Products Found"});
       }
  })
  
    
  app.delete("/product/:id" , async (req,res)=>{
       
       if(req.params.id){
           let result = await Product.deleteOne({_id:req.params.id});
           res.send(result);
       }else{
            res.send({"delete":"false"});
       }

  })
  app.get('/product/:id'  , async (req,res)=>{
       let result = await Product.findOne({_id:req.params.id});
       if(result){
          res.send(result);
       }else{
           res.send({result:"No product found"});
       }
  })

   app.put('/product/:id' , async (req,res)=>{
      let result = await Product.updateOne(
         {_id:req.params.id},
         {
            $set:req.body
         }
      )
    
       res.send(result);
   })

   app.get('/search/:key' , async (req,res)=>{
         let result = await Product.find({
            "$or" : [
                {name : {$regex : req.params.key}},
                {company : {$regex : req.params.key}},
                {category : {$regex : req.params.key}}
            ]
         });
         res.send(result);
   } )

app.use(express.static(path.join(__dirname,'../e-commerce-app/build')));
app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, '../e-commerce-app/buil/index.html'));
})
   
app.get('/', (req,res)=>{
    res.send("hello from backend")
})

app.listen(port, ()=>console.log(`Backend started on port ${port}`));

