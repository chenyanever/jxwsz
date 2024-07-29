import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = '江西卫生纸';

  @property({ type: Boolean}) enableBack: boolean = false;

  @property({ type: String}) backPath = "home";

  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--sl-color-primary-700);
      color: white;
      padding: 12px;
      padding-top: 4px;
      z-index: 100;

      position: fixed;
      left: env(titlebar-area-x, 0);
      top: env(titlebar-area-y, 0);
      height: env(titlebar-area-height, 30px);
      width: env(titlebar-area-width, 100%);
      -webkit-app-region: drag;
    }

    header h1 {
      margin-top: 0;
      margin-bottom: 0;
      font-size: 12px;
      font-weight: bold;
    }

    nav a {
      margin-left: 10px;
    }

    #back-button-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding-right: 20px;
      color: white;
    }

    @media(prefers-color-scheme: light) {
      header {
        color: black;
      }

      nav a {
        color: initial;
      }
    }

    sl-icon-button {
      color: white;
    }

    #back-icon {
      margin-right: auto; /* 将分享按钮推到最左边 */
    }

    #share-icon {
      margin-left: auto; /* 将分享按钮推到最右边 */
    }
  `;

  async _handleShare() {

    try{
        await navigator.share({title:"江西卫生纸",text:"纸机运行参数、电机巡检等功能",url:""});
    }
    catch(e) {
        alert('分享失败。');
    }
}

  render() {
    return html`
      <header>
        <div id="back-button-block">
          ${this.enableBack ? html`<sl-icon-button id="back-icon" name="chevron-left" label="返回" href="${resolveRouterPath(this.backPath)}">

          </sl--icon-button>` : null}

          <h1>${this.title}</h1>
          <sl-icon-button id="share-icon" name="share" label="分享" @click=${this._handleShare}></sl-icon-button>
        </div>
      </header>
    `;
  }
}
