Vue.component('sort-label', {
    props: {sorti: String, we: String},
    computed: {
        classObject: function () {
            let ret = {'attr-sort-asc': false, 'attr-sort-desc': false, 'attr-sort-un': false};
            if (this.sorti === this.we) {
                ret['attr-sort-asc'] = !0;
            } else if (this.sorti === '-' + this.we) {
                ret['attr-sort-desc'] = !0;
            } else {
                ret['attr-sort-un'] = !0;
            }
            return ret;
        }
    },
    template: `
            <a href="#" v-bind:data-sort="we" v-on:click="$emit(\'mysort\',we)">
                <i v-bind:class ="classObject" ></i>
            </a>
            `
});

window.leadinka_library = {
    closest: (el, selector) => {
        if (Element.prototype.closest) {
            return el.closest(selector);
        }

        let parent = el;

        while (parent) {
            if (parent.matches(selector))
                return parent;
            parent = parent.parentElement;
        }

        return null;
    },
    getCookie: name => {
        if (!document.cookie) {
            return null;
        }

        const xsrfCookies = document.cookie.split(';')
                .map(c => c.trim())
                .filter(c => c.startsWith(name + '='));

        if (xsrfCookies.length === 0) {
            return null;
        }
        return decodeURIComponent(xsrfCookies[0].split('=')[1]);
    },
};

new Vue({
    el: '#directspy-table',
    data: {
        columns: ['Host', 'SlagId', 'LimitShowPerDay', 'LimitLeadsPerDay', 'todayShow', 'todaySuccess', 'todayError'],
        data: [],
        CheckRegionsList: {},
        SlagIdList: {},
        MethodSendList: {},
        pages: 0,
        page: 0,
        sort: 'Host', // смотри mounted
        filterSite: '',
        filterSlag: 0,

        //UI 
        id_row: 0, // id записи, редактируемой строки
        insert_row:false,
        l_modal: {
            Host: '',
            SlagId: 0,
            CheckRegions: 0, // 0 - любой IP/любой телефон 1 - МоскваиПитер vs Россия 2 - точное соответствие региона
            LimitShowPerDay: 0,
            LimitLeadsPerDay: 0, // - не отправлять, ставим число до 100, что бы в случае ошибки не показать шторм
            UrlScriptShow: '',
            MethodSend: '', // Идентификатор JS кода отправки
        },
    },
    watch: {
        sort: function () {
            this.reload()
        },
        filterSite: function () {
            this.reload()
        },
        filterSlag: function () {
            this.reload()
        },
    },
    components: {
        'head-site': {
            props: {
                filterSite: String
            },
            template: `
                    <th>
                    <slot></slot>Cайт<br/>
                    <input type="text" class="form-control search-input" v-on:change="$emit(\'input\', $event.target.value)">
                    </th>
        `,
        },
        'head-slagid': {
            props: {
                filterSlag: String,
                optlist: {
                    type: Object,
                    required: true
                }
            },
            template: `
                    <th>
                    <slot></slot>Поток продаж<br/>
                    <select class="form-control" v-on:input="$emit(\'input\', $event.target.value)">
                        <option selected="" value=""></option>
                        <option v-for="(_view, name) in optlist" v-bind:value="name">{{_view}}</option>
                    </select>
                    </th>
            `,
        },
        'head-double': {
            props: {
                sort: String,
                consist: {
                    type: Object,
                    required: true
                }
            },
            data: function () {
                let ret = {key1: '', key2: '', val1: '', val2: ''}, key, first = !0;
                for (key in this.consist) {
                    if (first) {
                        first = !1;
                        ret.key1 = key;
                        ret.val1 = this.consist[key];
                    } else {
                        ret.key2 = key;
                        ret.val2 = this.consist[key];
                    }
                }
                return ret;
            },
            template: '<th>' +
                    '<slot v-bind:we_slot="this.key1"></slot>{{this.val1}}' +
                    '<br/>' +
                    '<slot v-bind:we_slot="this.key2"></slot>{{this.val2}}' +
                    '</th>',
        },
        'head-single': {
            props: {
                sort: String,
                consist: {
                    type: Object,
                    required: true
                }
            },
            data: function () {
                let ret = {key1: '', key2: '', val1: '', val2: ''}, key, first = !0;
                for (key in this.consist) {
                    if (first) {
                        first = !1;
                        ret.key1 = key;
                        ret.val1 = this.consist[key];
                    } else {
                        ret.key2 = key;
                        ret.val2 = this.consist[key];
                    }
                }
                return ret;
            },
            template: '<th><slot></slot>{{this.val1}}</th>',
        },
        paginator: {
            props: {
                page: Number,
                pages: {
                    type: Number,
                    default: 0
                }
            },
            computed: {
                bundle: function () {
                    var rez = {show: false, page: 0, firstdisable: true, lastdisable: true, lastpage: 0, pages: {}};
                    if (this.pages <= 1) {
                        return rez;
                    }
                    rez.show = true;
                    rez.page = this.page;
                    if (this.pages <= 7) {
                        for (let i = 0, n = this.pages; i < n; i++)
                            rez.pages['' + i] = i + 1;
                        return rez;
                    }
                    rez.firstdisable = (this.page === 0);
                    rez.lastdisable = (this.page === this.pages - 1);
                    rez.lastpage = this.pages - 1;
                    const left = Math.max(0, this.page - 3), right = Math.min(this.pages - 1, this.page + 3);
                    for (let i = left; i <= right; i++)
                        rez.pages['' + i] = i + 1;
                    return rez;

                }
            },
            template: `
            <ul class="pagination" v-if="bundle.show" v-on:click="$emit('go_newpage',$event.target)">
                <li class="prev" v-bind:class="{disabled:bundle.firstdisable}" >
                    <span v-if="bundle.firstdisable">««</span>
                    <a v-else href="#" data-page="0">««</a>
                </li>
          
                <li v-for="(_view, name,index) in bundle.pages" v-bind:key="name" v-bind:class="{active: +name===bundle.page}">
                    <a href="#" v-bind:data-page="name">{{_view}}</a>
                </li>
                        
                <li class="next" v-bind:class="{disabled:bundle.lastdisable}" >
                    <span v-if="bundle.lastdisable">»»</span>
                    <a v-else href="#" v-bind:data-page="bundle.lastpage">»»</a>
                </li>
            </ul>
                        `,
        },
    },

    mounted: function () {
        this.$nextTick(function () {
            let _l = this;
            fetch('./data?sort=Host')
                    .then(response => (response.status >= 200 && response.status < 300) ? Promise.resolve(response) : Promise.reject(new Error(response.statusText)))
                    .then(response => response.json())
                    .then(fdata => {
                        ['data', 'CheckRegionsList', 'SlagIdList', 'MethodSendList', 'pages', 'page'].forEach(//'columns',
                                (item) => {
                            _l[item] = fdata[item] || _l[item];
                        });
                    })
                    .catch(function (err) {
                        console.log('Fetch Error :-S', err);
                    });

        });
    },
    methods: {
        createrow: function(){
            let _l = this;
            ['Host', 'UrlScriptShow', 'MethodSend'].forEach(item => {_l.l_modal[item] = ''});
            ['SlagId', 'CheckRegions', 'LimitShowPerDay', 'LimitLeadsPerDay', ].forEach(item => {_l.l_modal[item] = 0});
            this.insert_row = true;
            $('#direct-spysmodal').modal('show');
        },
        SaveModal: function () {
            let token = yii.getCsrfToken(),
                    _l = this;
//           const csrfToken = leadinka_library.getCookie('CSRF-TOKEN');

            let params = new URL(window.location);
            params.pathname = '/settings/direct-sites/save';


            params.searchParams.set(yii.getCsrfParam(), token);
            if(this.insert_row){
                params.searchParams.set('id', true);// пройти привратника
                params.searchParams.set('insert', true);
            }else
                params.searchParams.set('id', this.id_row);
            
            ['Host', 'UrlScriptShow', 'MethodSend'].forEach(
                    item => {
                        params.searchParams.set('SlagDirectSites[' + item + ']', _l.l_modal[item] ? '' + _l.l_modal[item] : '');
                        // и очистим error-labels    
                        let el = document.querySelector('div.help-block.' + (item.toLowerCase())),
                                widget = el.closest('div.form-group');
                        el.text = '';
                        if (el.classList.contains('help-block-error')) {
                            el.classList.remove('help-block-error');
                        }
                        if (widget.classList.contains('has-error')) {
                            widget.classList.add('has-success');
                            widget.classList.remove('has-error');
                        }


                    });
            ['SlagId', 'CheckRegions', 'LimitShowPerDay', 'LimitLeadsPerDay', ].forEach(
                    item => {
                        params.searchParams.set('SlagDirectSites[' + item + ']', _l.l_modal[item] ? +_l.l_modal[item] : 0);
                         // и очистим error-labels
                        let el = document.querySelector('div.help-block.' + (item.toLowerCase())),
                                widget = el.closest('div.form-group');
                        el.text = '';
                        if (el.classList.contains('help-block-error')) {
                            el.classList.remove('help-block-error');
                        }
                        if (widget.classList.contains('has-error')) {
                            widget.classList.add('has-success');
                            widget.classList.remove('has-error');
                        }
                    });


//   for debug         params.searchParams.set('SlagDirectSites[SlagId]', 'Nan');
            fetch('./save', {
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded', //"application/json",
                    "Accept": "application/json, text-plain, */*",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": token
                },
                method: 'post',
                credentials: "same-origin", // credentials: 'include',
                body: '' + params.searchParams
            })
                    .then(response => (response.status >= 200 && response.status < 300) ? Promise.resolve(response) : Promise.reject(new Error(response.statusText)))
                    .then(response => response.json())
                    .then((data) => {
                        if (data.result === 'success') {
                            _l.reload();
                            $('#direct-spysmodal').modal('hide');
                        } else {
                            for (let field in data.errors) {
                                let item = document.querySelector('div.help-block.' + (field.toLowerCase())),
                                        widget = item.closest('div.form-group');
                                item.text = data.errors[field];
                                item.classList.add('help-block-error');
                                if (widget.classList.contains('has-success')) {
                                    widget.classList.remove('has-success');
                                }
                                widget.classList.add('has-error');
                            }
                        }
                    })
                    .catch(function (error) {
                        alert('Ошибка связи с сервером');
                        console.log(error);
                    });

        },
        deleterow: function(){
         let token = yii.getCsrfToken(),
                    _l = this;
//           const csrfToken = leadinka_library.getCookie('CSRF-TOKEN');

            let params = new URL(window.location);
            params.pathname = '/settings/direct-sites/delete';


            params.searchParams.set(yii.getCsrfParam(), token);
          

//   for debug         params.searchParams.set('SlagDirectSites[SlagId]', 'Nan');
            fetch('./delete?id='+this.id_row, {
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded', //"application/json",
                    "Accept": "application/json, text-plain, */*",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": token
                },
                method: 'post',
                credentials: "same-origin", // credentials: 'include',
                body: '' + params.searchParams
            })
                    .then(response => (response.status >= 200 && response.status < 300) ? Promise.resolve(response) : Promise.reject(new Error(response.statusText)))
                    .then(response => response.json())
                    .then((data) => {
                        if (data.result === 'success') {
                            _l.reload();                            
                        } else {
                           alert('Ошибка исполнения сервером');                            
                        }
                    })
                    .catch(function (error) {
                        alert('Ошибка связи с сервером');
                        console.log(error);
                    });

        },
        modaledit: function () {
            for (let i = 0, n = this.data.length; i < n; i++) {
                if (+this.data[i].id == this.id_row) {
                    let content = this.data[i].cells, _l = this;
                    ['Host', 'SlagId', 'CheckRegions', 'LimitShowPerDay', 'LimitLeadsPerDay', 'UrlScriptShow', 'MethodSend'].forEach(
                            (item) => {
                        _l.l_modal[item] = content[item];
                    });
                    $('#direct-spysmodal').modal('show');
                    return;
                }
            }
        },
        editrow: function (event) {
            if (leadinka_library.closest(event.target, 'thead'))
                return; // кликнули по заголовку
            const row = leadinka_library.closest(event.target, 'tr[data-id]');
            if (!row)
                return;
            //  event.preventDefault();
            this.id_row = row.getAttribute('data-id'); // запоминаем наш выбор
            this.insert_row = false;
            this.modaledit();
        },
        clickContext: function (event) { //  this.id_row устанавливается при создании контекстного меню
            if (event.target.matches('li[data-item]'))
                switch (event.target.getAttribute('data-item')) {
                    case 'edit':
                        this.insert_row = false;
                        this.modaledit();
                        break;
                    case 'copy':
                        this.insert_row = true;
                         this.modaledit();
                        break;
                    case 'delete':
                         for (let i = 0, n = this.data.length; i < n; i++) {
                if (+this.data[i].id == this.id_row) {
                        if(confirm('Подтвердите удаление сайта '+this.data[i].cells.Host)){
                            this.deleterow();
                            break;
                        }
                    }
                }
                        break;
                }

            document.getElementById('l-context-menu').style.display = 'none';
        },
        contextmenu: function (event) {
            if (event.which !== 3)
                return; // проверка правой мыши
            if (leadinka_library.closest(event.target, 'thead'))
                return; // кликнули по заголовку
            const row = leadinka_library.closest(event.target, 'tr[data-id]');
            if (!row)
                return;
            event.preventDefault();
            this.id_row = row.getAttribute('data-id'); // запоминаем наш выбор
            const item = document.getElementById('l-context-menu');
            const offset = document.querySelector('div.slag-direct-sites-index').getBoundingClientRect();
            item.style.left = '' + (event.pageX - offset.left) + 'px'; // Задаем позицию меню на X
            item.style.top = '' + (event.pageY - offset.top) + 'px'; // Задаем позицию меню по Y
            item.style.display = 'block';
        },
        go_newpage: function (item) {
            if (item.matches('[data-page]')) {
                const newpage = item.getAttribute('data-page');
                if (+newpage !== +this.page && +newpage >= 0 && +newpage < +this.pages) {
                    this.page = +newpage;
                    this.reload();
                }
            }
        },
        reload: function () {
            let _l = this, params;
            params = new URL(window.location);
            params.pathname = '/settings/direct-sites/data';

            this.sort && params.searchParams.set('sort', this.sort);
            this.page && params.searchParams.set('page', this.page);
            this.filterSite && params.searchParams.set('SlagDirectSitesSearch[Host]', this.filterSite);
            this.filterSlag && params.searchParams.set('SlagDirectSitesSearch[SlagId]', +this.filterSlag);
            fetch(params)
                    .then(response => (response.status >= 200 && response.status < 300) ? Promise.resolve(response) : Promise.reject(new Error(response.statusText)))
                    .then(response => response.json())
                    .then(fdata => {
                        ['data', 'CheckRegionsList', 'SlagIdList', 'MethodSendList', 'pages', 'page'].forEach(//'columns',
                                (item) => {
                            _l[item] = fdata[item] || _l[item];
                        });
                    })
                    .catch(function (err) {
                        console.log('Fetch Error :-S', err);
                    });

        },
        changeSort: function (sortClick) {

            if (sortClick != this.sort && '-' + sortClick != this.sort && sortClick != '-' + this.sort) {
                this.sort = sortClick;
            } else {
                if (this.sort[0] == '-') {
                    this.sort = '';
                } else {
                    this.sort = '-' + this.sort;
                }
            }
        },

        fetchSlag: function (line, slag) {
            slag = this.SlagIdList[line.cells.SlagId];
            if (line.cells.SlagId && slag === undefined) {
                return 'Поток не DirectSpy';
            }
            return  slag ? slag : '---не задано---';
        },
        slagColor: function (line) {
            const slag = this.SlagIdList[line.cells.SlagId];
            return (line.cells.SlagId && slag === undefined) ? '#f00' : '#000';
        },

    },
})


