# めざましリレー (Mezamashi Relay) — プロトタイプ

このリポジトリは PWA ベースの起床リレーアプリの最小プロトタイプです。

主な特徴（MVP）
- Vite + React (TypeScript) のフロントエンド
- Firebase Authentication (Email/Google) の雛形
- PWA マニフェストとシンプルな Service Worker
- BLE/NFC の受信はスタブ実装（ダミーイベントで動作確認可）

セットアップ
1. Node.js (推奨 18+) をインストール
2. 依存関係をインストール:

```powershell
npm install
```

3. Firebase のプロジェクトを作成し、Web SDK の設定値を `src/services/auth.tsx` の `firebaseConfig` に貼り付けてください。
   - Firebase Authentication を有効化（Email/Password、Google）
   - Firestore を作成（必要に応じてルール調整）

4. 開発サーバ起動:

```powershell
npm run dev
```

デプロイ
- Vercel や Netlify にデプロイできます。ビルドコマンドは `npm run build`、公開ディレクトリは `dist` です。

BLE タグ (ESP32C3 + MPU6050)
- `arduino/mezamashi_tag/mezamashi_tag.ino` を参照してください（サンプルコードを含む）。

次のステップ
- ミッション CRUD、セッション開始・完了ロジックを実装
- グループ機能（招待リンク／コード）を実装
- Web Bluetooth / Web NFC のフックを実装

