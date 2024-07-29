import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import moment from 'moment-timezone';
import { get } from "idb-keyval";
import { Router } from '@thepassle/app-tools/router.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import { supabase } from '../../supabase';
import { router } from '../../router';
import { styles } from '../../styles/shared-styles';


@customElement('app-paper-device-args-edit')
class AppPaperDeviceArgsEdit extends LitElement {
    title: string = "纸机运行参数";

    deviceList: any[] | null = [];;

    statusList: any[] | null = [];

    reasonList: any[] | null = [];

    mannerList: any[] | null = [];

    scraperManufacturerList: any[] | null = [];

    wetStrengthList: any[] | null = [];

    formData = {
        report_date: null,
        device: null,
        status: null,
        stop_reason: null,
        speed: null,
        paper_category: null,
        crepe_ratio: null,
        gas_long_fiber_ratio: null,
        short_fiber_tower_rate_setting: null,
        yangke_long_fiber_ratio: null,
        long_fiber_mill_power1: null,
        short_fiber_mill_power: null,
        gas_short_fiber_ratio: null,
        yangke_short_fiber_ratio: null,
        long_fiber_mill_power2: null,
        lip_plate_opening: null,
        vacuum_roll_line_pressure: null,
        vacuum_roller_vacuum_degree: null,
        turbine_frequency: null,
        steam_pressure: null,
        heat_pump_opening: null,
        gas_dry_temper: null,
        gas_wet_temper: null,
        wet_fan_frequency: null,
        dry_fan_frequency: null,
        jet_wire_speed_ratio: null,
        scraper_manufacturer: null,
        scraper_degree: null,
        scraper_manner: null,
        scraper_using_period: null,
        mesh_tension: null,
        fabric_tension: null,
        fabric_pressure_water: null,
        wet_strength_using: null,
        fabric_width: null,
        wet_strength: null,
        steam_consumption: null,
        gas_electricity_consumption: null,
        transmission_electricity_consumption: null,
        vacuum_electricity_consumption: null,
        remark: null
    };

    static styles = [
        styles, css`
        .form-container {
            padding: 20px;
            padding-top: 60px;
            padding-bottom: 60px; /* Space for the toolbar */
            display: block;
        }
        .form-container sl-input,
        .form-container sl-select,
        .form-container sl-date-picker,
        .form-container sl-textarea {
            margin-bottom: 20px;
            display: block;
        }

        .form-container .button-container {
            display: flex;
            justify-content: flex-end;
            width: 100%;
        }

        sl-button {
            margin-top: 20px;
            align:
        }

        .suffix {
            color: #666; /* Adjust color to make it dimmer */
        }
        .radio-group {
        display: flex;
        align-items: center;
        gap: 10px; /* Space between radio buttons */
        margin-top: 20px;
        }

    `];

    certificate: any | null;

    _id = 0;

    async connectedCallback() {
        super.connectedCallback();
        this.certificate = await get('certificate');
        await this._initData();
        this._id=router.context.params.id; // Access the path parameter
        await this.loadData(this._id);
        this.requestUpdate();
    }

    async loadData(id: number) {
        if (!id) return;
        // Fetch the data from Supabase or your data source using the ID
        // Example:
        const { data, error } = await supabase
          .from('paper_device_args_report')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching data:', error);
        } else {
          this.formData = data;
        }
      }


    private async _initData() {
        await Promise.all([this._fecthStatuses(), this._fecthReasons(),this._fecthDevices(),
            this._fecthScraperManufacturers(),this._fecthMannerList(),this._fecthWetStrengths()]);
    }

    private async _fecthStatuses() {
        const {data} = await supabase.from("dictionary").select("code,value").eq("category","running_status");
        this.statusList = data;
    }

    private async _fecthReasons() {
        const {data} = await supabase.from("dictionary").select("code,value").eq("category","stop_reason");
        this.reasonList = data;
    }

    private async _fecthMannerList() {
        const {data} = await supabase.from("dictionary").select("code,value").eq("category","scraper_manner");
        this.mannerList = data;
    }

    private async _fecthDevices() {
        const {data} = await supabase.from("paper_device").select("id,no,args_template");
        this.deviceList = data;
    }

    private async _fecthScraperManufacturers() {
        const {data} = await supabase.from("scraper_manufacturer").select("id,name");
        this.scraperManufacturerList = data;
    }

    private async _fecthWetStrengths() {
        const {data} = await supabase.from("wet_strength").select("id,name");
        this.wetStrengthList = data;
    }


    _handleInputChange(e: Event) {
        const { name, value } = e.target;
        this.formData = { ...this.formData, [name]: value };
        this.requestUpdate();
    }

    async _handleSubmit(e: Event) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const entity = Object.fromEntries(formData);
        const { error } = await supabase.from("paper_device_args_report").upsert({
            id: this._id,
            created_by: this.certificate.id,
            report_date: moment.tz(entity.report_date, 'Asia/Shanghai').utc(),
            device: entity.device,
            status: entity.status,
            stop_reason: entity.stop_reason,
            speed: entity.speed,
            paper_category: entity.paper_category,
            crepe_ratio: entity.crepe_ratio,
            gas_long_fiber_ratio: entity.gas_long_fiber_ratio,
            short_fiber_tower_rate_setting: entity.short_fiber_tower_rate_setting,
            yangke_long_fiber_ratio: entity.yangke_long_fiber_ratio,
            long_fiber_mill_power1: entity.long_fiber_mill_power1,
            short_fiber_mill_power: entity.short_fiber_mill_power,
            gas_short_fiber_ratio: entity.gas_short_fiber_ratio,
            yangke_short_fiber_ratio: entity.yangke_short_fiber_ratio,
            long_fiber_mill_power2: entity.long_fiber_mill_power2,
            lip_plate_opening: entity.lip_plate_opening,
            vacuum_roll_line_pressure: entity.vacuum_roller_vacuum_degree,
            vacuum_roller_vacuum_degree: entity.vacuum_roller_vacuum_degree,
            turbine_frequency: entity.turbine_frequency,
            steam_pressure: entity.steam_pressure,
            heat_pump_opening: entity.heat_pump_opening,
            gas_dry_temper: entity.gas_dry_temper,
            gas_wet_temper: entity.gas_wet_temper,
            wet_fan_frequency: entity.wet_fan_frequency,
            dry_fan_frequency: entity.dry_fan_frequency,
            jet_wire_speed_ratio: entity.jet_wire_speed_ratio,
            scraper_manufacturer: entity.scraper_manufacturer,
            scraper_degree: entity.scraper_degree,
            scraper_manner: entity.scraper_manner,
            scraper_using_period: entity.scraper_using_period,
            mesh_tension: entity.mesh_tension,
            fabric_tension: entity.fabric_tension,
            fabric_pressure_water: entity.fabric_pressure_water,
            wet_strength_using: entity.wet_strength_using,
            fabric_width: entity.fabric_width,
            wet_strength: entity.wet_strength,
            steam_consumption: entity.steam_consumption,
            gas_electricity_consumption: entity.gas_electricity_consumption,
            transmission_electricity_consumption: entity.transmission_electricity_consumption,
            vacuum_electricity_consumption: entity.vacuum_electricity_consumption,
            remark: entity.remark,
            keywords: `${this.certificate.name},${moment.tz(entity.reportDate, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm')},
            ${this.deviceList?.find(e=>e.id==entity.device).no},${this.statusList?.find(e=>e.code==entity.status).value},
            ${entity.stop_reason==null || undefined?``:`${this.reasonList?.find(e=>e.code==entity.stop_reason).value},`}
            ${entity.speed==null || undefined?``:`${entity.speed}m/min,`}
            ${entity.paper_category==null || undefined?``:`${entity.paper_category},`}
            ${entity.crepe_ratio==null || undefined?``:`${entity.crepe_ratio}%,`}
            ${entity.gas_long_fiber_ratio==null || undefined?``:`${entity.gas_long_fiber_ratio}%,`}
            ${entity.gas_short_fiber_ratio==null || undefined?``:`${entity.gas_short_fiber_ratio}%,`}
            ${entity.yangke_long_fiber_ratio==null || undefined?``:`${entity.yangke_long_fiber_ratio}%,`}
            ${entity.yangke_short_fiber_ratio==null || undefined?``:`${entity.yangke_short_fiber_ratio}%,`}
            ${entity.short_fiber_tower_rate_setting==null || undefined?``:`${entity.short_fiber_tower_rate_setting}%,`}
            ${entity.long_fiber_mill_power1==null || undefined?``:`${entity.long_fiber_mill_power1}%,`}
            ${entity.long_fiber_mill_power2==null || undefined?``:`${entity.long_fiber_mill_power2}%,`}
            ${entity.short_fiber_mill_power==null || undefined?``:`${entity.short_fiber_mill_power}%,`}
            ${entity.lip_plate_opening==null || undefined?``:`${entity.lip_plate_opening}%,`}
            ${entity.vacuum_roll_line_pressure==null || undefined?``:`${entity.vacuum_roll_line_pressure}KN/m,`}
            ${entity.vacuum_roller_vacuum_degree==null || undefined?``:`-${entity.vacuum_roller_vacuum_degree}kpa,`}
            ${entity.turbine_frequency==null || undefined?``:`${entity.turbine_frequency}hz,`}
            ${entity.steam_pressure==null || undefined?``:`${entity.steam_pressure}bar,`}
            ${entity.heat_pump_opening==null || undefined?``:`${entity.heat_pump_opening}%,`}
            ${entity.gas_dry_temper==null || undefined?``:`${entity.gas_dry_temper}°C,`}
            ${entity.gas_wet_temper==null || undefined?``:`${entity.gas_wet_temper}°C,`}
            ${entity.wet_fan_frequency==null || undefined?``:`${entity.wet_fan_frequency}%,`}
            ${entity.dry_fan_frequency==null || undefined?``:`${entity.dry_fan_frequency}%,`}
            ${entity.jet_wire_speed_ratio==null || undefined?``:`${entity.jet_wire_speed_ratio},`}
            ${entity.scraper_manufacturer==null || undefined?``:`${this.scraperManufacturerList?.find(e=>e.id==entity.scraper_manufacturer).name},`}
            ${entity.scraper_degree==null || undefined?``:`${entity.scraper_degree}°${entity.scraper_manner==null || undefined?`,`:`${this.mannerList?.find(e=>e.code==entity.scraper_manner).value},`}`}
            ${entity.scraper_using_period==null || undefined?``:`${entity.scraper_using_period}h,`}
            ${entity.steam_consumption==null || undefined?``:`${entity.steam_consumption}T/t,`}
            ${entity.gas_electricity_consumption==null || undefined?``:`${entity.gas_electricity_consumption}kwh/t,`}
            ${entity.transmission_electricity_consumption==null || undefined?``:`${entity.transmission_electricity_consumption}kwh/t,`}
            ${entity.vacuum_electricity_consumption==null || undefined?``:`${entity.vacuum_electricity_consumption}kwh/t,`}
            ${entity.mesh_tension==null || undefined?``:`${entity.mesh_tension}KN,`}
            ${entity.fabric_tension==null || undefined?``:`${entity.fabric_tension}KN/m,`}
            ${entity.fabric_pressure_water==null?``:`${entity.fabric_pressure_water}KG,`}
            ${entity.wet_strength==null || undefined?``:`${this.wetStrengthList?.find(e=>e.id==entity.wet_strength).name},`}
            ${entity.wet_strength_using==null || undefined?``:`${entity.wet_strength_using}kg/t,`}
            ${entity.fabric_width==null || undefined?``:`${entity.fabric_width}mm,`}
            ${entity.remark==null || undefined?``:`${entity.remark}`}
            `.replace(/^\s+/gm, '').replace('\r\n','')});
        router.navigate('/paper-device-args/index');
    }

    _deviceTemplate(device: number): number {
        return this.deviceList?.find(e=>e.id==device).args_template;
    }

    _renderStopFragment() {
        return html`<sl-select label="停机原因*" name="stop_reason" value=${this.formData.stop_reason} @sl-change=${this._handleInputChange} required>
                ${this.reasonList?.map((reason) =>
                    html`<sl-option value=${reason.code}>${reason.value}</sl-option>`
                )}
            </sl-select>
            <div class="button-container">
                <sl-button type="submit" variant="primary">提交</sl-button>
            </div>`;
    }

    _renderTemplate(template: number) {
        if (template == 1) {
            return html`<sl-input label="车速*" name="speed" type="number" value=${this.formData.speed} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">m/min</span>
                        </sl-input>
                        <sl-input label="纸种*" name="paper_category" value=${this.formData.paper_category} @sl-change=${this._handleInputChange} required></sl-input>
                        <sl-input label="起皱率*" name="crepe_ratio" type="number"
                        min="0" max="100"  value=${this.formData.crepe_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="气罩层长纤比率*" name="gas_long_fiber_ratio" type="number"
                        min="0" max="100"  value=${this.formData.gas_long_fiber_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="气罩层短纤比率*" name="gas_short_fiber_ratio" type="number"
                        min="0" max="100"  value=${this.formData.gas_short_fiber_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="杨克缸层长纤比率*" name="yangke_long_fiber_ratio" type="number"
                        min="0" max="100"  value=${this.formData.yangke_long_fiber_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="杨克缸层短纤比率*" name="yangke_short_fiber_ratio" type="number"
                        min="0" max="100"  value=${this.formData.yangke_short_fiber_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="短纤塔比率设定*" name="short_fiber_tower_rate_setting" type="number"
                        min="0" max="100"  value=${this.formData.short_fiber_tower_rate_setting} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="长纤磨机1功率*" name="long_fiber_mill_power1" type="number"
                        min="0" max="100"  value=${this.formData.long_fiber_mill_power1} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="长纤磨机2功率*" name="long_fiber_mill_power2" type="number"
                        min="0" max="100"  value=${this.formData.long_fiber_mill_power2} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="短纤磨机功率*" name="short_fiber_mill_power" type="number"
                        min="0" max="100"  value=${this.formData.short_fiber_mill_power} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="唇板开度*" name="lip_plate_opening" type="number"
                            step="0.1" value=${this.formData.lip_plate_opening} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">mm</span>
                        </sl-input>
                        <sl-input label="真空辊线压力*" name="vacuum_roll_line_pressure" type="number"
                            value=${this.formData.vacuum_roll_line_pressure} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">KN/m</span>
                        </sl-input>
                        <sl-input label="真空辊真空度*" name="vacuum_roller_vacuum_degree" type="number"
                            step="0.1" value=${this.formData.vacuum_roller_vacuum_degree} @sl-change=${this._handleInputChange} required>
                            <span slot="prefix" class="suffix">-</span>
                            <span slot="suffix" class="suffix">kpa</span>
                        </sl-input>
                        <sl-input label="透平机频率*" name="turbine_frequency" type="number"
                            value=${this.formData.turbine_frequency} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">hz</span>
                        </sl-input>
                        <sl-input label="蒸汽压力*" name="steam_pressure" type="number"
                            step="0.1" value=${this.formData.steam_pressure} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">bar</span>
                        </sl-input>
                        <sl-input label="热泵开度*" name="heat_pump_opening" type="number"
                        min="0" max="100"  value=${this.formData.heat_pump_opening} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="干端气罩温度*" name="gas_dry_temper" type="number"
                            step="0.1" value=${this.formData.gas_dry_temper} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°C</span>
                        </sl-input>
                        <sl-input label="湿端气罩温度*" name="gas_wet_temper" type="number"
                            step="0.1" value=${this.formData.gas_wet_temper} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°C</span>
                        </sl-input>
                        <sl-input label="湿端循环风机频率*" name="wet_fan_frequency" type="number"
                        min="0" max="100"  value=${this.formData.wet_fan_frequency} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="干端循环风机频率*" name="dry_fan_frequency" type="number"
                        min="0" max="100"  value=${this.formData.dry_fan_frequency} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="浆网速比*" name="jet_wire_speed_ratio" type="number"
                            step="0.001" value=${this.formData.jet_wire_speed_ratio} @sl-change=${this._handleInputChange} required>
                        </sl-input>
                        <sl-select label="刮刀厂家*" name="scraper_manufacturer" value=${this.formData.scraper_manufacturer} @sl-change=${this._handleInputChange} required>
                            ${this.scraperManufacturerList?.map((sm) =>
                                html`<sl-option value=${sm.id}>${sm.name}</sl-option>`
                            )}
                        </sl-select>
                        <sl-input label="刮刀角度*" name="scraper_degree" type="number"
                        min="0" max="360"  value=${this.formData.scraper_degree} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°</span>
                        </sl-input>
                        <sl-radio-group name="scraper_manner" value=${this.formData.scraper_degree} @sl-change=${this._handleInputChange} required>
                            ${this.mannerList?.map((m) =>
                                html`<sl-radio-button name="scraper_manner" value=${m.code}>${m.value}</sl-radio-button>`
                            )}
                        </sl-radio-group>
                        <sl-input label="刮刀使用时长*" name="scraper_using_period" type="number"
                            step="0.01" value=${this.formData.scraper_using_period} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">h</span>
                        </sl-input>
                        <sl-input label="成型网张力*" name="mesh_tension" type="number"
                            step="0.01" value=${this.formData.mesh_tension} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">KN</span>
                        </sl-input>
                        <sl-input label="毛布张力*" name="fabric_tension" type="number"
                            step="0.01" value=${this.formData.fabric_tension} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">KN/m</span>
                        </sl-input>
                        <sl-input label="毛布高压水*" name="fabric_pressure_water" type="number"
                            value=${this.formData.fabric_pressure_water} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">KG</span>
                        </sl-input>
                        <sl-input label="湿强剂用量*" name="wet_strength_using" type="number"
                            value=${this.formData.wet_strength_using} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kg/t</span>
                        </sl-input>
                        <sl-input label="幅宽*" name="fabric_width" type="number"
                            value=${this.formData.fabric_width} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">mm</span>
                        </sl-input>
                        <sl-textarea label="备注" name="remark" value=${this.formData.remark}></sl-textarea>
                        <div class="button-container">
                            <sl-button type="submit" variant="primary">提交</sl-button>
                        </div>`;
        } else if (template == 2) {
            return html`<sl-input label="车速*" name="speed" type="number" value=${this.formData.speed} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">m/min</span>
                        </sl-input>
                        <sl-input label="纸种*" name="paper_category" value=${this.formData.paper_category} @sl-change=${this._handleInputChange} required></sl-input>
                        <sl-input label="起皱率*" name="crepe_ratio" type="number"
                        min="0" max="100"  value=${this.formData.crepe_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="真空辊真空度*" name="vacuum_roller_vacuum_degree" type="number"
                            step="0.1" value=${this.formData.vacuum_roller_vacuum_degree} @sl-change=${this._handleInputChange} required>
                            <span slot="prefix" class="suffix">-</span>
                            <span slot="suffix" class="suffix">kpa</span>
                        </sl-input>
                        <sl-input label="透平机频率*" name="turbine_frequency" type="number"
                            value=${this.formData.turbine_frequency} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">hz</span>
                        </sl-input>
                        <sl-input label="蒸汽压力*" name="steam_pressure" type="number"
                            step="0.1" value=${this.formData.steam_pressure} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">bar</span>
                        </sl-input>
                        <sl-input label="热泵开度*" name="heat_pump_opening" type="number"
                        min="0" max="100"  value=${this.formData.heat_pump_opening} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="干端气罩温度*" name="gas_dry_temper" type="number"
                            step="0.1" value=${this.formData.gas_dry_temper} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°C</span>
                        </sl-input>
                        <sl-input label="浆网速比*" name="jet_wire_speed_ratio" type="number"
                            step="0.001" value=${this.formData.jet_wire_speed_ratio} @sl-change=${this._handleInputChange} required>
                        </sl-input>
                        <sl-select label="刮刀厂家*" name="scraper_manufacturer" value=${this.formData.scraper_manufacturer} @sl-change=${this._handleInputChange} required>
                            ${this.scraperManufacturerList?.map((sm) =>
                                html`<sl-option value=${sm.id}>${sm.name}</sl-option>`
                            )}
                        </sl-select>
                        <sl-input label="刮刀角度*" name="scraper_degree" type="number"
                        min="0" max="360"  value=${this.formData.scraper_degree} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°</span>
                        </sl-input>
                        <sl-radio-group name="scraper_manner"  value=${this.formData.scraper_manner} required>
                            ${this.mannerList?.map((m) =>
                                html`<sl-radio-button name="scraper_manner" value=${m.code}>${m.value}</sl-radio-button>`
                            )}
                        </sl-radio-group>
                        <sl-input label="刮刀使用时长*" name="scraper_using_period" type="number"
                            step="0.01" value=${this.formData.scraper_using_period} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">h</span>
                        </sl-input>
                        <sl-input label="蒸汽吨耗*" name="steam_consumption" type="number"
                            value=${this.formData.steam_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">T/t</span>
                        </sl-input>
                        <sl-input label="汽罩电耗*" name="gas_electricity_consumption" type="number"
                            value=${this.formData.gas_electricity_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kwh/t</span>
                        </sl-input>
                        <sl-input label="传动电耗*" name="transmission_electricity_consumption" type="number"
                            value=${this.formData.transmission_electricity_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kwh/t</span>
                        </sl-input>
                        <sl-input label="真空泵电耗*" name="vacuum_electricity_consumption" type="number"
                            value=${this.formData.vacuum_electricity_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kwh/t</span>
                        </sl-input>
                        <sl-input label="毛布高压水*" name="fabric_pressure_water" type="number"
                            value=${this.formData.fabric_pressure_water} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">KG</span>
                        </sl-input>
                        <sl-select label="湿强剂*" name="wet_strength" value=${this.formData.wet_strength} @sl-change=${this._handleInputChange} required>
                            ${this.wetStrengthList?.map((ws) =>
                                html`<sl-option value=${ws.id}>${ws.name}</sl-option>`
                            )}
                        </sl-select>
                        <sl-input label="湿强剂用量*" name="wet_strength_using" type="number"
                            value=${this.formData.wet_strength_using} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kg/t</span>
                        </sl-input>
                        <sl-input label="幅宽*" name="fabric_width" type="number"
                            value=${this.formData.fabric_width} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">mm</span>
                        </sl-input>
                        <sl-textarea label="备注" name="remark" value=${this.formData.remark}></sl-textarea>
                        <div class="button-container">
                            <sl-button type="submit" variant="primary">提交</sl-button>
                        </div>`;
        } else {
            return html`<sl-input label="车速*" name="speed" type="number" value=${this.formData.speed} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">m/min</span>
                        </sl-input>
                        <sl-input label="纸种*" name="paper_category" value=${this.formData.paper_category} @sl-change=${this._handleInputChange} required></sl-input>
                        <sl-input label="起皱率*" name="crepe_ratio" type="number"
                        min="0" max="100"  value=${this.formData.crepe_ratio} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="真空辊真空度*" name="vacuum_roller_vacuum_degree" type="number"
                            step="0.1" value=${this.formData.vacuum_roller_vacuum_degree} @sl-change=${this._handleInputChange} required>
                            <span slot="prefix" class="suffix">-</span>
                            <span slot="suffix" class="suffix">kpa</span>
                        </sl-input>
                        <sl-input label="蒸汽压力*" name="steam_pressure" type="number"
                            step="0.1" value=${this.formData.steam_pressure} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">bar</span>
                        </sl-input>
                        <sl-input label="热泵开度*" name="heat_pump_opening" type="number"
                        min="0" max="100"  value=${this.formData.heat_pump_opening} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">%</span>
                        </sl-input>
                        <sl-input label="干端气罩温度*" name="gas_dry_temper" type="number"
                            step="0.1" value=${this.formData.gas_dry_temper} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°C</span>
                        </sl-input>
                        <sl-input label="湿端气罩温度*" name="gas_wet_temper" type="number"
                            step="0.1" value=${this.formData.gas_wet_temper} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°C</span>
                        </sl-input>
                        <sl-input label="浆网速比*" name="jet_wire_speed_ratio" type="number"
                            step="0.001" value=${this.formData.jet_wire_speed_ratio} @sl-change=${this._handleInputChange} required>
                        </sl-input>
                        <sl-select label="刮刀厂家*" name="scraper_manufacturer" value=${this.formData.scraper_manufacturer} @sl-change=${this._handleInputChange} required>
                            ${this.scraperManufacturerList?.map((sm) =>
                                html`<sl-option value=${sm.id}>${sm.name}</sl-option>`
                            )}
                        </sl-select>
                        <sl-input label="刮刀角度*" name="scraper_degree" type="number"
                        min="0" max="360"  value=${this.formData.scraper_degree} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">°</span>
                        </sl-input>
                        <sl-radio-group name="scraper_manner"  value=${this.formData.scraper_manner} required>
                            ${this.mannerList?.map((m) =>
                                html`<sl-radio-button name="scraper_manner" value=${m.code}>${m.value}</sl-radio-button>`
                            )}
                        </sl-radio-group>
                        <sl-input label="刮刀使用时长*" name="scraper_using_period" type="number"
                            step="0.01" value=${this.formData.scraper_using_period} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">h</span>
                        </sl-input>
                        <sl-input label="蒸汽吨耗*" name="steam_consumption" type="number"
                            value=${this.formData.steam_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">T/t</span>
                        </sl-input>
                        <sl-input label="汽罩电耗*" name="gas_electricity_consumption" type="number"
                            value=${this.formData.gas_electricity_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kwh/t</span>
                        </sl-input>
                        <sl-input label="传动电耗*" name="transmission_electricity_consumption" type="number"
                            value=${this.formData.transmission_electricity_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kwh/t</span>
                        </sl-input>
                        <sl-input label="真空泵电耗*" name="vacuum_electricity_consumption" type="number"
                            value=${this.formData.vacuum_electricity_consumption} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kwh/t</span>
                        </sl-input>
                        <sl-input label="毛布高压水*" name="fabric_pressure_water" type="number"
                            value=${this.formData.fabric_pressure_water} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">KG</span>
                        </sl-input>
                        <sl-select label="湿强剂*" name="wet_strength" value=${this.formData.wet_strength} @sl-change=${this._handleInputChange} required>
                            ${this.wetStrengthList?.map((ws) =>
                                html`<sl-option value=${ws.id}>${ws.name}</sl-option>`
                            )}
                        </sl-select>
                        <sl-input label="湿强剂用量*" name="wet_strength_using" type="number"
                            value=${this.formData.wet_strength_using} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">kg/t</span>
                        </sl-input>
                        <sl-input label="幅宽*" name="fabric_width" type="number"
                            value=${this.formData.fabric_width} @sl-change=${this._handleInputChange} required>
                            <span slot="suffix" class="suffix">mm</span>
                        </sl-input>
                        <sl-textarea label="备注" name="remark" value=${this.formData.remark}></sl-textarea>
                        <div class="button-container">
                            <sl-button type="submit" variant="primary">提交</sl-button>
                        </div>`;
        }

    }

    render() {
        return html`
            <app-header enableBack title=${this.title} backPath="paper-device-args/index"></app-header>
            <div class="form-container">
                <span>汇报人 ${this.certificate?.name}</span> </br></br>
                <form @submit=${this._handleSubmit}>
                    <sl-input label="汇报时间*" name="report_date" type="datetime-local" value=${moment.tz(this.formData.report_date, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm')} @sl-change=${this._handleInputChange} required></sl-input>
                    <sl-select label="机台*" name="device" value=${this.formData.device} @sl-change=${this._handleInputChange} required>
                        ${this.deviceList?.map((device) =>
                            html`<sl-option value=${device.id}>${device.no}</sl-option>`
                        )}
                    </sl-select>
                    <sl-select label="工作状态*" name="status" value=${this.formData.status} @sl-change=${this._handleInputChange} required>
                        ${this.statusList?.map((status) =>
                            html`<sl-option value=${status.code}>${status.value}</sl-option>`
                        )}
                    </sl-select>

                    ${ this.formData.status == null?
                        html`<br/>` :
                        this.formData.status == 0 ?
                            this._renderStopFragment()
                            : this._renderTemplate(this._deviceTemplate(this.formData.device!))
                    }
                </form>
            </div>

           <app-toolbar></app-toolbar>

        `;
    }
}
