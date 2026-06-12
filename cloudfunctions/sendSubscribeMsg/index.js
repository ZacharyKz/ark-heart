// 云函数：sendSubscribeMsg — 发送订阅消息
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const TEMPLATE_ID = 'TWLsZQ3vYBhWycHcN0xN5Vd3YM5yf_p7EMRldqn3dm0';

// 模板字段: date3(开始时间) name5(预约人) thing2(预约地点)

exports.main = async (event, context) => {
  const { openid, type } = event;
  if (!openid || !type) {
    return { success: false, message: '缺少参数' };
  }

  try {
    let data, page;
    switch (type) {
      case 'confirmed':
        data = {
          date3: { value: event.dateText || event.counselDate || '待定' },
          name5: { value: event.userName || '来访者' },
          thing2: { value: event.location || '线上咨询' }
        };
        page = '/pages/records/records';
        break;
      case 'report':
        data = {
          date3: { value: new Date().toLocaleDateString('zh-CN') },
          name5: { value: '咨询报告已发布' },
          thing2: { value: event.reportTitle || '关系咨询个案报告' }
        };
        page = '/pages/reports/reports';
        break;
      default:
        return { success: false, message: '未知消息类型' };
    }

    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: TEMPLATE_ID,
      page,
      data,
      miniprogramState: 'formal'
    });

    return { success: true, result };
  } catch (err) {
    console.error('sendSubscribeMsg error:', err);
    return { success: false, message: err.errMsg || err.message };
  }
};
