/**
 * 定义模拟循环类
 */

import {
  根据奇穴修改buff数据,
  根据奇穴修改技能数据,
  起手留客雨BUFF,
  转化buff和增益名称,
} from './utils'
import {
  技能GCD组,
  技能类实例集合,
  检查运行数据实例类型,
  Buff枚举,
  循环日志数据类型,
  循环基础技能数据类型,
  角色状态信息类型,
  技能释放记录数据,
} from './type'

import 获取当前数据 from '@/数据/数据工具/获取当前数据'
import { 获取加速等级 } from '@/工具函数/data'
import 获取技能信息 from '@/数据/数据工具/获取技能等级信息'

import 流血 from './DOT类/流血'
import 截辕 from './DOT类/截辕'
import 行云势一 from './技能类/行云势一'
import 行云势二 from './技能类/行云势二'
import 行云势三 from './技能类/行云势三'
import 决云势一 from './技能类/决云势一'
import 决云势二 from './技能类/决云势二'
import 横云势一 from './技能类/横云势一'
import 横云势二 from './技能类/横云势二'
import 停云势 from './技能类/停云势'
import 留客雨 from './技能类/留客雨'
import 孤风破浪 from './技能类/孤风破浪'
import 灭影追风 from './技能类/灭影追风'

const { 技能系数 } = 获取当前数据()

interface SimulatorCycleProps {
  测试循环: string[]
  加速值: number
  网络延迟: number
  奇穴: string[]
  起手留层数: number
  大橙武模拟: boolean
}

class 循环主类 {
  循环执行结果: '成功' | '异常' = '成功'
  循环异常信息 = { 异常索引: 0, 异常信息: '' }
  测试循环: string[] = []
  奇穴: string[] = []
  加速等级 = 0
  网络延迟 = 0
  角色状态信息: 角色状态信息类型 = {
    锐意: 60,
  }
  当前自身buff列表: Buff枚举 = {}
  当前目标buff列表: Buff枚举 = {}
  当前时间 = 0
  开始释放上一个技能的时间 = 0
  战斗日志: 循环日志数据类型[] = []
  技能释放记录: 技能释放记录数据[] = []
  Buff和Dot数据: Buff枚举 = {}
  技能基础数据: 循环基础技能数据类型[] = []
  GCD组: 技能GCD组 = {
    公共: 0,
  }
  技能类实例集合: 技能类实例集合 = {}
  云刀上次造成伤害时间: number | undefined = undefined
  大橙武模拟 = false

  // 初始化创建
  constructor(props: SimulatorCycleProps) {
    // 模拟开始后不会变动的数据
    this.测试循环 = props.测试循环
    this.大橙武模拟 = props.大橙武模拟
    this.奇穴 = props.奇穴
    this.加速等级 = 获取加速等级(props.加速值)

    // !无界体感延迟多一段，这里比PC多按1帧延迟计算
    this.网络延迟 = props.网络延迟 + 1

    this.Buff和Dot数据 = 根据奇穴修改buff数据()
    this.技能基础数据 = 根据奇穴修改技能数据()

    // 模拟初始化
    this.初始化技能实例类()
    this.当前自身buff列表 = props.起手留层数
      ? { ...起手留客雨BUFF(this.Buff和Dot数据, props.起手留层数) }
      : {}
    this.当前目标buff列表 = {}
    this.角色状态信息 = {
      锐意: 60,
    }
    this.重置循环执行结果()
  }

  重置循环执行结果() {
    this.循环执行结果 = '成功'
    this.循环异常信息 = { 异常索引: 0, 异常信息: '' }
  }

  初始化技能实例类() {
    this.技能类实例集合 = {
      '行云势·一': new 行云势一(this),
      '行云势·二': new 行云势二(this),
      '行云势·三': new 行云势三(this),
      '决云势·一': new 决云势一(this),
      '决云势·二': new 决云势二(this),
      '横云势·一': new 横云势一(this),
      '横云势·二': new 横云势二(this),
      停云势: new 停云势(this),
      留客雨: new 留客雨(this),
      孤风破浪: new 孤风破浪(this),
      灭影追风: new 灭影追风(this),
      流血: new 流血(this),
      截辕: new 截辕(this),
    }
  }

  添加buff({ 名称, 对象 = '目标', 事件时间 = this.当前时间, 新增层数 = 1 }) {
    const 当前层数 =
      对象 === '自身'
        ? this.当前自身buff列表[名称]?.当前层数
        : this.当前目标buff列表[名称]?.当前层数

    const 新buff对象 = {
      ...this.Buff和Dot数据[名称],
      当前层数: Math.min((当前层数 || 0) + 新增层数, this.Buff和Dot数据[名称].最大层数 || 1),
      刷新时间: 事件时间,
    }
    if (新buff对象.当前层数 !== 当前层数 && 新buff对象.当前层数 !== 1) {
      this.添加战斗日志({
        日志: `${名称}层数变为【${新buff对象.当前层数}】`,
        日志类型: 对象 === '自身' ? '自身buff变动' : '目标buff变动',
        日志时间: 事件时间,
      })
    } else {
      this.添加战斗日志({
        日志: `${对象}获得${名称}`,
        日志类型: 对象 === '自身' ? '自身buff变动' : '目标buff变动',
        日志时间: 事件时间,
      })
    }

    if (对象 === '自身') {
      this.当前自身buff列表[名称] = { ...新buff对象 }
    } else {
      this.当前目标buff列表[名称] = { ...新buff对象 }
    }
  }

  卸除buff({ 名称, buff刷新时间 = 0, 对象 = '目标', 事件时间 = this.当前时间, 卸除层数 = 1 }) {
    const 当前层数 =
      对象 === '自身'
        ? this.当前自身buff列表[名称]?.当前层数
        : this.当前目标buff列表[名称]?.当前层数

    if (当前层数 && 当前层数 >= 0) {
      if (当前层数 - 卸除层数 > 0) {
        this.添加战斗日志({
          日志: `${名称}层数变为【${当前层数 - 卸除层数}】`,
          日志类型: 对象 === '自身' ? '自身buff变动' : '目标buff变动',
          日志时间: 事件时间,
        })
        const 新buff对象 = {
          ...this.Buff和Dot数据[名称],
          当前层数: 当前层数 - 卸除层数,
          刷新时间: buff刷新时间 || 事件时间,
        }
        if (对象 === '自身') {
          this.当前自身buff列表[名称] = { ...新buff对象 }
        } else {
          this.当前目标buff列表[名称] = { ...新buff对象 }
        }
      } else {
        this.添加战斗日志({
          日志: `${对象}失去${名称}`,
          日志类型: 对象 === '自身' ? '自身buff变动' : '目标buff变动',
          日志时间: 事件时间,
        })
        if (对象 === '自身') {
          delete this.当前自身buff列表[名称]
        } else {
          delete this.当前目标buff列表[名称]
        }
      }
    }
  }

  // 校验奇穴是否存在
  校验奇穴是否存在(待判断奇穴) {
    return this?.奇穴?.includes(待判断奇穴)
  }

  // ----------------- 时间、GCD、CD相关算法 start----------------- //
  /**
   *
   * @param 增加时间方法
   * @description 每次增加时间方法都要同步推进GCD
   */
  增加时间(time) {
    this.跳过全部GCD时间(time)
    // 增加时间
    this.当前时间 = this.当前时间 + (time > 0 ? time : 0 || 0)
    this.DOT结算与更新()
    this.清空已经消失的buff()
  }

  跳过全部GCD时间(time) {
    // 减少GCD剩余时间
    const 新GCD组: 技能GCD组 = { 公共: 0 }
    Object.keys(this.GCD组).map((key) => {
      新GCD组[key] = Math.max((this.GCD组[key] || 0) - time, 0)
    })
    this.GCD组 = { ...新GCD组 }
  }

  技能释放前检查GCD统一方法(当前技能: 循环基础技能数据类型) {
    let 校验GCD组: string = 当前技能.技能GCD组 as string
    if (当前技能.技能GCD组 === '自身') {
      校验GCD组 = 当前技能?.技能名称
    }
    if (校验GCD组) {
      // 大部分技能只检查自己的GCD
      const GCD = this.GCD组[校验GCD组]
      // if (当前技能.技能GCD组 === '自身') {
      //   GCD = GCD + 3
      // }
      // 增加GCD
      return GCD || 0
    }
    return 0
  }

  // 对所有有CD技能检查和充能
  对所有有CD技能检查和充能() {
    Object.keys(this.技能类实例集合).forEach((key) => {
      const 实例 = this.技能类实例集合[key]
      const 当前技能 = this.技能基础数据?.find((item) => item.技能名称 === key)
      if (实例?.技能运行数据) {
        const 最大充能层数 = 当前技能?.最大充能层数 || 1
        const 当前层数 = 实例?.技能运行数据?.当前层数
        const 计划下次充能时间点 = 实例?.技能运行数据?.计划下次充能时间点 || 0
        if (当前层数 < 最大充能层数) {
          // 当前有层数，检查充能度过情况，更新层数和充能时间
          let 新层数 = 当前层数
          let 新充能时间点 = 计划下次充能时间点
          const 充能 = () => {
            if (新充能时间点 <= this.当前时间 && 新层数 < 最大充能层数) {
              新层数 = 新层数 + 1
              // 没充满，继续跑充能CD
              if (新层数 < 最大充能层数) {
                新充能时间点 = 新充能时间点 + (当前技能?.技能CD || 0)
              }
              if (新充能时间点 <= this.当前时间 && 新层数 < 最大充能层数) {
                充能()
              }
            }
          }
          if (新充能时间点 && 新充能时间点 <= this.当前时间) {
            充能()
            实例?.更新技能运行数据({ 当前层数: 新层数, 计划下次充能时间点: 新充能时间点 })
          }
        }
      }
    })
  }

  技能释放前检查运行数据(当前技能: 循环基础技能数据类型, 技能实例: 检查运行数据实例类型, GCD) {
    let 等待CD时间 = 0
    const 可以释放时间 = this.当前时间 + GCD || 0
    if (技能实例?.技能运行数据) {
      const 当前层数 = 技能实例?.技能运行数据?.当前层数
      const 计划下次充能时间点 = 技能实例?.技能运行数据?.计划下次充能时间点 || 0
      // 当前层数为-1，说明未初始化实例，设置为最大层数
      if (当前层数 <= 0) {
        // 当前没有层数可用，需要等待充能
        if (计划下次充能时间点 > 可以释放时间) {
          等待CD时间 = 计划下次充能时间点 - 可以释放时间
        }
        if (计划下次充能时间点 <= 可以释放时间) {
          const 新层数 = Math.min(当前层数 + 1, 当前技能?.最大充能层数 || 1)
          技能实例?.更新技能运行数据({ 当前层数: 新层数 })
        }
      }
    }
    return 等待CD时间
  }

  技能释放后更新运行数据(
    当前技能: 循环基础技能数据类型,
    技能实例: 检查运行数据实例类型,
    增加CD?: number
  ) {
    const 实际增加CD = 增加CD || 当前技能?.技能CD || 0
    if (技能实例?.技能运行数据) {
      const 最大充能层数 = 当前技能?.最大充能层数 || 1
      const 是否为充满后第一次释放 = 技能实例?.技能运行数据?.当前层数 === 最大充能层数
      const 释放后层数 = 技能实例?.技能运行数据?.当前层数 - 1
      const 当前时间 = this.当前时间 || 0
      if (是否为充满后第一次释放) {
        技能实例?.更新技能运行数据({
          当前层数: 释放后层数,
          计划下次充能时间点: 当前时间 + 实际增加CD,
        })
      } else {
        if (释放后层数 <= 0) {
          const 原充能时间 = 技能实例?.技能运行数据?.计划下次充能时间点 || 0
          const 计算充能时间 = 原充能时间 <= 当前时间 ? 当前时间 + 实际增加CD : 原充能时间
          技能实例?.更新技能运行数据({
            当前层数: 释放后层数,
            计划下次充能时间点: 计算充能时间,
          })
        } else {
          技能实例?.更新技能运行数据({
            当前层数: 释放后层数,
          })
        }
      }
    }
  }

  // ----------------- 时间、GCD、CD相关算法 end----------------- //

  // 添加战斗日志
  添加战斗日志(log: 循环日志数据类型) {
    const { 日志时间 = this.当前时间, ...rest } = log
    this.战斗日志 = [
      ...(this.战斗日志 || []),
      {
        日志时间: 日志时间,
        ...rest,
      },
    ]
  }

  // 造成伤害
  技能造成伤害(
    来源,
    伤害次数 = 1,
    额外增益列表: string[] = [],
    造成时间 = this.当前时间,
    DOT伤害 = false
  ) {
    const 对应技能 = 技能系数?.find((item) => item.技能名称 === 来源)
    const 技能增益列表 = 获取技能信息(对应技能)?.技能增益列表 || []

    const 有关的buff列表 =
      技能增益列表
        ?.filter((item) => {
          const 当前增益数据 = 转化buff和增益名称(item.增益名称, this.当前自身buff列表)
          if (当前增益数据) {
            if (造成时间) {
              const 增益消失时间 = (当前增益数据?.刷新时间 || 0) + (当前增益数据?.最大持续时间 || 0)
              return 造成时间 <= 增益消失时间 && !!当前增益数据
            } else {
              return !!当前增益数据?.当前层数
            }
          } else {
            return false
          }
        })
        ?.map((item) => {
          // DOT伤害实时部分buff吃快照，由额外增益列表传入
          if (
            (['灭影追风·悟', '大橙武增伤']?.includes(item?.增益名称) ||
              item?.增益名称?.includes('披靡·悟')) &&
            DOT伤害
          ) {
            return ''
          } else {
            return item.增益名称
          }
        })
        .filter((item) => !!item) || []

    const 总增益列表 = 有关的buff列表.concat(额外增益列表)

    this.添加战斗日志({
      日志: 来源,
      日志类型: '造成伤害',
      日志时间: 造成时间,
      buff列表: 总增益列表 || [],
      其他数据: {
        伤害次数: 伤害次数,
      },
    })
  }

  增加锐意(锐意值, 来源) {
    this.添加战斗日志({
      日志: `${来源}回复锐意【${锐意值}】点`,
      日志类型: '回复锐意',
    })
    const 更新后锐意 = (this.角色状态信息.锐意 || 0) + 锐意值
    this.角色状态信息.锐意 = Math.min(更新后锐意, 60)
    this.添加战斗日志({
      日志: `锐意变为【${this.角色状态信息.锐意}】`,
      日志类型: '自身buff变动',
    })
  }

  减少锐意(锐意值, 来源) {
    this.添加战斗日志({
      日志: `${来源}消耗锐意【${锐意值}】点`,
      日志类型: '消耗锐意',
    })
    const 更新后锐意 = (this.角色状态信息.锐意 || 0) - 锐意值
    this.角色状态信息.锐意 = Math.max(更新后锐意, 0)
    this.添加战斗日志({
      日志: `锐意变为【${this.角色状态信息.锐意}】`,
      日志类型: '自身buff变动',
    })
  }

  检查GCD(当前技能: 循环基础技能数据类型, 技能实例, i) {
    let GCD = 0
    if (技能实例?.检查GCD) {
      GCD = 技能实例?.检查GCD?.(i)
    } else {
      GCD = this.技能释放前检查GCD统一方法(当前技能)
    }
    return GCD
  }

  // 判断GCD，技能CD等
  技能释放前(当前技能: 循环基础技能数据类型, 技能实例, i) {
    let GCD = 0
    let 等待CD = 0

    // 判断是否为当前箭袋第一个技能
    if (i >= 0) {
      // 判断上一个技能对于本技能是否有GCD限制
      if (当前技能?.技能GCD组) {
        GCD = this.检查GCD(当前技能, 技能实例, i)
      }
      // 判断技能CD，如果存在CD。增加等待时间
      if (当前技能?.技能CD) {
        等待CD = this.技能释放前检查运行数据(当前技能, 技能实例, GCD)
      }
    }
    // const 延迟等待 = this.当前时间 && (GCD || 等待CD) ? this.网络延迟 : 0
    const 延迟等待 = this.当前时间 ? this.网络延迟 : 0

    const 技能计划释放时间 = this.当前时间 + GCD + 延迟等待
    return {
      技能计划释放时间: 技能计划释放时间,
      技能预估释放时间: 技能计划释放时间 + 等待CD,
      等待CD,
    }
  }

  技能GCD和CD处理(
    等待CD,
    技能预估释放时间,
    当前技能: 循环基础技能数据类型,
    技能实例: 检查运行数据实例类型
  ) {
    // 判断在处理完特殊事件以后，剩余的待定时间还有多少
    const 时间差 = 技能预估释放时间 - this.当前时间
    if (时间差 && 时间差 > 0) {
      this.增加时间(时间差)
    }
    if (等待CD) {
      this.添加战斗日志({
        日志: `【${当前技能?.技能名称}】等技能CD【${等待CD}】帧`,
        日志类型: '等CD',
        日志时间: 技能预估释放时间,
      })
      const 当前层数 = 技能实例?.技能运行数据?.当前层数
      const 新层数 = Math.min(当前层数 + 1, 当前技能?.最大充能层数 || 1)
      技能实例?.更新技能运行数据({ 当前层数: 新层数 })
    }
  }

  // 增加技能GCD
  增加技能GCD(当前技能: 循环基础技能数据类型) {
    // GCD处理
    if (当前技能?.技能GCD组) {
      let 待更新GCD组: string = 当前技能.技能GCD组 as string
      if (当前技能.技能GCD组 === '自身') {
        待更新GCD组 = 当前技能?.技能名称
      }
      if (待更新GCD组) {
        this.GCD组[待更新GCD组] =
          (this.GCD组[待更新GCD组] || 0) + 当前技能?.技能释放后添加GCD - this.加速等级
      }
    }
  }

  技能成功开始释放(当前技能: 循环基础技能数据类型, 技能实例) {
    this.增加技能GCD(当前技能)
    this.增加技能CD(当前技能, 技能实例)
  }

  // 增加技能CD
  增加技能CD(当前技能: 循环基础技能数据类型, 技能实例) {
    // 技能CD处理
    if (当前技能?.技能CD) {
      if (技能实例?.技能释放后更新运行数据) {
        技能实例.技能释放后更新运行数据?.()
      } else {
        this.技能释放后更新运行数据(当前技能, 技能实例)
      }
    }
  }

  // 判断添加GCD等
  技能释放后(当前技能: 循环基础技能数据类型, 计划释放时间: number, 开始释放时间: number, 技能实例) {
    const 技能释放记录结果 = 技能实例?.获取技能释放记录结果?.() || {}
    // 技能释放记录
    this.技能释放记录.push({
      技能名称: 当前技能?.技能名称,
      计划释放时间,
      实际释放时间: 开始释放时间,
      技能释放记录结果,
    })
  }

  清空buff调用函数(对象: '自身' | '目标') {
    const buff列表 = 对象 === '自身' ? this.当前自身buff列表 : this.当前目标buff列表

    // 更新目标buff
    Object.keys(buff列表).forEach((key) => {
      const buff对象 = buff列表[key]
      const buff应该消失时间 = (buff对象?.刷新时间 || 0) + (buff对象?.最大持续时间 || 0)
      const 消失层数 = buff对象?.自然消失失去层数 || buff对象?.最大层数
      if (buff应该消失时间 < this.当前时间) {
        this.卸除buff({ 名称: key, 对象, 事件时间: buff应该消失时间, 卸除层数: 消失层数 })
      }
    })
  }

  清空已经消失的buff() {
    // 更新目标buff
    this.清空buff调用函数('目标')
    // 更新自身buff
    this.清空buff调用函数('自身')
  }

  // 对当前的DOT进行已过期的结算和剩余时间更新
  DOT结算与更新() {
    this.技能类实例集合?.流血?.结算流血伤害()
    this.技能类实例集合?.截辕?.结算截辕伤害()
  }

  // 模拟轮次开始
  本轮模拟开始前() {
    this.重置循环执行结果()
    this.DOT结算与更新()
  }

  // 模拟轮次释放结束
  本轮模拟结束后() {
    // 判断buff列表，清空已经消失的buff
    this.清空已经消失的buff()
    this.对所有有CD技能检查和充能()
  }

  // 技能释放校验
  技能释放校验(技能实例, 当前技能) {
    const 释放判断结果 = 技能实例.释放
      ? 技能实例.释放?.() || { 可以释放: true }
      : { 可以释放: true }
    const 校验结果 = {
      可以释放: 释放判断结果.可以释放,
      异常信息: 释放判断结果.异常信息,
    }
    if (校验结果.可以释放) {
      this.添加战斗日志?.({
        日志: 当前技能?.技能名称,
        日志类型: '释放技能',
      })
    }
    return 校验结果
  }

  // 技能释放异常
  技能释放异常(校验结果, 当前技能, i) {
    this.添加战斗日志({
      日志: `循环在第${i + 1}个技能${当前技能?.技能名称}异常终止`,
      日志类型: '循环异常',
    })
    this.循环执行结果 = '异常'
    if (校验结果?.异常信息) {
      this.循环异常信息 = {
        异常索引: i + 1,
        异常信息: 校验结果?.异常信息,
      }
    }
  }

  // 模拟函数，一个技能的释放生命周期
  模拟() {
    for (let i = 0; i < this.测试循环.length; i++) {
      this.本轮模拟开始前()
      const 当前技能 = this?.技能基础数据?.find((item) => item?.技能名称 === this.测试循环[i])

      if (当前技能) {
        const 技能实例 = this.技能类实例集合[当前技能?.技能名称]
        if (技能实例) {
          技能实例?.释放前初始化?.()
          // 获取预估技能释放时间，处理预估时间前的所有待生效事件，推进时间轴
          const { 技能计划释放时间, 等待CD, 技能预估释放时间 } = this.技能释放前(
            当前技能,
            技能实例,
            i
          )
          const 是否为读条技能 = !!技能实例?.读条时间?.()
          if (是否为读条技能) {
            技能实例?.读条?.(技能预估释放时间)
          }
          this.技能GCD和CD处理(等待CD, 技能预估释放时间, 当前技能, 技能实例)
          this.技能成功开始释放(当前技能, 技能实例)
          const 释放校验结果 = this.技能释放校验(技能实例, 当前技能)
          this.清空已经消失的buff()
          const 是否为最后一个技能 = i === this.测试循环.length - 1
          const 开始释放时间 = this.当前时间
          if (释放校验结果?.可以释放) {
            技能实例.命中?.(是否为最后一个技能)
            技能实例.造成伤害?.()
            技能实例.释放后?.()
          } else {
            this.技能释放异常(释放校验结果, 当前技能, i)
            break
          }
          this.技能释放后(当前技能, 技能计划释放时间, 开始释放时间, 技能实例)
        }
      }
      this.本轮模拟结束后()
    }
  }

  // 将日志按时间排序
  日志排序() {
    const 新日志 = [...(this.战斗日志 || [])]

    新日志.sort((a, b) => {
      return (a?.日志时间 || 0) - (b?.日志时间 || 0)
    })

    this.战斗日志 = [...(新日志 || [])]
  }

  获取当前各技能的运行状态() {
    const 各技能当前运行状态 = {}

    ;(Object.keys(this.技能类实例集合) || []).forEach((key) => {
      各技能当前运行状态[key] = this.技能类实例集合[key]?.技能运行数据 || {}
    })

    return 各技能当前运行状态
  }
}

export default 循环主类

export type 循环主类类型 = typeof 循环主类
