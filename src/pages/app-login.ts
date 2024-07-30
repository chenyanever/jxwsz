import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { set } from "idb-keyval";
import { router } from '../router.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { supabase } from '../supabase.js';



@customElement('app-login')
export class AppLogin extends LitElement {

  username = '';
  password = '';
  errorMessage = '';

  static styles = [
    css`
    .login-container {
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

    label {
        display: block;
        margin-bottom: 5px;
    }

    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .error-message {
        color: red;
        margin-bottom: 15px;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
    }
    .register-link span {
      color: var(--sl-color-primary-600);
      text-decoration: none;
      font-weight: bold;
    }


    `
  ]

  _navigateToRegister() {
    router.navigate('/register');
  }

  render() {
    return html`
    <div class="login-container">
        <h1>江西卫生纸</h1>
        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        <form @submit=${this._login}>
            <div class="input-group">
                <sl-input name="username" label="用户名" .value=${this.username} @input=${this._handleInputChange} required></sl-input>
            </div>
            <div class="input-group">
                <sl-input name="password" label="密码" type="password" .value=${this.password} @input=${this._handleInputChange} password-toggle required></sl-input>
            </div>
            <sl-button type="submit" variant="primary">登录</sl-button>
        </form>
        <div class="register-link">
            <p>没有账号？<span @click=${this._navigateToRegister}>立即注册</span></p>
        </div>
    </div>
    `;
  }

  _handleInputChange(e: Event) {
    // @ts-ignore
    const { name, value } = e.target;
    // @ts-ignore
    this[name] = value;
}

  private async _login(e: Event) {
    e.preventDefault();
    if (!this._validateInputs()) {
        this.requestUpdate();
        return;
    }
    const { data } = await supabase.from('user').select().eq('passport', this.username);
    if (data?.length == 0) {
        this.errorMessage = '账号未注册，请先注册.';
        this.requestUpdate();
        return;
    }
    // @ts-ignore
    if (data[0].password != this.password) {
        this.errorMessage = '密码不正确.';
        this.requestUpdate();
        return;
    }
    await set('certificate', {id: data![0].id, name: data![0].name, passport: this.username, password: this.password});
    this._redirectToHome();
  }



  _validateInputs() {
    if (this.username.length < 8) {
        this.errorMessage = '用户名长度至少要8位.';
        return false;
    }

    if (this.password.length < 6) {
        this.errorMessage = '密码长度至少要6位.';
        return false;
    }

    this.errorMessage = '';
    return true;
  }

  _redirectToHome() {
    router.navigate('/');
  }
}
