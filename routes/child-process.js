import { bank } from '../db/db.js';
let username;
process.on("message", async (message) => {
    username = message;
    const { resultCollectionUser, resultCollectionTransaksi } = await bank.get();
    const sentTransactions = resultCollectionTransaksi.filter((doc) => doc);
    const finds = resultCollectionUser.find((doc) => doc.name === username);
    process.send({
        sentTransactions,
        finds
    })
});