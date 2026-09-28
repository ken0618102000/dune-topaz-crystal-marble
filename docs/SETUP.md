# 羽排 · 詳細架設說明

這份文件給要 **自己跑起來** 或 **部署上線** 的人。產品怎麼用請看 [README](../README.md)。

- [系統需求](#系統需求)
- [Windows 一鍵啟動](#windows-一鍵啟動)
- [本機開發（推薦，零設定）](#本機開發推薦零設定)
- [本機接真實 Postgres / Neon](#本機接真實-postgres--neon)
- [環境變數](#環境變數)
- [資料庫與 migration](#資料庫與-migration)
- [常用指令](#常用指令)
- [部署到 Vercel](#部署到-vercel)
- [部署到其他 Node 主機](#部署到其他-node-主機)
- [上線後檢查](#上線後檢查)
- [權限與安全](#權限與安全)
- [疑難排解](#疑難排解)

---

## 系統需求

| 項目 | 版本 | 備註 |
|---|---|---|
| Node.js | **22.x** | 專案用 Vite 8、原生 TS test strip |
| npm | 隨 Node 22 | 不要改用 yarn / pnpm，lockfile 是 npm 的 |
| Git | 任意近期版本 | |
| 瀏覽器 | Chromium / Safari / Firefox 近期版 | 看板拖放以指標事件為主，平板最順 |
| Postgres | 15+（上線必備） | 本機可不裝，見下一節 |

作業系統：Windows 10/11 請用根目錄 **「一鍵啟動.bat」**（見下一節）。macOS、Linux、WSL2 跑 `npm run dev`。`startup.sh` 是給線上預覽用的，自己的機器不用碰。

確認 Node（一鍵啟動會代勞；手動安裝時）：

```bash
node -v    # 應為 v22.x
npm -v
```

若本機是 18 / 20，用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 切到 22：

```bash
nvm install 22
nvm use 22
```

---

## Windows 一鍵啟動

給現場那台 Windows 筆電 / 桌機：不用開終端機、不用先裝資料庫。

1. 到 [倉庫頁](https://github.com/ken0618102000/dune-topaz-crystal-marble) 按 **Code → Download ZIP**，解壓縮。
2. 打開解壓後的資料夾，**雙擊 `一鍵啟動.bat`**。
3. 第一次會代裝 Node.js（若還沒有）並下載套件，之後再開就只要等瀏覽器跳出來。
4. 團主用跳出的視窗看板；球友手機連 **同一 Wi-Fi**，網址用視窗裡印的 `http://區網IP:8080`。
5. 關掉黑色視窗 = 看板停止。場次存在 `%LOCALAPPDATA%\yupai\data`，不在專案資料夾裡，所以重新下載 ZIP 不會把名單蓋掉。啟動時若專案內還有舊的 `data\`，會自動搬過去。`%LOCALAPPDATA%\yupai\backups` 保留最近 7 份壓縮備份。
6. 需要 Node.js 22 以上。沒裝時會用 winget 安靜安裝。套件與上次相同就略過 `npm ci`，離線也能開。瀏覽器會等伺服器真的起來再開，不再固定等 8 秒。
7. 8080 若已是羽排，按 Enter 沿用現有看板；輸入 `R` 才重啟。若是別的程式佔用，會改用 8081–8085。

若 Windows 跳出「誰發行的？」選 **仍要執行**。第一次若跳出「允許存取」，按允許，手機才連得到。網卡若是公用網路，請改成私人網路。

已經 clone 過 git 的人，在專案根目錄雙擊同一個 bat 即可，不必再下載 ZIP。

---

## 本機開發（推薦，零設定）

沒有 `DATABASE_URL` 時，`src/lib/db.ts` 會啟動 **PGLite**（Postgres 編譯成 WASM，跑在行程裡）。開發伺服器啟動時會自動套用 `migrations/*.sql`。資料存在記憶體，**重啟 `npm run dev` 就沒了**——適合試 UI 與配對，不適合當正式場次。

### 1. 取得原始碼

```bash
git clone https://github.com/ken0618102000/dune-topaz-crystal-marble.git
cd dune-topaz-crystal-marble
```

### 2. 安裝依賴

```bash
npm install
```

第一次會比較久。不要刪 `package-lock.json`。

### 3. 啟動

```bash
npm run dev
```

開發伺服器綁 **`0.0.0.0:8080`**（同一區網的手機 / 平板才能連）。瀏覽器開：

```text
http://localhost:8080
```

區網其他裝置請改成你這台電腦的 IP，例如 `http://192.168.1.23:8080`。

### 4. 確認活著

1. 首頁看得到「羽排」標題、開場表單、加入場次。
2. 按 **開啟示範看板**：應出現 4 面場、休息區、下一場槽。
3. 拖一張名牌到空場，或先按補順位再按空場上場。
4. 另開分頁走 `/s/<場次碼>/me`，選一個暱稱，應是只讀狀態。

終端機不應出現 DB bootstrap 失敗。若有，見 [疑難排解](#疑難排解)。

### 不要做的事

- **不要建立 `.env` / `.env.local` 只為了本機預覽。** 沒設 `DATABASE_URL` 才會走 PGLite。
- 不要直接跑 `npx vite` / `vite dev`。請用 `npm run dev`，它會經過 `scripts/with-app-env.mjs` 把 `.grok/app-env.json` 裡的 `VITE_AUTH_ENABLED` 灌進環境。
- 不要改 `vite.config.ts` 的 port 契約：開發是 `8080`，`vite preview` 是 loopback `8081`。

---

## 本機接真實 Postgres / Neon

當你要：

- 重啟開發伺服器後場次還在
- 手機、筆電打同一顆資料庫
- 驗 migration 與正式環境是否一致

就改接真實 Postgres。

### A. Neon（建議，跟正式環境同一家）

1. 在 [Neon](https://neon.tech) 開專案，複製 **pooled** connection string（通常 host 帶 `-pooler`，`sslmode=require`）。
2. **只在你自己的 shell 裡 export**，不要把字串寫進 repo：

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST/neondb?sslmode=require'
npm run db:migrate    # 套用 migrations/0002_yupai.sql
npm run dev
```

### B. 本機 Docker Postgres

```bash
docker run --name yupai-pg -e POSTGRES_PASSWORD=yupai -e POSTGRES_DB=yupai \
  -p 5432:5432 -d postgres:16

export DATABASE_URL='postgresql://postgres:yupai@127.0.0.1:5432/yupai'
npm run db:migrate
npm run dev
```

`src/lib/db.ts` 看到非空的 `DATABASE_URL` 就改走 `pg` 連 Neon / Postgres，不再開 PGLite。

切換後請確認啟動 log 沒有再提 PGLite。首頁開一場、重啟 `npm run dev`，場次碼應該還在。

---

## 環境變數

**永遠不要把 `.env` commit 進 git**（`.gitignore` 已排除 `.env` 與 `.env.*`）。

| 變數 | 必填 | 出現位置 | 用途 |
|---|---|---|---|
| `DATABASE_URL` | 上線必填 | **只在 server** | Neon / Postgres 連線字串。未設 → PGLite |
| `VITE_AUTH_ENABLED` | 否 | 建置時由 `scripts/with-app-env.mjs` 讀 `.grok/app-env.json` | 本專案是 `"false"`，沒有登入頁 |
| `GROK_PROJECT_ID` | 否 | 平台部署時注入 | 用來分辨「Grok 預覽」與「已發布」。自架請不要設 |

沒有其他必填變數。`XAI_API_KEY`、Better Auth 金鑰這專案都用不到。

規則：

- 只有 `VITE_` 開頭的變數會進瀏覽器 bundle。
- `DATABASE_URL`、主控密鑰、PIN **絕對不可** 加 `VITE_` 前綴。
- 空白的 `DATABASE_URL` 會被當成未設定（避免部署 UI 填了空格卻默默走 PGLite）。

`.grok/app-env.json` 目前是：

```json
{
  "VITE_AUTH_ENABLED": "false",
  "deploy": {
    "database": true
  }
}
```

`deploy.database: true` 告訴 Grok / 平台部署時要配 Neon。你自己在 Vercel 手動部署時，等同於：**請自己在 Vercel 專案設定裡加上 `DATABASE_URL`。**

---

## 資料庫與 migration

Schema 只來自 `migrations/` **根目錄** 的 `*.sql`，依檔名排序、各跑一次，記錄在 `_migrations`。

| 檔案 | 會不會跑 | 內容 |
|---|---|---|
| `migrations/0002_yupai.sql` | 會 | 羽排五張表 |
| `migrations/0003_skill18_rating.sql` | 會 | 程度 1–18 與 seed_skill |
| `migrations/0004_transfer_attempts.sql` | 會 | 移交碼錯誤次數 |
| `migrations/auth/0001_auth.sql` | **不會** | 子目錄，登入未開所以不套用 |

套用方式：

| 環境 | 誰來跑 | 何時 |
|---|---|---|
| PGLite 本機 | `src/lib/db.ts` + Vite `configureServer` | `npm run dev` 啟動時 |
| Neon / Postgres | `npm run db:migrate`（`scripts/migrate.mjs`） | 你手動跑，或 `npm run build` 結尾 |

已套用的檔案 **不要改內容**（名稱對過就跳過）。要改 schema 請新增 `migrations/0003_....sql`，語句寫成 idempotent（`create table if not exists`、`create index if not exists`）。

`0002_yupai.sql` 建的表：

```text
yupai_sessions       場次、權重、host_token、controller、移交 PIN、version
yupai_players        名單與累計統計
yupai_restrictions   黑名單 / 指定配對
yupai_matches        進行中與歷史場次
yupai_ops            單步撤銷快照（before_json）
```

手動跑：

```bash
export DATABASE_URL='postgresql://...'
npm run db:migrate
```

沒設 `DATABASE_URL` 時這個指令會印 skip 然後 exit 0，這是正常的。

---

## 常用指令

全部從 repo 根目錄執行。

```bash
npm install          # 安裝
npm run dev          # 開發，http://0.0.0.0:8080
npm run build        # 正式建置 +（若有 DATABASE_URL）migration
npm run typecheck    # tsc --noEmit
npm test             # scripts 單元測試 + 配對測試
npm run lint         # eslint
npm run db:migrate   # 只跑 migration
```

進階（多半給平台 QA，自架可忽略）：

```bash
npm run preview           # vite preview（loopback :8081）
npm run preview:restart   # 先殺掉舊的再起
```

`startup.sh` 是 Grok sandbox 復活用的，綁死 `/workspace`。你自己的機器請用 `npm run dev`。

---

## 部署到 Vercel

正式環境 **必須** 有 Postgres。Vercel serverless 每次冷啟動檔案系統是空的，PGLite fallback 在這裡等於「每次請求一塊新白板」。

### 1. 準備資料庫

1. Neon 開一個專案（建議跟 Vercel 同區，例如 `iad1` / `sfo1`）。
2. 複製 **pooled** URL。
3. 用 SQL editor 或本機 `DATABASE_URL=... npm run db:migrate` 先跑過一次也可以；不過 Vercel build 本來就會跑 `db:migrate`。

### 2. 匯入專案

[Vercel](https://vercel.com) → Add New → 連 GitHub → 選 `ken0618102000/dune-topaz-crystal-marble`。

建置設定（通常自動偵測，對一下即可）：

| 欄位 | 值 |
|---|---|
| Framework | Other / Vite（Nitro 會在 `vite build` 產出 Vercel 輸出） |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Node.js Version | **22.x**（Project Settings → General） |
| Output | 交給 Nitro `preset: "vercel"`，不要自己填 `dist` |

`vite.config.ts` 只在 `build` / `preview` 時掛 `nitro({ preset: "vercel", serverDir: "./server" })`。開發模式不會開 Nitro，避免佔第二個 port。

### 3. 環境變數

Vercel → Project → Settings → Environment Variables，三個環境（Production / Preview / Development）都加上：

```text
DATABASE_URL=postgresql://...sslmode=require
```

不要加 `VITE_AUTH_ENABLED`（build script 會從 app-env.json 寫入）。不要把 Neon 的 **unpooled / 直接連線** 誤貼成唯一 URL；serverless 請用 pooler。

### 4. 部署

Push `main` 或在 Vercel 按 Deploy。Build log 應看到：

```text
[migrate] applied 0002_yupai.sql
```

或：

```text
[migrate] up to date.
```

若看到 `[migrate] DATABASE_URL not set — skipping`，代表環境變數沒進 **Build** 環境——Vercel 要勾選 Available for Build。沒跑 migration 的話第一次請求會因缺表而爆。

### 5. 網域

用 Vercel 給的 `*.vercel.app` 即可。自訂網域在 Vercel 加好 DNS 就行，應用程式沒有寫死 hostname。

---

## 部署到其他 Node 主機

Nitro 的 Vercel preset 產出的是 Vercel 專用輸出，**不是** 隨處可跑的 `node server.js`。

若要在自己的 VPS / Docker：

1. 仍建議走 Vercel 或任何支援 Nitro `vercel` / `node` preset 的主機。
2. 若要改 Nitro preset，必須改 `vite.config.ts` 裡 `nitro({ preset: "vercel", serverDir: "./server" })`——改了之後 Grok 平台的 Home Screen 安裝頁可能失效，請自行評估。
3. 不管哪種 host：
   - 設 `DATABASE_URL`
   - 建置前或建置中跑 `npm run db:migrate`
   - process 要能跑 Node 22
   - 不要把 `host_token` 寫進前端公開設定

Reverse proxy（Caddy / nginx）請把 WebSocket 以外的一般 HTTPS 轉到應用；本專案輪詢是 HTTP POST server function，不需要 Socket.IO。

---

## 上線後檢查

部署完成不要只看 HTTP 200。依序做：

1. 開首頁，標題「羽排」看得到。
2. **開場** 建一個 1 面場的短場次。
3. 加兩名球員、標已到、按補順位再空場上場。場上應出現兩人與計時。
4. 手機另開 `/s/<code>/me`，選其中一人，狀態應跟著變（約 1.5 秒）。
5. 關掉分頁再打開同一個場次碼——資料還在（證明不是 PGLite）。
6. 用建立場次的同一瀏覽器才能拖名牌；無痕視窗只有只讀。
7. 報表頁能下載 CSV。

任一項失敗先看 Vercel Function log 與瀏覽器 console。

---

## 權限與安全

本專案 **沒有使用者帳號**。請用這個模型來部署，不要誤以為「沒登入就沒人改得到」。

| 秘密 | 存在哪 | 誰有 |
|---|---|---|
| 場次碼 | URL、口頭、群組 | 所有球友（只讀） |
| `host_token` | DB + 建立者瀏覽器 `localStorage` | 能改棋盤 |
| 裝置 id | `localStorage` 的 `yupai:device` | 分辨目前主控裝置 |
| 移交 PIN | DB，5 分鐘過期 | 知道 PIN 的人可拿走主控 |

實務建議：

- 場次碼可以貼群組；**不要把主控裝置借來借去還開著同一個瀏覽器 profile**。
- 要換平板：在舊裝置產生移交碼，新裝置輸入 6 碼（5 分鐘內，錯 5 次作廢）。接下後舊裝置的主控密鑰會失效。
- HTTPS 必備（Vercel 預設有）。HTTP 的 `localStorage` 與 cookie 行為在部分手機不可靠。
- 資料列沒有 `user_id`。知道場次碼等於能讀整份名單與戰績，不要把身分證字號、電話寫進暱稱。
- 正式環境務必設 `DATABASE_URL`。沒設的話每個 serverless instance 都是空棋盤，還可能寫進互不相通的記憶體 DB。
- CORS / CSRF：server function 與頁面同源；不要另外把 API 暴露成無驗證的公開 REST。

---

## 疑難排解

### `npm run dev` 立刻結束 / 打不開 8080

- 確認用的是 `npm run dev` 不是裸的 `vite`。
- 8080 被佔：`lsof -i :8080`（macOS / Linux）後殺掉舊 process。
- Node 不是 22：`node -v`。

### 首頁白畫面、console 出現 Failed to load module

多半是用錯伺服器在 serve 建置產物，或 base path 不對。開發請用 `npm run dev`。正式環境不要自己把 `dist` 當靜態站，Nitro 必須處理 SSR / server functions。

### 「找不到這個場次碼」但剛剛才開的

- 本機 PGLite：你重啟過 `npm run dev`，記憶體 DB 沒了。改接 Neon，或接受預覽資料是暫存。
- 正式環境：`DATABASE_URL` 沒進 runtime，每個 instance 各開各的 PGLite。去 Vercel 看 env 是否對 Production / Preview 都勾了。

### 示範看板開了但拖不動、不能補順位

目前瀏覽器沒有 `hostToken`。只有 **按下開場 / 示範的那台裝置** 會把 token 寫進 `localStorage`。其他裝置是只讀。要用另一台主控：走設定裡的移交 PIN。

### 按了動作跳出「看板已更新」

樂觀鎖衝突：另一台主控或另一個分頁先寫入。重整後再操作。同一時間只讓一台平板當主控。

### `npm run build` 在 migrate 失敗

- URL 是不是 pooled、`sslmode=require`
- Neon 是否允許這個 IP（Vercel build 出口 IP 不固定，Neon 預設通常允許）
- 同一個 DB 是否被舊版 schema 髒掉：進 Neon SQL editor `\dt` 看表；必要時在 **空的** 新 branch 重跑，不要在有正式場次的庫隨意 drop

### 型別檢查失敗

```bash
npm run typecheck
```

`tsconfig` 開了 `allowImportingTsExtensions`，新增檔請跟現有一樣用 `.ts` 後綴 import。

### 配對結果「怪怪的」

先看設定：公平 vs 強度、連續場數、強制休息、黑名單、禁止近敵。演算法測試：

```bash
npx --yes node --experimental-strip-types --test src/lib/yupai/matching.test.ts
```

或直接 `npm test`。

### 平台檔讓你困惑

下列可以當「不要碰」：

```text
AGENTS.md
.grok/
public/__grok/
scripts/grok-pwa-*.mjs
scripts/with-app-env.mjs
server/middleware/grok-pwa.ts
startup.sh
```

自架時它們大多無害。刪 `grokPwaPlugin()` 或 `serverDir: "./server"` 會讓正式建置的安裝頁 / OG 壞掉。

---

## 一份最短的上線清單

```text
[ ] Node 22
[ ] npm install 成功
[ ] npm run dev → 首頁與示範看板可用
[ ] Neon 專案 + pooled DATABASE_URL
[ ] npm run db:migrate 成功（本機對著 Neon 跑一次也行）
[ ] Vercel Node 22 + Build Command = npm run build
[ ] Vercel 三個環境都有 DATABASE_URL（含 Build）
[ ] 部署後開場 → 重開網址場次還在
[ ] 手機 /s/:code/me 只讀正常
[ ] 沒有把 .env 推進 git
```
