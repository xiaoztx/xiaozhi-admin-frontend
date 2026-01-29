<template>
  <div class="terminal-container">
    <div class="terminal-toolbar">
      <div class="toolbar-left">
        <div class="status-indicator" :class="{ connected: connected }"></div>
        <span class="status-text">{{ connected ? 'SSH 已连接' : 'SSH 未连接' }}</span>
      </div>
      <div class="toolbar-right">
        <el-tooltip content="连接终端" placement="bottom">
          <el-button size="small" type="success" :icon="Link" circle @click="connect" :disabled="connected" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Link, SwitchButton, Delete, FullScreen } from '@element-plus/icons-vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'

const terminalRef = ref<HTMLElement>()
const connected = ref(false)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null

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
  term.writeln('Click \x1b[1;36m"Connect"\x1b[0m to start session (Simulation Mode)')
  
  // 模拟本地回显
  term.onData(data => {
    if (connected.value) {
       term?.write(data)
    }
  })
}

const connect = () => {
  connected.value = true
  term?.writeln('\r\n\x1b[33mConnecting...\x1b[0m')
  setTimeout(() => {
    term?.writeln('\x1b[32mConnected to server.\x1b[0m')
    term?.write('\r\nroot@aliyun-ecs:~# ')
    term?.focus()
  }, 1000)
}

const disconnect = () => {
  connected.value = false
  term?.writeln('\r\n\x1b[31mDisconnected.\x1b[0m')
}

const clear = () => {
  term?.clear()
}

const fit = () => {
  fitAddon?.fit()
}

onMounted(() => {
  initTerminal()
  window.addEventListener('resize', fit)
})

onBeforeUnmount(() => {
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
  border-radius: 4px;
  overflow: hidden;
}

.terminal-toolbar {
  height: 48px;
  padding: 0 16px;
  background: #252526;
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
      background-color: #909399;
      transition: all 0.3s;
      
      &.connected {
        background-color: #67C23A;
        box-shadow: 0 0 6px #67C23A;
      }
    }
    
    .status-text {
      font-size: 13px;
      color: #ccc;
      font-family: sans-serif;
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
      color: #909399;
      
      &:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
      
      &.el-button--success { color: #67C23A; &:hover { background: rgba(103,194,58,0.1); } }
      &.el-button--danger { color: #F56C6C; &:hover { background: rgba(245,108,108,0.1); } }
      &.is-disabled { color: #444; background: transparent; }
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
    &:hover { background: #555; }
  }
}
</style>
