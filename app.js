const ncmbClient = new NCMB("b53a849745e39e380c628263073d639407ddf57b21abf65261b279f6a49631b9", "ab9829b0f12baed4236368928577728c15f26fab97caf3c9c2520cb94c999738");
const fdb = ncmbClient.DataStore("Fusen");
let cdgbuf = [null, null];

async function allQuery(userid) {
    let retdata = null;
    await fdb.equalTo("UserId", userid).fetchAll().then(async d => {
        retdata = d;
    }).catch(err => {
        console.log(err);
        retdata = undefined;
    });
    return retdata;
}

async function add(json) {
    return new fdb(json).save().then(() => { return true; })
        .catch(err => {
            console.log(err);
            return false;
        });
}

function rgbtohex(rgbx){
    let r = ("00" + Number(rgbx.split("(")[1].split(",")[0]).toString(16)).substr(-2);
    let g = ("00" + Number(rgbx.split("(")[1].split(",")[1]).toString(16)).substr(-2);
    let b = ("00" + Number(rgbx.split("(")[1].split(",")[2].split(")")[0]).toString(16)).substr(-2);
    return "#" + r + g + b;
}

function retlp(v) {
    const linep = document.createElement("p");
    linep.setAttribute("class", "linediv");
    linep.setAttribute("id", "linep" + (v));
    return linep;
}

function retsdiv(idn, val, fsize, num, subs) {
    const subdiv = document.createElement("input");
    subdiv.setAttribute("class", "subdiv");
    subdiv.setAttribute("id", "sub" + idn);
    subdiv.value = val;
    subdiv.setAttribute("style", "font-size: " + fsize + "vh");
    subdiv.addEventListener("focusout", () => {
        subs.name[num - 1] = subdiv.value;
        fdb.equalTo("SubjectNo", num).fetchAll().then(x => {
            x.forEach(d => {
                d.set("SubjectName", subdiv.value).update().catch(err => console.log(err));
            });
        });
    });
    return subdiv;
}

function retpbtn(x, n, fbx) {
    const addbtn = document.createElement("button");
    addbtn.setAttribute("class", "addbtn");
    addbtn.innerText = "+";
    document.getElementById("fb" + fbx).appendChild(addbtn);

    addbtn.addEventListener("click", async() => {
        //付箋の追加
        const f = document.createElement("textarea");
        f.setAttribute("class", "fsdiv");
        f.setAttribute("style", "background-color: white;");
        f.value = "";
        document.getElementById("fb" + x).insertBefore(f, addbtn);
        const nfdb = await new fdb({
            Color: "white",
            Content: "",
            Progress: 0,
            SubjectName: n,
            SubjectNo: x,
            UserId: 1,
            Visible: "True",
        }).save().catch(err => console.log(err));
        //フォーカスが外れた際に編集結果でデータを更新する
        f.addEventListener("focusout", async() => {
            nfdb.set("Content", f.value);
            nfdb.set("SubjectName", f.parentElement.parentElement.firstElementChild.value);
            return await nfdb.update();
        });
        //shift,ctrl押しながらクリック
        f.addEventListener("click", async e => {
            if (e.shiftKey) {
                //モーダルを表示
                document.getElementById("cpick").value = "#FFFFFF";
                document.getElementById("layer").style.visibility = "visible";
                document.getElementById("popup").style.visibility = "visible";
                document.getElementById("modalclose").style.visibility = "visible";
                cdgbuf = [f, nfdb];
            }
            if (e.ctrlKey) {
                f.remove();
                nfdb.set("Visible", "False");
                return await nfdb.update();
            }
        });
    });

    return addbtn;
}

window.onload = async function() {
    //ユーザー判定
    let userid = 1;
    if(window.location.search){
        userid = Number(window.location.search.substring(1).split("&")[0].split("=")[1]);
    }
    console.log(userid);
    //モーダルを非表示
    document.getElementById("layer").style.visibility = "hidden";
    document.getElementById("popup").style.visibility = "hidden";
    //モーダルの閉じるボタン
    document.getElementById("modalclose").addEventListener("click", async () => {
        document.getElementById("layer").style.visibility = "hidden";
        document.getElementById("popup").style.visibility = "hidden";
        document.getElementById("modalclose").style.visibility = "hidden";
        cdgbuf[0].style.backgroundColor = document.getElementById("cpick").value;
        cdgbuf[1].set("Color", document.getElementById("cpick").value);
        await cdgbuf[1].update();
    });
    //ヘルプモーダルを非表示
    document.getElementById("hlayer").style.visibility = "hidden";
    document.getElementById("hpopup").style.visibility = "hidden";
    //ヘルプボタンの挙動
    document.getElementById("hlp").addEventListener("click", () => {
        document.getElementById("hlayer").style.visibility = "visible";
        document.getElementById("hpopup").style.visibility = "visible";
    });
    //ヘルプの閉じるボタン
    document.getElementById("hlpclose").addEventListener("click", () => {
        document.getElementById("hlayer").style.visibility = "hidden";
        document.getElementById("hpopup").style.visibility = "hidden";
    });

    //全ての付箋情報と小項目情報を読み込む
    let allf = await allQuery(userid);
    if (allf == void 0) {
        //読み込みに失敗した
        alert("付箋情報の読み込みに失敗しました。リロードします。");
        setTimeout("location.reload(true)", 0);
    } else {

        //小項目を計算
        let subs = { number: [], name: [] }; //小項目を追加する
        allf.forEach(ef => {
            if (subs.number.find(e => e == ef.SubjectNo) == void 0) {
                //小項目を追加
                subs.number.push(Number(ef.SubjectNo));
                subs.name.push(ef.SubjectName);
            }
        });

        //ベースUIの設計
        for (let i = 0; i < subs.number.length; i++) {

            //1行のまとまり
            const linep = retlp(i + 1);

            //小項目の部分
            let subdiv = null;
            if (subs.name[i] == void 0) {
                subdiv = retsdiv((i + 1), "", 3, Number(linep.id.slice(5)), subs);
            } else {
                subdiv = retsdiv((i + 1), subs.name[i], (15 / subs.name[i].length), Number(linep.id.slice(5)), subs);
            }

            //付箋の部分
            const fbdiv = document.createElement("div");
            fbdiv.setAttribute("class", "fbdiv");
            fbdiv.setAttribute("id", "fb" + (i + 1));

            //追加処理
            linep.appendChild(subdiv);
            linep.appendChild(fbdiv);
            document.getElementById("pdiv").appendChild(linep);

        }

        //小項目の追加ボタン
        const saddbtn = document.createElement("button");
        saddbtn.setAttribute("class", "addbtn");
        saddbtn.innerText = "+";
        const slinep = document.createElement("p");
        slinep.setAttribute("class", "linediv");
        slinep.appendChild(saddbtn);

        saddbtn.addEventListener("click", () => {
            //1行のまとまり
            const linep = retlp(subs.number.length + 1);

            //小項目の部分
            const subdiv = retsdiv((subs.number.length + 1), "", 3, Number(linep.id.slice(5)), subs);

            //付箋の部分
            const fbdiv = document.createElement("div");
            fbdiv.setAttribute("class", "fbdiv");
            fbdiv.setAttribute("id", "fb" + (subs.number.length + 1));

            //追加処理
            linep.appendChild(subdiv);
            linep.appendChild(fbdiv);
            document.getElementById("pdiv").insertBefore(linep, slinep);

            //付箋追加ボタン
            const addbtn = retpbtn(Number(fbdiv.id.slice(2)), subs.name[Number(fbdiv.id.slice(2))], (subs.number.length + 1), subs);
            document.getElementById("fb" + (subs.number.length + 1)).appendChild(addbtn);

            //内部処理
            subs.number.push((subs.number.length + 1));
            subs.name.push("Default");
        });
        document.getElementById("pdiv").appendChild(slinep);

        //付箋の追加
        for (let i in allf) {

            if (allf[i].Visible == "True") {
                //textareaの作成
                const f = document.createElement("textarea");
                f.setAttribute("class", "fsdiv");
                f.setAttribute("style", "background-color: " + allf[i].Color + ";");
                f.value = allf[i].Content;

                //フォーカスが外れた際に編集結果でデータを更新する
                f.addEventListener("focusout", async() => {
                    allf[i].set("Content", f.value);
                    allf[i].set("SubjectName", f.parentElement.parentElement.firstElementChild.value);
                    return await allf[i].update();
                });
                //shift,ctrl押しながらクリック
                f.addEventListener("click", async e => {
                    if (e.shiftKey) {
                        document.getElementById("cpick").value = "#FFFFFF";
                        document.getElementById("layer").style.visibility = "visible";
                        document.getElementById("popup").style.visibility = "visible";
                        document.getElementById("modalclose").style.visibility = "visible";
                        cdgbuf = [f, allf[i]];
                    }
                    if (e.ctrlKey) {
                        f.remove();
                        allf[i].set("Visible", "False");
                        return await allf[i].update();
                    }
                });
                document.getElementById("fb" + allf[i].SubjectNo).appendChild(f);

            }
        }

        //付箋追加ボタン
        for (let i in subs.name) {
            //ボタンのデザイン
            const addbtn = retpbtn((Number(i) + 1), subs.name[i], (Number(i) + 1), subs);

            //追加
            document.getElementById("fb" + (Number(i) + 1)).appendChild(addbtn);
        }

        //モーダル内ボタンの挙動設定
        for (let i = 0; i < 12; i++){
            document.getElementById("cbt" + i).addEventListener("click", () => {
                //カラーピッカーの色変更
                document.getElementById("cpick").value = rgbtohex(document.getElementById("cbt" + i).style.backgroundColor.toString());
            });
        }

    }
}