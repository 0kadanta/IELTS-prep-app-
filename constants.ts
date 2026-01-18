
import { Phase, WeekPlan, Task } from './types';

export const PHASES: Phase[] = [
  { id: 1, name: '基础构建期', weeks: [1, 2, 3, 4, 5, 6], goal: '熟悉题型，夯实词汇语法基础', color: 'bg-blue-500' },
  { id: 2, name: '技能提升期', weeks: [7, 8, 9, 10, 11, 12], goal: '分科突破技巧，强化主动输出', color: 'bg-emerald-500' },
  { id: 3, name: '专项强化期', weeks: [13, 14, 15, 16, 17, 18], goal: '模考训练，攻破弱点', color: 'bg-indigo-500' },
  { id: 4, name: '冲刺模考期', weeks: [19, 20, 21, 22, 23], goal: '全真模拟，调整状态', color: 'bg-rose-500' },
];

const generateDate = (start: string, daysToAdd: number) => {
  const d = new Date(start);
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
};

const START_DATE = "2025-01-19";

const WEEK_1_DATA: any[] = [
  { label: "剑10 T1 诊断", out: "计算听读分数，列出 3 类最集中的错题原因" },
  { label: "S1 精听跟读", out: "听写记录 3 个连读/弱读失分点 + 5 个场景词" },
  { label: "P1 精读分析", out: "整理 5 组文中的题目-原文同义替换词对" },
  { label: "小作文动态图结构", out: "写出 3 个描述趋势的高级句型 (如: witnessed a dramatic rise)" },
  { label: "口语 P1 练习", out: "录音转文字：列出自己常犯的 2 个时态错误" },
  { label: "第一周总结", out: "重写小作文开头段 + 本周词汇复查错误率" },
  { label: "休息/补漏", out: "下周学习目标简述 (100字内)" },
];

export const FULL_PLAN: WeekPlan[] = Array.from({ length: 23 }, (_, i) => {
  const weekNum = i + 1;
  const startDate = generateDate(START_DATE, i * 7);
  const endDate = generateDate(START_DATE, i * 7 + 6);
  
  let focus = "";
  if (weekNum === 1) focus = "全真诊断与启动";
  else if (weekNum === 2) focus = "听力填空 + 口语P1拓展";
  else if (weekNum === 3) focus = "阅读判断 + 写作静态图";
  else if (weekNum === 4) focus = "听力选择 + 口语P2串题";
  else if (weekNum === 5) focus = "阅读配对 + 写作议论文";
  else if (weekNum === 6) focus = "第一阶段复习 & 剑11测试";
  else if (weekNum >= 7 && weekNum <= 12) focus = "技能提升：限时训练与分科突破";
  else if (weekNum >= 13 && weekNum <= 18) focus = "专项强化：周模考 + 弱项攻克";
  else focus = "全真冲刺：考前调整与心态建设";

  return {
    week: weekNum,
    startDate,
    endDate,
    focus,
    dailyPlans: Array.from({ length: 7 }, (_, dIndex) => {
      const date = generateDate(startDate, dIndex);
      let outputReq = "";
      
      // 动态生成产出要求
      if (weekNum === 1) {
        outputReq = WEEK_1_DATA[dIndex].out;
      } else if (weekNum <= 6) {
        // 第一阶段通用
        const items = ["5组核心同义替换", "3个写作高分短语", "口语录音纠错笔记", "精听场景词汇总", "今日长难句分析"];
        outputReq = items[dIndex % items.length];
      } else if (weekNum <= 12) {
        // 第二阶段：注重实战产出
        const items = ["完整小作文草稿", "完整大作文逻辑大纲", "口语P2串题思路卡片", "阅读限时训练错题分析", "听力地图题方位词总结"];
        outputReq = items[dIndex % items.length];
      } else {
        // 第三、四阶段：注重模考反馈
        outputReq = dIndex === 5 ? "【周六模考】全科分数及考场失误反思" : "今日专项练习最高频错误总结";
      }

      const tasks: Task[] = weekNum === 1 ? [{ id: `${date}-w1`, label: WEEK_1_DATA[dIndex].label }] : [
        { id: `${date}-v`, label: "词汇/语法基础 (0.5h)" },
        { id: `${date}-s`, label: `专项训练: ${focus.split(' ')[0]} (1h)` },
        { id: `${date}-o`, label: "主动输出练习 (0.5h)" }
      ];

      return {
        date,
        dayNumber: dIndex + 1,
        tasks,
        outputRequired: outputReq
      };
    })
  };
});
