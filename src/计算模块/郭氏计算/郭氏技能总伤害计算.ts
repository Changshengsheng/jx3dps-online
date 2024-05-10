import { 基础系数, 属性系数 } from '@/数据/常量'
import { 最终计算属性类型 } from '@/@types/计算'
import { 技能基础数据模型 } from '@/@types/技能'
import { 获取郭氏加成值, 获取郭氏结果值 } from '@/工具函数/data'
import { INT } from '@/工具函数/help'
import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import 完整技能伤害 from './技能伤害公式'
import { 角色基础属性类型 } from '@/@types/角色'

const { 主属性, 功法, 主属性额外加成 } = 获取当前数据()

// 技能dps结果期望
export const 郭氏技能总伤害计算 = (
  最终计算属性: 最终计算属性类型,
  当前技能属性: 技能基础数据模型,
  技能总数: number
) => {
  const 用于计算的人物面板 = 获取属性加成后的面板(最终计算属性)

  const { 期望技能总伤, 会心数量 } = 完整技能伤害({
    当前技能属性,
    技能总数,
    最终人物属性: 用于计算的人物面板,
    当前目标: 最终计算属性?.计算目标,
    技能增伤: 最终计算属性?.技能增伤,
    郭氏额外会效果值: 最终计算属性?.郭氏额外会效果值,
    郭氏额外无双等级: 最终计算属性?.郭氏无双等级,
    额外会心率: 最终计算属性?.额外会心率,
    郭式无视防御: 最终计算属性?.郭式无视防御,
  })

  return { 期望技能总伤, 会心数量 }
}

export default 郭氏技能总伤害计算

export const 获取属性加成后的面板 = (
  最终计算属性: Partial<最终计算属性类型>,
  计算郭氏额外数据?: boolean
): 角色基础属性类型 => {
  let 计算人物面板: 角色基础属性类型 = { ...(最终计算属性?.最终人物属性 as any) }
  const 最终属性 = {
    力道: 获取郭氏加成值(最终计算属性?.最终人物属性?.力道, 最终计算属性?.郭氏力道),
    身法: 获取郭氏加成值(最终计算属性?.最终人物属性?.身法, 最终计算属性?.郭氏身法),
    根骨: 获取郭氏加成值(最终计算属性?.最终人物属性?.根骨, 最终计算属性?.郭氏根骨),
    元气: 获取郭氏加成值(最终计算属性?.最终人物属性?.元气, 最终计算属性?.郭氏元气),
  }
  const 最终主属 = 最终属性?.[主属性] || 0
  const 额外加成面板攻击 = 主属性额外加成?.面板攻击 || 0
  const 额外加成会心 = 主属性额外加成?.会心等级 || 0
  const 额外加成破防 = 主属性额外加成?.破防等级 || 0

  // 计算主属性的面板攻击
  计算人物面板.面板攻击 = (计算人物面板.基础攻击 || 0) + INT(最终主属 * 额外加成面板攻击)

  // 计算外功
  if (功法 === '外功') {
    // 力道-基础攻击
    计算人物面板.基础攻击 += INT(最终属性.力道 * 基础系数.力道转攻击)
    计算人物面板.面板攻击 += INT(最终属性.力道 * 基础系数.力道转攻击)
    // 力道-破防
    计算人物面板.破防等级 += INT(最终属性.力道 * 基础系数.力道转破防) + INT(最终主属 * 额外加成破防)
    // 身法-会心
    计算人物面板.会心等级 += INT(最终属性.身法 * 基础系数.身法转会心) + INT(最终主属 * 额外加成会心)
  }
  // 计算内功
  if (功法 === '内功') {
    // 元气-基础攻击
    计算人物面板.基础攻击 += INT(最终属性.元气 * 基础系数.元气转攻击)
    计算人物面板.面板攻击 += INT(最终属性.元气 * 基础系数.元气转攻击)
    // 元气-破防
    计算人物面板.破防等级 += INT(最终属性.元气 * 基础系数.元气转破防) + INT(最终主属 * 额外加成破防)
    // 根骨-会心
    计算人物面板.会心等级 += INT(最终属性.根骨 * 基础系数.根骨转会心) + INT(最终主属 * 额外加成会心)
  }

  计算人物面板 = {
    ...计算人物面板,
    ...最终属性,
    武器伤害_最小值: 获取郭氏加成值(计算人物面板.武器伤害_最小值, 最终计算属性?.郭氏武器伤害),
    武器伤害_最大值: 获取郭氏加成值(计算人物面板.武器伤害_最大值, 最终计算属性?.郭氏武器伤害),
    破防等级: 获取郭氏加成值(计算人物面板.破防等级, 最终计算属性?.郭氏破防等级),
    基础攻击: 获取郭氏加成值(计算人物面板.基础攻击, 最终计算属性?.郭氏基础攻击),
    面板攻击:
      计算人物面板.面板攻击 + 获取郭氏结果值(计算人物面板.基础攻击, 最终计算属性?.郭氏破防等级),
  }

  // 额外计算郭氏额外无双、额外会心、额外会效。用于面板展示
  if (计算郭氏额外数据) {
    计算人物面板 = {
      ...计算人物面板,
      无双等级: 计算人物面板.无双等级 + 获取郭氏结果值(属性系数?.无双, 最终计算属性?.郭氏无双等级),
      会心等级: 计算人物面板.会心等级 + INT(属性系数?.会心 * (最终计算属性?.额外会心率 || 0)),
      会心效果等级:
        计算人物面板.会心效果等级 + 获取郭氏结果值(属性系数?.无双, 最终计算属性?.郭氏额外会效果值),
    }
  }

  return 计算人物面板
}
