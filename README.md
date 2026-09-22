# 霧谷傳說 Mistvale

瀏覽器可玩的黑暗奇幻角色扮演遊戲，介面為繁體中文。

在迷霧籠罩的山谷中建立冒險者、接下村莊公佈欄任務、探索四個區域、馴服魔物，並在祭壇面對最終之敵。

## 遊玩

- **GitHub Pages（可安裝 PWA）**：https://victorchen0326.github.io/mistvale/
- 手機瀏覽器打開後，可「加到主畫面」當成 App 使用
- 若要做成 Android APK：把上面網址貼到 [PWABuilder](https://www.pwabuilder.com) → Generate Android package → 下載 zip 裡的 `.apk`
- 原始碼：https://github.com/victorchen0326/mistvale

存檔存在瀏覽器本機，換裝置或解除安裝後不會自動帶過去。APK 只是鎖住這個網址的殼；之後網站更新，多數情況不用重包。

PWABuilder 若要去掉 Chrome 網址列，還需要把套件裡的 `assetlinks.json` 放到網站網域根目錄。GitHub Pages 專案站在 `/mistvale/` 底下，這一步要另做網域驗證。沒做也能玩，只是殼子上方可能還看得到網址。

## 遊戲特色

- 三種職業：戰士、法師、遊俠，各有獨立技能樹
- 回合制戰鬥，含攻擊軌跡與技能特效
- 區域狩獵：探索累積線索、發現巢穴、擊敗巢穴首領才能取得關鍵結晶
- 角色與區域魔物會隨等級成長；最終頭目固定 50 級
- 秘銀之後解鎖職業傳說武器（需三顆結晶與清輝靈枝）
- 隨時存檔／讀檔，標題畫面可「繼續冒險」

## 如何開始

1. 標題畫面選 **新的冒險**，建立角色
2. 在迷霧村莊找長者、看公佈欄接任務
3. 用地圖前往迷霧森林、礦洞、荒廢神殿與終焉祭壇
4. 探索累積線索後潛入巢穴；回村莊休息、商店、回報任務
5. 等級 40 且發現最終巢穴後，鍛造傳說武器，挑戰霧谷之龍

## 本機執行（開發者）

```bash
npm install
npm run dev
```

靜態 PWA（GitHub Pages）建置：

```bash
npm run build:pages
```
