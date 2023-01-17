const { expect } = require("chai");
// const { ethers } = require("hardhat");
const { defaultFixture } = require("./_fixture");
const {
  loadFixture,
  hexToBytes,
  fromLittleEndian,
} = require("../utils/helpers");
const {
  // parseUnits,
  formatBytes32String,
  // parseBytes32String,
  defaultAbiCoder,
} = require("ethers/lib/utils");

describe("Droppin", async () => {
  describe("CoreFacet", async () => {
    let cCoreFacet;
    let cDroppin;
    let pia;
    let tay;
    let bob;
    before(async () => {
      const fixture = await loadFixture(defaultFixture);
      pia = fixture.pia;
      cDroppin = fixture.cDroppin;
      cCoreFacet = fixture.cCoreFacet;
      tay = fixture.tay;
      bob = fixture.bob;
    });
    it("should be able to create group", async () => {
      const testCases = [
        {
          name: formatBytes32String("Lepak DAO"),
          owner: pia,
        },
        {
          name: formatBytes32String("EduDAO"),
          owner: bob,
        },
        {
          name: formatBytes32String("Developer DAO"),
          owner: tay,
        },
      ];
      testCases.forEach(async (test) => {
        const tx = await cCoreFacet.connect(test.owner).createGroup(test.name);
        await tx.wait();
      });

      testCases.forEach(async (test, id) => {
        const rd = await cCoreFacet.getGroup(id + 1);
        expect(rd.name).eq(test.name);
        expect(rd.owner).eq(test.owner.address);
      });
    });

    it("should be able to modify group", async () => {
      const testData = {
        oldName: formatBytes32String("Lepak DAO"),
        newName: formatBytes32String("Fake Lepak DAO"),
      };
      //should fail
      let tx = await cCoreFacet.connect(tay).createGroup(testData.oldName);
      await tx.wait();
      let rd = await cCoreFacet.getGroup(4);
      expect(rd.name).eq(testData.oldName);
      expect(rd.owner).eq(tay.address);

      await expect(
        cCoreFacet.connect(bob).modifyGroup(4, testData.newName, bob.address)
      ).to.be.revertedWith("caller is not the owner of the group");
      tx = await cCoreFacet
        .connect(tay)
        .modifyGroup(4, testData.newName, bob.address);
      await tx.wait();
      rd = await cCoreFacet.getGroup(4);
      expect(rd.name).eq(testData.newName);
      expect(rd.owner).eq(bob.address);
    });
    // it("should be able to add 1 or more condition to group", async () => {
    //   const schemaHash = "9a7a6a513e29844f895cac0c6075ea77";
    //   const schemaHash1 = "9a7a6a513e29844f895cac0c6075eb77";
    //   const schemaHash2 = "9a7a6a513e29844f895cac0c6075ec77";

    //   const tx = await cDroppin
    //     .connect(pia)
    //     .addCondition(1, fromLittleEndian(hexToBytes(schemaHash)));
    //   await tx.wait();
    //   const tx1 = await cDroppin
    //     .connect(pia)
    //     .addCondition(1, fromLittleEndian(hexToBytes(schemaHash1)));
    //   await tx1.wait();
    //   const tx2 = await cDroppin
    //     .connect(pia)
    //     .addCondition(1, fromLittleEndian(hexToBytes(schemaHash2)));
    //   await tx2.wait();

    //   const rd = await cDroppin.conditionById(3);
    //   expect(rd.groupId).eq(1);
    //   expect(rd.requestId).eq(3);
    // });

    // it("FAIL : not owner cant add condition", async () => {
    //   const schemaHash = "9a7a6a513e29844f895cac0c6075ea77";
    //   await expect(
    //     cDroppin
    //       .connect(tay)
    //       .addCondition(1, fromLittleEndian(hexToBytes(schemaHash)))
    //   ).to.be.revertedWith("caller is not the owner of this group");
    // });

    // it("should be able to add 1 or more quests", async () => {
    //   const questInputDataFormat = ["bytes32", "uint256", "uint256", "uint256"];
    //   const testCasesQuests = [
    //     [
    //       formatBytes32String("Quest 1"),
    //       150,
    //       1,
    //       fromLittleEndian(hexToBytes("9a7a6a513e29844f895cac0c6075ea77")),
    //       [1, 2],
    //     ],
    //     [
    //       formatBytes32String("Quest 2"),
    //       120,
    //       1,
    //       fromLittleEndian(hexToBytes("9a7a6a513e29844f895cac0c6075eb77")),
    //       [1, 2, 3],
    //     ],
    //     [
    //       formatBytes32String("Quest 3"),
    //       620,
    //       1,
    //       fromLittleEndian(hexToBytes("9a7a6a513e29844f895cac0c6075ec77")),
    //       [1],
    //     ],
    //   ];
    //   for (let i = 0; i < testCasesQuests.length; i++) {
    //     const tx = await cDroppin
    //       .connect(pia)
    //       .addQuest(
    //         testCasesQuests[i][4],
    //         defaultAbiCoder.encode(
    //           questInputDataFormat,
    //           testCasesQuests[i].slice(0, 4)
    //         )
    //       );
    //     await tx.wait();
    //   }

    //   for (let i = 0; i < testCasesQuests.length; i++) {
    //     const rd = await cDroppin.questById(i + 1);
    //     expect(rd.name).eq(testCasesQuests[i][0]);
    //     expect(rd.reputation).eq(testCasesQuests[i][1]);
    //     expect(rd.groupId).eq(testCasesQuests[i][2]);
    //     // expect(rd.conditionIds).eq(testCasesQuests[i][4]);
    //     expect(rd.requestId).eq(4 + i);
    //   }

    //   // let rd = await
    // });
  });
});
