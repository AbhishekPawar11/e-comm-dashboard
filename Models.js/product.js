const mongoose = require('mongoose');
 
const productschema = new mongoose.Schema({
    name:{
        type:String
    },
    price:{
        type:String
    },
    category:{
        type:String
    },
    userId:{
        type:String
    },
    company:{
        type:String
    }

    
});

const product = mongoose.model('products' , productschema);

module.exports = product;