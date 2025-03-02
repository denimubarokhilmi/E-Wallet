import { MongoClient } from "mongodb";
const uri = 'mongodb://localhost:27017/bank';
const client = new MongoClient(uri);
import bcrpt from "bcrypt";

const collectionUserData = 'data-user';
const collectionTransaksiBank = 'transaction-bank';
class ConnectDb {
    constructor() {
        try {
            this.connect = client.db('bank')
        } catch (err) {
            console.log(err);
        }
    };
    async hashed(password) {
        const saltRounds = 10;
        const hashedPassword = await bcrpt.hash(password, saltRounds);
        return hashedPassword;
    };
    async compareHashed(password, hasdedPasswords) {
        return await bcrpt.compare(password, hasdedPasswords);
    }
}
class Collection extends ConnectDb {
    constructor() {
        super();
        this.collectionUser = this.connect.collection(collectionUserData);
        this.collectionTransaksi = this.connect.collection(collectionTransaksiBank);
        this.countID = 1;
    };
    randomNumber() {
        let randomNumber = 0;
        for (let i = 0; i <= 10; i++) {
            let random = Math.floor(Math.random() * 10);
            randomNumber += random.toString();
        }
        return randomNumber;
    };
    async checkLogin(body) {
        try {
            const { resultCollectionUser } = await this.get();
            const finds = resultCollectionUser.find((doc) => doc.name == body.name);
            if (finds) {
                const compareHashed = await this.compareHashed(body.password, finds.password);
                if (finds && compareHashed) {
                    return true
                } else throw 'username or password incorrect';
            } else throw 'username or password incorrect';

        } catch (er) {
            return new Error(er);
        }

    }
    async get() {
        const resultCollectionUser = await this.collectionUser.find().toArray();
        const resultCollectionTransaksi = await this.collectionTransaksi.find().toArray();
        return { resultCollectionUser, resultCollectionTransaksi };
    };
    async createDoc(body) {
        const { name, email, phone, password, password2 } = body;
        const collection = await this.collectionUser;
        const { resultCollectionUser } = await this.get()
        try {
            if (resultCollectionUser.find(doc => doc.name === name)) {
                throw "Nama sudah terdaftar";
            } else if (password !== password2) throw "password incorrect";
            else {

                const docs = {
                    name,
                    email,
                    phone,
                    password: await this.hashed(password),
                    bankAccount: {
                        idAccount: this.countID++,
                        nameAcount: name,
                        numberAcount: `8881${phone}`,
                        balance: 0,
                        uangmasuk: 0,
                        uangkeluar: 0
                    }
                };
                const result = await collection.insertOne(docs);
                return result;
            }
        } catch (err) {
            return new Error(err);
        }
    };

    async createDocTransaksi(body) {
        try {
            const { jumlah, tujuan, IDSYNOXTujuan, pengirim, IDMerchant } = body;
            const collectionTransfer = await this.collectionTransaksi;
            const collectionUser = await this.collectionUser;
            const { resultCollectionUser } = await this.get();
            const findsUser = resultCollectionUser.find((doc) => doc.name == pengirim);
            if (findsUser.bankAccount.balance === 0 || (findsUser.bankAccount.balance - jumlah) < 0) {
                throw new Error("Saldo anda tidak cukup");
            } else {

                const query = { name: pengirim };
                const updt = {
                    $inc: {
                        "bankAccount.balance": - parseInt(jumlah),
                        "bankAccount.uangkeluar": + parseInt(jumlah)
                    }
                }
                const querylast = { name: tujuan };
                const updtlast = {
                    $inc: {
                        "bankAccount.balance": + parseInt(jumlah),
                        "bankAccount.uangmasuk": + parseInt(jumlah)
                    }
                }
                await collectionUser.updateMany(query, updt);
                await collectionUser.updateMany(querylast, updtlast);
                const doc = {
                    sentTransactions: [
                        {
                            IDTransaksi: `id-${this.randomNumber()}`,
                            pengirim: pengirim,
                            penerima: tujuan,
                            akunPenerima: IDSYNOXTujuan,
                            tanggal: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
                            waktu: `${new Date().getHours()}:${new Date().getMinutes()}`,
                            IDMerchant,
                            jumlah: parseInt(jumlah),
                            type: "transfer"
                        }
                    ],
                    receivedTransactions: [
                        {
                            IDTransaksi: `id-${this.randomNumber()}`,
                            pengirim: pengirim,
                            penerima: tujuan,
                            akunPenerima: IDSYNOXTujuan,
                            tanggal: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
                            waktu: `${new Date().getHours()}:${new Date().getMinutes()}`,
                            IDMerchant,
                            jumlah: parseInt(jumlah),
                            type: "transfer"
                        }
                    ]
                }


                const result = await collectionTransfer.insertOne(doc);
                return result
            }

        } catch (err) {
            return new Error(err)
        }
    };
    async filterHari(body) {
        try {
            const hari = body.hari === 'semua' ? null : parseInt(body.hari);
            const { resultCollectionTransaksi } = await this.get();
            const filter = resultCollectionTransaksi.filter((el) => {
                return el.sentTransactions.some(item => {
                    const now = new Date();
                    const transaksiDate = new Date(item.tanggal);
                    const diffTime = Math.abs(now - transaksiDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return hari === null ? true : diffDays <= hari;


                })
            });
            return filter
        } catch (err) {
            return new Error(err);
        }
    };
    async createSaldo(body) {
        try {
            const { saldo, name, IDMerchant } = body;
            const realSaldo = parseInt(saldo)
            const collectionUSer = await this.collectionUser;

            const query = { name: name };
            const upt = {
                $inc: {
                    "bankAccount.balance": + realSaldo,
                }
            };

            const result = await collectionUSer.updateMany(query, upt);

            return result;
        } catch (err) {
            return new Error(err);
        }

    }

};

export const bank = new Collection();
process.on('SIGINT', async () => {
    await client.close();
    console.log('Koneksi ke MongoDB ditutup');
    process.exit(0);
});