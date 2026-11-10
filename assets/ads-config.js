// 广告位配置：把广告联盟分配的 ID 填进来即可，留空 = 不显示任何广告（页面上的广告位会自动折叠，不占位置）。
// 说明见 MONETIZE.md。
window.AD_CONFIG = {
  provider: "",            // "baidu"（百度联盟）或 "adsense"（Google AdSense），留空关闭
  baidu: {                 // 百度联盟：代码位 ID，形如 "u1234567"
    content: "",           // 工具下方的正文广告位
    footer: ""             // 页面底部广告位
  },
  adsense: {
    client: "",            // 形如 "ca-pub-1234567890123456"
    content: "",           // 广告单元 slot ID，形如 "1234567890"
    footer: ""
  }
};
