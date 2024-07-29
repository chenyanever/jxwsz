import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { set, del, get } from "idb-keyval";
import { supabase } from '../../supabase';
import { router } from '../../router';

@customElement('app-profile')
export class AppProfile extends LitElement {
    static styles = css`
        .profile-container {
            padding: 20px;
            padding-bottom: 60px; /* Space for the toolbar */
            text-align: center;
        }
        .profile-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #ccc;
            margin-bottom: 20px;
        }
        .profile-info {
            margin-bottom: 20px;
        }
        .profile-info p {
            margin: 0;
        }
        .profile-actions button {
            margin: 5px;
            padding: 10px 20px;
            font-size: 16px;
        }
    `;

    certificate: any | null;

    async connectedCallback() {
        super.connectedCallback();
        this.certificate = await get('certificate');
    }

    async _updatePassword() {
        this.certificate.password = '123456';
        const { data, error } = await supabase.from('user').upsert({id: this.certificate.id, passport: this.certificate.passport,
            password: this.certificate.password},{ignoreDuplicates:false}).select();

        await set('certificate', {id: this.certificate.id,  passport: this.certificate.passport,
            password: this.certificate.password});
    }

    async _logout() {
        await del('certificate');
        session.user = null;
        router.navigate('/');
    }

    render() {
        return html`
            <div class="profile-container">
                <div class="profile-avatar"></div>
                <div class="profile-info">
                   <p>姓名: ${ session.user?.name}</p>
                </div>
                <div class="profile-actions">
                    <button @click=${this._updatePassword}>修改密码</button>
                    <button @click=${this._logout}>登出</button>
                </div>
            </div>
        `;
    }


}

