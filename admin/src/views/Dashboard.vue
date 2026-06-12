<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <h1 class="brand">方舟之心 · 管理后台</h1>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
    </header>

    <!-- Tabs -->
    <nav class="tabs">
      <button v-for="t in tabs" :key="t.key" :class="['tab', { active: activeTab === t.key }]" @click="activeTab = t.key">
        {{ t.label }}
      </button>
    </nav>

    <main class="main">
      <!-- 统计看板 -->
      <section v-if="activeTab === 'stats'" class="stats-grid">
        <div class="stat-card" v-for="s in statCards" :key="s.label">
          <div class="stat-num">{{ s.num }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
        <div class="dir-stats card">
          <h3>咨询方向分布</h3>
          <div class="dir-bar" v-for="d in dirLabels" :key="d.key">
            <span class="dir-name">{{ d.label }}</span>
            <div class="dir-track"><div class="dir-fill" :style="{ width: dirPct(d.key) + '%' }"></div></div>
            <span class="dir-num">{{ stats.directions?.[d.key] || 0 }}</span>
          </div>
        </div>
        <div class="gender-stats card">
          <h3>性别分布</h3>
          <div class="gender-pie">
            <div>👨 {{ stats.male || 0 }}</div>
            <div>👩 {{ stats.female || 0 }}</div>
            <div>🔒 {{ stats.otherGender || 0 }}</div>
          </div>
        </div>
      </section>

      <!-- 预约管理 -->
      <section v-if="activeTab === 'appointments'" class="appointments">
        <div class="filters">
          <button v-for="f in filters" :key="f.key" :class="['pill', { active: currentFilter === f.key }]" @click="loadAppointments(f.key)">
            {{ f.label }}
          </button>
        </div>
        <table class="table" v-if="appointments.length">
          <thead>
            <tr><th>姓名</th><th>手机</th><th>方向</th><th>方式</th><th>状态</th><th>咨询师</th><th>时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in appointments" :key="a._id">
              <td>{{ a.name }}</td>
              <td>{{ a.phone }}</td>
              <td>{{ dirMap[a.direction] }}</td>
              <td>{{ modeMap[a.mode] }}</td>
              <td><span :class="'badge badge-' + a.status">{{ statusMap[a.status] }}</span></td>
              <td>{{ a.counselor || '-' }}</td>
              <td class="time-cell">{{ fmtDate(a.createdAt) }}</td>
              <td class="actions">
                <button v-if="a.status === 'pending'" class="act-btn confirm" @click="confirmAppt(a)">确认</button>
                <button v-if="a.status === 'confirmed'" class="act-btn complete" @click="completeAppt(a)">完成</button>
                <button v-if="a.status === 'done'" class="act-btn report" @click="showReport(a)">写报告</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty">暂无预约数据</div>
      </section>

      <!-- 报告 -->
      <section v-if="activeTab === 'reports'" class="reports">
        <form v-if="showReportForm" class="report-form card" @submit.prevent="submitReport">
          <h3>写报告 — {{ reportTarget?.name }}</h3>
          <input v-model="reportTitle" class="input" placeholder="报告标题" required />
          <textarea v-model="reportContent" class="textarea" placeholder="报告内容" rows="5" required></textarea>
          <button type="submit" class="btn">提交报告</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { callAdminApi } from '../utils/cloudbase.js';

const router = useRouter();
const activeTab = ref('appointments');
const currentFilter = ref('all');
const appointments = ref([]);
const showReportForm = ref(false);
const reportTarget = ref(null);
const reportTitle = ref('');
const reportContent = ref('');

const tabs = [
  { key: 'appointments', label: '预约管理' },
  { key: 'stats', label: '数据统计' },
  { key: 'reports', label: '报告管理' }
];

const filters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
];

const dirMap = { love_marriage: '爱情婚姻', parent_child: '亲子互动', workplace: '职场人际', other: '其他' };
const modeMap = { online: '线上', offline: '线下', both: '均可' };
const statusMap = { pending: '待确认', confirmed: '已确认', done: '已完成', cancelled: '已取消' };

const stats = reactive({});
const statCards = computedStats();

const dirLabels = [
  { key: 'love_marriage', label: '爱情婚姻' },
  { key: 'parent_child', label: '亲子互动' },
  { key: 'workplace', label: '职场人际' },
  { key: 'other', label: '其他' }
];

function computedStats() {
  return [
    { num: stats.total || 0, label: '总预约' },
    { num: stats.pending || 0, label: '待确认' },
    { num: stats.confirmed || 0, label: '已确认' },
    { num: stats.done || 0, label: '已完成' }
  ];
}

function dirPct(key) {
  const total = (stats.directions?.love_marriage || 0) + (stats.directions?.parent_child || 0) + (stats.directions?.workplace || 0) + (stats.directions?.other || 0);
  return total ? Math.round((stats.directions?.[key] || 0) / total * 100) : 0;
}

function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
}

async function loadAppointments(status) {
  currentFilter.value = status;
  const res = await callAdminApi('listAppointments', { status, pageSize: 100 });
  if (res.success) appointments.value = res.data.list;
}

async function loadStats() {
  const res = await callAdminApi('getStats');
  if (res.success) Object.assign(stats, res.data);
}

async function confirmAppt(a) {
  const counselor = prompt('咨询师姓名:', a.counselor || '');
  if (counselor === null) return;
  const dateText = prompt('预约时间 (如 6月15日 14:00):', a.dateText || '');
  if (dateText === null) return;
  const location = prompt('咨询地点 (如 腾讯会议/书香阁):', a.location || '');
  if (location === null) return;

  const res = await callAdminApi('confirmAppointment', {
    id: a._id, counselor, dateText, location
  });
  if (res.success) loadAppointments(currentFilter.value);
  else alert(res.message);
}

async function completeAppt(a) {
  if (!confirm('确认标记为已完成?')) return;
  const res = await callAdminApi('completeAppointment', { id: a._id });
  if (res.success) loadAppointments(currentFilter.value);
}

function showReport(a) {
  reportTarget.value = a;
  showReportForm.value = true;
  activeTab.value = 'reports';
}

async function submitReport() {
  const res = await callAdminApi('createReport', {
    appointmentId: reportTarget.value._id,
    title: reportTitle.value,
    content: reportContent.value
  });
  if (res.success) {
    alert('报告已创建并推送给用户');
    showReportForm.value = false;
    reportTitle.value = '';
    reportContent.value = '';
  } else {
    alert(res.message);
  }
}

function logout() {
  localStorage.removeItem('admin_password');
  router.push('/');
}

onMounted(() => {
  loadAppointments('all');
  loadStats();
});
</script>

<style scoped>
/* 保持和设计系统一致：鼠尾草绿 #6B9E7D */
.dashboard { min-height: 100vh; background: #F7F6F2; }
.header { background: #fff; border-bottom: 1px solid #EDEDEB; }
.header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; height: 56px; }
.brand { font-size: 18px; font-weight: 700; color: #2D2D2D; }
.logout-btn { background: none; border: 1px solid #EDEDEB; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #999; }
.logout-btn:hover { border-color: #991B1B; color: #991B1B; }
.tabs { max-width: 1200px; margin: 0 auto; display: flex; gap: 4px; padding: 16px 24px 0; }
.tab { padding: 10px 24px; border: none; background: transparent; border-radius: 8px 8px 0 0; font-size: 14px; color: #999; cursor: pointer; font-weight: 500; }
.tab.active { background: #fff; color: #6B9E7D; font-weight: 600; }
.main { max-width: 1200px; margin: 0 auto; padding: 0 24px 40px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
.stat-card, .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.stat-num { font-size: 32px; font-weight: 700; color: #2D2D2D; }
.stat-label { font-size: 13px; color: #999; margin-top: 4px; }
.dir-stats { grid-column: span 2; }
.dir-stats h3, .gender-stats h3 { font-size: 15px; margin-bottom: 16px; color: #2D2D2D; }
.dir-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dir-name { width: 72px; font-size: 13px; color: #666; }
.dir-track { flex: 1; height: 8px; background: #EDEDEB; border-radius: 4px; overflow: hidden; }
.dir-fill { height: 100%; background: #6B9E7D; border-radius: 4px; transition: width 0.5s; }
.dir-num { width: 32px; font-size: 13px; color: #333; text-align: right; }
.gender-stats { grid-column: span 2; }
.gender-pie { display: flex; gap: 32px; font-size: 24px; }

/* Filters */
.filters { display: flex; gap: 8px; margin-bottom: 16px; padding-top: 16px; }
.pill { padding: 6px 16px; border: none; border-radius: 18px; font-size: 13px; background: #F0EFEB; color: #666; cursor: pointer; }
.pill.active { background: #6B9E7D; color: #fff; }

/* Table */
.table { width: 100%; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.table th, .table td { padding: 12px 16px; text-align: left; font-size: 13px; border-bottom: 1px solid #F5F5F3; }
.table th { background: #FAFAF8; font-weight: 600; color: #666; font-size: 12px; }
.time-cell { white-space: nowrap; color: #999; font-size: 12px; }
.actions { white-space: nowrap; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 500; }
.badge-pending { background: #FEF3C7; color: #A16207; }
.badge-confirmed { background: #E8F0EA; color: #5A8A6C; }
.badge-done { background: #F1F5F9; color: #64748B; }
.badge-cancelled { background: #FEF2F2; color: #991B1B; }
.act-btn { padding: 4px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500; }
.act-btn.confirm { background: #6B9E7D; color: #fff; }
.act-btn.complete { background: #E8F0EA; color: #5A8A6C; }
.act-btn.report { background: #F1F5F9; color: #64748B; }
.act-btn:hover { opacity: 0.85; }
.empty { text-align: center; padding: 60px; color: #999; font-size: 14px; }

/* Report form */
.report-form { max-width: 600px; margin-top: 16px; }
.report-form h3 { margin-bottom: 16px; }
.input, .textarea { width: 100%; padding: 10px 14px; border: 1px solid #EDEDEB; border-radius: 8px; font-size: 14px; margin-bottom: 12px; outline: none; }
.input:focus, .textarea:focus { border-color: #6B9E7D; }
.btn { padding: 10px 32px; background: #6B9E7D; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn:hover { background: #5A8A6C; }
</style>
