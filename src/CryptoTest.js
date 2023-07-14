var crypto = require('crypto'); 
let salt = crypto.randomBytes(16).toString('hex'); 
  
// Hashing user's salt and password with 1000 iterations, 
 
let hash = crypto.pbkdf2Sync("test@123", salt,  
1000, 64, `sha512`).toString(`hex`); 

console.log("SALT IS -> ",salt);
console.log("Hash IS -> ",hash);