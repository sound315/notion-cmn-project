/**
 * LLM Chatbot 임베딩 위젯
 * 사용법: <script src="https://your-server/widget/chatbot.js" data-api-url="https://your-api-server"></script>
 */
(function () {
  const script = document.currentScript;
  const API_URL = script?.getAttribute('data-api-url') || 'http://localhost:8000';
  const POSITION = script?.getAttribute('data-position') || 'bottom-right';
  const PRIMARY_COLOR = script?.getAttribute('data-color') || '#10a37f';
  const TITLE = script?.getAttribute('data-title') || 'AI 챗봇';

  // ── 스타일 주입 ───────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #llm-chatbot-btn {
      position: fixed;
      ${POSITION.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      ${POSITION.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      width: 56px; height: 56px;
      border-radius: 50%;
      background: ${PRIMARY_COLOR};
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 99998;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    #llm-chatbot-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }

    #llm-chatbot-panel {
      position: fixed;
      ${POSITION.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      ${POSITION.includes('bottom') ? 'bottom: 92px;' : 'top: 92px;'}
      width: 400px; height: 600px;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      z-index: 99999;
      overflow: hidden;
      display: none;
      flex-direction: column;
      background: #fff;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0; transform: translateY(16px);
    }
    #llm-chatbot-panel.open {
      display: flex; opacity: 1; transform: translateY(0);
    }
    #llm-chatbot-header {
      background: ${PRIMARY_COLOR};
      color: #fff;
      padding: 12px 16px;
      display: flex; align-items: center; justify-content: space-between;
      font-family: -apple-system, sans-serif;
      font-size: 15px; font-weight: 600;
    }
    #llm-chatbot-close {
      background: none; border: none; color: #fff;
      font-size: 20px; cursor: pointer; padding: 0 4px;
    }
    #llm-chatbot-iframe {
      flex: 1; border: none; width: 100%;
    }
    @media (max-width: 480px) {
      #llm-chatbot-panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        right: 8px; left: 8px;
        bottom: 80px;
      }
    }
  `;
  document.head.appendChild(style);

  // ── 위젯 DOM 생성 ─────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'llm-chatbot-btn';
  btn.setAttribute('aria-label', '챗봇 열기');
  btn.innerHTML = '💬';

  const panel = document.createElement('div');
  panel.id = 'llm-chatbot-panel';
  panel.innerHTML = `
    <div id="llm-chatbot-header">
      <span>${TITLE}</span>
      <button id="llm-chatbot-close" aria-label="닫기">✕</button>
    </div>
    <iframe
      id="llm-chatbot-iframe"
      src="${API_URL}/embed"
      allow="microphone"
      title="${TITLE}"
    ></iframe>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // ── 이벤트 핸들러 ─────────────────────────────────────────
  let isOpen = false;

  function openPanel() {
    isOpen = true;
    panel.style.display = 'flex';
    requestAnimationFrame(() => panel.classList.add('open'));
    btn.innerHTML = '✕';
    btn.setAttribute('aria-label', '챗봇 닫기');
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    setTimeout(() => { panel.style.display = 'none'; }, 200);
    btn.innerHTML = '💬';
    btn.setAttribute('aria-label', '챗봇 열기');
  }

  btn.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  panel.querySelector('#llm-chatbot-close').addEventListener('click', closePanel);

  // ESC 키로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // 부모 → iframe 메시지 전달 (선택적 연동)
  window.addEventListener('message', (e) => {
    const iframe = document.getElementById('llm-chatbot-iframe');
    if (!iframe) return;
    if (e.data?.type === 'llm-chatbot-open') openPanel();
    if (e.data?.type === 'llm-chatbot-close') closePanel();
  });
})();
