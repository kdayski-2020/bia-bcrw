const fs = require('fs')
const express = require('express')
const axios = require('axios')

const Web3 = require('web3')

const conf = require('./conf')

var app = new express();
app.use(express.json())

var web3 = new Web3(new Web3.providers.HttpProvider(conf.rpc));

async function unlock(){
    return await web3.eth.personal.unlockAccount(conf.acc_adr, conf.acc_pass, 10000)
}

async function send(method) {
    unlock()

    // var gasa = await method.estimateGas()
    // var gp = await web3.eth.getGasPrice()
    // var gasp = gp // .toFixed.await method.getGasPrice()

    // console.log(gasa, gasp)

    var ret = await method.send({ from: conf.acc_adr })
    console.log(ret)
}

async function call(method) {
    unlock()

    // var gasa = await method.estimateGas()
    // var gp = await web3.eth.getGasPrice()
    // var gasp = gp // .toFixed.await method.getGasPrice()

    // console.log(gasa, gasp)

    var ret = await method.call({ from: conf.acc_adr })
    console.log(ret)
    return ret
}

app.post('/api/rpc/call', (req, res) => {
    var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    console.log(ip)

    var c = new web3.eth.Contract(abi, conf.contract_address)
    var json = req.body
    var a = json.params ? call(c.methods[json.method](...json.params)) : call(c.methods[json.method]())

    a.then(r => res.send(r))
})

app.post('/api/rpc/send', (req, res) => {
    var c = new web3.eth.Contract(abi, conf.contract_address)
    var json = req.body
    var a = json.params ? send(c.methods[json.method](...json.params)) : send(c.methods[json.method]())

    a.then(r => res.send(r))
})

function deploy(abi, bin, acc) {
    unlock().then(r1 => {
        // personal.unlockAccount(acc, '');
        // web3.eth.personal.unlockAccount(acc, '')
        var c = new web3.eth.Contract(abi)//, null, {from: acc, data: bin})
        // c.new({from: acc, data: bin})
        var res = c.deploy({ data: bin, arguments: ['0xe41fcbf00c5e65140da4d14fe52bc6d1317bc9a3'] })
        res.send({ from: conf.acc_adr, gas: 3000000 }).then(res => console.log(res._address))
    })
}

var abi = JSON.parse(fs.readFileSync('./contracts/airdropCompPay.abi'))
var bin = '0x' + JSON.parse(fs.readFileSync('./contracts/airdropCompPay.bin')).object

// console.log(bin)

// deploy(abi, bin, acc)


// web3.eth.personal.newAccount('password').then(r => console.log(r))
// web3.eth.getAccounts().then(r => console.log(r))

// greeterSource = fs.readFileSync('erc20.sol')
// var greeterCompiled = web3.eth.compile.solidity(greeterSource)
// console.log(greeterCompiled)

// console.log(web3.eth.getCompilers())

// 1. sendTokens(address[] _recipient,uint[] _amount)
// 2. getTokenBalance(address)
// 3. getBackTokens()


// web3.eth.personal.newAccount('password').then(adr => console.log(adr))

// web3.eth.getAccounts().then(r => console.log(r))

app.listen(3100);
