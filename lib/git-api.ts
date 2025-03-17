import { Institution } from './types';
import { v4 as uuidv4 } from 'uuid';

// サーバーサイドのみでモジュールをインポート
let simpleGit;
let fs;
let path;
let git;

// サーバーサイドコードかどうかを判定
const isServer = typeof window === 'undefined';

// サーバーサイドでのみ実行する初期化コード
if (isServer) {
    // 動的インポート
    const importSimpleGit = async () => {
        try {
            const { simpleGit: importedSimpleGit } = await import('simple-git');
            simpleGit = importedSimpleGit;
            fs = await import('fs');
            path = await import('path');

            // GitリポジトリのルートディレクトリのPath
            const REPO_PATH = process.env.NEXT_PUBLIC_GIT_REPO_PATH || './data';
            // 制度データを保存するディレクトリ
            const INSTITUTIONS_DIR = path.join(REPO_PATH, 'institutions');

            // Gitクライアントの初期化
            try {
                // ディレクトリが存在しない場合は作成
                if (!fs.existsSync(REPO_PATH)) {
                    fs.mkdirSync(REPO_PATH, { recursive: true });
                }
                if (!fs.existsSync(INSTITUTIONS_DIR)) {
                    fs.mkdirSync(INSTITUTIONS_DIR, { recursive: true });
                }

                git = simpleGit(REPO_PATH);

                // リポジトリが初期化されているか確認
                const isGitRepo = async () => {
                    try {
                        await git.checkIsRepo();
                        return true;
                    } catch (error) {
                        return false;
                    }
                };

                // リポジトリが初期化されていない場合は初期化
                (async () => {
                    if (!(await isGitRepo())) {
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
                })();
            } catch (error) {
                console.error('Gitリポジトリの初期化に失敗しました:', error);
            }
        } catch (error) {
            console.error('Git関連モジュールのインポートに失敗しました:', error);
        }
    };

    // 初期化を実行
    importSimpleGit();
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
    // クライアントサイドでは何もしない
    if (!isServer) {
        console.warn('クライアントサイドではGit操作はサポートされていません');
        return null;
    }

    try {
        if (!git) {
            console.error('Gitクライアントが初期化されていません');
            return null;
        }

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
    // クライアントサイドでは空の配列を返す
    if (!isServer) {
        console.warn('クライアントサイドではGit操作はサポートされていません');
        return [];
    }

    try {
        if (!git) {
            console.error('Gitクライアントが初期化されていません');
            return [];
        }

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

        return log.all.map(commit => ({
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
    // クライアントサイドでは空文字列を返す
    if (!isServer) {
        console.warn('クライアントサイドではGit操作はサポートされていません');
        return '';
    }

    try {
        if (!git) {
            console.error('Gitクライアントが初期化されていません');
            return '';
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
    // クライアントサイドでは空文字列を返す
    if (!isServer) {
        console.warn('クライアントサイドではGit操作はサポートされていません');
        return '';
    }

    try {
        if (!git) {
            console.error('Gitクライアントが初期化されていません');
            return '';
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
