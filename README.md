# Droppin

# Problem 🤔

Community Engagement. Probably the life blood of crypto.

And much like how not all communities are the same, not all engagements are the same.
So We believe high-quality engagement is crucial for successability for communities.

We’ve interviewed every community moderator and members we can. And ended with 2 problems.

If you are a moderator, you are driving engagement. But, it's really hard to qualify, What's qualified engagement looks like today. How do you know who to actually reward.What is the proof of contribution? something we’ve been thinking about since 2017.

And here’s next. Everybody is a community member everywhere. Yet communities are siloed. What does that mean? it means, you have different ID handles across multiple communities. Identities and works that you did and contributions that you made these identities are siloed today.

## Solution - Droppinprotocol.com 💡

- A protocol which provide engagement elements as a diamond facet. ``(BadgeFacet)`` 

- Allows Identity to link with the quests and engagement points that are issued by different communities. And points and badge activity will be fully tracking by on-chain. ``(Composable Identity)``

- Your social credit record will be standardized here, but it can be composable, transferable. Other community recognize your work in here, they can create engagements and tasks to certain groups of verified people. ``(Targeting verified groups)``

- Your `claim-badge` identities will be stored in your polygon id wallet ``(Privacy preserving) V2``

- If you hold an identity, you are only allowed to submit a proof once and mint a badge for yourself  ``(Secure & Trustworthy)``

- Droppin protocol is upgradable and composable thanks to the Diamond pattern user EIP2535, allows you to mint badges to different addresses and use only one polygon id account ``(infrastructure) V2``

## Repos 🙇🏽

- frontend : https://github.com/droppin2023/client
- contract : https://github.com/droppin2023/droppin-contracts
- server : https://github.com/droppin2023/droppin-server

## 🎧 [**Pitch**](https://pitch.com/public/21f69804-c2e8-416d-bb7d-d1fe94bd31ea)

## Video Demo 📀

[![Demo](./readme-assets/demo-yt.png)](https://vimeo.com/manage/videos/777732273)
## Technologies ( PoC )

### ``

ZK Circuits are generated using the halo2 library in rust

### `IPFS` 

Data issued is encrypted and stored on-chain using IPFS. This doesnt require us to save our data in our computer, but at the same time keeping it private.

### `Biconomy`

Provides us with social login and gasless transactions for a much better user experience, allowing us to easily onboard non web3 users into our protocol

### `Push`

When data is `issued` we notify the receiever via `email` by using Push Protocol SDK, connecting it to our mail bot

### `The Graph`

Indexes the transactions and data of the commitment hashes issued by entities to users. Helps to keep better track and its more efficient than reading from the blockchain. 

### `Covalent`

### `QuicknNode`

RPC endpoint for archive mode and deployment to mumbai testnet. 

### `Polygon`
| contract | address |
| --- | --- |
| DroppinDiamondInit | 0xA27B7d39d5485574c80d0376cc5a45E47D40e7B6 |
| DiamondCutFacet | 0x29aD01e57aC5400113dD095Ecf23E1B12a12C206 |
| DiamondLoupeFacet | 0x859FB18fEd647C035770Ee633a237D73c19Dbd72 |
| OwnershipFacet | 0x28eAE73e92896770F5BeCEB5d190A0eBE8E12e7f |
| DroppinDiamond | 0x7a884E2BEb49b70087eC9782474AB7f10d1f9505 |
| CoreFacet | 0xc1F8C6Ec1E06d5AbE69CA7a8C3852a95f327a020 |
| BadgeFacet | 0x319EA5E0EB08DbCAdcb01591BB82332A72776630 |

**MAIN CONTRACT** : [etherscan](https://mumbai.polygonscan.com/address/0x7a884E2BEb49b70087eC9782474AB7f10d1f9505)

<hr> 

# ZK Technical design
## Design of the document

A generic form that consist of two columns (one row for title, another row for content). Up to 10 rows.

eg:
| Title | Content |
| --- | --- |
| Name | CC |
| AGe | xx |
| | |

Each row is able to store string of text. The title depends on the use case, for example in a health certificate, we can imagine that there will be row with the title blood_type with the content A+ for example. This can be as flexible as possible.

<br />

## Generation of commitment hash

We utilizes Poseidon hash function as it is a Snark friendly hash function that will allow us to reduce the number of constraints as compared to when we use sha256.
We perform a double hashing mechanism (i.e horizontal and vertical).

<br />

## Horizontal hashing

| Title | Content | Horizontal Result |
| ----- | ------- | ----------------- |
| Name  | CC      | hash_row_1        |
| AGe   | xx      | hash_row_2        |
| ...   | ...     | ...               |

The horizontal hashing hashes the title and content row by row, producing a resultant hash for that row as seen in Horizontal Result above.
<br />

## Vertical hashing