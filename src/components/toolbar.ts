import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from '../router';

@customElement('app-toolbar')
export class AppToolbar extends LitElement {
    static styles = css`
        .toolbar {
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #007bff;
            color: white;
            text-align: center;
            padding: 10px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-around;
        }
        .toolbar button {
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
        }
        .toolbar button:hover {
            text-decoration: underline;
        }
    `;

    render() {
        return html`
            <div class="toolbar">
                <button @click=${() => router.navigate('/home')}>首页</button>
                <button @click=${() => router.navigate('/profile')}>我的</button>
            </div>
        `;
    }
}
