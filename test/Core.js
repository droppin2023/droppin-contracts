const { expect } = require("chai");
const { ethers } = require("hardhat");
const {defaultFixture} = require('./_fixture');
const {loadFixture, hexToBytes, fromLittleEndian} = require('../utils/helpers');
const { parseUnits , formatBytes32String, parseBytes32String} = require("ethers/lib/utils");

describe("Droppin", async () => {
  describe("Groups", async ()=>{

    let cDroppin;
    let pia;
    let tay;
    before(async () => {
      let fixture = await loadFixture(defaultFixture);
      pia = fixture.pia;
      cDroppin = fixture.cDroppin;
      tay = fixture.tay;
    })
    it("should be able to create group", async () => {
      let groupData = {
        name : formatBytes32String("Lepak DAO"),
        description : formatBytes32String("Asia's biggest builder fam"),
        owner : pia.address
      }
      let tx = await cDroppin.connect(pia).createGroup(groupData);
      await tx.wait();
      const rd = await cDroppin.groupById(1);
      expect(rd.name).eq(groupData.name);
      expect(rd.description).eq(groupData.description);
      expect(rd.owner).eq(pia.address)
    });
    it("should be able to add 1 or more condition to group", async () => {
      let schemaHash = '9a7a6a513e29844f895cac0c6075ea77';
      let schemaHash1 = '9a7a6a513e29844f895cac0c6075eb77';
      let schemaHash2 = '9a7a6a513e29844f895cac0c6075ec77';

      let tx = await cDroppin.connect(pia).addCondition(1,fromLittleEndian(hexToBytes(schemaHash)));
      await tx.wait();
      let tx1 = await cDroppin.connect(pia).addCondition(1,fromLittleEndian(hexToBytes(schemaHash1)));
      await tx1.wait();
      let tx2 = await cDroppin.connect(pia).addCondition(1,fromLittleEndian(hexToBytes(schemaHash2)));
      await tx2.wait();
    });

    it("FAIL : not owner cant add condition", async () => {
      let schemaHash = '9a7a6a513e29844f895cac0c6075ea77';
      await expect(cDroppin.connect(tay).addCondition(1,hexToBytes(schemaHash))).to.be.revertedWith("caller is not the owner of this group")
    });
  })
});
