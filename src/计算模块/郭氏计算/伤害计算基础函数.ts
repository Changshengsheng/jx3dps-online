/**
 * @name 技能伤害dps
 * @description 技能伤害计算遵循郭氏理论
 * @url https://www.jx3box.com/bps/12752
 */
import { 目标属性类型 } from '@/@types/常量'
import { 技能基础数据模型 } from '@/@types/技能'
import { 角色基础属性类型 } from '@/@types/角色'
import { INT } from '@/工具函数/help'
import { 自身属性系数, 每等级减伤 } from '@/数据/常量'

/**
 * @name 破招原始伤害计算
 */
export const 破招原始伤害计算 = (破招值, 技能伤害系数) => {
  return INT(破招值 * 技能伤害系数)
}

/**
 * @name 技能基础伤害
 */
export const 技能基础伤害 = (
  当前技能属性: 技能基础数据模型,
  人物属性: 角色基础属性类型,
  系数增伤 = 1
) => {
  const { 武器伤害_最小值 = 0, 武器伤害_最大值 = 0, 面板攻击 = 0, 破招值 = 0 } = 人物属性
  const {
    技能名称,
    武器伤害系数 = 0,
    基础伤害_基础值 = 0,
    基础伤害_浮动值 = 0,
    基础伤害_倍率 = undefined,
    伤害计算次数 = 1,
    技能伤害系数 = 0,
    技能破招系数 = 0,
  } = 当前技能属性

  if (技能名称 === '破') {
    const 破招伤害 = 破招原始伤害计算(破招值, 技能伤害系数)
    return 破招伤害
  }

  const 基础值 = 基础伤害_倍率 ? INT(基础伤害_基础值 * 基础伤害_倍率) : 基础伤害_基础值
  const 浮动值 = 基础伤害_倍率 ? INT(基础伤害_浮动值 * 基础伤害_倍率) : 基础伤害_浮动值

  const 技能基础伤害平均值 = (基础值 + 基础值 + 浮动值) / 2
  const 人物武器伤害平均值 = (武器伤害_最小值 + 武器伤害_最大值) / 2

  const 技能原始伤害 =
    INT(技能基础伤害平均值) +
    INT(面板攻击 * 技能伤害系数 * 系数增伤) +
    INT(人物武器伤害平均值 * 武器伤害系数) +
    (技能破招系数 ? INT(技能破招系数 * 破招值) : 0)

  return 技能原始伤害 * 伤害计算次数
}

/**
 * @name 破防伤害算法
 */
export const 破防伤害算法 = (
  伤害: number,
  人物属性: 角色基础属性类型,
  当前目标: 目标属性类型,
  郭氏无视防御: number,
  郭氏属性无视防御: number
) => {
  const { 破防等级 } = 人物属性
  const { 防御点数, 防御系数 } = 当前目标
  // 两个乘区
  const 郭氏属性无视防御结果 = Math.max(郭氏结果算法(防御点数, 郭氏属性无视防御), 0)
  const 郭氏无视防御结果 = Math.max(郭氏结果算法(郭氏属性无视防御结果, -郭氏无视防御), 0)

  const 郭氏破防值 = 郭氏基础系数算法(破防等级, 自身属性系数.破防)
  const 郭氏防御值 = 郭氏防御值算法(郭氏无视防御结果, 防御系数)
  const y = 1024 + 郭氏破防值 - INT(((1024 + 郭氏破防值) * 郭氏防御值) / 1024)

  return INT((伤害 * y) / 1024)
}

// 等级减伤dps
export const 等级减伤计算公式 = (
  伤害: number,
  人物属性: 角色基础属性类型,
  当前目标: 目标属性类型
) => {
  const 等级差 = Math.abs((人物属性?.等级 || 120) - 当前目标.等级)
  const 等级差距减伤 = 等级差 * 每等级减伤
  return INT(伤害 * (1 - 等级差距减伤))
}

// 无双计算后dps
export const 无双伤害计算公式 = (
  伤害: number,
  人物属性: 角色基础属性类型,
  郭氏额外无双等级: number
) => {
  return 郭氏无双害算法(伤害, 人物属性.无双等级, 郭氏额外无双等级)
}

/**
 * @name 郭氏基础系数算法
 */
export const 郭氏基础系数算法 = (点数, 系数) => {
  return INT((点数 * 1024) / 系数)
}

/**
 * @name 郭氏结果算法
 */
export const 郭氏结果算法 = (基础值, 郭氏值, 基础系数 = 1) => {
  return INT(基础值 * (基础系数 + 郭氏值 / 1024))
}

/**
 * @name 郭氏会心率
 */
export const 郭氏会心率算法 = (会心值) => {
  // const 郭氏会心值 = INT((会心值 * 1024) / 属性系数.会心)
  // return 郭氏会心值 / 1024
  return 会心值 / 自身属性系数.会心
}

/**
 * @name 郭氏会心伤害算法
 */
export const 郭氏会心伤害算法 = (伤害, 会效值, 郭氏额外会效果值) => {
  const 郭氏会效值 = 郭氏基础系数算法(会效值, 自身属性系数.会效)

  // 会心效果最大值为300%，既1.25%额外会心效果，郭氏值为 1280
  const 计算额外郭氏会效值 = Math.min(郭氏会效值 + 郭氏额外会效果值, 1280)
  return INT(伤害 * 1.75) + INT((伤害 * 计算额外郭氏会效值) / 1024)
}

/**
 * @name 郭氏无双害算法
 */
export const 郭氏无双害算法 = (伤害, 无双值, 郭氏额外无双值) => {
  const 郭氏无双值 = 郭氏基础系数算法(无双值, 自身属性系数.无双)
  return 伤害 + INT(伤害 * ((郭氏无双值 + 郭氏额外无双值) / 1024))
}

/**
 * @name 郭氏防御值算法
 */
export const 郭氏防御值算法 = (防御点数, 防御系数) => {
  return INT((防御点数 * 1024) / (防御点数 + 防御系数))
}
