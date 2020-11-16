const fs = require('fs')
const express = require('express')
const axios = require('axios')

const Web3 = require('web3')

const conf = require('./conf')

var app = new express();

app = require('./lib/swagger-bia')(app, {type:'json'});

app.use(express.json())

var web3 = new Web3(new Web3.providers.HttpProvider(conf.rpc));

async function unlock(){
    return await web3.eth.personal.unlockAccount(conf.acc_adr, conf.acc_pass, 10000)
}

async function send(method) {
    unlock()

    var ret = await method.send({ from: conf.acc_adr })
    console.log(ret)
    return ret
}

async function call(method) {
    unlock()

    var ret = await method.call({ from: conf.acc_adr })
    console.log(ret)
    return ret
}

app.post('/call', (req, res) => {
    console.log('call')

    var c = new web3.eth.Contract(abi, conf.contract_address)
    var json = req.body
    var a = json.params ? call(c.methods[json.method](...json.params)) : call(c.methods[json.method]())

    a.then(r => res.send(r))
})

app.post('/send', (req, res) => {
    var c = new web3.eth.Contract(abi, conf.contract_address)
    var json = req.body
    var a = json.params ? send(c.methods[json.method](...json.params)) : send(c.methods[json.method]())

    a.then(r => res.send(r))
})
app.post('/deploy', (req, res) => {
  var c = new web3.eth.Contract(abi, conf.contract_address)
  var json = req.body
  var a = deploy(abi, bin)

  a.then(r => res.send(r._address))
})

async function deploy(abi, bin) {
    unlock().then(r1 => {
        // personal.unlockAccount(acc, '');
        // web3.eth.personal.unlockAccount(acc, '')
        var c = new web3.eth.Contract(abi)//, null, {from: acc, data: bin})
        // c.new({from: acc, data: bin})
        var res = c.deploy({ data: bin })
        //res.send({ from: conf.acc_adr, gas: 1500000 }).then(res => console.log(res._address))
        var ret = res.send({ from: conf.acc_adr, gas: 1500000 })
        console.log(ret)
        return ret
    })
} 

var abi = JSON.parse(fs.readFileSync('./contracts/' + conf.contract_name +'.abi'))
var bin = '0x' + JSON.parse(fs.readFileSync('./contracts/' + conf.contract_name +'.bin')).object



//deploy(abi, bin)



//web3.eth.getAccounts().then(r => console.log(r))

app.listen(8866);
  /*
axios.post('http://localhost:8866/call', {
    method: 'retrieve'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
*/
axios.post('http://localhost:8866/deploy', {
    
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
