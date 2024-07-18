import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { set } from "idb-keyval";
import { router } from '../router.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { supabase } from '../supabase.js';
import { session } from '../session.js';


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

    button:hover {
        background-color: #0056b3;
    }

    .error-message {
        color: red;
        margin-bottom: 15px;
    }
    `
  ]

  render() {
    return html`
    <div class="login-container">
        <h1>江西卫生纸</h1>
        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        <form id="loginForm" @submit=${this._login}>
            <div class="input-group">
                <sl-input name="username" label="用户名" .value=${this.username} @input=${this._handleInputChange} required></sl-input>
            </div>
            <div class="input-group">
                <sl-input name="password" label="密码" type="password" .value=${this.password} @input=${this._handleInputChange} password-toggle required></sl-input>
            </div>
            <sl-button type="submit" variant="primary">登录</sl-button>
        </form>
    </div>
    `;
  }

  _handleInputChange(e: Event) {
    const { name, value } = e.target;
    this[name] = value;
}

  private async _login(e: Event) {
    e.preventDefault();
    if (!this._validateInputs()) {
        this.requestUpdate();
        return;
    }
    const { data, error } = await supabase.from('user').insert({passport: this.username,
        password: this.password}).select();
    console.log('id',data![0].id);
    console.log('passport',data![0].passport);
    await set('certificate', {id: data![0].id, passport: this.username, password: this.password});
    session.user =  {id: data![0].id, name: '未设置', passport: this.username, password: this.password};
    this._redirectToHome();
  }



  _validateInputs() {
    if (this.username.length < 4) {
        this.errorMessage = 'Username must be at least 4 characters long.';
        return false;
    }

    if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long.';
        return false;
    }

    this.errorMessage = '';
    return true;
  }

  _redirectToHome() {
    router.navigate('/');
  }
}
