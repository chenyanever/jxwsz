import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from '../router.js';
import { get } from "idb-keyval";

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  static styles = [
    styles,
    css`
        .home-container {
            padding: 20px;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        }
        .grid-item {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
        }
        .grid-item h2 {
            margin: 0 0 10px 0;
        }
  `];

  isLoading: boolean;

  constructor() {
      super();
      this.isLoading = true;
  }


  async connectedCallback() {
    super.connectedCallback();
    await this._checkLoginStatus();
  }

  async _checkLoginStatus() {
      const certificate = await get('certificate');
      if (certificate) {
        router.navigate('/');
        this.isLoading = false;
        this.requestUpdate();
      } else {
        router.navigate('/login');
      }
  }

  _navigateToPaperMachine() {
    router.navigate('/paper-device-args/index');
  }

  render() {
    if (this.isLoading) {
      return html`<div class="loading">Loading...</div>`;
    }

    return html`
      <app-header></app-header>
      <div class="home-container">
          <h1>Welcome Home</h1>
          <div class="grid-container">
              <div class="grid-item" @click=${this._navigateToPaperMachine}>
                  <h2>纸机运行参数</h2>
                  <p>查看和管理纸机的运行参数。</p>
              </div>
              <div class="grid-item">
                  <h2>电机巡检</h2>
                  <p>检查和记录电机的运行情况。</p>
              </div>
          </div>
      </div>
      <app-toolbar></app-toolbar>
    `;
  }


}
