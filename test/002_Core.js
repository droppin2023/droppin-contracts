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
const { ethers } = require("hardhat");

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
      // should fail
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
    it("should add quest to group", async () => {
      const questsToAdd = [
        {
          name: formatBytes32String("Quest1"),
          groupId: 1,
          owner: pia,
        },
        {
          name: formatBytes32String("Quest2"),
          groupId: 2,
          owner: bob,
        },
        {
          name: formatBytes32String("Quest3"),
          groupId: 3,
          owner: tay,
        },
        {
          name: formatBytes32String("Quest4"),
          groupId: 1,
          owner: pia,
        },
      ];

      questsToAdd.forEach(async (item) => {
        const tx = await cCoreFacet
          .connect(item.owner)
          .addQuest(item.groupId, item.name);
        await tx.wait();
      });

      questsToAdd.forEach(async (item, id) => {
        const rd = await cCoreFacet.getQuest(id + 1);
        expect(rd.name).eq(item.name);
        expect(rd.groupId).eq(item.groupId);
      });
      await expect(
        cCoreFacet
          .connect(bob)
          .addQuest(questsToAdd[0].groupId, questsToAdd[0].name)
      ).to.be.revertedWith("caller is not the owner of the group");
    });
  });
  describe("BadgeFacet", async () => {
    let cCoreFacet;
    let cBadgeFacet;
    let pia;
    let tay;
    let bob;
    before(async () => {
      const fixture = await loadFixture(defaultFixture);
      pia = fixture.pia;
      cCoreFacet = fixture.cCoreFacet;
      cBadgeFacet = fixture.cBadgeFacet;
      tay = fixture.tay;
      bob = fixture.bob;

      // create groups
      const groupList = [
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
      groupList.forEach(async (item) => {
        const tx = await cCoreFacet.connect(item.owner).createGroup(item.name);
        await tx.wait();
      });

      // add quests
      const questsToAdd = [
        {
          name: formatBytes32String("Quest1"),
          groupId: 1,
          owner: pia,
        },
        {
          name: formatBytes32String("Quest2"),
          groupId: 2,
          owner: bob,
        },
        {
          name: formatBytes32String("Quest3"),
          groupId: 3,
          owner: tay,
        },
        {
          name: formatBytes32String("Quest4"),
          groupId: 1,
          owner: pia,
        },
      ];

      questsToAdd.forEach(async (item) => {
        const tx = await cCoreFacet
          .connect(item.owner)
          .addQuest(item.groupId, item.name);
        await tx.wait();
      });
    });
    it("should be able to create badge", async () => {
      const badgesList = [
        {
          groupId: 1,
          owner: pia,
          requiredQuests: [1, 4, 0],
          threshold: 1000,
          badgePrice: 0,
          name: "Hacker Badge",
          symbol: "HACK",
          URI: "www.google.com",
        },
      ];
      badgesList.forEach(async (item) => {
        const tx = await cBadgeFacet.connect(item.owner).addBadge(
          item.groupId,
          {
            requiredQuests: item.requiredQuests,
            reputationThreshold: item.threshold,
            badgePrice: item.badgePrice,
            name: item.name,
            NFT: ethers.constants.AddressZero,
          },
          item.symbol,
          item.URI
        );
        await tx.wait();
      });
      badgesList.forEach(async (item, id) => {
        const rd = await cBadgeFacet.getBadge(id + 1);
        expect(rd.name).eq(item.name);
        expect(rd.NFT).not.eq(ethers.constants.AddressZero);
        expect(rd.badgePrice).eq(item.badgePrice);
        expect(rd.reputationThreshold).eq(item.threshold);
      });
    });
    it("should be able to claim badge", async () => {
      const nftAddress = (await cBadgeFacet.getBadge(1)).NFT;
      const cNFTBadge = await ethers.getContractAt("NFTBadge", nftAddress);
      const balanceBefore = await cNFTBadge.balanceOf(bob.address);
      const tx = await cBadgeFacet.connect(bob).claimBadge(1);
      await tx.wait();
      const balanceAfter = await cNFTBadge.balanceOf(bob.address);
      expect(balanceAfter).eq(balanceBefore + 1);
    });
  });
});