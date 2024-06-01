const { BigNumber, constants } = require("ethers");
const AddressZero = constants;

const { expect } = require("chai");

// const chai = require('chai')
// const hre = require('hardhat')
require("@nomicfoundation/hardhat-chai-matchers");

const fromWei = (x) => ethers.utils.formatEther(x.toString());
const toWei = (x) => ethers.utils.parseEther(x.toString());
const fromWei18Dec = (x) => x / Math.pow(10, 6);
const toWei18Dec = (x) => x * Math.pow(10, 6);
const fromWei8Dec = (x) => x / Math.pow(10, 8);
const toWei8Dec = (x) => x * Math.pow(10, 8);

// const provider = new ethers.providers.JsonRpcProvider()
const provider = ethers.provider;

let FactoryOwner, Investor1, Investor2, Investor3;
let testBytecode, salt1, calculatedAddress1;
let blockNum, bITS;

describe("Clone factory, ST (18 decimals)", function () {
  it("setup wallets", async function () {
    [FactoryOwner, Investor1, Investor2, Investor3] = await ethers.getSigners();
  });

  it("setup factory assembly", async function () {
    const cloneFact = await hre.ethers.getContractFactory("CloneFactory");
    console.log("Deploying Clone Factory contract...");
    this.cloneFactoryContract = await cloneFact.deploy();
    await this.cloneFactoryContract.deployed();
    console.log("Clone Factory deployed @", this.cloneFactoryContract.address);

    const test = await hre.ethers.getContractFactory("TestContract");
    console.log("Deploying Test contract...");
    this.testContract = await test.deploy();
    await this.testContract.deployed();
    console.log("Test contract deployed @", this.testContract.address);

    const Sbl18Decs = await hre.ethers.getContractFactory("StableCoin18Decs");
    console.log("Deploying Stable coin 18 decs contract...");
    this.stable18Decs = await Sbl18Decs.deploy("myDAI", "myDAI", 1000000000);
    await this.stable18Decs.deployed();
    console.log("Stable coin 18 decs deployed @", this.stable18Decs.address);
  });

  it("calculate future address for test contract", async function () {
    salt1 = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    console.log(`salt: ${salt1}`);
    calculatedAddress1 =
      await this.cloneFactoryContract.predictTestContractAddress(
        this.testContract.address,
        salt1
      );
    console.log(`Test Contract calculated address: ${calculatedAddress1}`);
  });

  it("send some token and eth to non-deployed address", async function () {
    await this.stable18Decs
      .connect(FactoryOwner)
      .transfer(calculatedAddress1, toWei(1000));
    bal = await this.stable18Decs.balanceOf(calculatedAddress1);
    console.log(fromWei(bal) + " token");

    await Investor1.sendTransaction({
      to: calculatedAddress1,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });
    bal = await ethers.provider.getBalance(calculatedAddress1);
    console.log(fromWei(bal) + " eth");
  });

  it("deploy test contract to calculeted address", async function () {
    await expect(
      this.cloneFactoryContract.cloneTestContract(
        this.testContract.address,
        salt1
      )
    );

    test = await ethers.getContractFactory("TestContract");
    this.testContractClone = await test.attach(calculatedAddress1);
    console.log(
      "Test contract clone deployed @",
      this.testContractClone.address
    );
    expect(this.testContract.address).to.be.equal(calculatedAddress1);

    bal = await this.stable18Decs.balanceOf(calculatedAddress1);
    console.log(fromWei(bal) + " token");

    bal = await ethers.provider.getBalance(calculatedAddress1);
    console.log(fromWei(bal) + " eth");
  });

  it("set owner of a test contract (initialization)", async function () {
    console.log("owner before init: ", await this.testContractClone.owner());
    await this.testContract
      .connect(Investor3)
      .initialize(FactoryOwner.address, 42);
    console.log("owner after init: ", await this.testContractClone.owner());
  });

  it("remove tokens and eth from test contract", async function () {
    await expect(
      this.testContract
        .connect(Investor1)
        .contractTokentransfer(AddressZero, Investor2.address, toWei(1))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await this.testContract
      .connect(FactoryOwner)
      .contractTokentransfer(AddressZero, Investor2.address, toWei(1));
    await this.testContract
      .connect(FactoryOwner)
      .contractTokentransfer(
        this.stable18Decs.address,
        Investor2.address,
        toWei(1000)
      );

    bal = await this.stable18Decs.balanceOf(this.testContract.address);
    console.log(fromWei(bal) + " token");

    bal = await this.testContract.getBalance();
    console.log(fromWei(bal) + " eth");
  });
});
