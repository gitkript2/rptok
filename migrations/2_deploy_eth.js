const BuddyERC20 = artifacts.require("./BuddyERC20.sol");
const web3 = require("web3");

module.exports = async function(deployer, network) {

  // deployer.deploy(TestToken, 100000);
  // deployer.deploy(TestItem);

  var globalInbox = "0x603B563e088859CB752e983AAD9E47BA1A6120C9";
  var rollup = "0xc68DCee7b8cA57F41D1A417103CB65836E99e013";

  const buddyERC20 = await deployer.deploy(BuddyERC20);
  const instance = await BuddyERC20.deployed();
  let ouput = await instance.initialize(rollup, globalInbox);
  console.log("address: "+BuddyERC20.address);

  // let x = await instance.chain();
  // let y = await instance.inbox();
  // console.log("chain: "+x);
  // console.log("inbox: "+y);

  var num = new web3.utils.BN("99999999909900000.0");

  myAdd = "0xc7711f36b2C13E00821fFD9EC54B04A60AEfbd1b";
  await instance.mint(myAdd, num);

  var balance = await instance.balanceOf(myAdd);
  console.log("balance: "+ balance);
};
``