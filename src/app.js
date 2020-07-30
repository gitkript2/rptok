/* eslint-env browser */
"use strict";

var $ = require("jquery");
const ethers = require("ethers");

require("bootstrap/dist/css/bootstrap.min.css");
require("bootstrap/js/dist/tab.js");
require("bootstrap/js/dist/alert.js");
require("bootstrap/js/dist/util.js");

const ArbErc20Factory = require("arb-provider-ethers/dist/lib/abi/ArbErc20Factory")
  .ArbErc20Factory;

const delay = ms => new Promise(res => setTimeout(res, ms));

class App {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.gld_units = null;
    return this.initWeb3();
  }

  async initWeb3() {
    // Modern dapp browsers...
    var standardProvider = null;
    if (window.ethereum) {
      standardProvider = window.ethereum;
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        console.log("User denied account access");
      }
    } else if (window.web3) {
      // Legacy dapp browsers...
      standardProvider = window.web3.currentProvider;
    } else {
      // Non-dapp browsers...
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }

    this.provider = new ethers.providers.Web3Provider(standardProvider);
    return this.initContracts();
  }

  async initContracts() {
    console.log("here yo");
      const buddyContract = require("../build/contracts/BuddyERC20.json");
      const arberc20Contract = require("../build/contracts/ArbERC20.json");
      
      // metamask:
      // const provider =  new ethers.providers.Web3Provider(window.ethereum);
      let wallet = this.provider.getSigner(0);
      let key = "0x979f020f6f6f71577c09db93ba944c89945f10fade64cfc7eb26137d5816fb76";
      this.walletAddress = await wallet.getAddress();
      console.log(this.walletAddress);


        let buddyInterfaceX = new ethers.Contract(
          '0xf9dEB127F8C85D215c8F5471E074793c53635F1b',
          buddyContract.abi,
          this.provider
        );
      //   let buddyInterface2 = new ethers.Contract(
      //     '0xf9dEB127F8C85D215c8F5471E074793c53635F1b',
      //     arberc20Contract.abi,
      //     provider
      //   );
    
       const ethereumProvider = new ethers.providers.JsonRpcProvider("http://localhost:7545")
       const ethereumWallet = new ethers.Wallet(key, ethereumProvider);
       const buddyInterface = new ethers.Contract('0xf9dEB127F8C85D215c8F5471E074793c53635F1b', buddyContract.abi, ethereumWallet)
       
       // this.contracts.TestItem = arbERC0Interface;
       // this.contracts.TestToken = buddyInterface;
       // this.gld_units = await this.contracts.TestToken.decimals();

      this.contracts.TestToken = buddyInterface.connect(wallet);
      

      this.gld_units = await this.contracts.TestToken.decimals();

      const ethBalance = await this.contracts.TestToken.balanceOf(
        this.walletAddress
      );
      console.log(ethBalance);



      const arbProvider = new ethers.providers.JsonRpcProvider("http://localhost:8547")
      const arbWallet = new ethers.Wallet(key, arbProvider);
      const arbERC0Interface = new ethers.Contract('0xf9dEB127F8C85D215c8F5471E074793c53635F1b', arberc20Contract.abi, arbWallet)
      this.contracts.ArbToken = arbERC0Interface.connect(arbWallet);
      
      const ethBalance2 = await this.contracts.ArbToken.balanceOf(
        this.walletAddress
      );

    //   let arbTestTokenContractRaw = ArbErc20Factory.connect(
    //   '0xf9dEB127F8C85D215c8F5471E074793c53635F1b',
    //   arbWallet
    // );

    //   this.contracts.ArbToken = arbTestTokenContractRaw.connect(arbWallet);
      
    //   const ethBalance2 = await this.contracts.ArbToken.balanceOf(
    //     this.walletAddress
    //   );
      
      // console.log(ethBalance2);

      this.setupHooks();

      return this.render();
  }

  // async initContracts() {

  //   var network = await this.provider.getNetwork();

  //   // const testToken = require("../build/contracts/TestToken.json");
  //   // const testItem = require("../build/contracts/TestItem.json");

  //   let chainId = network.chainId.toString();

  //   let wallet = this.provider.getSigner(0);
  //   this.walletAddress = await wallet.getAddress();

  //   if (chainId in testItem.networks) {
  //     let testItemAddress = testItem.networks[chainId].address;
  //     let testTokenAddress = testToken.networks[chainId].address;

  //     let testTokenContractRaw = new ethers.Contract(
  //       testTokenAddress,
  //       testToken.abi,
  //       this.provider
  //     );

  //     let testItemContractRaw = new ethers.Contract(
  //       testItemAddress,
  //       testItem.abi,
  //       this.provider
  //     );

  //     this.contracts.TestToken = testTokenContractRaw.connect(wallet);
  //     this.contracts.TestItem = testItemContractRaw.connect(wallet);

  //     this.gld_units = await this.contracts.TestToken.decimals();

  //     this.setupHooks();
  //   }

  //   return this.render();
  // }

  setupHooks() {
    $("#mintERC20Form").submit(event => {
      this.mintERC20();
      event.preventDefault();
    });
    $("#mintERC721Form").submit(event => {
      this.mintERC721();
      event.preventDefault();
    });
  }

  async render() {
    var content = $("#content");
    if (this.walletAddress) {
      $("#accountAddress").html(this.walletAddress);
    } else {
      $("#accountAddress").html("Loading");
    }

    if (this.contracts.TestItem) {
      $("#nocontracts").hide();
      $("#minting").show();
      $("#testTokenAddress").html(this.contracts.TestToken.address);
      $("#testItemAddress").html(this.contracts.TestItem.address);
    } else {
      $("#nocontracts").show();
      $("#minting").hide();
    }

    content.show();
  }

  alertError(element, alert_class, message) {
    $(element).removeClass("alert-primary alert-danger alert-success");
    $(element).addClass(alert_class);
    $(element + "-message").html(message);
    $(element).show();
  }

  alertSuccess(message) {
    this.alertError("#alert", "alert-success", message);
  }

  clearAlerts() {
    $("#ETH-alert").hide();
    $("#ERC20-alert").hide();
    $("#ERC721-alert").hide();
  }

  handleFailure(e) {
    let message;
    if (Object.prototype.hasOwnProperty.call(e, "reason")) {
      message = e.reason;
    } else if (
      Object.prototype.hasOwnProperty.call(e, "data") &&
      Object.prototype.hasOwnProperty.call(e, "message")
    ) {
      message = e.data.message;
    } else if (Object.prototype.hasOwnProperty.call(e, "message")) {
      message = e.message;
    } else {
      message = e.data;
    }

    $("#mintERC20Message").hide();
    $("#mintERC20Form").show();
    $("#mintERC721Message").hide();
    $("#mintERC721Form").show();

    this.alertError(
      "#alert",
      "alert-danger",
      "Failed making transaction: " + message
    );
    this.render();
  }

  async mintERC20() {
    this.clearAlerts();
    let val = ethers.utils.parseUnits(
      $("#mintERC20Amount").val(),
      this.gld_units
    );
    $("#mintERC20Amount").val("");
    $("#mintERC20Form").hide();
    $("#mintERC20Message").html("Tokens are minting...");
    $("#mintERC20Message").show();
    let tx;
    try {
      tx = await this.contracts.TestToken.mint(this.walletAddress, val);
    } catch (e) {
      return this.handleFailure(e);
    }

    await tx.wait();
    $("#mintERC20Message").hide();
    $("#mintERC20Form").show();
    this.alertSuccess(
      "Successfully minted " +
      ethers.utils.formatUnits(val, this.gld_units) +
      " tokens"
    );
    this.render();
  }
}

$(function () {
  $(window).on("DOMContentLoaded", new App);
});
