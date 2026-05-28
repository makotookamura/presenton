# フォーク固有カスタマイズ一覧

upstream (`presenton/presenton`) から定期的にマージするたびに、コンフリクト解消や再適用が必要な変更をまとめたドキュメント。

## 概要

- **upstream**: https://github.com/presenton/presenton.git
- **fork**: https://github.com/makotookamura/presenton
- **現在の作業ブランチ**: `feat/slide-to-html-via-litellm`

---

## 1. Slide-to-HTML 機能

### 対象ファイル
- `servers/fastapi/api/v1/ppt/endpoints/slide_to_html.py`
- `servers/fastapi/api/v1/ppt/router.py`

### 内容
OpenAI GPT Responses API を使ってスライドのHTMLを生成・変換するエンドポイント群。
upstream にはなく、マージ時にコンフリクト解消で失われることが多い。

**エンドポイント:**

| ルーター変数 | パス | 概要 |
|---|---|---|
| `SLIDE_TO_HTML_ROUTER` | `POST /slide-to-html` | スライドデータからHTMLを生成 |
| `HTML_TO_REACT_ROUTER` | `POST /html-to-react` | HTMLをReactコンポーネントに変換 |
| `HTML_EDIT_ROUTER` | `POST /html-edit` | 画像付きでHTMLを編集 |

**Pydanticモデル:**
- `SlideToHtmlRequest` / `SlideToHtmlResponse`
- `HtmlToReactRequest` / `HtmlToReactResponse`
- `HtmlEditResponse`

### マージ後にやること
1. `slide_to_html.py` のインポート・ルーター定義・Pydanticモデルが残っているか確認
2. `router.py` に以下を追加（消えていることが多い）:
   ```python
   from api.v1.ppt.endpoints.slide_to_html import (
       SLIDE_TO_HTML_ROUTER, HTML_TO_REACT_ROUTER, HTML_EDIT_ROUTER
   )
   API_V1_PPT_ROUTER.include_router(SLIDE_TO_HTML_ROUTER)
   API_V1_PPT_ROUTER.include_router(HTML_TO_REACT_ROUTER)
   API_V1_PPT_ROUTER.include_router(HTML_EDIT_ROUTER)
   ```

---

## 2. フォント処理の強化（日本語対応）

### 対象ファイル
- `servers/fastapi/api/v1/ppt/endpoints/fonts.py`
- `servers/fastapi/templates/preview.py`

### 内容

#### 2-1. TTC フォントの .ttf 自動展開
`.ttc`（フォントコレクション）ファイルをアップロードすると、fontTools で個別の `.ttf` に展開する。  
ブラウザは `.ttc` を `@font-face` で読み込めないため必須。

```python
# fonts.py: アップロード時に TTC を TTF に展開
# preview.py: LibreOffice プレビュー生成時にも同様に処理
```

#### 2-2. PPTXフォント名の自動エイリアス
PPTXに埋め込まれたフォント名が、サーバーにインストールされているフォント名と一致しない場合（例: "Yu Gothic UI" → "Yu Gothic"）、fontconfig のエイリアスで自動マッピングする。

関連関数:
- `_build_font_alias_map()` — プレフィックス/部分文字列マッチでエイリアスマップを構築
- `_create_font_alias_config()` — fontconfig XML を生成
- `_install_fonts()` — `/usr/share/fonts/truetype/` にコピーして `fc-cache` 実行

LibreOffice 起動時に `FONTCONFIG_FILE` 環境変数で渡す。

### マージ後にやること
- `fonts.py` と `preview.py` の TTC 展開コード（`fontTools` 使用部分）が残っているか確認
- `_build_font_alias_map`、`_create_font_alias_config`、`_install_fonts` 関数が残っているか確認

---

## 3. インラインMarkdown対応（スライドテキスト）

### 対象ファイル
- `servers/nextjs/utils/inlineMarkdown.ts`（新規追加ファイル）
- スライドテンプレート各種（30ファイル以上）

### 内容
`**bold**` や `_italic_` をHTMLタグ（`<strong>` / `<em>`）に変換するユーティリティ関数 `inlineMarkdownToHtml()` を追加。

スライドのdescription/body/paragraphフィールドに適用済み。

**適用対象テンプレート（抜粋）:**
- ChartPrimitives系: `GeneralChartPrimitives`, `ModernChartPrimitives`, `NeoChartPrimitives` など
- レイアウト系: `IntroSlideLayout`, `HeadingBulletImageDescriptionLayout` など
- テーマ系: Education, ProductOverview, Report, standard, neo-*, pitch-deck, swift

### マージ後にやること
- `inlineMarkdown.ts` が残っているか確認
- upstream で新規テンプレートが追加された場合、`inlineMarkdownToHtml()` を description/body 系フィールドに適用する

---

## 4. チャートの日本語フォント対応

### 対象ファイル
- 全 `ChartPrimitives` ファイル（9ファイル）
- `servers/nextjs/app/layout.tsx`
- `servers/nextjs/app/(presentation-generator)/(dashboard)/theme/components/ThemePanel/constants.ts`

### 内容
Chart.js でのフォント指定に `"Noto Sans JP"` をフォールバックとして追加することで、チャート内の日本語文字化けを防ぐ。

`layout.tsx` でグローバルに Noto Sans JP をロード済み。  
`edge-yellow` テーマのデフォルトフォントを Playfair Display → Noto Sans JP に変更済み。

### マージ後にやること
- upstream で新しい `ChartPrimitives` ファイルが追加された場合、`"Noto Sans JP"` フォールバックを追加する
- `layout.tsx` の Noto Sans JP グローバルロードが残っているか確認
- `constants.ts` の edge-yellow フォント設定が上書きされていないか確認

---

## マージ作業チェックリスト

upstream (`upstream/main`) をマージするたびに以下を確認・修正:

```
[ ] slide_to_html.py — ルーター・モデル・関数の定義が残っているか
[ ] router.py — 3つのルーター (SLIDE_TO_HTML_ROUTER 等) が include されているか
[ ] fonts.py — TTC→TTF展開コードが残っているか
[ ] preview.py — TTC展開・フォントエイリアス関連関数が残っているか
[ ] inlineMarkdown.ts — ファイルが存在するか
[ ] 新規テンプレート — inlineMarkdownToHtml 適用が必要か
[ ] 新規ChartPrimitives — Noto Sans JP フォールバック追加が必要か
[ ] layout.tsx — Noto Sans JP グローバルロードが残っているか
[ ] constants.ts — edge-yellow テーマフォント設定が正しいか
```
