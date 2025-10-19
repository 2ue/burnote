export interface ThemeColor {
  id: number;
  name: string;
  description: string;
  primary: string;
  accent: string;
  category: 'traditional' | 'modern' | 'vibrant';
  saturation: 'low' | 'medium' | 'high';
}

export const themeColors: ThemeColor[] = [
  // 默认主题 - 月白
  {
    id: 0,
    name: '月白',
    description: '淡雅青白',
    primary: '200 18% 46%',
    accent: '180 25% 55%',
    category: 'traditional',
    saturation: 'low',
  },

  // 传统色 - 低饱和度
  {
    id: 1,
    name: '竹青',
    description: '优雅青绿',
    primary: '160 40% 45%',
    accent: '165 35% 55%',
    category: 'traditional',
    saturation: 'medium',
  },
  {
    id: 2,
    name: '黛',
    description: '深邃青黑',
    primary: '210 30% 35%',
    accent: '200 25% 50%',
    category: 'traditional',
    saturation: 'low',
  },
  {
    id: 3,
    name: '藕荷',
    description: '淡雅粉紫',
    primary: '320 28% 62%',
    accent: '310 25% 70%',
    category: 'traditional',
    saturation: 'low',
  },
  {
    id: 4,
    name: '秋香',
    description: '温暖黄褐',
    primary: '40 45% 50%',
    accent: '45 40% 58%',
    category: 'traditional',
    saturation: 'medium',
  },

  // 传统色 - 中饱和度
  {
    id: 5,
    name: '胭脂',
    description: '温润红',
    primary: '350 65% 50%',
    accent: '355 60% 60%',
    category: 'traditional',
    saturation: 'medium',
  },
  {
    id: 6,
    name: '石青',
    description: '深邃蓝',
    primary: '195 65% 42%',
    accent: '190 55% 52%',
    category: 'traditional',
    saturation: 'medium',
  },
  {
    id: 7,
    name: '豆绿',
    description: '温和绿',
    primary: '140 50% 45%',
    accent: '150 45% 52%',
    category: 'traditional',
    saturation: 'medium',
  },

  // 传统色 - 高饱和度
  {
    id: 8,
    name: '赤金',
    description: '华丽金红',
    primary: '15 85% 55%',
    accent: '25 90% 60%',
    category: 'traditional',
    saturation: 'high',
  },
  {
    id: 9,
    name: '靛蓝',
    description: '浓郁蓝紫',
    primary: '235 75% 48%',
    accent: '240 70% 58%',
    category: 'traditional',
    saturation: 'high',
  },
  {
    id: 10,
    name: '孔雀蓝',
    description: '明艳蓝绿',
    primary: '185 85% 42%',
    accent: '180 80% 50%',
    category: 'traditional',
    saturation: 'high',
  },
  {
    id: 11,
    name: '朱砂',
    description: '鲜艳红',
    primary: '5 90% 55%',
    accent: '10 85% 62%',
    category: 'traditional',
    saturation: 'high',
  },

  // 现代常见色
  {
    id: 12,
    name: '暗夜',
    description: '深沉黑蓝',
    primary: '220 25% 25%',
    accent: '215 22% 35%',
    category: 'modern',
    saturation: 'low',
  },
  {
    id: 13,
    name: '森林',
    description: '浓郁绿',
    primary: '150 60% 35%',
    accent: '155 55% 45%',
    category: 'modern',
    saturation: 'medium',
  },
  {
    id: 14,
    name: '海洋',
    description: '深蓝',
    primary: '210 85% 45%',
    accent: '205 80% 52%',
    category: 'modern',
    saturation: 'high',
  },
  {
    id: 15,
    name: '日落',
    description: '橙红',
    primary: '20 95% 55%',
    accent: '25 90% 62%',
    category: 'modern',
    saturation: 'high',
  },
];
