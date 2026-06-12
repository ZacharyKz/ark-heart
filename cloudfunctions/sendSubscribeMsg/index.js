// 云函数：sendSubscribeMsg — 发送订阅消息
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 模板消息配置（模板 ID 从微信公众平台获取后替换）
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';

exports.main = async (event, context) => {
  const { openid, appointmentId, type } = event;

  if (!openid || !type) {
    return { success: false, message: '缺少参数' };
  }

  try {
    // 根据 type 构建消息内容
    let data;
    switch (type) {
      case 'confirmed':
        // 预约已确认
        data = {
          thing1: { value: '您的咨询预约已确认' },
          time2: { value: event.dateText || '待定' },
          thing3: { value: event.counselor || '待分配咨询师' },
          thing4: { value: `咨询方式：${event.location || '待定'}` }
        };
        break;
      case 'report':
        // 报告已发布
        data = {
          thing1: { value: '您的咨询报告已发布' },
          thing2: { value: event.reportTitle || '关系咨询个案报告' },
          date3: { value: new Date().toLocaleDateString('zh-CN') }
        };
        break;
      default:
        return { success: false, message: '未知消息类型' };
    }

    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: TEMPLATE_ID,
      page: `/pages/reports/reports`,
      data,
      miniprogramState: 'formal'
    });

    return { success: true, result };
  } catch (err) {
    console.error('sendSubscribeMsg error:', err);
    return { success: false, message: err.errMsg || err.message };
  }
};
