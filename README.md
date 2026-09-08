# NAIA 2.0 — 日本語UI版

[DNT-LAB/NAIA2.0](https://github.com/DNT-LAB/NAIA2.0) の日本語UIフォークです。[韓国語のREADME（原文）](README.ko.md)も保存しています。

## このフォークの日本語化について

- UIの既定言語は日本語です。言語選択から韓国語に切り替えられます。韓国語の原文は上書きしていません。
- タグ説明10,705件をPapago Webで再翻訳し、一部を個別に補正しました。それ以外の既存UI訳3,290件は保持しています。**全件の意味校閲は未完了**です。
- このフォークの日本語版Portableビルドは、まだ配布・検証していません。以下のPortable配布、署名、Defenderスキャン、ハッシュの説明は、**上流の配布物についての説明**です。

---

Headless Remote Webを中心としたAI画像生成アプリです。**NovelAI / Stable Diffusion WebUI / ComfyUI**のバックエンドに対応しています。

ブラウザーから利用するRemote Web UIが基本の実行形態です。デスクトップGUI（PyQt6）は現行ソースから削除されています（必要な場合はgit履歴を参照してください）。

## 使い方 — 3つの方法

### A. Pythonで直接実行（cloneして使う方向け・ブラウザーモード）

ソースをcloneして実行します。Python **3.10～3.12**に対応しています（3.13以降は未対応、3.12推奨）。

```bash
pip install -r requirements-headless.txt
python NAIA_web_headless.py
```

Windowsでは`run_NAIA_web.bat`、macOSでは`run_NAIA_web.command`でも起動できます。
起動後に表示されるローカルアドレスをブラウザーで開いてください。

### B. ソースからElectronデスクトップシェルを起動（clone + Node.js）

Aと同じPythonバックエンドをElectronのデスクトップウィンドウで実行します。
Danbooruの埋め込みビューなど、シェル専用の機能も利用できます。
Python **3.10～3.12**（3.13以降は未対応）と**Node.js 18以降**が必要です。
ランチャーが`py`ランチャー経由でインストール済みの3.12を自動検出するため、PATHの既定Pythonが3.13以降でも構いません。

```bash
# Windows
run_NAIA_electron.bat
# macOS
./run_NAIA_electron.command
```

ランチャーはvenvの作成 → `pip install -r requirements-headless.txt` → `app/electron`で
`npm ci`（初回のみ）→ `npm start`を自動実行します。
手動で行う場合は、上記Aのvenvをセットアップした後、`cd app/electron && npm ci && npm start`を実行してください。

- 初回起動時にタグ検索データ（約1.4GB）のインストール画面が表示されます（Portableビルドと同じ流れです）。
- user-dataは既定でA（ブラウザーモード）と**共有**されます（Windows: `%APPDATA%\NAIA`）。Aで使っていた設定・トークン・保存データをそのまま引き継ぎます。

### C. Portableアプリ（上流のReleaseを利用する場合）

Pythonをインストールせずに使いたい場合は、[上流のReleases](https://github.com/DNT-LAB/NAIA2.0/releases)から`NAIA-Portable.zip`を入手できます。
PythonランタイムとElectronシェルを同梱しており、展開するだけで起動できます。
**リンク先は上流の配布物であり、このフォークの日本語化を含むビルドではありません。日本語版Portableは未配布です。**

```powershell
# 整合性の検証（推奨）
Get-FileHash .\NAIA-Portable.zip -Algorithm SHA256
Get-Content  .\SHA256SUMS.txt
```

> 上流READMEによると、このPortableビルドは署名のないベータ版です。初回起動時にWindows SmartScreenの警告が表示されることがあります。
> 上流の配布物はローカルのMicrosoft Defenderスキャンを通過しており、`SHA256SUMS.txt`で検証できます。
> これは上流の配布物についての記載で、このフォークの配布・検証実績を示すものではありません。

更新: A/B（ソース）のランチャーは起動時に新しいコミットを自動確認し、`git pull`を提案します。
上流のPortable（C）はアプリ内更新（ダウンロード・検証・再起動）に対応しています。

---

## リポジトリ構成 — ランタイムと開発・リリース用の仕組み

cloneすると、実行に必要なソース**だけでなく**、メンテナー向けのビルド・リリース用のファイルも取得されます。
**実行するだけ**なら、下表の「ランタイム」だけ把握すれば十分です。それ以外は無視して構いません。

| 区分 | ディレクトリ | 用途 |
|------|----------|------|
| **ランタイム**（実行に必要） | `core/` `app/backend/` `app/web/` `interfaces/` `utils/` `data/` `workflows/` `NAIA_web_headless.py` `requirements-headless.txt` | cloneしてそのまま実行 |
| **Electronシェル**（任意） | `app/electron/` | B（ソースからのElectron起動）とPortableビルドで使用。A（ブラウザーモード）には不要 |
| **開発・リリース用の仕組み**（メンテナー専用） | `tools/` `tests/` `release_assets/` `docs/` | ゲート検証・パッケージ化・リリースビルド。実行には不要 |

- ランタイムと開発専用ファイルの区分を定める**正式な定義**は、[`release_assets/manifests/release_include_exclude_draft.json`](release_assets/manifests/release_include_exclude_draft.json)です。Portable Releaseパッケージはこのマニフェストに従って**ランタイムのみ**を収録し、`tools/`・`tests/`・`docs/`などは除外します。
- 開発に貢献する場合は、`tests/`（テスト）と`tools/`（ビルド・ゲート）が必要です。

---

## 🧩 Extensions（ユーザー拡張）— 実験的機能

NAIAの**本体コードを変更せずに**、Pythonで機能を追加する公式の方法です。
拡張はuser-data内に置くため、**アプリを更新してもそのまま残ります**。

> ⚠️ **信頼性に関する警告**: 拡張はNAIAと同じプロセスで実行される任意のPythonコードであり、サンドボックスはありません。
> 生成パイプラインやAPIトークンなどの認証情報にアクセスできるため、**作者を信頼できる拡張だけ**をインストールしてください。

### インストール先

```
<user-data>/extensions/<拡張-id>/
├── extension.json    # マニフェスト（必須）
├── main.py           # エントリーポイント — register(ctx)関数を公開（必須）
└── settings.json     # 拡張ごとの設定（任意）
```

`<user-data>`の場所: ソース実行（A/B）はWindowsの`%APPDATA%\NAIA`、Portable（C）は`<インストール先>\user-data`です。
バックエンドを一度起動すると、`extensions/`フォルダーが自動作成されます。

### 操作ガイド — Settings ▸ Extension

拡張の管理は、右側のタブバーの**⚙ Settings**タブから行います。左側のカテゴリで**Extension**を選択してください。
Globalは今後追加する全体設定のための場所です。

**1）インストール**: 上記の`extensions/`フォルダーに拡張フォルダーを入れ、Settings ▸ Extensionを開くと、すぐに「未承認」と表示されます。
この段階で読み込むのはマニフェストのみで、**拡張のコードは1行も実行されません**。

**2）有効化（初回承認）**: トグルをクリック → 信頼性の警告を確認して「信頼して有効化」を選択すると、**再起動せず、その場で読み込まれます**。

**3）オン・オフ — 2段階**: どちらも即時反映され、オフにするとイベント・フック・enqueueが無効になりますが、表示の扱いが異なります。

- **Settingsのトグル（この画面）**: オフにすると動作が停止し、**メインUIのクイックボタンも非表示**になります。再びオンにできるのもこの画面だけです。
- **クイックポップアップの「Activate This Script」**: **動作だけ**を切り替えます。オフでもボタンは薄く表示されたまま残り、設定も編集できます。設定を準備しておき、必要なときだけ動かすための切替です。Settingsの行には「有効・動作OFF」のチップが表示されます。

**4）クイックボタンの位置**: 有効な拡張は、行の「クイックボタンの位置」でメインUIの配置場所を選べます。
**ツールバー（Tools）**（TOOLS & ASSISTANTSの下・既定値）／**自動化・高度な機能**（ランチャーのカテゴリメニュー内）／**なし**から選択します。
ボタンを押すと、その拡張の**クイックポップアップ**が開きます。内容は`Activate This Script`スイッチと、拡張が宣言した設定フォーム（後述の`register_panel`）です。設定は保存するとすぐに`settings.json`へ反映されます。

> **表示範囲のルール**: Settings ▸ Extensionの行では、拡張の**全体設定**（オン・オフ、ボタン位置、ブロック、および保存先などの`scope:"global"`フィールド）だけを扱います。
> **実際の動作設定**（`scope:"module"`・既定値）はクイックボタンのポップアップだけに表示されます。2つの画面は互いの設定領域を扱いません。

**5）ブロック（hard）**: ⋯メニューでブロックすると、次回起動からimportそのものを禁止します。
拡張コードの更新を反映する場合も再起動が必要です（Pythonでは安全な再読み込みができないため）。

**6）エラーからの復旧**: エラーのある拡張には赤いチップと理由が表示されます。修正後に**再試行**ボタンを押すと、その場で再読み込みできます。

> 既存ユーザー向け: この機能の導入後、初回起動時にすでにインストールされている拡張は自動承認されます（1回だけトーストで案内）。その後に新しくインストールする拡張から承認手順が適用されます。

**Seed Fan-outで試す**: サンプルをインストールすると、ツールバーに`🧩 Seed Fan-out`ボタンが表示されます。
次の2つのモードがあります。設定は**次の生成から**適用されます。

- **Seed Fan-out**: Generateを1回押すと、同じプロンプトのリクエストが、原本を含めて指定した**生成数**だけキューに追加されます。シード方式は`random`／`+1`／`-1`／`fixed`です。`fixed`はすべて原本と同じシードを使い、入力欄のワイルドカードによる変化の比較に使えます。
- **X/Y Plot**: モードを切り替えると、ポップアップ右側にX/Y軸の設定が開きます。軸の**種類**を選ぶと対応する入力欄が表示されます。
  - `CFG Scale`・`PG.Rescale`: 値の範囲を「開始,終了,間隔」で指定します。例: `5,7,1`なら5・6・7の3値で3枚です。
  - `Sampler`: **現在のモードのサンプラー一覧からチェックで選択**します。選択数が生成数になります。
  - `プロンプト強調`: **元のプロンプト**（完全一致・カンマを含めても可）と、開始・ステップ・終了の**重み3欄**を指定します。すべて必須です。構文はモードに応じて自動選択され、NAI（NAID4/4.5）では`w::元のプロンプト::`、WEBUI/ComfyUIでは`(元のプロンプト:w)`になります。
  - `プロンプトスワップ`: **3列目が開き**、［開始プロンプト］＋［Step nの置換プロンプト］＋［追加 +］のビルダーで設定します。1ステップにつき1枚生成します。
  - 開始プロンプト／元のプロンプトがプロンプト欄にない場合は、**トーストで案内して中止**します。2軸を組み合わせると、Generateを1回押すだけでグリッド全体が**同じシード**でキューに追加されます（上限32枚）。**元のリクエストは自動キャンセルされ、グリッドの枚数だけが生成されます。**
  - **グリッド合成保存**（既定でON）を有効にすると、全セルの完了時に、軸タイトルと値ラベル付きの**n×m合成PNG**が保存先の`grid/`以下に作成されます。「Gridフォルダーを開く」ボタンで直接開けます。有効な拡張があると「自動化／高度な機能」の見出しに薄いオレンジ色の**E{n}**チップが表示され、ホバーすると有効な拡張の一覧を確認できます。
- 共通の**キャラクタープロンプト固定**（NAI）: オンにすると、原本を含む一連の生成で、その時点で1回だけ展開したキャラクターのスナップショットを共有します（キャラクターワイルドカードの再抽選を防止）。Seed Fan-outでは原本をキャンセルして置き換え、合計N枚すべてを同じキャラクターにします。

### extension.json

```json
{
  "id": "my_extension",
  "name": "My Extension",
  "version": "1.0.0",
  "naia_ext_api": 1,
  "entry": "main.py",
  "description": "パネルに表示する1行の説明（任意）",
  "homepage": "https://...（任意。パネルにリンクを表示。source_urlは将来の更新確認用に予約）",
  "python": {
    "requirements": ["rapidfuzz>=3.9", "orjson"],
    "max_install_mb": 200
  }
}
```

`naia_ext_api`は、ホストが対応する拡張APIのバージョン（現在は`1`）と一致する必要があります。
一致しない場合は該当する拡張だけが無効になり、アプリ本体は正常に起動します。

**インストール方法は2つあります**:

1. フォルダー（`<id>/extension.json + main.py`）を`<user-data>/extensions/`へコピーします。
2. **GitHub URL**: Settings ▸ Extensionの上部に`https://github.com/owner/repo`を入力し、「GitHubからインストール」を選択します（gitは不要で、zipをダウンロードします）。この操作は**ファイルの配置まで**で、一覧には「未承認」と表示されます。自分で承認するまでコードは実行されません（同意に基づく仕組み）。

**依存関係（`python.requirements`）のポリシー**: SSOT（単一の正しい情報源）を守るため、意図的に制限しています。
`requirements`に指定できるのは、`["rapidfuzz>=3.9", "orjson"]`のような**PyPIパッケージの仕様を表す文字列の配列**だけです。直接URL・パス・`-r`・オプションは指定できません。

| 条件 | 動作 |
|---|---|
| 本体がすでに持つパッケージ（numpy・Pillow・scipyなど） | **再利用**（インストールせず、単一の供給元を維持） |
| 本体にない**軽量な純Python／wheelパッケージ** | 拡張フォルダー内の`.deps/`に**分離してインストール**（本体環境を変更しない） |
| 本体にあるパッケージの**別バージョン**を要求 | **拒否**（本体のバージョンを変えず、安全側に閉じるfail-closed方式） |
| **重いMLパッケージ**（torch・tensorflow・onnxruntime-gpu・transformers・nvidia-*など） | **拒否**。推論はComfyUIなどのバックエンドに委譲 |
| **推移的依存関係**から重いMLパッケージや競合バージョンが導入される | **拒否**。インストール前に`pip --dry-run`で解決後の依存関係全体を検証 |
| **ソースビルド／URL・VCS・ローカルパス／`name @ url`** | **拒否**。ビルド済みwheelのみ許可（`--only-binary=:all:`） |
| `.deps`の合計容量が上限を超える（既定300MB・絶対上限800MB） | **拒否** |

依存関係は**承認時に自動インストール**されます。信頼性の警告に一覧を表示し、分離先の`.deps/`へ導入します。
検証対象は直接指定した仕様だけでなく、**推移的依存関係も含みます**。たとえば`sentence-transformers`のように一見軽量でも、`torch`を必要とするものは拒否します。
`onnxruntime`（CPU）・rapidfuzz・orjsonのような軽量なユーティリティや推論は利用できますが、torch級の重いMLを同一プロセスで動かすことは、ディスク容量・ABI競合・SSOTの観点から禁止しています。こうした推論はComfyUIノードなどの**外部バックエンドの役割**です。
`.deps`は`sys.modules`がプロセス全体で共有される制約上、ファイルの分離であって完全なモジュール分離ではありません。同じパッケージの異なるバージョンを使う2つの拡張では、先に読み込まれた側が優先されます。本体との競合は上記のとおりブロックします。

### main.py — 最小構成の例

```python
def register(ctx):
    # 1) 生成リクエストを購読（キューに入るすべての生成）
    ctx.subscribe("generation_request_dispatched", on_dispatched)

    # 2) プロンプトパイプラインのフック（プロンプトを直接変更）
    ctx.register_hook(MyHook())

    ctx.log("loaded!")   # コンソールに [ext:my_extension] loaded! と表示

def on_dispatched(info):
    if info.get("ext_origin"):       # 拡張による派生リクエストは無視（無限再帰を防止）
        return
    seed = info["params"]["seed"]    # params = 読み取り専用スナップショット
    # 追加の生成をキューに登録:
    # ctx.enqueue_generation(prompt=..., overrides={"seed": seed + 1})

class MyHook:
    def get_pipeline_hook_info(self):
        # hook_point: pre_processing | post_processing | after_wildcard | final_hookpoint
        return {"target_pipeline": "PromptProcessor", "hook_point": "final_hookpoint", "priority": 100}
    def execute_pipeline_hook(self, context):
        context.postfix_tags.append("masterpiece")   # タグを変更
        return context                               # 必ずcontextを返す
```

### ExtensionContext API（naia_ext_api = 1）

`register(ctx)`に渡される`ctx`の公開メソッドだけが、**公式に提供されるインターフェース**です。
それ以外の内部モジュールのimportは、動作しても次のリリースで使えなくなる可能性があります。

| メソッド | 説明 |
|--------|------|
| `ctx.subscribe(event, fn)` / `ctx.unsubscribe(event, fn)` | イベントの購読／解除。コールバックの例外は他へ波及しないよう隔離され、5回連続で失敗すると自動的にミュートされます。 |
| `ctx.register_hook(hook)` | プロンプトパイプラインのフックを登録。priorityが100未満の場合は100に引き上げます（0～99はコア用の予約範囲）。 |
| `ctx.register_panel(fields=[...], title=, on_action=)` | **宣言的な設定フォーム**を表示します（JS不要）。field: `{key, type: bool/int/float/select/multiselect/text/tags/list/action, label, default, min/max/step, options, help, placeholder, section, order, apply: immediate/next-generation/restart-required, scope: module/global, column: left/right/extra, visible_when: {field, in: [...]}}`。**scopeで表示場所が決まります**。`"module"`（既定）はクイックボタンのポップアップ、`"global"`はSettingsの行です。`column:"right"`のフィールドが表示されると**2列**、`"extra"`が表示されると**3列**に展開します。`visible_when`は段階的な条件付き表示です。`type:"multiselect"`はチェック式チップの複数選択（値は文字列配列、選択肢にない値は除外）。`type:"list"`は動的な行ビルダー（［追加 +］／×、値は文字列配列）。`type:"action"`はボタンで、クリックすると`on_action(key)`を呼びます（設定は保存せず、例外は隔離）。再呼び出しでフォームを置き換えます（モード切替時の選択肢更新など）。値は`settings.json`に保存・復元されます。 |
| `ctx.show_toast(message, level="info")` | 接続中のすべてのWebクライアントにトーストを表示します（info/success/warning/error）。検証失敗の案内など、ユーザーへのフィードバック用です。ブリッジ経路: バックエンドの`extension_toast`イベント → WSの`{type:"toast"}`。 |
| `ctx.get_api_mode()` | 現在のAPIモード（"NAI"/"WEBUI"/"COMFYUI"）を取得します。サンプラー一覧など、モード別の選択肢を構成するために使います。 |
| `ctx.resolve_nai_characters()` | 現在のNAIキャラクター設定を、ワイルドカードを含めて**その場で1回展開**したスナップショット`{characters, uc, character_positions}`、またはNoneを返します。overridesに渡すと、そのリクエストは遅延バインディング（画像ごとの再展開）ではなくスナップショットを使用します。一連のバリエーション生成でキャラクターを固定するための機能です。 |
| `ctx.enqueue_generation(prompt=, negative_prompt=, api_mode=, prompt_run_id=, priority=, overrides=, allow_chain=False)` | 生成リクエストをキューに追加し、`{ok, request_id, message}`を返します。派生リクエストには`ext_origin`とチェーンの深さが付きます。**拡張由来の派生イベントを処理している間の呼び出しは既定で禁止**します（拡張間の無限連鎖を防止。意図的に連鎖させる場合は`allow_chain=True`）。ただしチェーンの深さが4を超える場合は、`allow_chain`に関係なく拒否します。 |
| `ctx.start_generation_queue()` | **キューの消費ループを起動・再開**し、`{ok, message}`を返します。`enqueue_generation()`は**追加するだけ**でループを起こしません（ループはキューが空になると終了します）。そのためフックやイベントコールバックではなく、**パネルのactionボタンなど生成フローの外から**追加した場合は、これを呼んで処理待ちのままにならないようにしてください。すでに動作中なら何もしません（冪等）。`ok=False`は、接続クライアントやブリッジがなく、**何も開始されなかった**という意味です。成功したものとして扱うと、拡張が届かない結果を待ち続けます。 |
| `ctx.request_confirmation(message, title=, confirm_action=, cancel_action=, confirm_label=, cancel_label=)` | ユーザー確認ダイアログを表示します。戻り値は**表示できたかどうか**であり、回答ではありません。⚠️ 回答を待機しないでください（ブロックするとイベントループが停止します）。選択結果は`register_panel(on_action=)`へ返され、`confirm_action`／`cancel_action`に指定した**フィールドキー**がそのまま渡されます。そのため両方のキーをパネルに`type:"action"`として**宣言する必要があります**。`visible_when`で非表示にすると、ボタンを表示せず応答だけ受け取れます。複数枚生成などコストの高い処理の前に同意を得るための機能です。`False`は拡張がオフの場合。送信できない場合（接続先0件／ブリッジなし）は`RuntimeError`です。 |
| `ctx.cancel_generation(request_id)` | **待機中（pending）**の生成リクエストをキューから除き、`{ok, skip_scheduled, message}`を返します。`ok=True`は削除確定です。消費ループが先に取得する競合によってキューにない場合は、**実行前にスキップするための記録（トゥームストーン）**を予約して`skip_scheduled=True`にします。呼び出し側ではokとほぼ同様に扱えますが、すでに実行が始まっているマイクロ秒単位の隙間だけは例外です。両方ともFalseなら原本がそのまま生成されます。用途例: X/Y Plotの「グリッドだけ生成」。 |
| `ctx.get_result_image(request_id)` | 完了したリクエストの画像を取得し、`{ok, image(PILコピー), file_path, message}`を返します。`generation_result_available`コールバックで、イベントのrequest_idを使って呼び出します。保存は非同期のため保存先が`""`の場合もありますが、画像は必ずメモリ上にあります。用途例: X/Yグリッドの合成。 |
| `ctx.get_save_directory()` | 現在のセッションの自動保存ディレクトリのパス（str）を取得します。グリッドPNGなどの拡張の出力を、ユーザーの保存フォルダーに隣接して配置するために使います。 |
| `ctx.load_settings(defaults)` / `ctx.save_settings(dict)` | `settings.json`の読み込み（defaultsを統合）／書き込み。saveは**情報を失わず保存できたか**をboolで返します。シリアライズできない値はrepr文字列へ変換して記録し、Falseを返します（元の値への復元は保証しません）。 |
| `ctx.log(msg)` | `[ext:<id>]`接頭辞付きのコンソールログを出力します。 |
| `ctx.ext_id` `ctx.name` `ctx.version` `ctx.ext_dir` `ctx.api_version` | 識別情報・パス。 |

**公式イベント（v1）**:

| イベント | ペイロード | タイミング |
|--------|----------|------|
| `generation_request_dispatched` | `request_id`, `prompt_run_id`, `api_mode`, `priority`, `source`（コマンドのtype。メインのGenerateボタンは`"generate"`）, `ext_origin`（拡張由来の派生リクエストなら、その拡張id）, `ext_chain_depth`（派生チェーンの深さ。ユーザーリクエストは0）, `params`（認証情報・内部キーを除く**安全なコピー**。変更しても実際のリクエストには反映されません） | 生成リクエストがキューに入るとき |
| `generation_result_available` | `request_id`, `prompt_run_id`, `api_mode`, `ext_origin`, `ext_chain_depth`（dispatchedと同じ派生関係情報） | 1枚の生成・保存が完了したとき |
| `prompt_generated` | PromptContext | ランダムプロンプトのパイプライン完了時 |

それ以外のイベントも受信できますが、名前やペイロードの安定性は保証しません。

### 拡張でできること・できないこと（機能の境界 — エージェント向けリファレンス）

> 拡張は通常、ClaudeやCodexなどの**コーディングエージェント**がこの文書を読んで作成します。
> そのため以下では、**「何をしたいとき、何を使うか（意図 → API）」**と、**「何が構造上できず、ホストがどう制約するか」**を対応表で示します。
> NAIAは軽量な**オーケストレーター**であり、生成やMLはNovelAI/WEBUI/ComfyUIのバックエンドへ委譲します。拡張は「生成を組み合わせて加工する」ものであり、「生成エンジンになる」ものではありません。

#### ✅ できること — 意図 → API

| したいこと | 使用するAPI | 主な制約 |
|---|---|---|
| プロンプトを変更する | `register_hook` + `execute_pipeline_hook(context)` | `context.{prefix,main,postfix}_tags`・`final_prompt`を変更後、**`context`を返す**。`hook_point ∈ {pre_processing, post_processing, after_wildcard, final_hookpoint}`、`priority ≥ 100` |
| バリエーションや追加画像を生成する | `enqueue_generation(prompt=, overrides={...})` | 派生イベント処理中の呼び出しは**禁止**（再帰ガード）。意図した連鎖だけ`allow_chain=True`、深さは4以下 |
| 待機中のリクエストをキャンセルする | `cancel_generation(request_id)` | `pending`のみ。競合時は`skip_scheduled`のトゥームストーン。用途例: X/Yの「グリッドだけ生成」 |
| 完成画像を加工・合成する | `get_result_image(request_id)` → PILコピー | `generation_result_available`コールバックで取得。保存先は`get_save_directory()`以下 |
| 設定画面を作る | `register_panel(fields=[...])` | 宣言的（JS不要）。`scope:"module"`はクイックポップアップ、`"global"`はSettingsの行 |
| ユーザーに通知する | `show_toast(msg, level)` | `info/success/warning/error` |
| 独自の状態を保存する | `load_settings` / `save_settings` | `settings.json`に保存・復元 |
| 一連のバリエーションのキャラクターを固定する | `resolve_nai_characters()` | NAIキャラクターをその場で1回展開したスナップショット |
| 軽量ライブラリを使う | manifestの`python.requirements` | wheelのみ、`.deps`に分離（上記の依存関係ポリシーを参照） |

#### ❌ できないこと — ホストが強制する不変条件（回避は不可）

| できないこと | ホストによる制約 | 代わりの方法 |
|---|---|---|
| 生成エンジンの置き換え／実際のAPI呼び出しの改変 | エンジン呼び出しはNAIAが管理。`params`は**読み取り専用の安全なコピー** | `overrides`やプロンプトフックで調整 |
| APIトークン・認証情報の読み取り | トークン・キー・内部識別子は`params`から**除去** | 不可。設計上公開しない |
| 重いMLを同一プロセスで実行（torchなど） | 拒否リストと、**推移的依存関係まで含めた**`pip --dry-run`検証 | ComfyUIのタグ付けノードなどのバックエンドへ委譲し、結果だけを受け取る |
| 本体パッケージのバージョン変更 | 本体のパッケージで要件を満たす場合は再利用し、別バージョンの要求は拒否 | 本体のバージョンに合わせるか、独自ロジックに置き換える |
| ソースビルド／URL・VCS・ローカルパスからのインストール | `--only-binary=:all:`と`name @ url`直接参照の拒否 | PyPIにあるwheelだけを使用 |
| コア内部の変更／他の拡張への干渉 | 公式なのは`ctx`のインターフェースだけで、拡張同士は隔離 | `ctx`の公開メソッドだけを使用 |

> **`ctx`の外にある内部モジュールのimport**（例: `from core... import ...`）は、動作しても**非公式**であり、リリースごとに使えなくなる可能性があります。
> 公式の契約は、`register(ctx)`で受け取る`ctx`の公開メソッドだけです（`naia_ext_api=1`）。
>
> 日本語版補足: 上の「できないこと」は、公式APIが公開しない情報・操作や、依存関係のインストール制約の説明です。冒頭の警告どおり、任意のPythonコードそのものを安全に隔離するサンドボックスではありません。APIで認証情報を公開しないことを、悪意ある拡張から認証情報を保護できるという保証として扱わないでください。

#### ⚠️ 実装時のルール（違反すると不具合につながります）— エージェント用チェックリスト

- **無限ループを防止**: `generation_request_dispatched`コールバックの先頭で`if info.get("ext_origin"): return`を実行し、自分が作った派生リクエストを再処理しないようにします。
- **`params`は読み取り専用スナップショット**: 直接変更しても実際の生成には反映されません。プロンプトは**フック**で、パラメーターは`enqueue_generation(overrides=...)`で変更します。
- **フックは必ず`context`を返します**。コア予約範囲の優先度（0～99）は100へ引き上げられます。
- **コールバックの例外は隔離**されますが、**5回連続で失敗すると自動的にミュート**されます。無言で停止せず、`show_toast`／`log`で通知してください。
- **重い処理は独自スレッドやバックエンドで実行**: コールバックはイベントループ付近で動くため、ブロックしないでください。
- **依存関係はmanifestで宣言するだけ**: 実行時に直接`pip`／`subprocess`でインストールしないでください。承認・分離・検証を迂回してしまいます。

要約すると、**プロンプト・キュー・結果・UI・独自状態は操作できますが、生成エンジン・認証情報・本体環境は公式APIから変更できません**。
「画像からプロンプトを推定する」といった重い処理はComfyUIのタグ付けノードへ任せ、その結果を拡張が受け取って組み合わせるのがNAIAの設計方針です。

### サンプル: Seed Fan-out

[`release_assets/samples/extensions/seed_fanout/`](release_assets/samples/extensions/seed_fanout/)

Generateボタンを押すと、**同じプロンプトからシードだけを変えたバリエーションn枚**（Random／+1／-1方式）をキューへ追加する完全なサンプルです。
フォルダーを`<user-data>/extensions/`へコピーして再起動すると利用でき、`settings.json`で枚数や方式を調整できます（設定変更後の再起動は不要）。
購読・再帰ガード・enqueue・設定の永続化まで拡張API全体を実演しているため、新しい拡張の出発点として使ってください。

### 管理・トラブルシューティング

- **個別に無効化**: `<user-data>/config/extensions.json`に`{"disabled": ["拡張id"]}`を指定
- **すべて無効化**: 環境変数`NAIA_DISABLE_EXTENSIONS=1`
- **ログ**: 拡張の読み込み・エラーは、バックエンドのコンソールに`Remote Web: extension ...`／`[ext:<id>] ...`として出力
- 不具合のある拡張は**その拡張だけ**が無効になり、アプリの起動・生成は継続します（拡張単位での隔離）

---

## 関連ドキュメント

- レイアウト・ランタイムの境界ポリシー: [`PROJECT_LAYOUT_POLICY.md`](PROJECT_LAYOUT_POLICY.md)
- エージェント・開発参加者向けガイド: [`AGENTS.md`](AGENTS.md)

> 注: `CLAUDE.md`と各ディレクトリの詳細ガイドは、ローカル開発専用（`*.md`は追跡対象外）という方針のため、配布ソースには含まれません。
