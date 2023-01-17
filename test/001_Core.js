// const { expect } = require("chai");
// // const { ethers } = require("hardhat");
// const { defaultFixture } = require("./_fixture");
// const {
//   loadFixture,
//   hexToBytes,
//   fromLittleEndian,
// } = require("../utils/helpers");
// const {
//   // parseUnits,
//   formatBytes32String,
//   // parseBytes32String,
//   defaultAbiCoder,
// } = require("ethers/lib/utils");

// describe("Droppin", async () => {
//   describe("Core", async () => {
//     let cDroppin;
//     let pia;
//     let tay;
//     before(async () => {
//       const fixture = await loadFixture(defaultFixture);
//       pia = fixture.pia;
//       cDroppin = fixture.cDroppin;
//       tay = fixture.tay;
//     });
//     it("should be able to create group", async () => {
//       const groupData = {
//         name: formatBytes32String("Lepak DAO"),
//         description: formatBytes32String("Asia's biggest builder fam"),
//         owner: pia.address,
//       };
//       const tx = await cDroppin.connect(pia).createGroup(groupData);
//       await tx.wait();
//       const rd = await cDroppin.groupById(1);
//       expect(rd.name).eq(groupData.name);
//       expect(rd.description).eq(groupData.description);
//       expect(rd.owner).eq(pia.address);
//     });
//     it("should be able to add 1 or more condition to group", async () => {
//       const schemaHash = "9a7a6a513e29844f895cac0c6075ea77";
//       const schemaHash1 = "9a7a6a513e29844f895cac0c6075eb77";
//       const schemaHash2 = "9a7a6a513e29844f895cac0c6075ec77";

//       const tx = await cDroppin
//         .connect(pia)
//         .addCondition(1, fromLittleEndian(hexToBytes(schemaHash)));
//       await tx.wait();
//       const tx1 = await cDroppin
//         .connect(pia)
//         .addCondition(1, fromLittleEndian(hexToBytes(schemaHash1)));
//       await tx1.wait();
//       const tx2 = await cDroppin
//         .connect(pia)
//         .addCondition(1, fromLittleEndian(hexToBytes(schemaHash2)));
//       await tx2.wait();

//       const rd = await cDroppin.conditionById(3);
//       expect(rd.groupId).eq(1);
//       expect(rd.requestId).eq(3);
//     });

//     it("FAIL : not owner cant add condition", async () => {
//       const schemaHash = "9a7a6a513e29844f895cac0c6075ea77";
//       await expect(
//         cDroppin
//           .connect(tay)
//           .addCondition(1, fromLittleEndian(hexToBytes(schemaHash)))
//       ).to.be.revertedWith("caller is not the owner of this group");
//     });

//     it("should be able to add 1 or more quests", async () => {
//       const questInputDataFormat = ["bytes32", "uint256", "uint256", "uint256"];
//       const testCasesQuests = [
//         [
//           formatBytes32String("Quest 1"),
//           150,
//           1,
//           fromLittleEndian(hexToBytes("9a7a6a513e29844f895cac0c6075ea77")),
//           [1, 2],
//         ],
//         [
//           formatBytes32String("Quest 2"),
//           120,
//           1,
//           fromLittleEndian(hexToBytes("9a7a6a513e29844f895cac0c6075eb77")),
//           [1, 2, 3],
//         ],
//         [
//           formatBytes32String("Quest 3"),
//           620,
//           1,
//           fromLittleEndian(hexToBytes("9a7a6a513e29844f895cac0c6075ec77")),
//           [1],
//         ],
//       ];
//       for (let i = 0; i < testCasesQuests.length; i++) {
//         const tx = await cDroppin
//           .connect(pia)
//           .addQuest(
//             testCasesQuests[i][4],
//             defaultAbiCoder.encode(
//               questInputDataFormat,
//               testCasesQuests[i].slice(0, 4)
//             )
//           );
//         await tx.wait();
//       }

//       for (let i = 0; i < testCasesQuests.length; i++) {
//         const rd = await cDroppin.questById(i + 1);
//         expect(rd.name).eq(testCasesQuests[i][0]);
//         expect(rd.reputation).eq(testCasesQuests[i][1]);
//         expect(rd.groupId).eq(testCasesQuests[i][2]);
//         // expect(rd.conditionIds).eq(testCasesQuests[i][4]);
//         expect(rd.requestId).eq(4 + i);
//       }

//       // let rd = await
//     });
//   });
// });
