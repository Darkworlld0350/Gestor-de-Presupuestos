declare module "expo-file-system" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;

  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: { encoding?: string }
  ): Promise<void>;
}
