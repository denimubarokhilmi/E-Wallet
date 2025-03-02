
//* event close offcanvas
document.addEventListener("DOMContentLoaded", () => {
    const offcanvas = document.getElementById("transfer");
    const searchName = document.querySelector(".search-name");
    const transferName = document.querySelector(".transfer-name");
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("misal")) {
            searchName.style.display = "none";
            transferName.style.display = "block";
        }
    });

    offcanvas.addEventListener("hide.bs.offcanvas", () => {
        searchName.style.display = "block";
        transferName.style.display = "none";
    });
});

//* submit transfer ke teman
const btnTransfer = document.querySelector(".btn-merchant");
const jumlahInput = document.getElementById("jumlah");
const IDSYNOXTujuan = document.getElementById("IDSYNOXTujuan");
const tujuan = document.getElementById("tujuan");
const pengirim = document.getElementById("pengirims");
const form = document.querySelector(".transfer-teman");
const IDMerchant = document.getElementById("IDMerchant").value;
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const jumlahValue = jumlahInput.value.trim();
    if (!jumlahValue || parseFloat(jumlahValue) < 5000) {
        document.querySelector(".warning").textContent = "";
        document.querySelector(".warning").textContent =
            "masukan jumlah input yang benar Min.5.000";
        return;
    }

    btnTransfer.disabled = true;
    const spanTransfer = document.createElement("span");
    spanTransfer.classList.add(
        "spinner-border",
        "spinner-border-sm",
        "text-light",
        "ms-2"
    );
    btnTransfer.appendChild(spanTransfer);
    try {

        const response = await fetch("https://267a-180-244-128-82.ngrok-free.app/transfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tujuan: tujuan.value,
                IDSYNOXTujuan: IDSYNOXTujuan.value,
                jumlah: jumlahValue,
                pengirim: pengirim.value,
                IDMerchant,
            }),
        });
        const result = await response.json();
        if (response.ok) {
            updateListTransaksi()
            setTimeout(async () => {
                btnTransfer.disabled = false;
                spanTransfer.remove();
                inputSeacrh.value = "";
                document.querySelector(".result-fetch").innerHTML = "";
                const res = await fetch(" https://267a-180-244-128-82.ngrok-free.app/userData");
                const hasil = await res.json();
                const phone = hasil.data.phone;
                document.body.insertAdjacentHTML(
                    "beforeend",
                    createcanvas(result.data.sentTransactions[0], phone)
                );
                merchant(result.data.sentTransactions[0]);
            }, 2000);
        } else if (response.status == 400) {
            setTimeout(async () => {
                btnTransfer.disabled = false;
                spanTransfer.remove();
                inputSeacrh.value = "";
                document.querySelector(".result-fetch").innerHTML = "";
                document
                    .querySelector(".transfer-name")
                    .insertAdjacentHTML(
                        "afterbegin",
                        `<h5 class="text-danger">${result.message}!</h5>`
                    );

                return;
            }, 1000);
        }
    } catch (er) {
        console.log(er);
    }
});

function createcanvas(value, phone) {
    return `  <div class="offcanvas canvas-right offcanvas-end p-3 " id="${value.IDMerchant
        }"
                style="width: 500px;">
                <i class=" back bi bi-arrow-left-circle-fill fs-3 ms-2 mb-2" data-bs-toggle="offcanvas"
                data-bs-target="#transaksi"></i>
                <div
                class="canvas-header-templates offcanvas-header text-center d-flex justify-content-center align-items-center">
                <div class="profile mt-3 mb-3">
                <img src="../img/logoapk.svg" alt="">
                </div>
                </div>
                <div class="offcanvas-body shadow-lg">
                <div class=" p-3">
                <h4 class="text-center mb-3">Detail Transaksi</h4>
                <div class="row">
                <div class="col-md-12  text-secondary">
                <p>${value.tanggal}, <span>${value.waktu}</span>
                <span class="float-end">ID SYNOX  ${phone}</span>
                </p>
                </div>
                <hr>
                <div class="col-md-12 text-secondary">
                <i class="bi bi-check-circle-fill text-success"></i> <span>Transaksi berhasil</span>
                <h5 class="text-dark mt-3">Kirim uang RP${value.jumlah.toLocaleString()} ke ${value.penerima
        }-${value.akunPenerima}</h5>
                <p class="bg-info fw-bold text-dark mt-3 p-2">Total bayar
                <span class="float-end">${value.jumlah.toLocaleString()}
                </span>
                </p>
                <p>Metode pembayaran
                <span class="float-end">Saldo SYNOX</span>
                </p>
                <hr>
                <p>ID Transaksi :
                <span class="float-end">
                
                ${value.IDTransaksi}
                </span>
                </p>
                <p>IDMerchant <span class="float-end">
                ${value.IDMerchant}
                </span></p>
                <p>Penerima :
                <span class="float-end">
                
                ${value.penerima}
                </span>
                </p>
                <p>Akun SYNOX :
                <span class="float-end">
                
                ${value.akunPenerima}
                </span>
                </p>
                </div>
                </div>
                </div>
                </div>
 </div>`;
}

function merchant(value) {
    const bsTransferCanvas = bootstrap.Offcanvas.getInstance(
        document.getElementById("transfer")
    );
    bsTransferCanvas.hide();
    const bsDetailCanvas = new bootstrap.Offcanvas(
        document.querySelector("#" + value.IDMerchant)
    );
    bsDetailCanvas.show();
}

//* end submit transfer ke teman
// filter hari terakhir
const contentTransaction = document.querySelector(".content-transaction");
const listTransaksi = document.querySelectorAll(".list-transaksi");
let active = null;
listTransaksi.forEach((el) => {
    el.addEventListener("click", async (event) => {
        if (active) {
            active.style.backgroundColor = "";
            active.style.color = "";
        }
        if (event.target.classList.contains("list-transaksi")) {
            try {
                active = el;
                el.style.backgroundColor = "blue";
                el.style.color = "white";
                const dataset = event.target.dataset.hari;
                const res = await fetch(" https://267a-180-244-128-82.ngrok-free.app/filter-hari", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        hari: dataset,
                    }),
                });
                const result = await res.json();
                contentTransaction.innerHTML = "";
                contentTransaction.insertAdjacentHTML(
                    "beforeend",
                    `<div class="d-flex justify-content-center">
              <div class="spinner-border text-dark text-center">
                </div>
                </div>
                <p class="text-secondary text-center mt-2 fs-4">Please wait...</p>
            `
                );
                setTimeout(() => {
                    contentTransaction.innerHTML = "";
                    updateCanvas(result);
                }, 1000);
            } catch (err) {
                console.log(err);
            }
        }
    });
});
//* update canvas
function updateCanvas(data) {
    data.data.forEach((el) => {
        showUpdateCanvas(el);
    });
}

// show update canvas
function showUpdateCanvas(value) {
    value.receivedTransactions.forEach((el) => {
        if (el.penerima === pengirim.value) {
            contentTransaction.insertAdjacentHTML(
                "beforeend",
                reveicedTransactions(el)
            );
        } else if (el.pengirim === pengirim.value) {
            contentTransaction.insertAdjacentHTML(
                "beforeend",
                sentTransactions(el)
            );
        }
    });
}
// received transaction
function reveicedTransactions(value) {
    return `  <div
      class="col-md-12 border-bottom border-primary detail-transaksi-list p-3"
          data-bs-toggle="offcanvas"
          data-bs-target="#${value.IDTransaksi}"
        >
          <i class="bi bi-person-fill-up fs-4 text-primary"></i>
          <span>Terima Uang</span>
          <i class="bi bi-chevron-compact-right fs-4 float-end"></i>
          </div>`;
}
// sent transaction
function sentTransactions(value) {
    return `  <div
          class="col-md-12 border-bottom border-primary detail-transaksi-list p-3"
          data-bs-toggle="offcanvas"
          data-bs-target="#${value.IDMerchant}"
        >
          <i class="bi bi-person-fill-down fs-4 text-warning"></i>
          <span>Transfer Uang</span>
          <i class="bi bi-chevron-compact-right fs-4 float-end"></i>
        </div>`;
}
//search
const inputSeacrh = document.querySelector(".seacrh-name");
const spanClick = document.querySelector(".cari");
inputSeacrh.addEventListener("keyup", search);
spanClick.addEventListener("click", search);
function search(event) {
    if (event.type == "click" || event.key == "Enter") {
        const values = inputSeacrh.value;
        document.querySelector(".result-fetch").innerHTML = "";
        document
            .querySelector(".result-fetch")
            .insertAdjacentHTML(
                "beforeend",
                `<h5 class="text-secondary">tunggu sebentar...</h5>`
            );
        setTimeout(() => {
            fetch(" https://267a-180-244-128-82.ngrok-free.app/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    value: values,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.data) {
                        document.querySelector(".result-fetch").innerHTML = "";
                        document.querySelector(".result-fetch").insertAdjacentHTML(
                            "beforeend",
                            ` <a class="list-text misal border-top list-group-item list-group-item-action"><i
                    class="bi bi-person-circle fs-5 me-2"></i>${data.data.name}</a`
                        );

                        tujuan.value = data.data.name;
                        IDSYNOXTujuan.value = data.data.bankAccount.numberAcount;
                        return;
                    } else if (data.status == 404) {
                        document.querySelector(".result-fetch").innerHTML = "";
                        document
                            .querySelector(".result-fetch")
                            .insertAdjacentHTML(
                                "beforeend",
                                `<h5 class="text-secondary">${data.message}</h5>`
                            );
                    }
                });
        }, 1000);
    }
}

// isi saldo
const inputtopup = document.getElementById('topup').value
const btnSaldo = document.querySelector('.btn-saldo');
const formIsiSaldo = document.querySelector('.isi-saldo');
formIsiSaldo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const spanIsiSaldo = document.createElement('span');
    spanIsiSaldo.classList.add(
        "spinner-border",
        "spinner-border-sm",
        "text-light",
        "ms-2"
    );
    btnSaldo.disabled = true;

    btnSaldo.appendChild(spanIsiSaldo);
    setTimeout(async () => {
        btnSaldo.disabled = false;
        spanIsiSaldo.remove();
        const res = await fetch('https://267a-180-244-128-82.ngrok-free.app/isi-saldo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                saldo: document.getElementById('saldo').value,
                name: inputtopup,
                IDMerchant: document.getElementById('IDMerchantIsiSaldo').value

            })
        });
        const result = await res.json();
        if (res.ok) {
            formIsiSaldo.insertAdjacentHTML("afterbegin", createCanvasIsiSaldo(result.message));
        }
    }, 1000);
});
function createCanvasIsiSaldo(value) {
    return `<p class="text-secondary fs-5 m-auto">${value}</p>`;
}

async function updateListTransaksi() {
    // ambil data transaksi
    contentTransaction.innerHTML = '';
    const response = await fetch('https://267a-180-244-128-82.ngrok-free.app/transfer');
    const result = await response.json();
    result.data.forEach((doc) => {
        showUpdateCanvas(doc)
    })
}