/* eslint-env browser */
"use strict";

var $ = require("jquery");
const ethers = require("ethers");

require("bootstrap/dist/css/bootstrap.min.css");
require("bootstrap/js/dist/tab.js");
require("bootstrap/js/dist/alert.js");
require("bootstrap/js/dist/util.js");

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
    var network = await this.provider.getNetwork();

    const testToken = require("../build/contracts/TestToken.json");
    const testItem = require("../build/contracts/TestItem.json");

    let chainId = network.chainId.toString();

    let wallet = this.provider.getSigner(0);
    this.walletAddress = await wallet.getAddress();

    if (chainId in testItem.networks) {
      let testItemAddress = testItem.networks[chainId].address;
      let testTokenAddress = testToken.networks[chainId].address;

      let testTokenContractRaw = new ethers.Contract(
        testTokenAddress,
        testToken.abi,
        this.provider
      );

      let testItemContractRaw = new ethers.Contract(
        testItemAddress,
        testItem.abi,
        this.provider
      );

      this.contracts.TestToken = testTokenContractRaw.connect(wallet);
      this.contracts.TestItem = testItemContractRaw.connect(wallet);

      this.gld_units = await this.contracts.TestToken.decimals();

      this.setupHooks();
    }
    
    return this.render();
  }

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

  async mintERC721() {
    this.clearAlerts();
    let tokenId = parseInt($("#mintERC721Amount").val());
    $("#mintERC721Amount").val("");
    $("#mintERC721Form").hide();
    $("#mintERC721Message").html("Creating mint transaction");
    $("#mintERC721Message").show();
    let tx;
    try {
      tx = await this.contracts.TestItem.mintItem(
        this.walletAddress,
        tokenId
      );
    } catch (e) {
      return this.handleFailure(e);
    }
    $("#mintERC721Message").html("Token is minting");
    await tx.wait();
    $("#mintERC721Message").hide();
    $("#mintERC721Form").show();
    this.alertSuccess("Successfully minted token " + tokenId);
    this.render();
  }
}

$(function() {
  $(window).on("load", () => {
    new App();
  });
});
