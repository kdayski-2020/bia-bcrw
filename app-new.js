const express = require("express")
let app = express()

app = require('./lib/swagger-bia')(app, {type:'json'});

app.get('/bc', (req,res)=>{
    let bc = [{id:1, name:'Main Blockchain', address:'188.22.22.33'},{id:2, name:'Secondary BC 2', address:'141.32.0.1'}]
    res.json(bc);
})

app.post('/bc', (req, res) => {
    res.json({'success':true,'error':false});
})

app.listen(5000, () => {
    console.log("Server started")
})