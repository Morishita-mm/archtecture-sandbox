import type { ProjectSaveData } from "../types";

/**
 * プロジェクトデータをローカルファイルとして保存（ダウンロード）する
 */
export const saveProjectToLocalFile = (
  data: ProjectSaveData,
  filename: string
) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    // Base64エンコード (日本語対応)
    const base64Encoded = btoa(unescape(encodeURIComponent(jsonString)));

    const blob = new Blob([base64Encoded], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Save Error:", error);
    throw new Error("ファイルの保存中にエラーが発生しました。");
  }
};

/**
 * アップロードされたファイルを読み込み、検証してProjectSaveDataを返す
 */
export const loadProjectFromLocalFile = (
  file: File
): Promise<ProjectSaveData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64EncodedContent = e.target?.result as string;

      try {
        // Base64デコード (日本語対応)
        const decodedJsonString = decodeURIComponent(
          escape(atob(base64EncodedContent))
        );
        const loadedData = JSON.parse(decodedJsonString);

        // データ構造のバリデーション
        if (
          typeof loadedData.version !== "string" ||
          typeof loadedData.projectId !== "string" ||
          typeof loadedData.scenario !== "object" ||
          !Array.isArray(loadedData.diagram?.nodes) ||
          !Array.isArray(loadedData.diagram?.edges) ||
          !Array.isArray(loadedData.chatHistory)
        ) {
          throw new Error(
            "プロジェクトファイルの構造が不正です。破損しているか、バージョンが異なります。"
          );
        }

        resolve(loadedData as ProjectSaveData);
      } catch (error) {
        console.error("Load Error:", error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました。"));
    reader.readAsText(file);
  });
};