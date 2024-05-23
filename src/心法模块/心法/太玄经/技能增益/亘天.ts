import { 技能增益列表类型 } from '@/@types/技能'
import 通用增益 from './通用增益/通用增益'
import 九字诀通用增益 from './通用增益/九字诀通用增益'

const 亘天增益: 技能增益列表类型[] = [...通用增益, ...九字诀通用增益]

export default 亘天增益
