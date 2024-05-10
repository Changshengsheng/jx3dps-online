import { 技能基础数据模型, 技能增益列表类型 } from '@/@types/技能'
import { 装备增益类型 } from '@/@types/装备'

/**
 * 根据当前装备的增益情况，修改技能基础增益
 */

export const 根据装备格式化技能基础数据 = (
  技能系数: 技能基础数据模型[],
  装备增益: 装备增益类型
) => {
  return 技能系数.map((item) => {
    return {
      ...item,
      技能增益列表: 获取技能增益判断(item, 装备增益),
    }
  })
}

export const 获取技能增益判断 = (
  技能: 技能基础数据模型,
  装备增益: 装备增益类型
): 技能增益列表类型[] => {
  const 格式化后增益列表 = (技能.技能增益列表 || [])?.map((增益) => {
    if (增益?.增益所在位置 === '装备') {
      return { ...增益, 增益启用: 判断增益是否启用(增益, 装备增益) }
    } else {
      return 增益
    }
  })

  return 格式化后增益列表
}

export const 判断增益是否启用 = (增益: 技能增益列表类型, 装备增益: 装备增益类型) => {
  switch (增益?.增益名称) {
    case 'CW5%':
      return 装备增益?.大橙武特效
    case '小CW会心5%':
      return 装备增益?.小橙武特效
    case '套装10%_1':
      return !装备增益?.套装技能
    case '套装10%_2':
      return +(装备增益?.套装技能 || 0) > 1
    default:
      return false
  }
}
