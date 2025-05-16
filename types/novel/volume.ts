// 卷类型定义
export interface Volume {
  _id: string;
  title: string;
  order: number;
  chapters: {
    _id: string;
    title: string;
    order: number;
    word_count: number;
  }[];
}