import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-paper-device-args')
class AppPaperDeviceArgs extends LitElement {
    static styles = css`
        .paper-device-args-container {
            padding: 20px;
            text-align: center;
        }
    `;

    render() {
        return html`
            <app-header enableBack title="纸机运行参数"></app-header>
            <div class="paper-device-args-container">
                <h1>纸机运行参数</h1>
                <p>This is a blank page for Paper Machine Operating Parameters.</p>
            </div>
           <app-toolbar></app-toolbar>
        `;
    }
}