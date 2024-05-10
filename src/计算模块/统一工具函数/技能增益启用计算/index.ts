import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 根据秘籍格式化技能基础数据 } from './技能秘籍计算'
import { 根据奇穴格式化技能基础数据 } from './技能奇穴计算'
import { 根据装备格式化技能基础数据 } from './技能装备计算'

const { 技能系数 } = 获取当前数据()

/**
 * 计算由装备、秘籍、奇穴等影响的技能基础的增益启用情况
 */

export const 获取判断增益后技能系数 = ({ 秘籍信息, 奇穴数据, 装备增益 }) => {
  const 秘籍格式化后技能基础数据 = 根据秘籍格式化技能基础数据(技能系数, 秘籍信息)
  const 装备格式化后技能基础数据 = 根据奇穴格式化技能基础数据(秘籍格式化后技能基础数据, 奇穴数据)
  const 计算后技能基础数据 = 根据装备格式化技能基础数据(装备格式化后技能基础数据, 装备增益)

  return 计算后技能基础数据
}
