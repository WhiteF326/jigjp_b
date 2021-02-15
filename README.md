# FuseNote ver.β0.01
## jig.jp インターンシップ事前課題 / HTML + CSS + JavaScript 制作
### jig.jp pre_internship task / HTML + CSS + JavaScript Production



## 使用方法についてはindex.htmlを開いて左上のヘルプを参照してください。


## クライアントシステム要件
- HTMLを開けるブラウザ
- インターネット接続環境
- 最低限実用可能な性能のPC


## System Requirements
- Browser to open html
- Internet Connection Environment
- Minimum Practical PC performance


## Note
- JavaScriptの本体は28418～28675行です。
- HTMLはindex.htmlです。
- ~~文法がわからないので、~~ jQueryは使用していません。


## 現在の機能
- 項目ごとに付箋を表示、削除、追加、更新をmBaaSと連携して実装。
- モーダルウィンドウを表示、閉じる操作をHTML / JavaScriptで実装。
- (複数ユーザー用のフィールドだけ用意。)


## 制作関連
- アイデア、実装について元ネタや助言など一切なし
- ソースコードもゼロから作成しました。
- (さすがにネット中のそこかしこを検索して回りました)


## 現在の実装
- rgbtohex(rgbx) - rgb(r, g, b)形式のデータを#rrggbb形式に変換。
- retlp(v) - 小項目ごとの行をパーツ的に生成
- retsdiv(...) - 小項目の見出し部分をパーツ的に生成
- retpbtn(...) - 付箋をパーツ的に生成
- 主関数onload内
  - useridを仮決定、get部分があればユーザーidを取得
    - **未実装** useridとpasswordをPOSTメソッド送信に変更しmBaaSに突き合わせる
  - モーダル関連のセットアップ (28510 ~ 28534)
  - mBaaSから付箋データの取得 (28538 ~ 28547)
    - awaitを使ってデータ取得完了まで待機する
    - 取得に失敗してundefinedが返された場合は一先ずエラー表示とリロード (28544 ~ 28547)
  - 以下データ取得できた場合のみ、小項目ごとにデータをまとめる (28551 ~ 28558)
    - mBaaSのデータ自体がRDBMS的な運用をするものではないので、見出しの処理がやや曖昧
      - 見出し番号とテキストの一覧を保持する連想配列を生成 (28551)
      - 取得できたデータを頭から参照し、まだ連想配列上にない見出し番号ならば、番号とテキストを格納(28552 ~ 28558)
  - UIを設計する
    - 見出しの数ぶん行を作成 (28561 ~ 28582)
    - 小項目を追加するボタンの作成 (28594 ~ 28619)
    - 付箋を追加する (28622 ~ 28655)
      - 付箋そのものの追加 (28624 ~ 28629, 28652)
      - 付箋からフォーカスが外れた際のデータベース更新処理 (28632 ~ 28636)
      - shiftやctrlを押しながらクリックした際の処理 (28638 ~ 28651)
    - 付箋を追加するボタンを配置 (28658 ~ 28664)
    - モーダル内の色ボタンに対する挙動を設定 (28667 ~ 28672)


## 実装できていない機能
- 複数ユーザーに対応しようとしたが、謎のバグ発生により時間切れ
- (login.htmlは何もかもが未完成)
