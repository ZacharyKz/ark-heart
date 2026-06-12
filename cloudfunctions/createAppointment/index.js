// 云函数：createAppointment — 创建预约
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { name, phone, wechat, gender, age, direction, description, mode } = event;
  const wxContext = cloud.getWXContext();

  // ─── 1. 鉴权 ───
  if (!wxContext.OPENID) {
    return { success: false, code: 401, message: '未登录，请先授权' };
  }

  // ─── 2. 必填校验 ───
  const required = { name, phone, wechat, gender, age, direction, description };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    return {
      success: false,
      code: 400,
      message: `缺少必填字段: ${missing.join(', ')}`
    };
  }

  // 手机号格式校验
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { success: false, code: 400, message: '手机号格式不正确' };
  }

  // 方向枚举校验
  const validDirections = ['love_marriage', 'parent_child', 'workplace', 'other'];
  if (!validDirections.includes(direction)) {
    return { success: false, code: 400, message: '咨询方向无效' };
  }

  // ─── 3. 重复提交检查（同一用户 5 分钟内有待处理预约则阻止）───
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existing = await db.collection('appointments')
    .where({
      _openid: wxContext.OPENID,
      status: 'pending',
      createdAt: db.command.gte(fiveMinAgo)
    })
    .count();

  if (existing.total > 0) {
    return {
      success: false,
      code: 409,
      message: '您已有待处理的预约，请等待管理员确认后再提交新的预约'
    };
  }

  // ─── 4. 写入数据库 ───
  try {
    const result = await db.collection('appointments').add({
      data: {
        _openid: wxContext.OPENID,
        name: name.trim(),
        phone: phone.trim(),
        wechat: wechat.trim(),
        gender,
        age,
        direction,
        description: description.trim().substring(0, 500),
        mode: mode || 'both',
        status: 'pending',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    return {
      success: true,
      code: 200,
      message: '预约提交成功',
      data: {
        id: result._id,
        status: 'pending'
      }
    };
  } catch (err) {
    console.error('createAppointment error:', err);
    return {
      success: false,
      code: 500,
      message: '服务器错误，请稍后重试'
    };
  }
};
