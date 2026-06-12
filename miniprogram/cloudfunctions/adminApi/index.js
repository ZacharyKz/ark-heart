// 云函数：adminApi — 管理员后台 API
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 管理员密码（生产环境应放环境变量）
const ADMIN_PASSWORD = 'ark2026admin';

exports.main = async (event, context) => {
  // 兼容多种调用方式
  let params;
  if (typeof event.body === 'string') {
    params = JSON.parse(event.body);          // HTTP 网关
  } else if (event.data && typeof event.data === 'object' && !event.action) {
    params = event.data;                       // SDK v2 可能包装在 data 里
  } else {
    params = event;                            // SDK 直调 / MCP invoke
  }
  const { action, password } = params;

  // DEBUG: 返回收到的数据
  if (action === '_debug') {
    return {
      success: true,
      debug: {
        eventKeys: Object.keys(event),
        hasBody: typeof event.body,
        hasData: event.data ? typeof event.data : 'none',
        paramsKeys: Object.keys(params),
        passwordReceived: password ? 'YES len=' + password.length : 'NO',
        passwordVal: password
      }
    };
  }

  // ─── 鉴权 ───
  if (password !== ADMIN_PASSWORD) {
    return { success: false, code: 401, message: '密码错误' };
  }

  try {
    switch (action) {

      // ─── 预约列表 ───
      case 'listAppointments': {
        const { status, page = 1, pageSize = 20 } = event;
        const query = {};
        if (status && status !== 'all') query.status = status;

        const total = await db.collection('appointments').where(query).count();
        const list = await db.collection('appointments')
          .where(query)
          .orderBy('createdAt', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        return {
          success: true,
          data: {
            list: list.data,
            total: total.total,
            page,
            pageSize
          }
        };
      }

      // ─── 确认预约 ───
      case 'confirmAppointment': {
        const { id, counselor, dateText, location } = event;
        if (!id) return { success: false, message: '缺少预约 ID' };

        // 先获取预约信息（需要 openid 发通知）
        const appt = await db.collection('appointments').doc(id).get();

        await db.collection('appointments').doc(id).update({
          data: {
            status: 'confirmed',
            counselor: counselor || '',
            dateText: dateText || '',
            location: location || '',
            updatedAt: db.serverDate()
          }
        });

        // 发送订阅消息通知
        if (appt.data && appt.data._openid) {
          try {
            await cloud.openapi.subscribeMessage.send({
              touser: appt.data._openid,
              templateId: 'TWLsZQ3vYBhWycHcN0xN5Vd3YM5yf_p7EMRldqn3dm0',
              page: '/pages/records/records',
              data: {
                date3: { value: dateText || '已确认' },
                name5: { value: appt.data.name || '来访者' },
                thing2: { value: location || '已安排' }
              },
              miniprogramState: 'formal'
            });
          } catch (e) {
            console.error('订阅消息失败:', e.errMsg || e.message);
          }
        }

        return { success: true, message: '预约已确认' };
      }

      // ─── 完成预约 ───
      case 'completeAppointment': {
        const { id } = event;
        await db.collection('appointments').doc(id).update({
          data: { status: 'done', updatedAt: db.serverDate() }
        });
        return { success: true, message: '已标记完成' };
      }

      // ─── 写报告 + 推送 ───
      case 'createReport': {
        const { appointmentId, title } = event;
        if (!appointmentId || !title) {
          return { success: false, message: '缺少必要字段' };
        }

        const appt = await db.collection('appointments').doc(appointmentId).get();
        if (!appt.data) return { success: false, message: '预约不存在' };

        // 生成报告编号: 年月日-RC序号
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
        const count = await db.collection('reports').count();
        const reportNo = `${dateStr}-RC${String(count.total + 1).padStart(2,'0')}`;

        await db.collection('reports').add({
          data: {
            appointmentId,
            _openid: appt.data._openid,
            reportNo,
            title,
            counselor: event.counselor || '',
            counselDate: event.counselDate || '',
            duration: event.duration || '',
            method: event.method || '',
            clientInfo: event.clientInfo || '',
            complaint: event.complaint || '',
            process: event.process || '',
            strengths: event.strengths || '',
            improvements: event.improvements || '',
            images: (event.images || []).map(img => ({
              fileID: img.fileID || img,
              url: img.url || img
            })),
            suggestion: event.suggestion || '',
            content: event.content || '',
            reportStatus: 'ongoing',
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        });

        return { success: true, message: '报告已创建并推送给用户' };
      }

      // ─── 统计看板 ───
      case 'getStats': {
        const total = await db.collection('appointments').count();
        const pending = await db.collection('appointments').where({ status: 'pending' }).count();
        const confirmed = await db.collection('appointments').where({ status: 'confirmed' }).count();
        const done = await db.collection('appointments').where({ status: 'done' }).count();
        const cancelled = await db.collection('appointments').where({ status: 'cancelled' }).count();

        // 性别统计
        const male = await db.collection('appointments').where({ gender: 'male' }).count();
        const female = await db.collection('appointments').where({ gender: 'female' }).count();

        // 方向统计
        const directions = ['love_marriage', 'parent_child', 'workplace', 'other'];
        const dirStats = {};
        for (const d of directions) {
          const c = await db.collection('appointments').where({ direction: d }).count();
          dirStats[d] = c.total;
        }

        return {
          success: true,
          data: {
            total: total.total,
            pending: pending.total,
            confirmed: confirmed.total,
            done: done.total,
            cancelled: cancelled.total,
            male: male.total,
            female: female.total,
            otherGender: total.total - male.total - female.total,
            directions: dirStats
          }
        };
      }

      // ─── 删除报告 ───
      case 'deleteReport': {
        const { id } = event;
        if (!id) return { success: false, message: '缺少报告 ID' };
        await db.collection('reports').doc(id).remove();
        return { success: true, message: '报告已删除' };
      }

      // ─── 报告列表 ───
      case 'listReports': {
        const list = await db.collection('reports')
          .orderBy('createdAt', 'desc')
          .limit(100)
          .get();
        return { success: true, data: list.data };
      }

      // ─── 报告详情 ───
      case 'getReport': {
        const { id } = event;
        if (!id) return { success: false, message: '缺少报告 ID' };
        const r = await db.collection('reports').doc(id).get();
        return { success: true, data: r.data };
      }

      default:
        return { success: false, message: `未知操作: ${action}` };
    }
  } catch (err) {
    console.error('adminApi error:', err);
    return { success: false, code: 500, message: '服务器错误' };
  }
};
