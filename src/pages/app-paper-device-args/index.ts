import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import moment, { now } from 'moment-timezone';

import { supabase } from '../../supabase';
import { router } from '../../router';
import { get } from "idb-keyval";

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

@customElement('app-paper-device-args-index')
class AppPaperDeviceArgsIndex extends LitElement {
    title: string = "纸机运行参数";

    static styles = css`
        .container {
            padding: 20px;
            padding-top: 60px;
            padding-bottom: 60px; /* Space for the toolbar */
            display: block;
        }
        .card-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        sl-card {
            width: 100%;
            max-width: 300px;
        }
        .no-data {
            font-size: 1.5em;
            color: #888;
        }
        .toolbar {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-bottom: 20px;
        }
        .loading-more {
            margin: 20px 0;
        }
        .highlight {
            background-color: yellow;
            font-weight: bold;
        }
        .record-row {
            display: flex;
            align-items: flex-start; /* 使所有子元素在垂直方向上顶部对齐 */
            margin-bottom: 10px; /* 设置每行之间的间距 */
        }

        .record-row sl-card {
            flex-grow: 1; /* 使卡片占据尽可能多的水平空间 */
            margin-right: 10px; /* 设置卡片与按钮之间的间距 */
        }

        .record-row .edit-button {
            flex-shrink: 0; /* 防止按钮缩小 */
            align-self: flex-start; /* 使按钮对齐到顶部 */
        }

    `;

    userList: any[] | null = [];

    deviceList: any[] | null = [];

    statusList: any[] | null = [];

    reasonList: any[] | null = [];

    mannerList: any[] | null = [];

    scraperManufacturerList: any[] | null = [];

    wetStrengthList: any[] | null = [];

    paramsList:any[] = [];
    loading = true;
    loadingMore = false;
    limit = 20;
    offset = 0;
    searchKeyword = '';
    searching = false;
    exporting = false;

    cols = [
        "汇报人","汇报时间","机台","工作状态","停机原因","车速","纸种","起皱率","气罩层长纤比率",
        "气罩层短纤比率","杨克缸层长纤比率","杨克缸层短纤比率","短纤塔比率设定","长纤磨机1功率",
        "长纤磨机2功率","短纤磨机功率","唇板开度","真空辊线压力","真空辊真空度","透平机频率",
        "蒸汽压力","热泵开度","干端气罩温度","湿端气罩温度","湿端循环风机频率","干端循环风机频率",
        "浆网速比","刮刀厂家","刮刀角度","刮刀使用时长","蒸汽吨耗","气罩电耗","传动电耗",
        "真空泵电耗","成型网张力","毛布张力","毛布高压水","湿强剂","湿强剂用量","幅宽","备注"];

    table_data: any[] = [];
    certificate: any | null;

    async connectedCallback() {
        super.connectedCallback();
        this.certificate = await get('certificate');
        await this._initData();
        await this.loadData();
        this.requestUpdate();
        window.addEventListener('scroll', this.handleScroll);
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.handleScroll);
        super.disconnectedCallback();
    }

    private async _fecthUsers() {
        const {data} = await supabase.from("user").select("id,name");
        this.userList = data;
    }

    private async _initData() {
        await Promise.all([this._fecthUsers(), this._fecthStatuses(), this._fecthReasons(),this._fecthDevices(),
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


    async loadData() {
        this.loading = true;
        const query = supabase
            .from('paper_device_args_report')
            .select(`*`)
            .range(this.offset, this.offset + this.limit - 1)
            .order('report_date', { ascending: false });


        if (this.searchKeyword) {
            query.textSearch('keywords', `'${this.searchKeyword}'`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching data:', error);
        } else {
            this.paramsList = [...this.paramsList, ...data];
            this.offset += this.limit;
        }
        this.loading = false;
    }

    async loadExportData(): any[] {
        const query = supabase
            .from('paper_device_args_report')
            .select(`*`)

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching data:', error);
            return [];
        } else {
            this.table_data.push(this.cols);
            data.forEach(el => {
                this.table_data.push([this.userList?.find(e=>e.id==el.created_by).name,moment.tz(el.reportDate, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm'),
                this.deviceList?.find(e=>e.id==el.device).no,this.statusList?.find(e=>e.code==el.status).value,
                el.stop_reason==null || undefined?``:`${this.reasonList?.find(e=>e.code==el.stop_reason).value}`,
                el.speed==null || undefined?``:`${el.speed}m/min`,
                el.paper_category==null || undefined?``:`${el.paper_category}`,
                el.crepe_ratio==null || undefined?``:`${el.crepe_ratio}%`,
                el.gas_long_fiber_ratio==null || undefined?``:`${el.gas_long_fiber_ratio}%`,
                el.gas_short_fiber_ratio==null || undefined?``:`${el.gas_short_fiber_ratio}%`,
                el.yangke_long_fiber_ratio==null || undefined?``:`${el.yangke_long_fiber_ratio}%`,
                el.yangke_short_fiber_ratio==null || undefined?``:`${el.yangke_short_fiber_ratio}%`,
                el.short_fiber_tower_rate_setting==null || undefined?``:`${el.short_fiber_tower_rate_setting}%`,
                el.long_fiber_mill_power1==null || undefined?``:`${el.long_fiber_mill_power1}%`,
                el.long_fiber_mill_power2==null || undefined?``:`${el.long_fiber_mill_power2}%`,
                el.short_fiber_mill_power==null || undefined?``:`${el.short_fiber_mill_power}%`,
                el.lip_plate_opening==null || undefined?``:`${el.lip_plate_opening}%`,
                el.vacuum_roll_line_pressure==null || undefined?``:`${el.vacuum_roll_line_pressure}KN/m`,
                el.vacuum_roller_vacuum_degree==null || undefined?``:`-${el.vacuum_roller_vacuum_degree}kpa`,
                el.turbine_frequency==null || undefined?``:`${el.turbine_frequency}hz`,
                el.steam_pressure==null || undefined?``:`${el.steam_pressure}bar`,
                el.heat_pump_opening==null || undefined?``:`${el.heat_pump_opening}%`,
                el.gas_dry_temper==null || undefined?``:`${el.gas_dry_temper}°C`,
                el.gas_wet_temper==null || undefined?``:`${el.gas_wet_temper}°C`,
                el.wet_fan_frequency==null || undefined?``:`${el.wet_fan_frequency}%`,
                el.dry_fan_frequency==null || undefined?``:`${el.dry_fan_frequency}%`,
                el.jet_wire_speed_ratio==null || undefined?``:`${el.jet_wire_speed_ratio}`,
                el.scraper_manufacturer==null || undefined?``:`${this.scraperManufacturerList?.find(e=>e.id==el.scraper_manufacturer).name}`,
                el.scraper_degree==null || undefined?``:`${el.scraper_degree}°${el.scraper_manner==null || undefined?``:`${this.mannerList?.find(e=>e.code==el.scraper_manner).value}`}`,
                el.scraper_using_period==null || undefined?``:`${el.scraper_using_period}h`,
                el.steam_consumption==null || undefined?``:`${el.steam_consumption}T/t`,
                el.gas_electricity_consumption==null || undefined?``:`${el.gas_electricity_consumption}kwh/t`,
                el.transmission_electricity_consumption==null || undefined?``:`${el.transmission_electricity_consumption}kwh/t`,
                el.vacuum_electricity_consumption==null || undefined?``:`${el.vacuum_electricity_consumption}kwh/t`,
                el.mesh_tension==null || undefined?``:`${el.mesh_tension}KN`,
                el.fabric_tension==null || undefined?``:`${el.fabric_tension}KN/m`,
                el.fabric_pressure_water==null?``:`${el.fabric_pressure_water}KG`,
                el.wet_strength==null || undefined?``:`${this.wetStrengthList?.find(e=>e.id==el.wet_strength).name}`,
                el.wet_strength_using==null || undefined?``:`${el.wet_strength_using}kg/t`,
                el.fabric_width==null || undefined?``:`${el.fabric_width}mm`,
                el.remark==null || undefined?``:el.remark
                ]);
            });
            console.error('table_data', this.table_data);
            return this.table_data;
        }
    }

    handleScroll = () => {
        const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
        if (bottom && !this.loading && !this.loadingMore) {
            this.loadMore();
            this.requestUpdate();
        }
    };

    async loadMore() {
        this.loadingMore = true;
        await this.loadData();
        this.loadingMore = false;
    }

    handleAddClick() {
        router.navigate('/paper-device-args/edit');
    }




    async handleExportClick() {
        if (this.exporting) return;
        this.exporting = true;

        const data = await this.loadExportData();
        // const data = [["id","name","age","addr"],[1,"bob","",""],[2,"alis",8,""],["","jack","","street1"]];
        if (data.length > 0) {
            // Convert data array to CSV format
            const csvContent = data.map(e => e.join(",")).join("\n");

            // Create a Blob from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create a link element
            const link = document.createElement("a");

            // Create a URL for the Blob and set it as the href attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);

            // Set the download attribute with a filename
            link.setAttribute("download", `${moment.tz(now(), 'Asia/Shanghai').format('YYYY-MM-DD HH:mm')}.csv`);

            // Append the link to the body
            document.body.appendChild(link);

            // Programmatically click the link to trigger the download
            link.click();

            // Remove the link from the document
            document.body.removeChild(link);
        }
        this.exporting = false;
    }

    async handleSearch() {
        if (this.searching) return;
        this.searching = true;
        this.paramsList = [];
        this.offset = 0;
        await this.loadData();
        this.requestUpdate();
        this.searching = false;
    }

    handleSearchInputChange(e: Event) {
        this.searchKeyword = e.target.value;
    }

    _highlightText(text: string, keyword: string) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.split(regex).map((part, index) =>
            regex.test(part) ? html`<span class="highlight">${part}</span>` : part
        );
    }

    _handleEdit(record: any) {
        if (record.created_by === this.certificate?.id) {
          router.navigate(`/paper-device-args/edit/${record.id}`);
        } else {
          alert('你没有权限修改这个记录。');
        }
    }

    async _handleShare(param: any) {
        // 采用模板字符串构建带制表符的字符串
        const shareData = [
            `汇报人:\t${this.userList?.find(e => e.id == param.created_by).name}`,
            `汇报时间:\t${moment.tz(param.report_date, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm')}`,
            `机台:\t${this.deviceList?.find(e => e.id == param.device).no}`,
            `工作状态:\t${this.statusList?.find(e => e.code == param.status).value}`,
            param.stop_reason ? `停机原因:\t${this.reasonList?.find(e => e.code == param.stop_reason).value}` : '',
            param.speed ? `车速:\t${param.speed}m/min` : '',
            param.paper_category ? `纸种:\t${param.paper_category}` : '',
            param.crepe_ratio ? `起皱率:\t${param.crepe_ratio}%` : '',
            param.gas_long_fiber_ratio ? `气罩层长纤比率:\t${param.gas_long_fiber_ratio}%` : '',
            param.gas_short_fiber_ratio ? `气罩层短纤比率:\t${param.gas_short_fiber_ratio}%` : '',
            param.yangke_long_fiber_ratio ? `杨克缸层长纤比率:\t${param.yangke_long_fiber_ratio}%` : '',
            param.yangke_short_fiber_ratio ? `杨克缸层短纤比率:\t${param.yangke_short_fiber_ratio}%` : '',
            param.short_fiber_tower_rate_setting ? `短纤塔比率设定:\t${param.short_fiber_tower_rate_setting}%` : '',
            param.long_fiber_mill_power1 ? `长纤磨机1功率:\t${param.long_fiber_mill_power1}%` : '',
            param.long_fiber_mill_power2 ? `长纤磨机2功率:\t${param.long_fiber_mill_power2}%` : '',
            param.short_fiber_mill_power ? `短纤磨机功率:\t${param.short_fiber_mill_power}%` : '',
            param.lip_plate_opening ? `唇板开度:\t${param.lip_plate_opening}%` : '',
            param.vacuum_roll_line_pressure ? `真空辊线压力:\t${param.vacuum_roll_line_pressure}KN/m` : '',
            param.vacuum_roller_vacuum_degree ? `真空辊真空度:\t${`-${param.vacuum_roller_vacuum_degree}kpa`}` : '',
            param.turbine_frequency ? `透平机频率:\t${param.turbine_frequency}hz` : '',
            param.steam_pressure ? `蒸汽压力:\t${param.steam_pressure}bar` : '',
            param.heat_pump_opening ? `热泵开度:\t${param.heat_pump_opening}%` : '',
            param.gas_dry_temper ? `干端气罩温度:\t${param.gas_dry_temper}°C` : '',
            param.gas_wet_temper ? `湿端气罩温度:\t${param.gas_wet_temper}°C` : '',
            param.wet_fan_frequency ? `湿端循环风机频率:\t${param.wet_fan_frequency}%` : '',
            param.dry_fan_frequency ? `干端循环风机频率:\t${param.dry_fan_frequency}%` : '',
            param.jet_wire_speed_ratio ? `浆网速比:\t${param.jet_wire_speed_ratio}` : '',
            param.scraper_manufacturer ? `刮刀厂家:\t${`${this.scraperManufacturerList?.find(e => e.id == param.scraper_manufacturer).name}`}` : '',
            param.scraper_degree ? `刮刀角度:\t${param.scraper_degree}°${param.scraper_manner == null || undefined ? `` : `${this.mannerList?.find(e => e.code == param.scraper_manner).value}`}` : '',
            param.scraper_using_period ? `刮刀使用时长:\t${param.scraper_using_period}h` : '',
            param.steam_consumption ? `蒸汽吨耗:\t${param.steam_consumption}T/t` : '',
            param.gas_electricity_consumption ? `汽罩电耗:\t${param.gas_electricity_consumption}kwh/t` : '',
            param.transmission_electricity_consumption ? `传动电耗:\t${param.transmission_electricity_consumption}kwh/t` : '',
            param.vacuum_electricity_consumption ? `真空泵电耗:\t${param.vacuum_electricity_consumption}kwh/t` : '',
            param.mesh_tension ? `成型网张力:\t${param.mesh_tension}KN` : '',
            param.fabric_tension ? `毛布张力:\t${param.fabric_tension}KN/m` : '',
            param.fabric_pressure_water ? `毛布高压水:\t${param.fabric_pressure_water}KG` : '',
            param.wet_strength ? `湿强剂:\t${`${this.wetStrengthList?.find(e => e.id == param.wet_strength).name}`}` : '',
            param.wet_strength_using ? `湿强剂用量:\t${param.wet_strength_using}kg/t` : '',
            param.fabric_width ? `幅宽:\t${param.fabric_width}mm` : '',
            `备注:\t${param.remark || '无'}` // 最后一行没有制表符
        ].filter(line => line !== '').join('\n'); // 过滤掉空行并使用换行符连接



        try{
            await navigator.share({title:"",text:shareData,url:""});
        }
        catch(e) {
            alert('分享失败。');
        }
    }

    render() {
        return html`
            <app-header enableBack title=${this.title}></app-header>
            <div class="container">
                <div class="toolbar">
                    <sl-input placeholder="输入关键字..." @sl-change=${this.handleSearchInputChange}>
                        <div slot="suffix" @click=${this.handleSearch}>
                            <sl-icon-button name="search"></sl-icon-button>
                        </div>
                    </sl-input>
                    <sl-icon-button name="plus-circle" @click=${this.handleAddClick}></sl-icon-button>
                    <sl-icon-button name="box-arrow-up" @click=${this.handleExportClick}></sl-icon-button>
                </div>
                ${this.loading && this.paramsList.length === 0
                    ? html`<sl-spinner></sl-spinner>`
                    : html`
                        <div class="card-container">
                            ${this.paramsList.map(param => html`
                                <div class="record-row">
                                <sl-card>
                                    <strong>汇报人:</strong> ${this._highlightText(this.userList?.find(e=>e.id==param.created_by).name,this.searchKeyword)}<br>
                                    <strong>汇报时间:</strong> ${this._highlightText(moment.tz(param.report_date, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm'),this.searchKeyword)}<br>
                                    <strong>机台:</strong> ${this._highlightText(`${this.deviceList?.find(e=>e.id==param.device).no}`,this.searchKeyword)}<br>
                                    <strong>工作状态:</strong> ${this._highlightText(`${this.statusList?.find(e=>e.code==param.status).value}`,this.searchKeyword)}<br>
                                    ${param.stop_reason == null ? ``:html`<strong>停机原因:</strong> ${this._highlightText(`${this.reasonList?.find(e=>e.code==param.stop_reason).value}`,this.searchKeyword)}<br>`}
                                    ${param.speed == null ? ``:html`<strong>车速:</strong> ${this._highlightText(`${param.speed}m/min`,this.searchKeyword)}<br>`}
                                    ${param.paper_category == null ? ``:html`<strong>纸种:</strong> ${this._highlightText(`${param.paper_category}`,this.searchKeyword)}<br>`}
                                    ${param.crepe_ratio == null ? ``:html`<strong>起皱率:</strong> ${this._highlightText(`${param.crepe_ratio}%`,this.searchKeyword)}<br>`}
                                    ${param.gas_long_fiber_ratio == null ? ``:html`<strong>气罩层长纤比率:</strong> ${this._highlightText(`${param.gas_long_fiber_ratio}%`,this.searchKeyword)}<br>`}
                                    ${param.gas_short_fiber_ratio == null ? ``:html`<strong>气罩层短纤比率:</strong> ${this._highlightText(`${param.gas_short_fiber_ratio}%`,this.searchKeyword)}<br>`}
                                    ${param.yangke_long_fiber_ratio == null ? ``:html`<strong>杨克缸层长纤比率:</strong> ${this._highlightText(`${param.yangke_long_fiber_ratio}%`,this.searchKeyword)}<br>`}
                                    ${param.yangke_short_fiber_ratio == null ? ``:html`<strong>杨克缸层短纤比率:</strong> ${this._highlightText(`${param.yangke_short_fiber_ratio}%`,this.searchKeyword)}<br>`}
                                    ${param.short_fiber_tower_rate_setting == null ? ``:html`<strong>短纤塔比率设定:</strong> ${this._highlightText(`${param.short_fiber_tower_rate_setting}%`,this.searchKeyword)}<br>`}
                                    ${param.long_fiber_mill_power1 == null ? ``:html`<strong>长纤磨机1功率:</strong>  ${this._highlightText(`${param.long_fiber_mill_power1}%`,this.searchKeyword)}<br>`}
                                    ${param.long_fiber_mill_power2 == null ? ``:html`<strong>长纤磨机2功率:</strong> ${this._highlightText(`${param.long_fiber_mill_power2}%`,this.searchKeyword)}<br>`}
                                    ${param.short_fiber_mill_power == null ? ``:html`<strong>短纤磨机功率:</strong> ${this._highlightText(`${param.short_fiber_mill_power}%`,this.searchKeyword)}<br>`}
                                    ${param.lip_plate_opening == null ? ``:html`<strong>唇板开度:</strong> ${this._highlightText(`${param.lip_plate_opening}%`,this.searchKeyword)}<br>`}
                                    ${param.vacuum_roll_line_pressure == null ? ``:html`<strong>真空辊线压力:</strong> ${this._highlightText(`${param.vacuum_roll_line_pressure}KN/m`,this.searchKeyword)}<br>`}
                                    ${param.vacuum_roller_vacuum_degree == null ? ``:html`<strong>真空辊真空度:</strong> ${this._highlightText(`-${param.vacuum_roller_vacuum_degree}kpa`,this.searchKeyword)}<br>`}
                                    ${param.turbine_frequency == null ? ``:html`<strong>透平机频率:</strong> ${this._highlightText(`${param.turbine_frequency}hz`,this.searchKeyword)}<br>`}
                                    ${param.steam_pressure == null ? ``:html`<strong>蒸汽压力:</strong> ${this._highlightText(`${param.steam_pressure}bar`,this.searchKeyword)}<br>`}
                                    ${param.heat_pump_opening == null ? ``:html`<strong>热泵开度:</strong> ${this._highlightText(`${param.heat_pump_opening}%`,this.searchKeyword)}<br>`}
                                    ${param.gas_dry_temper == null ? ``:html`<strong>干端气罩温度:</strong> ${this._highlightText(`${param.gas_dry_temper}°C`,this.searchKeyword)}<br>`}
                                    ${param.gas_wet_temper == null ? ``:html`<strong>湿端气罩温度:</strong> ${this._highlightText(`${param.gas_wet_temper}°C`,this.searchKeyword)}<br>`}
                                    ${param.wet_fan_frequency == null ? ``:html`<strong>湿端循环风机频率:</strong> ${this._highlightText(`${param.wet_fan_frequency}%`,this.searchKeyword)}<br>`}
                                    ${param.dry_fan_frequency == null ? ``:html`<strong>干端循环风机频率:</strong> ${this._highlightText(`${param.dry_fan_frequency}%`,this.searchKeyword)}<br>`}
                                    ${param.jet_wire_speed_ratio == null ? ``:html`<strong>浆网速比:</strong> ${this._highlightText(`${param.jet_wire_speed_ratio}`,this.searchKeyword)}<br>`}
                                    ${param.scraper_manufacturer == null ? ``:html`<strong>刮刀厂家:</strong> ${this._highlightText(`${this.scraperManufacturerList?.find(e=>e.id==param.scraper_manufacturer).name}`,this.searchKeyword)}<br>`}
                                    ${param.scraper_degree == null ? ``:html`<strong>刮刀角度:</strong> ${this._highlightText(`${param.scraper_degree}°${param.scraper_manner==null || undefined?``:`${this.mannerList?.find(e=>e.code==param.scraper_manner).value}`}`,this.searchKeyword)}<br>`}
                                    ${param.scraper_using_period == null ? ``:html`<strong>刮刀使用时长:</strong> ${this._highlightText(`${param.scraper_using_period}h`,this.searchKeyword)}<br>`}
                                    ${param.steam_consumption == null ? ``:html`<strong>蒸汽吨耗:</strong> ${this._highlightText(`${param.steam_consumption}T/t`,this.searchKeyword)}<br>`}
                                    ${param.gas_electricity_consumption == null ? ``:html`<strong>汽罩电耗:</strong> ${this._highlightText(`${param.gas_electricity_consumption}kwh/t`,this.searchKeyword)}<br>`}
                                    ${param.transmission_electricity_consumption == null ? ``:html`<strong>传动电耗:</strong> ${this._highlightText(`${param.transmission_electricity_consumption}kwh/t`,this.searchKeyword)}<br>`}
                                    ${param.vacuum_electricity_consumption == null ? ``:html`<strong>真空泵电耗:</strong> ${this._highlightText(`${param.vacuum_electricity_consumption}kwh/t`,this.searchKeyword)}<br>`}
                                    ${param.mesh_tension == null ? ``:html`<strong>成型网张力:</strong> ${this._highlightText(`${param.mesh_tension}KN`,this.searchKeyword)}<br>`}
                                    ${param.fabric_tension == null ? ``:html`<strong>毛布张力:</strong> ${this._highlightText(`${param.fabric_tension}KN/m`,this.searchKeyword)}<br>`}
                                    ${param.fabric_pressure_water == null ? ``:html`<strong>毛布高压水:</strong> ${this._highlightText(`${param.fabric_pressure_water}KG`,this.searchKeyword)}<br>`}
                                    ${param.wet_strength == null ? ``:html`<strong>湿强剂:</strong> ${this._highlightText(`${this.wetStrengthList?.find(e=>e.id==param.wet_strength).name}`,this.searchKeyword)}<br>`}
                                    ${param.wet_strength_using == null ? ``:html`<strong>湿强剂用量:</strong> ${this._highlightText(`${param.wet_strength_using}kg/t`,this.searchKeyword)}<br>`}
                                    ${param.fabric_width == null ? ``:html`<strong>幅宽:</strong> ${this._highlightText(`${param.fabric_width}mm`,this.searchKeyword)}<br>`}
                                    <strong>备注:</strong> ${param.remark || '无'}
                                </sl-card>
                                <sl-icon-button name="pencil" label="编辑" @click=${() => this._handleEdit(param)}></sl-icon-button>
                                <sl-icon-button name="share" label="分享" @click=${() => this._handleShare(param)}></sl-icon-button>
                                </div>
                            `)}
                        </div>
                        ${this.paramsList.length === 0
                            ? html`<div class="no-data">没有数据</div>`
                            : this.loadingMore
                                ? html`<sl-spinner class="loading-more"></sl-spinner>`
                                : ''}
                    `}
            </div>
            <app-toolbar></app-toolbar>
        `;
    }
}


