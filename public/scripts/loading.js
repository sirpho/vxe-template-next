/**
 * loading 占位
 * 解决首次加载时白屏的问题
 */
 (function () {
  const _root = document.querySelector('#app');
  if (_root && _root.innerHTML === '') {
    _root.innerHTML = `
  <style>
      html{
        padding: 0;
        margin: 0;
        background: #FFFFFF;
      }
      .com__box {
        margin-top: 45vh;
      }
      
      .loading,
      .loading > div {
        position: relative;
        box-sizing: border-box;
      }
      
      .loading {
        display: block;
        font-size: 0;
        color: #93B9F8;
        margin: 0 auto;
      }
      
      .loading > div {
        display: inline-block;
        float: none;
        background-color: currentColor;
        border: 0 solid currentColor;
      }
      
      .loading {
        width: 10vh;
        height: 10vh;
      }
      
      .loading > div:nth-child(1),
      .loading > div:nth-child(2) {
        position: absolute;
        left: 0;
        width: 100%;
      }
      
      .loading > div:nth-child(1) {
        top: -25%;
        z-index: 1;
        height: 100%;
        border-radius: 10%;
        animation: square-jelly-box-animate 0.6s -0.1s linear infinite;
      }
      
      .loading > div:nth-child(2) {
        bottom: -9%;
        height: 10%;
        background: #000;
        border-radius: 50%;
        opacity: 0.2;
        animation: square-jelly-box-shadow 0.6s -0.1s linear infinite;
      }
      
      
      @keyframes square-jelly-box-animate {
        17% {
          border-bottom-right-radius: 10%;
        }
      
        25% {
          transform: translateY(25%) rotate(22.5deg);
        }
      
        50% {
          border-bottom-right-radius: 100%;
          transform: translateY(50%) scale(1, 0.9) rotate(45deg);
        }
      
        75% {
          transform: translateY(25%) rotate(67.5deg);
        }
      
        100% {
          transform: translateY(0) rotate(90deg);
        }
      }
      
      @keyframes square-jelly-box-shadow {
        50% {
          transform: scale(1.25, 1);
        }
      }
  </style>
  <div class="com__box">
    <div class="loading">
      <div></div>
      <div></div>
    </div>
  </div>
    `;
  }
})();
