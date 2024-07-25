const express = require('express');
const ethers = require('ethers');
const fs = require('fs');
const ethUtil = require('ethereumjs-util');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const wallets = JSON.parse(fs.readFileSync('wallets.json'));
const txContractAddress = process.env.TX_CONTRACT_ADDRESS; // Address of the deployed TxHistory contract
const txABI = [
    "function claim(address beneficiary) public",
    "function claimed(address beneficiary) public view returns (bool)"
];

app.use(cors())

const txContract = new ethers.Contract(txContractAddress, txABI, wallet);

app.use(express.json());

app.post('/send', async (req, res) => {
    const { signature } = req.body;
    const message = "Quiero el airdrop de Ethereum Argentina";

    try {
        const signerAddress = verifySignature(message, signature);

        console.log(wallets)
        console.log(signerAddress)

        if (wallets.includes(signerAddress)) {
            const hasClaimed = await airdropContract.claimed(signerAddress);
            if (hasClaimed) {
                console.log("Error: Already claimed")
                return res.status(400).send('Already claimed');
            }

            const tx = await airdropContract.claim(signerAddress);
            console.log("Success: Airdrop claimed")
            console.log(`Airdrop claimed by ${signerAddress}, Transaction hash: ${tx.hash}`);
            res.send(`Airdrop claimed by ${signerAddress}`);
        } else {
            res.status(400).send('Address not in whitelist');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Airdrop failed');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function verifySignature(message, signature) {
    const msgBuffer = Buffer.from(message, 'utf8');
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const signerAddress = ethUtil.bufferToHex(addressBuffer);

    return signerAddress;
}