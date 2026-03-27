const fs = require("fs");
const express = require("express");
const axios = require("axios");
const Web3 = require("web3");
const conf = require("./conf");
const { constants } = require("buffer");
const { connectDb } = require("./helper/db");
const mongoose = require("mongoose");
const { callbackify } = require("util");

const port = conf.service_port;
const host = conf.mongo_host;
const db = conf.mongo_url;
const sk_schema = new mongoose.Schema({
  bcId: String,
  contractAddress: String,
});
const sk_model = mongoose.model("SmartContract", sk_schema);

var app = new express();

app = require("./lib/swagger-bia")(app, { type: "json" });

app.use(express.json());

var web3;

function transferMoney(eth) {
  eth = String(eth);
  console.log("transfer money");
  web3.eth.getBalance(conf.app_address, (e, d) => {
    console.log(web3.utils.fromWei(d, "ether"));
  });
  web3.eth.getAccounts((er, data) => {
    console.log(data);
    web3.eth
      .sendTransaction({
        from: data[0],
        to: conf.app_address,
        value: web3.utils.toWei(eth, "ether"),
      })
      .then(function (receipt) {
        web3.eth.getBalance(conf.app_address, (e, d) => {
          console.log(web3.utils.fromWei(d, "ether"));
        });
      });
  });
}

function checkBalance() {
  web3.eth.getBalance(conf.app_address, (e, d) => {
    if (web3.utils.fromWei(d, "ether") < 1) {
      transferMoney(10);
    }
  });
}

async function initApp(bcId, callback, err_callback = () => { }) {
  web3 = new Web3(
    new Web3.providers.HttpProvider(
      "http://83.220.168.72:8001/bcm/bc/" + bcId + "/rpc"
    )
  );
  /*
    1. Перевести деньги с мастер кошелька на свой
    2. Отправить деньги со своего кошелька на мастер кошелек
    https://stackoverflow.com/questions/57393050/no-truffle-error-number-can-only-safely-store-up-to-53-bits
    3. 
    */
  web3.eth.getAccounts((er, data) => {
    console.log(er);
    console.log(data);
    if (er) {
      err_callback(String(er));
    } else {
      conf.acc_adr = data[0];
      callback(bcId);
    }
  });
}

async function unlock() {
  return await web3.eth.personal.unlockAccount(
    conf.acc_adr,
    conf.acc_pass,
    10000
  );
}

async function send(method) {
  var ret = await method.send({ from: conf.acc_adr });
  console.log(ret);
  return ret;
}

async function call(method) {
  var ret = await method.call({ from: conf.acc_adr });
  console.log(ret);
  return ret;
}

app.post("/call", (req, res) => {
  console.log("call");
  var json = req.body;
  sk_model.findOne(
    { _id: json.id },
    ["bcId", "contractAddress"],
    (err, contract) => {
      if (err) return console.error(err);
      console.log(contract);
      initApp(
        contract.bcId,
        () => {
          var c = new web3.eth.Contract(abi, contract.contractAddress);
          var a = json.params
            ? call(c.methods[json.method](...json.params))
            : call(c.methods[json.method]());
          a.then((r) => res.send(r));
        },
        (er) => {
          res.status(500).send(er);
        }
      );
    }
  );
});

app.post("/send", (req, res) => {
  console.log("app post sent");
  var json = req.body;
  console.log(json);
  sk_model.findOne(
    { _id: json.id },
    ["bcId", "contractAddress"],
    (err, contract) => {
      if (err) return console.error(err);
      console.log(contract);
      initApp(
        contract.bcId,
        () => {
          var c = new web3.eth.Contract(abi, contract.contractAddress);
          var a = json.params
            ? send(c.methods[json.method](...json.params))
            : send(c.methods[json.method]());
          a.then((r) => res.send(r));
        },
        (er) => {
          res.status(500).send(er);
        }
      );
    }
  );
});

app.post("/deploy", (req, res) => {
  console.log("app deploy");
  var json = req.body;
  console.log(json);
  initApp(
    json.bcId,
    () => {
      var c = new web3.eth.Contract(abi);
      var result = c.deploy({ data: bin });
      result.send({ from: conf.acc_adr, gas: 1500000 }).then((data) => {
        console.log(`contract address: ${data._address}`);
        const contract = new sk_model({
          bcId: json.bcId,
          contractAddress: data._address,
        });
        contract.save(function (err) {
          if (err) return console.error(err);
        });
        console.log(`contract id: ${contract._id}`);
        res.send(contract);
      });
    },
    (er) => {
      res.status(500).send({ error: er });
    }
  );
});

function testRPC() {
  let bcId = "EpMyxT6O88sWOZ62aH4ZlXNPbjZemVsg";
  web3 = new Web3(
    new Web3.providers.HttpProvider(
      "http://83.220.168.72:8001/bcm/bc/" + bcId + "/rpc"
    )
  );
  console.log("TEST RPC");
  web3.eth.getAccounts((er, data) => {
    console.log(data);
    web3.eth.getBalance(data[0], (e, d) => {
      console.log(d);
    });
  });
}

function info(_id) {
  sk_model.find({ _id: _id }, ["bc_http", "contract_address"], function (
    err,
    contract
  ) {
    if (err) return console.error(err);
    console.log(contract);
  });
}

function deleteAll() {
  sk_model.deleteMany({ bcId: `${host}:8545` }, function (err) {
    if (err) return handleError(err);
  });
}

var abi = JSON.parse(
  fs.readFileSync("./contracts/" + conf.contract_name + ".abi")
);
var bin =
  "0x" +
  JSON.parse(fs.readFileSync("./contracts/" + conf.contract_name + ".bin"))
    .object;

const startServer = () => {
  app.listen(port, () => {
    console.log(
      `Service has been started, using port: ${port}\nDatabase: ${db}`
    );
  });
};

connectDb()
  .on("error", console.log)
  .on("disconnected", connectDb)
  .once("open", startServer);
