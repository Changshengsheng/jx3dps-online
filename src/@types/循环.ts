import { 快照类型 } from './技能'

export interface 循环数据 {
  /**
   * @name 名称
   * 循环名称，唯一KEY
   */
  名称: string
  /**
   * @name 标题
   * 循环标题，用作展示显示循环名，可以不唯一
   */
  标题?: string
  /**
   * @name 默认隐藏
   * 是否默认隐藏，不展示在循环选择框内
   * @default false
   */
  默认隐藏?: boolean
  /**
   * @name 类型
   * 循环类型
   * 默认 | 自定义
   */
  类型: string
  /**
   * @name 标记
   * 循环标记，用作辅助性类别区分
   */
  标记?: string
  /**
   * @name 强制加速要求
   * 开启后如果未命中加速将不会反回默认值
   */
  强制加速要求?: boolean
  /**
   * @name 奇穴
   * 循环默认奇穴信息
   */
  奇穴: string[]
  /**
   * @name 循环详情
   */
  循环详情: 循环详情[]
  /**
   * @name 额外配置信息
   * 部分职业的额外需要保存的数据
   * 例：万灵宠物顺序
   */
  额外配置信息?: {
    [key: string]: any
  }
  /**
   * @name 用于模拟器的技能序列
   */
  技能序列?: string[]
  /**
   * @name 快照计算
   * @default false
   * 启用快照计算后，部分期望计算将不再默认计算
   * 目前包含：套装会心会效、大附魔_伤腰、水特效、风特效
   */
  快照计算?: 快照类型[]
}

export interface 循环详情 {
  /**
   * 循环加速等级
   */
  循环加速等级?: number | string
  /**
   * 循环延迟要求
   */
  循环延迟要求?: number | string
  /**
   * @name 计算战斗时间
   * 单位（秒）
   */
  战斗时间: number
  /**
   * @name 技能详情
   */
  技能详情: 循环技能详情[]
}

export interface 循环技能详情 {
  /**
   * @name 技能名称
   * 代表用于计算的技能名称，需要和系数中的名称一致
   */
  技能名称: string
  /**
   * @name 技能等级
   * 该技能在循环中的总数量
   */
  技能等级?: number
  /**
   * @name 技能数量
   * 该技能在循环中的总数量
   */
  技能数量: number
  /**
   * @name 技能增益列表
   * 该技能携带的增益列表
   */
  技能增益列表?: 技能增益列表数据[]
}

export interface 技能增益列表数据 {
  /**
   * @name 增益名称
   * 当该技能存在多个增益时，用逗号(,)隔开
   */
  增益名称: string
  /**
   * @name 增益技能数
   * 代表该技能携带上方增益的总数量
   * 注意，整个技能增益列表中的增益技能数的和事小于上层的技能数量的
   */
  增益技能数: number
}
