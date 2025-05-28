import type { Novel } from '~/types/novel/novelinfo';

export const useSimilarNovels = (novelId: string) => {
  return useState<Novel[]>(`similarFinishedNovels_${novelId}`, () => []);
}

export const useSimilarFinishNovels = (novelId: string) => {
  return useState<Novel[]>(`similarFinishNovels_${novelId}`, () => []);
}
