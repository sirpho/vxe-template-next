/**
 * loading 占位
 * 解决首次加载时白屏的问题
 */
 (function () {
  const _root = document.querySelector('#app');
  if (_root && _root.innerHTML === '') {
    _root.innerHTML = `
  <style>
      html {
        padding: 0;
        margin: 0;
        background: #FFFFFF;
      }
      .spinner-box {
        position: fixed;
        z-index: 1001;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100vh;
        opacity: 1;
        transition: all 0.5s ease;
      }
      .spinner-box .loading-taichi {
          opacity: 0.65;
          animation: rotate-all 2s infinite;
          animation-timing-function: linear;
      }

      @keyframes rotate-all {
        100% {
        transform: rotate(360deg);
        }
      }
  </style>
<div class="spinner-box">
    <div class="loading-taichi" style="">
      <svg width="150" height="150" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
      <path d="M303.5 432A80 80 0 0 1 291.5 592A80 80 0 0 1 303.5 432z" fill="#93B9F8"></path>
      <path d="M512 65A447 447 0 0 1 512 959L512 929A417 417 0 0 0 512 95A417 417 0 0 0 512 929L512 959A447 447 0 0 1 512 65z" fill="#93B9F8"></path>
      <path d="M512 95A417 417 0 0 1 929 512A208.5 208.5 0 0 1 720.5 720.5L720.5 592A80 80 0 0 0 720.5 432A80 80 0 0 0 720.5 592L720.5 720.5A208.5 208.5 0 0 1 512 512A208.5 208.5 0 0 0 303.5 303.5A208.5 208.5 0 0 0 95 512A417 417 0 0 1 512 95" fill="#93B9F8"></path>
    </svg>
    </div>
  </div>
    `;
  }
})();
