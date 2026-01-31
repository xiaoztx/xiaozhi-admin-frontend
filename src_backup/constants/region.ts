export const REGION_MAP: Record<string, string> = {
  // 阿里云地域
  'cn-hangzhou': '华东1 (杭州)',
  'cn-shanghai': '华东2 (上海)',
  'cn-qingdao': '华北1 (青岛)',
  'cn-beijing': '华北2 (北京)',
  'cn-zhangjiakou': '华北3 (张家口)',
  'cn-huhehaote': '华北5 (呼和浩特)',
  'cn-wulanchabu': '华北6 (乌兰察布)',
  'cn-shenzhen': '华南1 (深圳)',
  'cn-heyuan': '华南2 (河源)',
  'cn-guangzhou': '华南3 (广州)',
  'cn-chengdu': '西南1 (成都)',
  'cn-hongkong': '中国香港',
  'us-west-1': '美国西部 (硅谷)',
  'us-east-1': '美国东部 (弗吉尼亚)',
  'ap-southeast-1': '新加坡',
  'ap-southeast-2': '澳大利亚 (悉尼)',
  'ap-southeast-3': '马来西亚 (吉隆坡)',
  'ap-southeast-5': '印度尼西亚 (雅加达)',
  'ap-northeast-1': '日本 (东京)',
  'eu-central-1': '德国 (法兰克福)',
  'eu-west-1': '英国 (伦敦)',
  'me-east-1': '阿联酋 (迪拜)',

  // 腾讯云地域
  'ap-guangzhou': '华南地区 (广州)',
  'ap-shanghai': '华东地区 (上海)',
  'ap-nanjing': '华东地区 (南京)',
  'ap-beijing': '华北地区 (北京)',
  'ap-chengdu': '西南地区 (成都)',
  'ap-chongqing': '西南地区 (重庆)',
  'ap-hongkong': '港澳台地区 (中国香港)',
  'ap-singapore': '亚太东南 (新加坡)',
  'ap-seoul': '亚太东北 (首尔)',
  'ap-tokyo': '亚太东北 (东京)',
  'ap-bangkok': '亚太东南 (曼谷)',
  'na-siliconvalley': '美国西部 (硅谷)',
  'na-ashburn': '美国东部 (弗吉尼亚)',
  'eu-frankfurt': '欧洲地区 (法兰克福)',
}

export const ZONE_MAP: Record<string, string> = {
  // 广州
  'ap-guangzhou-1': '广州一区',
  'ap-guangzhou-2': '广州二区',
  'ap-guangzhou-3': '广州三区',
  'ap-guangzhou-4': '广州四区',
  'ap-guangzhou-6': '广州六区',
  'ap-guangzhou-7': '广州七区',
  // 上海
  'ap-shanghai-1': '上海一区',
  'ap-shanghai-2': '上海二区',
  'ap-shanghai-3': '上海三区',
  'ap-shanghai-4': '上海四区',
  'ap-shanghai-5': '上海五区',
  'ap-shanghai-8': '上海八区',
  // 北京
  'ap-beijing-1': '北京一区',
  'ap-beijing-2': '北京二区',
  'ap-beijing-3': '北京三区',
  'ap-beijing-4': '北京四区',
  'ap-beijing-5': '北京五区',
  'ap-beijing-6': '北京六区',
  'ap-beijing-7': '北京七区',
  // 成都
  'ap-chengdu-1': '成都一区',
  'ap-chengdu-2': '成都二区',
  // 重庆
  'ap-chongqing-1': '重庆一区',
  // 南京
  'ap-nanjing-1': '南京一区',
  'ap-nanjing-2': '南京二区',
  'ap-nanjing-3': '南京三区',
  // 香港
  'ap-hongkong-1': '香港一区',
  'ap-hongkong-2': '香港二区',
  'ap-hongkong-3': '香港三区',
  // 阿里云常见Zone后缀
  'cn-hangzhou-b': '杭州可用区B',
  'cn-hangzhou-h': '杭州可用区H',
  'cn-hangzhou-i': '杭州可用区I',
  'cn-hangzhou-j': '杭州可用区J',
  'cn-shanghai-a': '上海可用区A',
  'cn-shanghai-b': '上海可用区B',
  'cn-shanghai-e': '上海可用区E',
  'cn-shanghai-g': '上海可用区G',
  'cn-shanghai-l': '上海可用区L',
  'cn-shanghai-m': '上海可用区M',
  'cn-shanghai-n': '上海可用区N',
  'cn-beijing-a': '北京可用区A',
  'cn-beijing-b': '北京可用区B',
  'cn-beijing-c': '北京可用区C',
  'cn-beijing-d': '北京可用区D',
  'cn-beijing-e': '北京可用区E',
  'cn-beijing-f': '北京可用区F',
  'cn-beijing-g': '北京可用区G',
  'cn-beijing-h': '北京可用区H',
  'cn-shenzhen-a': '深圳可用区A',
  'cn-shenzhen-b': '深圳可用区B',
  'cn-shenzhen-c': '深圳可用区C',
  'cn-shenzhen-d': '深圳可用区D',
  'cn-shenzhen-e': '深圳可用区E',
  'cn-shenzhen-f': '深圳可用区F',
}

export const getRegionLabel = (region: string) => {
  // 尝试完全匹配
  if (REGION_MAP[region]) return REGION_MAP[region]
  
  // 尝试部分匹配（去除最后的数字或后缀）
  // 比如 ap-guangzhou-4 -> ap-guangzhou
  const parts = region.split('-')
  if (parts.length > 2) {
      const parentRegion = parts.slice(0, 2).join('-')
      if (REGION_MAP[parentRegion]) return REGION_MAP[parentRegion]
  }
  
  return region
}

export const getZoneLabel = (zone: string) => {
  return ZONE_MAP[zone] || zone
}
