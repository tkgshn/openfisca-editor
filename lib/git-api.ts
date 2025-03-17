import { Institution } from './types';
import { v4 as uuidv4 } from 'uuid';

// サーバーサイドコードかどうかを判定
const isServer = typeof window === 'undefined';

// サーバーサイドでのみ使用する変数
// 型定義をany型として明示的に定義
let git: any = null;

// dynamic importを防ぐために変数宣言と型定義
type SimpleGitType = any;
type FSType = any;
type PathType = any;

let simpleGit: SimpleGitType = null;
let fs: FSType = null;
let path: PathType = null;

// サーバーサイドでのみ実行される初期化関数
async function initGitOnServer() {
    if (!isServer) return;

    try {
        // クライアントサイドでのimport防止のため条件付きで実行
        if (isServer) {
            const simpleGitModule = await import('simple-git');
            simpleGit = simpleGitModule.simpleGit;
            fs = await import('fs');
            path = await import('path');
        }

        // GitリポジトリのルートディレクトリのPath
        const REPO_PATH = process.env.NEXT_PUBLIC_GIT_REPO_PATH || './data';
        // 制度データを保存するディレクトリ
        const INSTITUTIONS_DIR = path.join(REPO_PATH, 'institutions');

        // ディレクトリが存在しない場合は作成
        if (!fs.existsSync(REPO_PATH)) {
            fs.mkdirSync(REPO_PATH, { recursive: true });
        }
        if (!fs.existsSync(INSTITUTIONS_DIR)) {
            fs.mkdirSync(INSTITUTIONS_DIR, { recursive: true });
        }

        git = simpleGit(REPO_PATH);

        // リポジトリが初期化されているか確認
        try {
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                // 初期化
                await git.init();
                // 初期コミット
                try {
                    await git.add('.');
                    await git.commit('Initial commit');
                    console.log('Gitリポジトリを初期化しました');
                } catch (error) {
                    console.warn('初期コミットに失敗しました:', error);
                }
            }
        } catch (error) {
            console.warn('リポジトリ確認に失敗しました:', error);
        }
    } catch (error) {
        console.error('Git関連モジュールのインポートに失敗しました:', error);
    }
}

// サーバーサイドの場合は初期化を実行
if (isServer) {
    initGitOnServer();
}

/**
 * 制度をGitリポジトリにコミットする
 * @param institution 制度
 * @param message コミットメッセージ
 * @returns コミットハッシュ
 */
export async function commitInstitutionToGit(
    institution: Institution,
    message: string
): Promise<string | null> {
    // クライアントサイドではダミーのコミットハッシュを返す
    if (!isServer) {
        // ダミーのコミットハッシュを生成（UUIDの先頭7文字）
        return uuidv4().substring(0, 7);
    }

    try {
        // サーバーサイドで実行
        if (!git) {
            await initGitOnServer();
            if (!git) {
                console.error('Gitクライアントが初期化されていません');
                return null;
            }
        }

        const fs = await import('fs');
        const path = await import('path');

        // GitリポジトリのルートディレクトリのPath
        const REPO_PATH = process.env.NEXT_PUBLIC_GIT_REPO_PATH || './data';
        // 制度データを保存するディレクトリ
        const INSTITUTIONS_DIR = path.join(REPO_PATH, 'institutions');

        // 制度データをJSONファイルとして保存
        const institutionPath = path.join(INSTITUTIONS_DIR, `${institution.id}.json`);
        fs.writeFileSync(institutionPath, JSON.stringify(institution, null, 2), 'utf8');

        // 変更をコミット
        await git.add(institutionPath);
        const commitResult = await git.commit(message);

        // コミットハッシュを返す
        return commitResult.commit || null;
    } catch (error) {
        console.error('制度のコミットに失敗しました:', error);
        return null;
    }
}

/**
 * コミットからバージョンを作成する
 * @param institution 制度
 * @param commitHash コミットハッシュ
 * @param message メッセージ
 * @returns 作成したバージョン
 */
export async function createVersionFromCommit(
    institution: Institution,
    commitHash: string,
    message: string
) {
    // バージョン情報を作成
    const version = {
        id: uuidv4(),
        institutionId: institution.id,
        commitHash,
        message,
        createdAt: new Date().toISOString(),
    };

    return version;
}

/**
 * 制度のコミット履歴を取得する
 * @param institution 制度
 * @returns コミット履歴
 */
export async function getInstitutionCommitHistory(institution: Institution): Promise<any[]> {
    // クライアントサイドではダミーのコミット履歴を返す
    if (!isServer) {
        // モックデータ
        const dummyHistory = [
            {
                hash: uuidv4().substring(0, 7),
                date: new Date().toISOString(),
                message: "最新の変更",
                author: "現在のユーザー",
            },
            {
                hash: uuidv4().substring(0, 7),
                date: new Date(Date.now() - 86400000).toISOString(), // 1日前
                message: "初期バージョン",
                author: "システム",
            }
        ];
        return dummyHistory;
    }

    try {
        // サーバーサイドで実行
        if (!git) {
            await initGitOnServer();
            if (!git) {
                console.error('Gitクライアントが初期化されていません');
                return [];
            }
        }

        const fs = await import('fs');
        const path = await import('path');

        // GitリポジトリのルートディレクトリのPath
        const REPO_PATH = process.env.NEXT_PUBLIC_GIT_REPO_PATH || './data';
        // 制度データを保存するディレクトリ
        const INSTITUTIONS_DIR = path.join(REPO_PATH, 'institutions');
        const institutionPath = path.join(INSTITUTIONS_DIR, `${institution.id}.json`);

        // ファイルが存在しない場合は空の配列を返す
        if (!fs.existsSync(institutionPath)) {
            return [];
        }

        // ファイルのコミット履歴を取得
        const log = await git.log({ file: institutionPath });

        return log.all.map((commit: any) => ({
            hash: commit.hash,
            date: commit.date,
            message: commit.message,
            author: commit.author_name,
        }));
    } catch (error) {
        console.error('コミット履歴の取得に失敗しました:', error);
        return [];
    }
}

/**
 * コミットの差分を取得する
 * @param commitHash コミットハッシュ
 * @returns 差分
 */
export async function getCommitDiff(commitHash: string): Promise<string> {
    // クライアントサイドではダミーの差分を返す
    if (!isServer) {
        return `--- a/old-version
+++ b/new-version
@@ -1,3 +1,3 @@
-古いコード
+新しいコード
 変更なし部分`;
    }

    try {
        // サーバーサイドで実行
        if (!git) {
            await initGitOnServer();
            if (!git) {
                console.error('Gitクライアントが初期化されていません');
                return '';
            }
        }

        const diff = await git.show([commitHash]);
        return diff;
    } catch (error) {
        console.error('コミット差分の取得に失敗しました:', error);
        return '';
    }
}

/**
 * リリースタグを作成する
 * @param institution 制度
 * @param tagName タグ名
 * @param tagMessage タグメッセージ
 * @param commitHash コミットハッシュ（指定されていない場合は最新コミット）
 * @returns タグ名
 */
export async function createReleaseTag(
    institution: Institution,
    tagName: string,
    tagMessage: string,
    commitHash?: string
): Promise<string> {
    // クライアントサイドではタグ名をそのまま返す
    if (!isServer) {
        return tagName;
    }

    try {
        // サーバーサイドで実行
        if (!git) {
            await initGitOnServer();
            if (!git) {
                console.error('Gitクライアントが初期化されていません');
                return '';
            }
        }

        // コミットハッシュが指定されていない場合は最新コミットを使用
        const targetCommit = commitHash || 'HEAD';

        // タグを作成
        await git.tag(['-a', tagName, '-m', tagMessage, targetCommit]);

        return tagName;
    } catch (error) {
        console.error('リリースタグの作成に失敗しました:', error);
        return '';
    }
}
