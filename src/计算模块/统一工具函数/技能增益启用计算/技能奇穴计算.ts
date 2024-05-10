import { 技能基础数据模型, 技能增益列表类型 } from '@/@types/技能'

/**
 * 根据当前已选的奇穴、奇穴等修改技能增益
 */
export const 根据奇穴格式化技能基础数据 = (
  技能系数: 技能基础数据模型[],
  当前奇穴信息: string[]
): 技能基础数据模型[] => {
  return 技能系数.map((item) => {
    return { ...item, 技能增益列表: 获取技能增益判断(item, 当前奇穴信息) }
  })
}

export const 获取技能增益判断 = (
  技能: 技能基础数据模型,
  当前奇穴信息: string[]
): 技能增益列表类型[] => {
  const 格式化后增益列表 = (技能.技能增益列表 || [])?.map((增益) => {
    if (增益?.增益所在位置 === '奇穴') {
      return { ...增益, 增益启用: 当前奇穴信息?.includes(增益?.增益名称) }
    } else {
      return 增益
    }
  })

  return 格式化后增益列表
}
