<template>
  <div class="terminal-container">
    <div class="terminal-toolbar">
      <div class="toolbar-left">
        <div class="status-indicator" :class="{ connected: connected }"></div>
        <span class="status-text">{{ connected ? 'SSH 已连接' : 'SSH 未连接' }}</span>
      </div>
      <div class="toolbar-right">
        <el-tooltip content="连接终端" placement="bottom">
          <el-button size="small" type="success" :icon="Link" circle @click="showConnectDialog" :disabled="connected" />
        </el-tooltip>
        <el-tooltip content="断开连接" placement="bottom">
          <el-button size="small" type="danger" :icon="SwitchButton" circle @click="disconnect" :disabled="!connected" />
        </el-tooltip>
        <el-divider direction="vertical" />
        <el-tooltip content="清屏" placement="bottom">
          <el-button size="small" :icon="Delete" circle @click="clear" />
        </el-tooltip>
        <el-tooltip content="全屏/自适应" placement="bottom">
          <el-button size="small" :icon="FullScreen" circle @click="fit" />
        </el-tooltip>
      </div>
    </div>
    <div ref="terminalRef" class="xterm-viewport"></div>

    <!-- 连接信息对话框 -->
    <el-dialog v-model="dialogVisible" title="SSH 连接信息" width="400px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="主机 IP">
          <el-input v-model="form.ip" placeholder="请输入公网IP" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="form.port" placeholder="22" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.user" placeholder="root" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入SSH密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="connectReal" :loading="connecting">
            连接
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { Link, SwitchButton, Delete, FullScreen } from '@element-plus/icons-vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { ElMessage } from 'element-plus'
import 'xterm/css/xterm.css'

const terminalRef = ref<HTMLElement>()
const connected = ref(false)
const connecting = ref(false)
const dialogVisible = ref(false)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: WebSocket | null = null

const form = reactive({
  ip: '', // 这里可以尝试从父组件获取 props 填充
  port: '22',
  user: 'root',
  password: ''
})

// 暴露一个方法供父组件调用以预填IP
const setServerInfo = (ip: string) => {
  form.ip = ip
}
defineExpose({ setServerInfo })

const initTerminal = () => {
  if (!terminalRef.value) return

  term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    lineHeight: 1.2,
    fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
    theme: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      cursor: '#ffffff',
      selectionBackground: 'rgba(255, 255, 255, 0.3)',
      black: '#000000',
      red: '#cd3131',
      green: '#0dbc79',
      yellow: '#e5e510',
      blue: '#2472c8',
      magenta: '#bc3fbc',
      cyan: '#11a8cd',
      white: '#e5e5e5',
      brightBlack: '#666666',
      brightRed: '#f14c4c',
      brightGreen: '#23d18b',
      brightYellow: '#f5f543',
      brightBlue: '#3b8eea',
      brightMagenta: '#d670d6',
      brightCyan: '#29b8db',
      brightWhite: '#e5e5e5'
    }
  })

  fitAddon = new FitAddon()
  const webLinksAddon = new WebLinksAddon()
  
  term.loadAddon(fitAddon)
  term.loadAddon(webLinksAddon)
  term.open(terminalRef.value)
  fitAddon.fit()

  term.writeln('\x1b[1;32mWelcome to WebSSH Terminal\x1b[0m')
  term.writeln('Click \x1b[1;36m"Connect"\x1b[0m to start SSH session')
  
  term.onData(data => {
    if (connected.value && socket && socket.readyState === WebSocket.OPEN) {
       socket.send(data)
    }
  })
  
  term.onResize(size => {
    if (connected.value && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'resize',
        cols: size.cols,
        rows: size.rows
      }))
    }
  })
}

const showConnectDialog = () => {
  dialogVisible.value = true
}

const connectReal = () => {
  if (!form.ip || !form.password) {
    ElMessage.warning('请输入IP和密码')
    return
  }

  connecting.value = true
  term?.writeln(`\r\n\x1b[33mConnecting to ${form.ip}...\x1b[0m`)

  // 构建 WebSocket URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // 假设后端在 8081 端口
  const host = 'localhost:8081' // 开发环境硬编码
  
  // 获取 token
  const token = localStorage.getItem('token')
  const url = `${protocol}//${host}/api/v1/ssh/ws?ip=${form.ip}&port=${form.port}&user=${form.user}&password=${encodeURIComponent(form.password)}&token=${token}`

  try {
    socket = new WebSocket(url)
    socket.binaryType = 'arraybuffer'

    socket.onopen = () => {
      connected.value = true
      connecting.value = false
      dialogVisible.value = false
      term?.writeln('\r\n\x1b[32mConnection established.\x1b[0m\r\n')
      term?.focus()
      fit()
    }

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        term?.write(event.data)
      } else {
        const buffer = new Uint8Array(event.data)
        term?.write(buffer)
      }
    }

    socket.onclose = () => {
      connected.value = false
      connecting.value = false
      term?.writeln('\r\n\x1b[31mConnection closed.\x1b[0m')
      socket = null
    }

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error)
      term?.writeln('\r\n\x1b[31mWebSocket Error.\x1b[0m')
      connecting.value = false
    }

  } catch (e) {
    console.error(e)
    connecting.value = false
    term?.writeln(`\r\n\x1b[31mConnection failed: ${e}\x1b[0m`)
  }
}

const disconnect = () => {
  if (socket) {
    socket.close()
  }
}

const clear = () => {
  term?.clear()
}

const fit = () => {
  fitAddon?.fit()
  if (connected.value && socket && term) {
    socket.send(JSON.stringify({
      type: 'resize',
      cols: term.cols,
      rows: term.rows
    }))
  }
}

onMounted(() => {
  initTerminal()
  window.addEventListener('resize', fit)
})

onBeforeUnmount(() => {
  disconnect()
  term?.dispose()
  window.removeEventListener('resize', fit)
})
</script>

<style scoped lang="scss">
.terminal-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    height: 100vh;
    border-radius: 0;
  }
}

.terminal-toolbar {
  height: 48px;
  padding: 0 16px;
  background: #252526; /* VS Code Toolbar Color */
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #666;
      transition: all 0.3s;
      
      &.connected {
        background-color: var(--color-success);
        box-shadow: 0 0 6px var(--color-success);
      }
    }
    
    .status-text {
      font-size: 13px;
      color: #ccc;
      font-family: 'JetBrains Mono', monospace;
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    :deep(.el-button--small.is-circle) {
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      background: transparent;
      color: #ccc;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
      
      &.el-button--success { color: var(--color-success); &:hover { background: rgba(103,194,58,0.2); } }
      &.el-button--danger { color: var(--color-danger); &:hover { background: rgba(245,108,108,0.2); } }
      &.is-disabled { color: #666; background: transparent; cursor: not-allowed; }
    }
    
    :deep(.el-divider--vertical) {
      border-color: #444;
      height: 16px;
    }
  }
}

.xterm-viewport {
  flex: 1;
  padding: 8px;
  overflow: hidden;
  background-color: #1e1e1e;
  
  /* 滚动条样式优化 */
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 5px;
    &:hover { background: #666; }
  }
}
</style>
