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
      <button v-for="t in tabs" :key="t.key" :class="['tab', { active: activeTab === t.key }]" @click="switchTab(t.key)">
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

        <!-- 报告列表 -->
        <div v-if="!showReportForm">
          <div class="rpt-list-header-bar">
            <span class="rpt-count">共 {{ reports.length }} 份报告</span>
          </div>
          <table class="table" v-if="reports.length">
            <thead><tr><th>标题</th><th>来访者</th><th>咨询师</th><th>日期</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="r in reports" :key="r._id">
                <td>{{ r.title || '-' }}</td>
                <td>{{ r.clientInfo ? r.clientInfo.slice(0,15) : '-' }}</td>
                <td>{{ r.counselor || '-' }}</td>
                <td>{{ r.counselDate || '-' }}</td>
                <td><span :class="'badge ' + (r.reportStatus === 'ongoing' ? 'badge-pending' : 'badge-done')">{{ r.reportStatus === 'ongoing' ? '进行中' : '已关闭' }}</span></td>
                <td>
                  <button class="act-btn report" @click="viewReport(r)">查看</button>
                  <button class="act-btn delete-btn" @click="deleteReport(r)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty">暂无报告</div>
        </div>

        <!-- 报告表单 -->
        <form v-if="showReportForm" class="report-form-full card" @submit.prevent="submitReport">
          <div class="form-top-bar">
            <h3>关系咨询个案报告 — {{ reportTarget?.name }}</h3>
            <button type="button" class="btn-back" @click="showReportForm = false">← 返回报告管理</button>
          </div>

          <div class="rpt-row">
            <div class="rpt-field"><label>报告标题</label><input v-model="rpt.title" class="input" placeholder="关系咨询个案报告" /></div>
            <div class="rpt-field"><label>咨询师</label><input v-model="rpt.counselor" class="input" placeholder="咨询师姓名" /></div>
          </div>
          <div class="rpt-row rpt-row-3">
            <div class="rpt-field"><label>咨询日期</label><input v-model="rpt.counselDate" type="date" class="input" /></div>
            <div class="rpt-field"><label>咨询时长</label><input v-model="rpt.duration" class="input" placeholder="50分钟" /></div>
            <div class="rpt-field"><label>咨询方式</label>
              <select v-model="rpt.method" class="input"><option value="">选择</option><option>面谈</option><option>视频</option><option>语音</option></select>
            </div>
          </div>

          <div class="rpt-field"><label>来访者基本信息</label><input v-model="rpt.clientInfo" class="input" placeholder="如：小林（化名），女，26岁，互联网公司产品运营" /></div>

          <div class="rpt-field"><label>主诉问题</label><textarea v-model="rpt.complaint" class="textarea" rows="4" placeholder="来访者自述的主要困扰和症状..." /></div>

          <div class="rpt-field"><label>咨询过程概述</label><textarea v-model="rpt.process" class="textarea" rows="5" placeholder="咨询初期...咨询中段...咨询后段..." /></div>

          <div class="rpt-field"><label>你的优势</label><textarea v-model="rpt.strengths" class="textarea" rows="3" placeholder="来访者在哪些方面做得不错、有哪些积极特质..." /></div>

          <div class="rpt-field"><label>你可以继续提升的地方</label><textarea v-model="rpt.improvements" class="textarea" rows="3" placeholder="哪些方面还有成长空间、可以尝试的方向..." /></div>

          <div class="rpt-field"><label>后续建议</label><textarea v-model="rpt.suggestion" class="textarea" rows="3" placeholder="咨询频率、方向建议、辅助练习..." /></div>

          <!-- 已有图片展示 -->
          <div class="rpt-field" v-if="rptImages.length > 0 || (reportTarget && reportTarget.images && reportTarget.images.length)">
            <label>图片报告</label>
            <div class="img-grid">
              <div class="img-card" v-for="(img, i) in (reportTarget?.images || [])" :key="'old-'+i">
                <img :src="img.url || img" @click="previewImage(img.url || img)" style="cursor:pointer" />
              </div>
            </div>
          </div>

          <!-- 图片上传 -->
          <div class="rpt-field">
            <label v-if="!reportTarget?._id">图片报告（可选 — 上传图片后文字字段可不填）</label>
            <label v-else>追加图片</label>
            <input type="file" accept="image/*" multiple @change="onImagesPicked" ref="fileInput" style="display:none" />
            <div class="upload-dropzone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="onDropImages">
              <div class="upload-icon">📷</div>
              <div class="upload-text">点击或拖拽图片到此处</div>
              <div class="upload-sub">支持 JPG/PNG，可多张</div>
            </div>
            <div class="img-grid" v-if="rptImages.length > 0">
              <div class="img-card" v-for="(img, i) in rptImages" :key="i">
                <img :src="img.preview" />
                <button type="button" class="img-del" @click="rptImages.splice(i, 1)">✕</button>
              </div>
              <div class="img-card img-add" @click="$refs.fileInput.click()">
                <div class="add-icon">+</div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn">提交报告</button>
        </form>
      </section>

    </main>

    <!-- 确认预约弹窗 -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="modal-card">
        <h3>确认预约 — {{ confirmTarget?.name }}</h3>
        <input v-model="confirmForm.counselor" class="input" placeholder="咨询师姓名" />
        <input v-model="confirmForm.dateText" class="input" placeholder="预约时间 (如 6月15日 14:00)" />
        <input v-model="confirmForm.location" class="input" placeholder="咨询地点 (如 腾讯会议/书香阁)" />
        <div class="modal-btns">
          <button class="btn btn-cancel" @click="showConfirm = false">取消</button>
          <button class="btn" @click="doConfirm">确认预约</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { callAdminApi, uploadImage } from '../utils/cloudbase.js';

const router = useRouter();
const activeTab = ref('appointments');
const currentFilter = ref('all');
const appointments = ref([]);
const showReportForm = ref(false);
const reportTarget = ref(null);
const reports = ref([]);
const rpt = ref({
  title: '关系咨询个案报告', counselor: '', counselDate: '',
  duration: '50分钟', method: '', clientInfo: '',
  complaint: '', process: '', strengths: '', improvements: '', suggestion: ''
});
const rptImages = ref([]);
const showConfirm = ref(false);
const confirmTarget = ref(null);
const confirmForm = ref({ counselor: '', dateText: '', location: '' });

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

const dirMap = { love_marriage: '爱情婚姻', parent_child: '亲子互动', workplace: '职场人际', personal_growth: '个人成长', other: '其他' };
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

function confirmAppt(a) {
  confirmTarget.value = a;
  confirmForm.value = { counselor: '', dateText: '', location: '' };
  showConfirm.value = true;
}

async function doConfirm() {
  const a = confirmTarget.value;
  const f = confirmForm.value;
  const res = await callAdminApi('confirmAppointment', {
    id: a._id,
    counselor: f.counselor,
    dateText: f.dateText,
    location: f.location
  });
  if (res.success) {
    showConfirm.value = false;
    loadAppointments(currentFilter.value);
  } else {
    alert(res.message);
  }
}

async function completeAppt(a) {
  if (!confirm('确认标记为已完成?')) return;
  const res = await callAdminApi('completeAppointment', { id: a._id });
  if (res.success) loadAppointments(currentFilter.value);
}

function showReport(a) {
  reportTarget.value = a;
  rpt.value = {
    title: '关系咨询个案报告',
    counselor: a.counselor || '',
    counselDate: new Date().toISOString().split('T')[0],
    duration: '50分钟',
    method: a.mode === 'online' ? '视频' : '面谈',
    clientInfo: '',
    complaint: '',
    process: '',
    strengths: '',
    improvements: '',
    suggestion: ''
  };
  rptImages.value = [];
  showReportForm.value = true;
  activeTab.value = 'reports';
}

async function loadReports() {
  const res = await callAdminApi('listReports');
  if (res.success) reports.value = res.data || [];
}

function viewReport(r) {
  reportTarget.value = r;
  rpt.value = {
    title: r.title || '关系咨询个案报告',
    counselor: r.counselor || '',
    counselDate: r.counselDate || '',
    duration: r.duration || '',
    method: r.method || '',
    clientInfo: r.clientInfo || '',
    complaint: r.complaint || '',
    process: r.process || '',
    strengths: r.strengths || '',
    improvements: r.improvements || '',
    suggestion: r.suggestion || ''
  };
  rptImages.value = [];
  showReportForm.value = true;
}

async function deleteReport(r) {
  if (!confirm('确定删除报告「' + (r.title || '无标题') + '」？此操作不可撤销。')) return;
  const res = await callAdminApi('deleteReport', { id: r._id });
  if (res.success) {
    loadReports();
  } else {
    alert(res.message);
  }
}

function previewImage(url) {
  // url 可能是 { fileID, url } 对象或纯字符串
  const imgUrl = typeof url === 'object' ? (url.url || url.fileID) : url;
  window.open(imgUrl, '_blank');
}

function addImages(files) {
  Array.from(files).forEach(f => {
    if (!f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      rptImages.value.push({ file: f, preview: ev.target.result, uploaded: false });
    };
    reader.readAsDataURL(f);
  });
}

function onImagesPicked(e) {
  addImages(e.target.files);
  e.target.value = '';
}

function onDropImages(e) {
  addImages(e.dataTransfer.files);
}

async function submitReport() {
  // 校验：必须上传图片或填写文字内容
  const hasImages = rptImages.value.length > 0;
  const hasText = rpt.value.complaint || rpt.value.process || rpt.value.strengths || rpt.value.improvements;
  if (!hasImages && !hasText) {
    alert('请填写报告文字内容，或上传图片报告（二选一）');
    return;
  }

  // 上传图片
  const imageList = [];
  for (const img of rptImages.value) {
    if (!img.uploaded && img.file) {
      try {
        const result = await uploadImage(img.file);
        imageList.push({ fileID: result.fileID, url: result.url });
        img.uploaded = true;
      } catch (e) {
        alert('图片上传失败: ' + (e.message || JSON.stringify(e)));
        return;
      }
    }
  }

  const res = await callAdminApi('createReport', {
    appointmentId: reportTarget.value._id,
    ...rpt.value,
    images: imageList
  });
  if (res.success) {
    alert('报告已创建');
    showReportForm.value = false;
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
  loadReports();
});

// tab 切换时刷新数据
function switchTab(key) {
  activeTab.value = key;
  if (key === 'appointments') loadAppointments(currentFilter.value);
  if (key === 'stats') loadStats();
  if (key === 'reports') loadReports();
}
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
<style scoped>
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-card { background: #fff; border-radius: 16px; padding: 32px; width: 400px; max-width: 90vw; }
.modal-card h3 { font-size: 18px; margin-bottom: 20px; color: #2D2D2D; }
.modal-card .input { width: 100%; padding: 10px 14px; border: 1px solid #EDEDEB; border-radius: 8px; font-size: 14px; margin-bottom: 12px; outline: none; display: block; box-sizing: border-box; }
.modal-card .input:focus { border-color: #6B9E7D; }
.modal-btns { display: flex; gap: 12px; margin-top: 16px; }
.modal-btns .btn { flex: 1; padding: 10px 0; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.modal-btns .btn-cancel { background: #F0EFEB; color: #666; }
</style>

<style scoped>
/* Report form */
.report-form-full { padding: 32px; max-width: 800px; margin-top: 16px; }
.report-form-full h3 { margin-bottom: 24px; font-size: 18px; color: #2D2D2D; }
.rpt-row { display: flex; gap: 16px; margin-bottom: 12px; }
.rpt-row-3 .rpt-field { flex: 1; }
.rpt-field { flex: 1; margin-bottom: 16px; }
.rpt-field label { display: block; font-size: 13px; color: #666; margin-bottom: 4px; font-weight: 500; }
.rpt-field .input, .rpt-field .textarea { width: 100%; padding: 8px 12px; border: 1px solid #EDEDEB; border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box; }
.rpt-field .input:focus, .rpt-field .textarea:focus { border-color: #6B9E7D; }
.rpt-field .textarea { resize: vertical; }
.btn { padding: 12px 40px; background: #6B9E7D; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn:hover { background: #5A8A6C; }
</style>

<style scoped>
/* Upload */
.upload-dropzone { border: 2px dashed #D0D0D0; border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
.upload-dropzone:hover { border-color: #6B9E7D; background: rgba(107,158,125,0.03); }
.upload-icon { font-size: 36px; margin-bottom: 8px; }
.upload-text { font-size: 14px; color: #666; }
.upload-sub { font-size: 12px; color: #999; margin-top: 4px; }
.img-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.img-card { width: 100px; height: 100px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid #EDEDEB; }
.img-card img { width: 100%; height: 100%; object-fit: cover; }
.img-del { position: absolute; top: 2px; right: 2px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: none; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
.img-add { display: flex; align-items: center; justify-content: center; cursor: pointer; background: #FAFAF8; }
.add-icon { font-size: 28px; color: #C0C0C0; }
</style>

<style scoped>
.delete-btn { background: #FEF2F2; color: #991B1B; margin-left: 6px; }
.delete-btn:hover { background: #FEE2E2; }
</style>

<style scoped>
.form-top-bar { margin-bottom: 16px; }
.btn-back { background: none; border: 1px solid #EDEDEB; padding: 6px 16px; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; }
.btn-back:hover { border-color: #6B9E7D; color: #6B9E7D; }
</style>

<style scoped>
.form-top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.form-top-bar h3 { margin: 0; font-size: 18px; color: #2D2D2D; }
.btn-back { background: none; border: 1px solid #D0D0D0; padding: 6px 18px; border-radius: 8px; font-size: 14px; color: #666; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.btn-back:hover { border-color: #6B9E7D; color: #6B9E7D; }
</style>

<style scoped>
/* Image Manager */
.img-mgr-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-top: 16px; }
.btn-upload-img { padding: 8px 20px; background: #6B9E7D; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; display: inline-block; }
.btn-upload-img:hover { background: #5A8A6C; }
.img-grid-mgr { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.img-card-mgr { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow: hidden; }
.img-preview-mgr { width: 100%; height: 150px; object-fit: cover; }
.img-name { font-size: 12px; color: #666; padding: 8px 12px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.img-actions { display: flex; gap: 6px; padding: 8px 12px 12px; }
.act-btn.small { font-size: 11px; padding: 3px 10px; border-radius: 6px; }
</style>
