import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { set } from "idb-keyval";
import { router } from '../router.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';

import { supabase } from '../supabase.js';

@customElement('app-register')
export class AppRegister extends LitElement {

    static styles = css`
    .register-container {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        width: 300px;
        text-align: center;
    }
    .input-group {
        margin-bottom: 15px;
        text-align: left;
    }

    form {
      max-width: 300px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }
    .login-link {
      text-align: center;
      margin-top: 20px;
    }
    .login-link span {
      color: var(--sl-color-primary-600);
      text-decoration: none;
      font-weight: bold;
    }
  `;

  username = '';
  name = '';
  password = '';
  confirmPassword = '';
  error = '';

  async _isDuplicate() {
    const { data } = await supabase.from('user').select().eq('passport', this.username);
    // @ts-ignore
    return data.length > 0;
  }

  _validateInputs() {
    if (this.username.length < 8) {
        this.error = '用户名长度至少要8位.';
        return false;
    }

    if (this.password.length < 6) {
        this.error = '密码长度至少要6位.';
        return false;
    }

    this.error = '';
    return true;
  }

  async _handleRegister(e:Event) {
    e.preventDefault();

    if (!this._validateInputs()) {
        this.requestUpdate();
        return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = '密码不匹配，请重新输入。';
      this.requestUpdate();
      return;
    }

    if (await this._isDuplicate()) {
        this.error = '账号已存在，请重新输入';
        this.requestUpdate();
        return;
    }

    // Implement registration logic with Supabase here
    try {
      const { data, error } = await supabase.from('user').insert({passport: this.username,
        name: this.name, password: this.password}).select();
      console.log('id',data![0].id);
      console.log('passport',data![0].passport);
      await set('certificate', {id: data![0].id, passport: this.username, password: this.password});

      if (error) {
        this.error = '注册失败：' + error.message;
      } else {
        router.navigate('/');;
      }
    } catch (err) {
      // @ts-ignore
      this.error = '注册失败：' + err.message;
    }
    this.requestUpdate();
  }

  _navigateToLogin() {
    router.navigate('/login');
  }

  render() {
    return html`
      <div class="register-container">
        <form @submit=${this._handleRegister}>
            <div class="input-group"><sl-input label="用户名*" name="username" required @sl-change=${
              // @ts-ignore
              e => this.username = e.target.value}></sl-input></div>
            <div class="input-group"><sl-input label="姓名*" name="name" required @sl-change=${
              // @ts-ignore
              e => this.name = e.target.value}></sl-input></div>
            <div class="input-group"><sl-input label="密码*" name="password" type="password" required @sl-change=${
              // @ts-ignore
              e => this.password = e.target.value}></sl-input></div>
            <div class="input-group"><sl-input label="确认密码*" name="confirmPassword" type="password" required @sl-change=${
              // @ts-ignore
              e => this.confirmPassword = e.target.value}></sl-input></div>
            ${this.error ? html`<sl-alert variant="danger" open>${this.error}</sl-alert>` : ''}
            <sl-button type="submit" variant="primary">注册</sl-button>
        </form>
        <div class="login-link">
            <p>已有账号？<span @click=${this._navigateToLogin}>立即登录</span></p>
        </div>
      </div>
    `;
  }

}
