/* 
 * 2019
 * Мини документация по передаче значений полей на сервер
 * 1. Технически сложно организовать подписку на изменение значений в полях, так как некоторые поля синтетические (Select2, GoogleWidget)
 * изменения происходят не в том элементе, у которого id, а в смежных. 
 * Можно конечно делать подписку на события jQuery, и сделать redux в 1с. Но выбран принцип Model, где есть чистые и грязные данные. 
 * 2. Чистые значения хранятся в old_values (clear_values), грязные - в values (dirty_values) Они устанавливаются, как копия грязных 
 * при POST запросе, и утверждаются только с yii2 как transfer или sync.
 * 3. Функция gather считывает через irsField.val() грязные значения в values (dirty_values) (и блокировки полей в status), 
 * сверяет грязное и чистое и отправляется change в yii2.
 * 4. Если на сервере есть сомнения об изменении списка полей - отправляется SYNC, иначе, 
 * если были изменения - возвращается transfer как "чистые данные"
 * 5. При частой отправке JB_2JS_SYNC - систему начинает сбоить. Часто приходящий sync с запаздыванием затирает исходные данные.
 */


"use strict"

window.irsCrypto = {
    utf8_encode: function (str_data) {	// Encodes an ISO-8859-1 string to UTF-8
        // 
        // +  lets take original by: Webtoolkit.info (http://www.webtoolkit.info/)
        
    },

    parseFormatDate: function ($str, havetime) {
        //'d-m-Y H:i:s' // js не умеет работать с датами до 1970г
        var $Year = 1,
            $month = 1,
            $day = 1,
            $hour = 0,
            $minute = 0,
            $second = 0,
            $test, $test2;

        var $dva = String($str).split(' ');

        if ($dva.length) {
            var $adate = String($dva[0]).split('-');
            if ($adate.length === 3) {
                $test = +$adate[0];
                $test2 = +$adate[2];
                if ($test < 32 || $test2 < 32) {
                    if ($dva.length > 1) {
                        var $atime = String($dva[1]).split(':');
                        if ($atime.length === 3) {
                            $hour = +$atime[0];
                            $minute = +$atime[1];
                            $second = +$atime[2];
                            if ($hour > 23) {
                                $hour = 0;
                            }
                            if ($minute > 59) {
                                $minute = 0;
                            }
                            if ($second > 59) {
                                $second = 0;
                            }
                        }
                    }


                    $month = +$adate[1];
                    if ($month > 12) {
                        $month = 1;
                    }
                    if ($test < 32) {
                        $day = $test;
                        $Year = $test2;
                    } else {
                        $day = $test2;
                        $Year = $test;
                    }
                    if ($day > 31) {
                        $day = 1;
                    }
                }
            }
        }
        if ($day === 1 && $month === 1 && $Year === 1) {
            return '';
        }
        for (var l = 0, z = ''; l < 4 - $Year.length; l++) {
            z += '0';
        }
        //'d-m-Y H:i:s'
        if (havetime)
            return '' + ($day > 9 ? $day : '0' + $day) + '-'
                + ($month > 9 ? $month : '0' + $month) + '-'
                + z + $Year + ' '
                + ($hour > 9 ? $hour : '0' + $hour) + ':'
                + ($minute > 9 ? $minute : '0' + $minute) + ':'
                + ($second > 9 ? $second : '0' + $second);

        return '' + ($day > 9 ? $day : '0' + $day) + '-'
            + ($month > 9 ? $month : '0' + $month) + '-'
            + z + $Year;
    },

    Base64: {
        /**
         * Base64 encode/decode
         * Lets take http://www.webtoolkit.info
         **/

            return output;
        },
        }
    },

};

/**
 * Очень удобная функция наследования
 * @param {object} Child
 * @param {object} Parent
 * @returns Child
 */
function extend(Child, Parent) {
    var F = function () {
    }
    F.prototype = Parent.prototype
    Child.prototype = new F()
    Child.prototype.constructor = Child
    Child.superclass = Parent.prototype;
    return Child;
}

Object.defineProperty(Object.prototype,'irsClear',
    {enumerable: false, // Иначе JQuery.find падает в ошибку
        value: function(){
                for(let key in this) delete this[key];
            }
    });
Object.defineProperty(Array.prototype,'irsClear',
    {enumerable: false, // Иначе JQuery.find падает в ошибку
        value: function(){
                for(let i =0, n = this.length; i<n; i++,this.pop());
            }
    });

/**
 * Конструктор базового класса виджетов
 *
 * @param {int} sorder - порядок следования виджетов в форме
 * @param {string} tag - уникальное имя переменной
 * @param {string} label
 * @param {string} placeholder
 * @param {string} value
 * @param {string} tooltip
 * @param {int} subpage - закладка формы размещения элемента
 * @returns {class }
 */
function irsField(sorder, tag, label, placeholder, value, tooltip, subpage, mask, options, typecode, presentation, picture) {
    this.widget = ''; // тип виджета
    // this.$formgroup = null; // yii2 div.form-group Не прижилось
    this.in_el = null; // yii2 #tag element  
    this.$in_el = null; // yii2 #tag element
    this.mask = mask;
    this.options = options;
    this.typecode = +typecode;
    this.presentation = this.escapeHtml(presentation);

    this.tooltip = this.escapeHtml(tooltip);
    this.placeholder = this.escapeHtml(placeholder);
    this.picture = this.escapeHtml(picture);
    this.label = this.escapeHtml(label);
    if (value == 'null') {
        this.value = '';
    } else {
        this.value = String(value);
    }
    this.sorder = +sorder;
    this.subpage = +subpage || 1;
    this.lowtag = String(tag).toLowerCase();
    this.captag = String(tag).toUpperCase();
}

/**
 * class irsField{
 * string widget;          /// тип виджета
 * string in_el;           /// yii2 #tag element
 * jQuery $in_el;          /// yii2 #tag element
 * string mask;            /// mask for Input Mask
 * oblect options;         /// options
 * integer typecode;       /// Type of AJAX list dropdown
 * string presentation;    /// Select2 start presentation for value
 
 * strin addressType;      /// Original type of address field
 
 * string tooltip;         /// popup Tooltip
 * string placeholder;     /// placeholder
 * string picture;         /// uri picture
 * string label;           /// label
 * string value;           /// value
 * integer sorder;         /// sort order
 * integer subpage;        /// number in pagination
 * temporary lowtag;       /// lowcase tag
 * temporary captag;       /// uppercase tag
 
 *** readonly getters:

 * boolean isban;             // Is field blocked
 * StringBoolean('0'|'1') bval_block /// field of bval pack It use getter isban
 * bval_uni                /// bval simple value of element
 * bval                    /// bval string value of element
 
 ** methods:
 * string val(string)      /// set/get value so jQuery
 * void ban(void)          /// block field
 * void unban(void)        /// unblock field

 * void waitban(void)          /// block field for wait 1c
 * void waitunban(void)        /// unblock field for wait 1c

 * void errorlabel(string) /// set|clear(without params) error messages
 * void clear(void)        /// clear value of simple input field
 * void reinit()           /// search jQuery, in_el, initialization tooltip {


 ** renderGetters:
 * string html;            /// form-group  + label  + @@@WidgetCode + help-block
 
 * attrName: ' name="Mutability[' + this.captag + ']" '
 * attrFor: ' for="mutability-' + this.lowtag + '" '
 * attrPlaceholder: '' || ' placeholder="' + this.placeholder + '" '
 
 * attrIdOptions:  ' id="mutability-' + this.lowtag + '" data-widget="' + this.widget + '" data-sorder="' + this.sorder + '" data-page="' + this.subpage + '" '
 * + (this.picture ? 'data-picture="'+this.picture+'"' : '')
 * + (this.tooltip ? 'data-toggle="tooltip" data-placement="bottom" title="' + this.tooltip + '"' : '') + ' ';
 *}
 **/

Object.defineProperty(irsField.prototype, "isban", {
    get: function () {
        return this.in_el.hasAttribute('readonly');
    }
});

Object.defineProperty(irsField.prototype, "bval_block", {
    get: function () {
        return this.isban ? "1" : "0";
    }
});
Object.defineProperty(irsField.prototype, "bval_uni", {
    get: function () {
        return this.bval_block + this.val();
    }
});

Object.defineProperty(irsField.prototype, "bval", { // default for string values, must be overrided
    get: function () {
        return 's' + this.bval_block + irsCrypto.Base64.encode(this.in_el.value);
    }
});

//******** renders

Object.defineProperty(irsField.prototype, "valueTag", {
    get: function () {
        return ' value = "' + this.escapeHtml(this.value) + '" ';
    }
});

// рендеринг обвертки form-group
// использует дочерний метод widgetCode()
Object.defineProperty(irsField.prototype, "html", {
    get: function () {
        return '<div class="form-group field-mutability-' + this.lowtag + '">'
            + '<label class="control-label"' + this.attrFor + '>' + this.label + '</label>'
            + this.widgetCode() + '<div class="help-block"></div></div>';
    }
});

irsField.prototype.escapeHtml = function (string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "/": '&#x2F;',
        '"': "&quot;",
        "'": "&#039;"
    };
    return String(string).replace(/[&<>\/\"]/g, function (s) {
        return entityMap[s];
    });
};

/**
 * Метод инициализации добавленного в DOM виджета
 *
 * @returns {undefined}
 */
irsField.prototype.reinit = function () {
    this.$in_el = $("#mutability-" + this.lowtag);
    this.in_el = this.$in_el.length ? this.$in_el[0] : null;
    this.tooltip && this.in_el && this.$in_el.tooltip();
    //   this.$formgroup = this.$in_el.parents('div.field-mutability-' + this.lowtag);
};
/**
 * Getter&Setter
 * @param {type} setval - value
 * @returns value
 */
irsField.prototype.val = function (setval) { // по умолчанию: если id элемент виджета - честный INPUT
    if (arguments.length) {
        if ('' + setval === '') {
            this.clear();
            return '';
        } else {
            this.in_el.value = setval;
            this.value = String(setval);
        }
    }
    return this.in_el.value;
};


irsField.prototype.ban = function () {
    this.in_el.setAttribute('readonly', '');
    this.in_el.setAttribute('disabled', '');
};

irsField.prototype.unban = function () {
    this.in_el.hasAttribute('readonly') && this.in_el.removeAttribute('readonly');
    this.in_el.hasAttribute('disabled') && this.in_el.removeAttribute('disabled');
};

irsField.prototype.waitban = function () {
    !this.beforeBan && this.ban();
};

irsField.prototype.waitunban = function () {
    !this.beforeBan && this.unban();
};

irsField.prototype.errorlabel = function (msg) {
    var widget = this.in_el.closest('div.form-group');
    var $widget = $(widget);
    var $helpBlock = $(widget.querySelector('div.help-block'));

    if (arguments.length) {
        if ($widget.hasClass('has-success'))
            $widget.removeClass('has-success');
        $widget.addClass('has-error');

        $helpBlock.addClass('help-block-error').text(msg);
        return;
    }
    // Очистка errorlabel
    if ($widget.hasClass('has-error'))
        $widget.removeClass('has-error');
    if ($helpBlock.hasClass('help-block-error'))
        $helpBlock.removeClass('help-block-error');
    $helpBlock.text('');
};

irsField.prototype.clear = function () { // по умолчанию: если id элемент виджета - честный INPUT
    this.in_el.value = '';
    this.value = '';
};

Object.defineProperty(irsField.prototype, "attrIdOptions", {
    get: function () {
        return ' id="mutability-' + this.lowtag + '" data-widget="' + this.widget + '" data-sorder="' + this.sorder + '" data-page="' + this.subpage + '" '
            + (this.picture ? 'data-picture="' + this.picture + '"' : '')
            + (this.tooltip ? 'data-toggle="tooltip" data-placement="bottom" title="' + this.tooltip + '"' : '') + ' ';
    }
});

Object.defineProperty(irsField.prototype, "attrFor", {
    get: function () {
        return ' for="mutability-' + this.lowtag + '" ';
    }
});
Object.defineProperty(irsField.prototype, "attrName", {
    get: function () {
        return ' name="Mutability[' + this.captag + ']" ';
    }
});
Object.defineProperty(irsField.prototype, "attrPlaceholder", {
    get: function () {
        if (this.placeholder.trim() == '')
            return '';
        return ' placeholder="' + this.placeholder + '" ';
    }
});

//================================== STRING =================

function irsString() {
    irsField.apply(this, arguments);
    this.widget = 'string';
}

extend(irsString, irsField);

irsString.prototype.widgetCode = function () {
    return '<input type="text" class="form-control"' + this.valueTag
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + ' >';
};

//========================== BOOLEAN ================================
function irsBoolean() {
    irsField.apply(this, arguments);
    this.widget = 'boolean';
}

extend(irsBoolean, irsField);

irsBoolean.prototype.widgetCode = function () {
    return '<input type="checkbox" style="width:20px;" class="form-control pristine" value="' + (this.value ? 1 : 0) + '"'
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + ' >';
};

irsBoolean.prototype.val = function (setval) {
    if (arguments.length) {
        this.in_el.checked = (+setval == 1 ? true : false);
        this.value = (+setval == 1 ? '1' : '0');
    }
    return this.in_el.checked ? '1' : '0';
};

irsBoolean.prototype.clear = function () {
    this.in_el.checked = false;
    this.value = '0';
};

Object.defineProperty(irsBoolean.prototype, "bval", {
    get: function () {
        return 'b' + this.bval_uni;
    }
});

//============================== NUMBER ===============================
function irsNumber() {
    irsField.apply(this, arguments);
    this.widget = 'number';
    this._encOptions = {"alias": "decimal", "groupSeparator": " ", "autoGroup": true};
    this.krajee_id = Math.abs(irsCrypto.crc32(JSON.stringify(this._encOptions)));
}

extend(irsNumber, irsField);

irsNumber.prototype.widgetCode = function () {
    return '<input type="text" class="form-control" style="text-align: right;"' + this.valueTag
        + ' data-plugin-inputmask="inputmask_v' + this.krajee_id + '"'
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + ' >';
};

irsNumber.prototype.reinit = function () {
    irsNumber.superclass.reinit.apply(this);

    window['inputmask_v' + this.krajee_id] = this._encOptions;
    this.in_el && this.$in_el.inputmask(this._encOptions);
};

Object.defineProperty(irsNumber.prototype, "bval", {
    get: function () {
        return 'f' + this.bval_uni;
    }
});

//========================== MASKSTRING =========================================
function irsMaskstring() {
    irsField.apply(this, arguments);
    this.widget = 'maskstring';
    this._encOptions = {"mask": this.mask};
    this.krajee_id = Math.abs(irsCrypto.crc32(JSON.stringify(this._encOptions)));
}

extend(irsMaskstring, irsField);

irsMaskstring.prototype.widgetCode = function () {
    return '<input type="text" class="form-control"' + this.valueTag
        + ' data-plugin-inputmask="inputmask_v' + this.krajee_id + '"'
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + ' >';
};

irsMaskstring.prototype.reinit = function () {
    irsMaskstring.superclass.reinit.apply(this);

    window['inputmask_v' + this.krajee_id] = this._encOptions;
    this.in_el && this.$in_el.inputmask(this._encOptions);
};

//========================== DATE ===============================================

function irsDate() {
    irsField.apply(this, arguments);
    if (this.value.substring(0, 10) === '0001-01-01' || this.value.substring(0, 10) === '01-01-0001' || this.value === 'null') {
        this.value = '';
    }
    this.widget = 'date';
    this._encOptions = {"autoclose": true, "format": "dd-mm-yyyy", "defaultDate": '01-01-0001', "language": "ru"};
    this.krajee_id = Math.abs(irsCrypto.crc32(JSON.stringify(this._encOptions)));
}

extend(irsDate, irsField);

irsDate.prototype.widgetCode = function () {
    return '<input type="text" class="form-control krajee-datepicker"' + this.valueTag
        + ' autocomplete="off" data-datepicker-source="mutability-' + this.lowtag + '" '
        + 'data-datepicker-type="1" data-krajee-kvdatepicker="kvDatepicker_v' + this.krajee_id + '" '
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + ' >';
};

irsDate.prototype.val = function (setval) { // по умолчанию: если id элемент виджета - честный INPUT
    if (arguments.length) {
        if (String(setval).substring(0, 10) === '0001-01-01' ||
            String(setval).substring(0, 10) === '01-01-0001' ||
            String(setval).substring(0, 10) === 'null' ||
            String(setval).substring(0, 10) === '') {
            this.clear();
        } else {
            this.value = irsCrypto.parseFormatDate('' + setval);
            this.in_el.value = this.value;
        }
    }
    return this.in_el.value;
};

irsDate.prototype.reinit = function () {

    this.$in_el = $("#mutability-" + this.lowtag);
    this.in_el = this.$in_el.length ? this.$in_el[0] : null;

    if (!jQuery.fn.kvDatepicker.dates)
        jQuery.fn.kvDatepicker.dates = {};
    window['kvDatepicker_v' + this.krajee_id] = this._encOptions;
    if (this.$in_el.data('kvDatepicker')) {
        this.$in_el.kvDatepicker('destroy');
    }
    $('#mutability-' + this.lowtag).kvDatepicker(this._encOptions);

    irsDate.superclass.reinit.apply(this);
};

Object.defineProperty(irsDate.prototype, "bval", {
    get: function () {
        return 'd' + this.bval_uni;
    }
});

//=========================== DATETIME ============================================

function irsDatetime() {
    irsField.apply(this, arguments);
    if (this.value.substring(0, 10) === '0001-01-01' || this.value.substring(0, 10) === '01-01-0001' || this.value === 'null') {
        this.value = '';
    }

    this.widget = 'datetime';
    this._encOptions = {
        "autoclose": true, "format": "dd-mm-yyyy hh:ii:ss", icontype: "glyphicon",
        "fontAwesome": false, icons: {"leftArrow": "glyphicon-arrow-left", "rightArrow": "glyphicon-arrow-right"},
        "defaultDate": '01-01-0001 00:00:00', "timezone": "Europe/Moscow", "language": "ru"
    };
    this.krajee_id = Math.abs(irsCrypto.crc32(JSON.stringify(this._encOptions)));
}

extend(irsDatetime, irsField);

irsDatetime.prototype.widgetCode = function () {
    return '<div id="mutability-' + this.lowtag + '-datetime" class="input-group  date">'
        + '<input  type="text" class="form-control"' + this.valueTag
        + ' autocomplete="off" data-krajee-datetimepicker="datetimepicker_v' + this.krajee_id + '"'
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + '>'
        + '<span class="input-group-addon" title="Очистить поле"><i class="glyphicon glyphicon-remove kv-dp-icon"></i></span>'
        + '<span class="input-group-addon kv-datetime-picker" title="Выбрать дату &amp; время">'
        + '<i class="glyphicon glyphicon-calendar kv-dp-icon"></i></span></div>';
};


irsDatetime.prototype.val = function (setval) { // по умолчанию: если id элемент виджета - честный INPUT
    if (arguments.length) {
        if (String(setval).substring(0, 10) === '0001-01-01' ||
            String(setval).substring(0, 10) === '01-01-0001' ||
            String(setval).substring(0, 10) === '' || setval === 'null') {
            this.value = '';
            this.in_el.value = '';
        } else {
            this.value = irsCrypto.parseFormatDate('' + setval, true);
            this.in_el.value = this.value;
        }
    }
    return this.in_el.value;
};

irsDatetime.prototype.reinit = function () {
    this.$in_el = $("#mutability-" + this.lowtag);
    this.in_el = this.$in_el.length ? this.$in_el[0] : null;


    window['datetimepicker_v' + this.krajee_id] = this._encOptions;
    if (this.$in_el.data('datetimepicker')) {
        this.$in_el.datetimepicker('destroy');
    }
    jQuery("#mutability-" + this.lowtag + "-datetime").datetimepicker(this._encOptions);
    irsDatetime.superclass.reinit.apply(this);
};

Object.defineProperty(irsDatetime.prototype, "bval", {
    get: function () {
        return 'd' + this.bval_uni;
    }
});

// ========================== DROPDOWN ===========================================

function irsDropdown() {
    irsField.apply(this, arguments);
    this.widget = 'dropdown';
    //reinit() - берем из irsField 
}

extend(irsDropdown, irsField);

irsDropdown.prototype.widgetCode = function (html, rlist) {
    html = '<select class="form-control" ' + this.attrIdOptions + this.attrName + '>';
    if (this.placeholder) {
        html += '<option value="">-- ' + this.placeholder + ' --</option>';
    }
    rlist = '';
    for (var val in this.options) {//https://learn.javascript.ru/object-for-in
        rlist += '<option value="' + val + '" ' + (val == this.value ? 'selected=""' : '') + '>' + this.options[val] + '</option>';
    }
    return html + rlist + '</select>';
};

Object.defineProperty(irsDropdown.prototype, "bval", {
    get: function () {
        return '?' + this.bval_uni;
    }
});

//=========================== RADIO ================================================

function irsRadio() {
    irsField.apply(this, arguments);
    this.widget = 'radio';
    //reinit() - берем из irsField 
}

extend(irsRadio, irsField);

irsRadio.prototype.widgetCode = function (html, rlist) {
    html = '<input type="hidden" value="" ' + this.attrName + '>'
        + '<div ' + this.attrIdOptions + '">';

    rlist = '';
    for (var val in this.options) {
        rlist += '<label>' + //(rlist !== '' ? '<br/>' : '') +
            '<input type="radio" ' + this.attrName + ' value="' + val + '" ' + (val == this.value ? 'checked=""' : '') + '> ' +
            this.options[val] + '</label>';
    }
    return html + rlist + '</div>';
};

irsRadio.prototype.clear = function () {
    this.$in_el.find("input[type='radio']").prop('checked', !1);
    this.value = '';
};

irsRadio.prototype.val = function (setval) {
    if (arguments.length) {
        if ('' + setval === '') {
            this.clear();
            return '';
        } else {
            let v = this.in_el.querySelector("input[type='radio'][value='" + setval + "']");
            if (v) {
                v.checked = !0;
                this.value = '' + setval;
                return this.value;
            } else {
                this.clear();
                return '';
            }
        }
    }
    var chel = this.in_el.querySelector("input[type='radio']:checked");
    if (!chel)
        return '';
    return chel.value;
};

Object.defineProperty(irsRadio.prototype, "bval", {
    get: function () {
        return '?' + this.bval_uni;
    }
});

Object.defineProperty(irsRadio.prototype, "attrFor", {// Label без for
    get: function () {
        return '';
    }
});


irsRadio.prototype.ban = function () {
    irsRadio.superclass.ban.apply(this);
    this.in_el.querySelectorAll("input[type='radio']").forEach(
        item => {
            item.setAttribute('readonly', '');
            item.setAttribute('disabled', '');
        });


};

Object.defineProperty(irsRadio.prototype, "isban", {
    get: function () {
        let all = !0;
        this.in_el.querySelectorAll("input[type='radio']").forEach(
            item => {
                all = all && item.hasAttribute('readonly');
            });
        return all;
    }
});

irsRadio.prototype.unban = function () {
    irsRadio.superclass.unban.apply(this);
    this.in_el.querySelectorAll("input[type='radio']").forEach(
        item => {
            item.hasAttribute('readonly') && item.removeAttribute('readonly');
            item.hasAttribute('disabled') && item.removeAttribute('disabled');
        });
};

// ========================= SELECT2 ===============================================

function irsSelect2() {
    irsField.apply(this, arguments);
    this.widget = 'select2';

    var _encOptions = {
        allowClear: true,
        ajax: {
            url: webalias() + "/ajax/field-options",
            dataType: "json",
            data: 'function(params) { return { typecode: ' + this.typecode + ', q:params.term, }; }',
        },
        escapeMarkup: 'function (markup) { return markup; }',
        templateResult: 'function(user) { return user.text; }',
        templateSelection: 'function (user) { return user.text; }',
    };
    this.krajee_id = Math.abs(irsCrypto.crc32(JSON.stringify(_encOptions)));

    this.s2Options = {//s2options_d6851687
        "themeCss": ".select2-container--krajee",
        "sizeCss": "",
        "doReset": true,
        "doToggle": false,
        "doOrder": false
    };
    this.options_id = Math.abs(irsCrypto.crc32(JSON.stringify(this.s2Options)));

}

extend(irsSelect2, irsField);

irsSelect2.prototype.widgetCode = function () {
    let v = '<select class="form-control select2-hidden-accessible" data-s2-options="s2options_dv' + this.options_id + '" '
        + 'data-krajee-select2="select2_v' + this.krajee_id + '"  style="display:none" tabindex="-1" aria-hidden="true" '
        + 'data-typecode="' + this.typecode + '" '
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + '>'
        + '<option value="">-- ' + this.placeholder + ' --</option>'
        + (this.value ? '<option' + this.valueTag + 'selected="">' + this.presentation + '</option>' : '');

    for (var val in this.options) {
        if (val == this.value)
            continue;
        v += '<option value="' + val + '">' + this.options[val] + '</option>';
    }
    return v + '</select>';
};

irsSelect2.prototype.reinit = function () {

    this.$in_el = $("#mutability-" + this.lowtag);
    this.in_el = this.$in_el.length ? this.$in_el[0] : null;

    var _l = this;

    window['s2options_dv' + this.options_id] = this.s2Options;
    window['select2_v' + this.krajee_id] = {
        allowClear: true,
        ajax: {
            url: webalias() + "/ajax/field-options",
            dataType: "json",
            data: function (params) {
                return {
                    typecode: _l.typecode,
                    q: params.term,
                };
            }
        },
        escapeMarkup: markup => markup,
        templateResult: user => user.text,
        templateSelection: user => user.text,
        theme: "krajee",
        width: "100%",
        placeholder: this.placeholder,
        language: "ru"
    };

    this.$in_el.data('select2') && this.$in_el.select2('destroy');

    jQuery.when(jQuery('#mutability-' + this.lowtag)
        .select2(window['select2_v' + this.krajee_id]))
        .done(initS2Loading('mutability-' + this.lowtag, 's2options_dv' + this.options_id));
    irsSelect2.superclass.reinit.apply(this);

};

Object.defineProperty(irsSelect2.prototype, "bval", {
    get: function () {
        return '?' + this.bval_uni;
    }
});
irsSelect2.prototype.val = function (setval) {
    if (arguments.length) {
        if ('' + setval === '') {
            this.clear();
            return '';
        } else {
            this.value = String(+setval);
            if (this.in_el.value == this.value) {// Уже установлено
                return this.value;
            }
            var need = !0;
            this.$in_el.find('option').each(function () {
                if ((+this.value) == (+setval)) {
                    need = false;
                    return !1;
                }
            });
            if (!need) {
                this.$in_el.val(+setval);
                this.$in_el.trigger && this.$in_el.trigger("change");
                return this.in_el.value;
            }
            var _l = this, adata = {typecode: this.typecode, q: '', id: +setval};// берем typecode из настроек                                  
            $.get(
                webalias() + '/ajax/field-options',
                adata,
                function (bdata) {
                    if (Array.isArray(bdata.results) && bdata.results.length) {
                        $("#mutability-" + _l.lowtag).append('<option value="' + (+setval) + '">' + bdata.results[0].text + '</option>');
                    } else {
                        console.error('Попытка установки для Select2 не существующего значения');
                        debugger;
                        return;
                    }
                    _l.$in_el.val(+setval);
                    _l.$in_el.trigger && _l.$in_el.trigger("change");
                },
                'json'
            );
        }
        return +setval;
    }
    return this.in_el.value;
};

irsSelect2.prototype.clear = function () {
    this.value = '';
    this.$in_el.val('');
    this.$in_el.trigger && this.$in_el.trigger("change");
};

//========================= InputAutocompliteGoogle =================================

function irsInputAutocompliteGoogle(sorder, tag, label, placeholder, value) {
    irsField.apply(this, arguments);
    this.widget = 'InputAutocompliteGoogle';

    this.aboardObjects = false;
    this.russianObjects = true;
    this.language = 'ru';

    this.presentation = ''; // презентацию с php не принимаем. У нас своя логика.

    if (value == 'null' || !value) { // так как у нас JSON - закавычивать их нельзя
        this.value = '';
    } else {
        this.value = value;
    }

    // Вытаскиваем презентацию из пакета
    this.privateParserPresentation =
         () => { // стрелочную функцию нужно, так как функция существует только в объекте, ан прототипе.
            try {
                let pack = JSON.parse(this.value);
                this.presentation = (pack.presentation) ? this.escapeHtml(pack.presentation) : '';
            } catch (e) {
                let pos = String(this.value).indexOf('presentation":"'), subst;
                if (~pos) {
                    subst = String(this.value).slice(pos);
                    pos = String(subst).indexOf('",');
                    this.presentation = (~pos) ? subst.slice(0, pos) : subst;
                }
            }

        };
    this.privateParserPresentation();

    this.showElement = '';
}

extend(irsInputAutocompliteGoogle, irsField);

irsInputAutocompliteGoogle.prototype.widgetCode = function () {
    if (!this.presentation)
        this.presentation = '';
    return '<input type="hidden" id="mutability-' + this.lowtag + '" '
        + this.attrName + this.valueTag
        + '" data-widget="' + this.widget + '" data-address-type="' + this.addressType + '" '
        + 'data-sorder="' + this.sorder + '" data-page="' + this.subpage + '" '
        + (this.picture ? 'data-picture="' + this.picture + '"' : '') + ' >'
        + '<input type="text" id="inputGoogleAutocomplete-mutability-' + this.lowtag + '" class="form-control" '
        + (this.tooltip ? 'data-toggle="tooltip" data-placement="bottom" title="' + this.tooltip + '"' : '')
        + 'value="' + this.presentation + '" ' + this.attrPlaceholder + '  autocomplete="off">';

};

irsInputAutocompliteGoogle.prototype.clear = function () {
    this.value = '';
    this.$in_el.val('{"presentation":"","google":0}');
    if (!this.showElement)
        this.showElement = document.getElementById('inputGoogleAutocomplete-mutability-' + this.lowtag);
    if (this.showElement)
        this.showElement.value = '';
};

irsInputAutocompliteGoogle.prototype.reinit = function () {
    irsInputAutocompliteGoogle.superclass.reinit.apply(this);
    this.showElement = document.getElementById('inputGoogleAutocomplete-mutability-' + this.lowtag);
    document.getElementById('mutability-' + this.lowtag).value = this.value;


    let clearRu = false, opt = {fields: ['address_components'], language: this.language};
    if (this.aboardObjects && !this.russianObjects) {
        clearRu = true;
    } else if (!this.aboardObjects && this.russianObjects) {
        opt.componentRestrictions = {country: 'ru'};
    }

    const autocomplete = new google.maps.places.Autocomplete(this.showElement, opt);
    autocomplete.addListener('place_changed',
        window.inputGoogleAutocomplete.fabricaFillinAddress(this.showElement, this.in_el, autocomplete, clearRu));

};

irsInputAutocompliteGoogle.prototype.val = function (setval) {
    if (arguments.length) {
        if ('' + setval === '') {
            this.clear();
            return '{"presentation":"","google":0}';
        } else {
            this.value = String(setval);
            this.in_el.value = setval;
            this.privateParserPresentation();
            if (this.showElement) this.showElement.value = this.presentation;
        }
    }
    return this.in_el.value;
};

Object.defineProperty(irsInputAutocompliteGoogle.prototype, "bval", {
    get: function () {
        return 'g' + this.bval_block + irsCrypto.Base64.encode(this.in_el.value);
    }
});

Object.defineProperty(irsInputAutocompliteGoogle.prototype, "isban", {
    get: function () {
        return this.in_el.parentElement.querySelector("input[type='text']").hasAttribute('readonly');
    }
});

irsInputAutocompliteGoogle.prototype.ban = function () {
    irsInputAutocompliteGoogle.superclass.ban.apply(this);
    const item = this.in_el.parentElement.querySelector("input[type='text']");
    item.setAttribute('readonly', '');
    item.setAttribute('disabled', '');

};

irsInputAutocompliteGoogle.prototype.unban = function () {
    irsInputAutocompliteGoogle.superclass.unban.apply(this);
    const item = this.in_el.parentElement.querySelector("input[type='text']");
    item.hasAttribute('readonly') && item.removeAttribute('readonly');
    item.hasAttribute('disabled') && item.removeAttribute('disabled');
};

// =========================   SELECT3 ==============================================

function irsSelect3() {
    irsField.apply(this, arguments);
    this.widget = 'select3';

    var _encOptions = {
        tags: true,
        allowClear: true,
        ajax: {
            url: webalias() + "/ajax/field-options",
            dataType: "json",
            data: 'function(params) { return { typecode: ' + this.typecode + ', q:params.term, }; }',
        },
        escapeMarkup: 'function (markup) { return markup; }',
        templateResult: 'function(user) { return user.text; }',
        "maximumSelectionLength": 1,
        templateSelection: 'function (user) { return user.text; }',
        theme: "krajee",
        width: "100%",
        placeholder: this.placeholder,
        language: "ru"
    };
    this.krajee_id = Math.abs(irsCrypto.crc32(JSON.stringify(_encOptions)));

    this.s2Options = {//s2options_d6851687
        themeCss: ".select2-container--krajee",
        sizeCss: "",
        doReset: !0,
        doToggle: !0,
        doOrder: !1
    };
    this.options_id = Math.abs(irsCrypto.crc32(JSON.stringify(this.s2Options)));

}

extend(irsSelect3, irsField);

irsSelect3.prototype.widgetCode = function () {
    let v = '<span id="parent-s2-togall-mutability-' + this.lowtag + '" style="display:none">'
        + '<span id="s2-togall-mutability-' + this.lowtag + '" class="s2-togall-button s2-togall-select">'
        + '<span class="s2-select-label"><i class="glyphicon glyphicon-unchecked"></i>Выбрать все</span>'
        + '<span class="s2-unselect-label"><i class="glyphicon glyphicon-check"></i>Отменить выбор</span>'
        + '</span></span>'
        + '<div class="kv-plugin-loading loading-mutability-' + this.lowtag + '">&nbsp;</div>'
        + '<input type="hidden" ' + this.attrName + ' value="">'
        + '<select class="form-control" multiple size="4" maximumSelectionLength="1"  data-placement="bottom" '
        + 'data-s2-options="s2options_dv' + this.options_id + '" data-krajee-select2="select2_v' + this.krajee_id + '" style="display:none" '
        + 'data-typecode="' + this.typecode + '" '
        + this.attrIdOptions + this.attrName + this.attrPlaceholder + '>'
        + '<optgroup label="0">'
        // '<option value="">-- ' + placeholder + ' --</option>' + selected=""
        + (this.value ? '<option' + this.valueTag + 'data-select2-tag="true" >' + this.presentation + '</option>' : '');

    for (var val in this.options) {
        if (val == this.value)
            continue;
        v += '<option value="' + val + '">' + this.options[val] + '</option>';
    }
    return v + '</optgroup>'
        + '</select>';
};

irsSelect3.prototype.reinit = function () {

    this.$in_el = $("#mutability-" + this.lowtag);
    this.in_el = this.$in_el.length ? this.$in_el[0] : null;

    var _l = this;

    window['s2options_dv' + this.options_id] = this.s2Options;
    window['select2_v' + this.krajee_id] =
        {
            tags: !0,
            allowClear: !0,
            ajax: {
                url: webalias() + "/ajax/field-options",
                dataType: "json",
                data: params => {
                    return {typecode: _l.typecode, q: params.term};
                }
            },
            escapeMarkup: markup => markup,
            templateResult: user => user.text,
            templateSelection: user => user.text,
            maximumSelectionLength: 1,
            theme: "krajee",
            width: "100%",
            placeholder: _l.placeholder,
            language: "ru"
        };

    this.$in_el.data('select2') && this.$in_el.select2('destroy');

    jQuery.when(jQuery('#mutability-' + this.lowtag)
        .select2(window['select2_v' + this.krajee_id]))
        .done(initS2Loading('mutability-' + this.lowtag, 's2options_dv' + this.options_id));

    // конкретный глюк select2
    if (this.value)
        jQuery('#mutability-' + this.lowtag).val([this.value]).trigger("change");
    irsSelect3.superclass.reinit.apply(this);
    this.clear();

};

Object.defineProperty(irsSelect3.prototype, "bval", {
    get: function () {
        return '?' + this.bval_uni;
    }
});
irsSelect3.prototype.val = function (setvalin) {

    if (arguments.length) {
        let setval = String(Array.isArray(setvalin) ? setvalin.shift() : setvalin);

        const rval = this.$in_el.val();
        if (setval === (rval.length ? rval[0] : '')) { // Не меняем заданное значение
            return setval;
        }

        this.clear();
        if (String(setval).trim() === '' || String(setval).trim() === 'null') {
            return '';
        } else {
            var need = !0;
            this.$in_el.find('option').each(function () {
                if ((+this.value) == (+setval)) {
                    need = false;
                    return !1;
                }
            });
            if (!need) {
                this.$in_el.val([+setval]);
                this.$in_el.trigger && this.$in_el.trigger("change");
                this.value = String(+setval);

            } else {
                var _l = this, adata = {typecode: this.typecode, q: '', id: +setval};// берем typecode из настроек
                $.get(
                    webalias() + '/ajax/field-options',
                    adata,
                    function (bdata) {
                        if (Array.isArray(bdata.results) && bdata.results.length) {
                            $("#mutability-" + _l.lowtag + ' optgroup').append('<option value="' + (+setval) + '">' + bdata.results[0].text + '</option>');
                            _l.$in_el.val([+setval]);
                            _l.$in_el.trigger && _l.$in_el.trigger("change");
                            this.value = String(+setval);
                        } else {
                            let v = irsField.prototype.escapeHtml(String(setval).trim()).replace(/&nbsp;/g, ' ').replace(/[\r\n]/g, " ");

                            $("#mutability-" + _l.lowtag + ' optgroup').append('<option value="' + v + '">' + v + '</option>');
                            _l.$in_el.val([v]);
                            _l.$in_el.trigger && _l.$in_el.trigger("change");
                            this.value = v;
                        }
                    },
                    'json'
                );
            }
        }
    }
    var rval = this.$in_el.val();
    return rval.length ? rval[0] : '';
};

irsSelect3.prototype.clear = function () {
    this.value = '';
    this.$in_el.val([]);
    this.$in_el.trigger && this.$in_el.trigger("change");
};

//=========================== WRAPS ====================================================

function irsContact_maskstring(sorder, tag, label, placeholder, value, tooltip, subpage, mask) {
    if (mask && mask !== 'null') {
        this.__proto__ = new irsMaskstring;
        irsMaskstring.apply(this, arguments);
    } else {
        this.__proto__ = new irsString;
        irsString.apply(this, arguments);
    }
    this.addressType = 'contact_maskstring';
}

function irsAutocomplite_russian() {
    this.addressType = 'autocomplite_russian';
    irsInputAutocompliteGoogle.apply(this, arguments);
    this.aboardObjects = false;
    this.russianObjects = true;
}

extend(irsAutocomplite_russian, irsInputAutocompliteGoogle);


function irsAutocomplite_abroad() {
    this.addressType = 'autocomplite_abroad';
    irsInputAutocompliteGoogle.apply(this, arguments);
    this.aboardObjects = true;
    this.russianObjects = false;
}

extend(irsAutocomplite_abroad, irsInputAutocompliteGoogle);

//========================= LIBRARY ====================================================

window.irslibrary = {

    bval2value: function (bval) {
        if (bval === '') {
            return null;
        }
        var str = bval.trim(), block = str.substring(1, 2), body = str.substring(2);
        switch (str[0]) {
            case "r" :
            case "g" :
            case "s" :
                return irsCrypto.Base64.decode(body);
            case "f" :
                return parseFloat(body);
            case "b":
                return +body === 1;
            case "d" :
                return body; // JS не поддерживает даты до 1970
            case "p" :
                return null;
//                var result = JSON.parse(irsCrypto.Base64.encode(body));

//                $forret = OptionsOfFields::findOneByUid($result - > uid, $result - > type);
//                if ($createOption && !$forret) {
//        $forret = new OptionsOfFields(['typecode' => $result - > type,
//                'uid' => $result - > uid,
//                'name' => $result - > view, ]);
//                $forret - > save(false);
//        }
//        return $forret;
            case "n" :
                return null;
            case "j" :
                return JSON.parse(irsCrypto.Base64.encode(body));
            case 'u':
                var x;
                return x;
        }
        return null;
    },

    formatDate: function (date) {

        var dd = date.getDate();
        if (dd != dd)
            return '-';
        if (dd < 10)
            dd = '0' + dd;
        var mm = date.getMonth() + 1;
        if (mm < 10)
            mm = '0' + mm;
        var yy = date.getFullYear() % 100;
        if (yy < 10)
            yy = '0' + yy;
        return dd + '.' + mm + '.' + yy;
    },

    fixbugs: (mainwrap) => {
        //bug Bootstrap.Modal и Select2
        $('.portlet-body').show(); // удаляем мигание          


        mainwrap.removeAttr('tabindex');//https://ru.stackoverflow.com/questions/442230/%D0%9D%D0%B5-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D0%B5%D1%82-%D1%84%D0%B8%D0%BB%D1%8C%D1%82%D1%80-%D0%B2-select2-%D0%B2-%D0%BC%D0%BE%D0%B4%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%BC-%D0%BE%D0%BA%D0%BD%D0%B5-bootstrap

        // bug в новой версии картик Select3
        mainwrap.find(' .form-group optgroup[label=0]').each(function () {
            var bug = $(this);
            if (~bug.html().indexOf('<option value="" selected=""></option>'))
                bug.html(' ');
        });

        //bug отправки печ формы по Enter - делаем переход в следующую
        mainwrap.on('keydown', function (event) {
            if (event.keyCode == 13) {
                var inputs = $(event.target).closest('form').find(':input');
                inputs = inputs.eq(inputs.index(event.target) + 1);
                inputs.length && inputs[0].tagName != 'BUTTON' && inputs.focus();
            }
        });
        mainwrap.on('submit', function (event) {
            event.preventDefault();// Запрещаем submit по Enter
            return !1;
        });
        mainwrap.on('click', 'input[data-widget=boolean]', event => {
            let c = event.target.classList, p = "pristine";
            c.contains(p) && c.remove(p);
        });

        //получатель тест набора
        $(mainwrap).on('click', '#takefixture', () => {
            let tags = [];
            $('#irsCarousel form>div.form-group [data-widget]').each(function () {

                var vreg = /\-(.+)$/i.exec(this.id);

                var tag = String(vreg && vreg[1]).toUpperCase();

                if (!tag) {
                    console.error('При сборе виджетов по DOM не удалось найти тег виджета');
                    return;
                }
                tags.push(tag);
            });
            let $data = irslibrary.take$data({tags: tags});
            $.post(
                webalias() + '/ajax/fixture',
                $data,
                (data) => {
                    if (!data.bval) {
                        alert('Ошибка обращения к серверу');
                        return;
                    }
                    let fields = {};
                    $('#irsCarousel form>div.form-group [data-widget]').each(function () {
                        var vreg = /\-(.+)$/i.exec(this.id);

                        var tag = vreg && vreg[1], type = this.getAttribute('data-widget');
                        tag = String(tag).toUpperCase();

                        if (!tag || !type) {
                            console.error('При сборе виджетов по DOM не удалось найти тег или тип виджета');
                            debugger;
                            return;
                        }

                        fields[tag] = (irslibrary.classFabrica(type))(
                            this.getAttribute('data-sorder'),
                            tag,
                            'Ошибка: рабочий класс irsField',
                            this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : '',
                            '' + this.value,
                            (this.hasAttribute('data-toggle') && this.getAttribute('data-toggle') == "tooltip") ? this.getAttribute('title') : '',
                            +this.getAttribute('data-page'),
                            '',
                            {},
                            this.hasAttribute('data-typecode') ? +this.getAttribute('data-typecode') : 0,
                            'Ошибка: рабочий класс irsField',
                            this,
                            this.hasAttribute('data-picture') ? this.hasAttribute('data-picture') : ''
                        );
                    });

                    for (var tag in fields) {
                        if (data.bval[tag]) {
                            fields[tag].val(irslibrary.bval2value(data.bval[tag]));
                        } else {
                            fields[tag].clear();
                        }
                    }

                },
                'json');
        });
    },

    allListener: function (watchdog, classwrap, mainSelector) {
        ['change', 'input', 'click', 'keydown',
            'focusin', 'focusout', 'scroll',
            'mousedown', 'mouseup', 'mousemove', 'mouseout', 'mouseover',
            'pointerover', 'pointerout', 'MSPointerOut'].forEach(
            (function () {
                var node = document.querySelector(mainSelector),
                    shade = document.querySelector(classwrap + ' .loader'),
                    siteerr = document.querySelector(classwrap + ' .siteerror');
                if (node === null)
                    return e => {
                    }; // Для админской консоли, где нет ничего
                if (document.addEventListener)
                    return e => {
                        node.addEventListener(e, watchdog, false);
                        shade.addEventListener(e, watchdog, false);
                        siteerr.addEventListener(e, watchdog, false);
                    };
                return e => {
                    node.attachEvent("on" + e, watchdog);
                    shade.attachEvent("on" + e, watchdog);
                    siteerr.attachEvent("on" + e, watchdog);
                }
            })());
    },
    replaceGoogle: !0,
    gather: function (dirty_values, fields, clear_values, statusBan,statusUnBan) {
        let tag;
        dirty_values.irsClear();
        statusBan.irsClear();  
        statusUnBan.irsClear();

        var irsfield, changes = {};
        const hasOld = Object.keys(clear_values).length;
        for (tag in fields)
            if (typeof tag == 'string') {
                irsfield = fields[tag];
                // Повышение надежности - подмена Google скрипта
                if (window.irslibrary.replaceGoogle && irsfield.widget === 'InputAutocompliteGoogle') {
                    const research = document.getElementById('inputGoogleAutocomplete-mutability-' + irsfield.lowtag);
                    if (research && ~research.style.backgroundImage.toString().indexOf('icon_error.png')) {
                        window.irslibrary.replaceGoogle = !1;
                        google.maps = undefined;
                        let s = document.createElement("script");
                        s.type = "text/javascript";
                        s.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=A2c';
                        s.async = true;
                        s.onload = () => {
                            let el;
                            for (tag in fields) {
                                if (typeof tag == 'string') {
                                    irsfield = fields[tag];
                                    if (irsfield.widget === 'InputAutocompliteGoogle') {
                                        el = document.getElementById('inputGoogleAutocomplete-mutability-' + irsfield.lowtag);
                                        el.style.backgroundImage = 'none';
                                        el.hasAttribute('autocomplete') && el.removeAttribute('autocomplete');
                                        el.hasAttribute('disabled') && el.removeAttribute('disabled');
                                        el.placeholder = irsfield.placeholder;
                                        irsfield.reinit();
                                    }
                                }
                            }
                        }
                        document.body.appendChild(s);
                    }
                }

                (irsfield.isban? statusBan: statusUnBan).push(tag)
                dirty_values[tag] = irsfield.val();

                if (!hasOld || !(tag in clear_values) || dirty_values[tag] != clear_values[tag])
                    if((!dirty_values[tag] || dirty_values[tag] =='' || dirty_values[tag] =='null')&& 
                        (!clear_values[tag] || clear_values[tag] =='' || clear_values[tag]=='null'));else
                    changes[tag] = dirty_values[tag];
            }
        return changes;
    },

    rulesBlinking: function (pressgroup, n) {
        n = 0;
        const label = pressgroup.find('label');
        const blinker = () => {
            label.css({backgroundColor: n % 2 ? 'red' : ''});
            ++n < 7 && setTimeout(blinker, 300);
        }
        setTimeout(blinker, 300);
    },

    postFullpress: function (itemButton, fields) {
        for (var tag in fields) {
            let i = fields[tag];
            if(!i) continue;
            i.beforeBan = i.isban; // Запоминаем прошлое состояние, что бы не разблокировать заблокированных
            if (typeof i.waitban === 'function') i.waitban();
        }
    },

    setListenerOnSubpage: function (classPage2formAuth) {
        for (var classPagev in classPage2formAuth) {
            (function (classPage, formAuth) {// Замыкаем classPage
                $('ul.' + classPage).on('click', 'a', function () {
                    $('ul.' + classPage + ' a.active').removeClass('active');

                    var tmp = +($(this).data('page') || '1');
                    $('ul.' + classPage + ' a[data-page=' + tmp + ']').addClass('active');
                    $('form[data-auth=' + formAuth + '] .form-group [data-page]').each(function () {
                        var $el = $(this).parents('.form-group');
                        if (this.hasAttribute('data-page') && this.getAttribute('data-page') == tmp)// jQuery здесь глючит и не выдает правильный data('page')
                            $el.show();
                        else
                            $el.hide();
                    });
                });
            })(classPagev, classPage2formAuth[classPagev]);
        }
    },

    managePagination: (classPage2formAuth, whenon, whenoff) => {
        for (var classPage in classPage2formAuth)
            irslibrary.manageItemPagination(classPage, classPage2formAuth[classPage], whenon, whenoff)
    },
    manageItemPagination: (classPage, formAuth, whenon, whenoff) => {
        Object.values(document.querySelectorAll('form[data-auth="' + formAuth + '"] .form-group [data-widget]')).forEach(el => {
            if (el.hasAttribute('data-page')) {
                if (+el.getAttribute('data-page')) {
                    return;
                }
                el.removeAttribute('data-page');
            }
            el.setAttribute('data-page', "1");
            console.warning('Внимание. Нет data-page у виджета');
        });
        var allWidgets = Object.values(document.querySelectorAll('form[data-auth="' + formAuth + '"] .form-group [data-page]')),
            $paginator = $('ul.' + classPage), // Пагинатор всегда в 2 штуках - используем скрытый цикл jQuery
            isActivePaginator = $paginator.css('display') != 'none',
            needCheckPressButton = !0,
            $buttok = $('form[data-auth=' + formAuth + '] button.fullpress');

        if (allWidgets.length > 5 && !isActivePaginator) {//switch on pagination
            if (typeof whenon === 'function')
                whenon();
            let tags = [],
                cont = allWidgets.reduce((res, el) => {
                    let dp = +el.getAttribute('data-page');
                    tags[dp] = 1;
                    return {
                        min: Math.min(res.min, dp),
                        max: Math.max(res.max, dp)
                    };

                }, {min: 9999, max: 0});


            if (Object.keys(tags).length > 1) { // не выполнено деление по закладкам - нечего делить
                needCheckPressButton = !1;

                let active = cont.min, mx = cont.max;
                // присваем кнопке место
                $buttok.attr('data-page', mx).parents('.form-group').hide();

                $paginator.find('li.nav-item').hide();
                $paginator.find('a.active').removeClass('active');

                $paginator.show(); // типа анимация

                for (var i in tags) // показываем li
                    if (+i === active)
                        $paginator.find('a[data-page=' + i + ']').addClass('active').parent().show();
                    else
                        $paginator.find('a[data-page=' + i + ']').parent().show();


                allWidgets.forEach(el => {// так как кнопка точно не на первой странице allWidget используем обычный
                    el.closest('.form-group').style.display = +(el.getAttribute('data-page') || 1) === active ? '' : 'none';
                });
            }
        }
        if (allWidgets.length <= 6 && isActivePaginator) {//switch off pagination 5 + pressbetton
            if (typeof whenon === 'function')
                whenoff();
            needCheckPressButton = !1;
            $paginator.hide();
            $buttok.removeAttr('data-page').parents('.form-group').show();
            allWidgets.forEach(el => {
                el.closest('.form-group').style.display = '';
            });
        }
        if (needCheckPressButton && $paginator.css('display') != 'none') {
            // Возможно удаление и добавление элементов и страница окажется не последней или пустой. Нужно поправлять местоположение кнопки и закладок при включенном пагинаторе

            allWidgets = Object.values(document.querySelectorAll('form[data-auth="' + formAuth + '"] .form-group [data-page]'));

            let tags = [],
                cont = allWidgets.reduce((res, el) => {
                    if (el.matches('button.fullpress'))
                        return res; // Кнопка не считается
                    let dp = +el.getAttribute('data-page');
                    tags[dp] = 1;
                    return {
                        min: Math.min(res.min, dp),
                        max: Math.max(res.max, dp)
                    };

                }, {min: 9999, max: 0});

            let mx = cont.max;

            let position = $paginator.find('a.active'),
                active = position.length ? +position[0].getAttribute('data-page') : 0;


            let newactive = active;
            if (!('' + active in tags)) {
                newactive = cont.min;
                let delta = 9999;
                for (let pg in tags) {
                    let x = Math.abs(pg - active);
                    if (x < delta) {
                        newactive = pg, delta = x;
                    }
                }
            }
            /////////////////////////// Параметры готовы //////////////////////////////////////////////////

            +$buttok.attr('data-page') !== mx && $buttok.attr('data-page', mx);
            $paginator.find('li.nav-item').hide();
            for (var i in tags) // показываем li
                if (+i === newactive)
                    $paginator.find('a[data-page=' + i + ']').addClass('active').parent().show();
                else
                    $paginator.find('a[data-page=' + i + ']').parent().show();

            allWidgets.forEach(el => {// кнопка в списке !!!!
                el.closest('.form-group').style.display = +(el.getAttribute('data-page') || 1) === newactive ? '' : 'none';
            });
        }
    },
    
    
    
    createStoreRedux: (reducer, initialState) => {
        let state = initialState, listeners = []
        return {
            dispatch: action => {
                let old = state;
                state = reducer(state, action);
                if (old !== state)
                    for (let i = 0, n = listeners.length; i < n; i++) {
                        if (typeof listeners[i] === 'function') listeners[i]();
                    }
            },
            getState: () => state,
            subscribe: (listener) => {
                listeners.push(listener)
            }
        }
    },

    ourReducer: (state, action) => {
      //  const newkey = state.store.length;
        switch (action.type) {
            case 'SET':
                state.store[action.field] = action.val;
                return state;
            default:
                return state;
        }
    },
    
    
    
    defaultEvents: function (dataPOST, fields, funcReinit, funcWatchdog, classwrap, clear_values, classPage2formAuth, statusBan, statusUnBan, addElForm) {
        var ifield, tag;
        $('.background-wait').show(); //полоска

        if (dataPOST.sync && typeof dataPOST.sync == 'object') {
            svetofore.style.backgroundColor = '#f00';
            funcReinit();
            for (tag in dataPOST.sync) {
                if (fields[tag] === undefined) {// Это новое поле
                    dataPOST.add = dataPOST.add || {};
                    dataPOST.add[tag] = dataPOST.sync[tag];
                } else {
                    if ((statusBan.includes(tag) || !statusUnBan.includes(tag))&& +dataPOST.sync[tag].readonly == 0) {
                        dataPOST.unban = dataPOST.unban || {};
                        dataPOST.unban[tag] = 1;
                    }
                    if ((statusUnBan.includes(tag) || !statusBan.includes(tag)) && +dataPOST.sync[tag].readonly == 1) {
                        dataPOST.ban = dataPOST.ban || {};
                        dataPOST.ban[tag] = 1;
                    }
                }
                let it = dataPOST.sync[tag]['value'];
                it = Array.isArray(it)?it[0]:it;
                
                if (it != clear_values[tag]) { // усстановка значений отсроченно, так как не все поля созданы
                    dataPOST.setintro = dataPOST.setintro || {};
                    dataPOST.setintro[tag] = it;
                }
                
                clear_values[tag] = it; // setintro не обнуляет чистые значения, ставим здесь и для новых и для существующих полей
            }
            for (tag in fields) {
                if (dataPOST.sync[tag] === undefined) {// Это поле убрано
                    dataPOST.erase = dataPOST.erase || {};
                    dataPOST.erase[tag] = 1;
                }
            }
        }else if (dataPOST.transfer && typeof dataPOST.transfer == 'object') { // для корректной репликации, когда данные не могут уйти на сервер
            svetofore.style.backgroundColor = '#00f';
            for (var kk in dataPOST.transfer) {
                 let it = dataPOST.transfer[kk];
                it = Array.isArray(it)?it[0]:it;
                if (clear_values[kk] != it) {
                    clear_values[kk] = it;
                    funcWatchdog();// Синхронизируем свои значения
                }
            }
        }

        if (dataPOST.wait !== undefined)
            if (typeof dataPOST.wait == 'boolean' || dataPOST.wait == '') {
                svetofore.style.backgroundColor = '#fff';
                $(classwrap + ' .loader span').text('Обращение к центральному серверу - ждем');
                $(classwrap + ' .loader').show();
            } else {
                $(classwrap + ' .loader span').html(dataPOST.wait);
                $(classwrap + ' .loader').show();
            }

        if (dataPOST.add) {
            let bundle;
            for (tag in dataPOST.add) {
                if (fields[tag])
                    continue;
                if (bundle = dataPOST.add[tag])
                    irslibrary.addField(bundle, tag, addElForm, fields);
            }
            for (var classPage in classPage2formAuth) {
                $('ul.' + classPage).hide();
                $('form[data-auth=' + classPage2formAuth[classPage] + '] button.fullpress').removeAttr('data-page').parents('.form-group').show();
                $('form[data-auth=' + classPage2formAuth[classPage] + '] .form-group [data-page]').each(function () {
                    $(this).parents('.form-group').show();
                });
            }
            funcReinit(); // пересборка, пересортировка закладок
            funcWatchdog();// Синхронизируем свои значения
        }


        if (dataPOST.clearall) { // если на сервере нет полей - приходит эта команда, она транслируется в команду на очистку всех полей
            dataPOST.erase = dataPOST.erase || {};
            for (tag in fields)
                dataPOST.erase[tag] = 1;
        }
        if (dataPOST.redirect_auth !== undefined) {
            svetofore.style.backgroundColor = '#0ff';
            $(classwrap + ' .loader span').text('Ожидаем переадресацию на страницу авторизации');
            $(classwrap + ' .loader').show();
            setTimeout(() => {
                window.location.pathname = webalias() + '/auth/default/login';
            }, 1000);
        }
        if (dataPOST.erase) { // Удалить поле
            let blk;
            for (tag in dataPOST.erase)
                if (typeof tag == 'string' && tag) {
                    if (ifield = fields[tag].in_el) {
                        if(blk = ifield.closest('.form-group')){
                             blk.parentElement.removeChild(blk);
                              delete fields[tag];
                          }      
                    }                   
                }
            $(classwrap + ' .loader').hide();
            funcReinit(); // пересборка, пересортировка закладок, в том числе clearValues
            funcWatchdog();// Синхронизируем свои значения
        }
        if (dataPOST.errorlabel) { //errorlabel
            for (tag in fields) {
                fields[tag].errorlabel(); // убираем старые ошибки
                if (typeof fields[tag].waitunban === 'function') fields[tag].waitunban(); // пришли ошибки - 1с не хочет давать новые поля. Снимаем блокировки
            }
            var lastError;
            for (tag in dataPOST.errorlabel)
                if (typeof tag == 'string' && fields[tag]) {
                    if(lastError = fields[tag])
                        lastError.errorlabel(dataPOST.errorlabel[tag]);
                }
            if (lastError) {//если ни одно поле по запросу не найдено
                var auth = +lastError.in_el.closest('form').getAttribute('data-auth'),
                subpage = +lastError.in_el.getAttribute('data-page') || 1,
                classPage = '';
                for (var cl in classPage2formAuth)
                    if (+classPage2formAuth[cl] == auth) {
                        classPage = cl;
                        break;
                    }

                if (classPage) { //Перелистнем страницу
                    if (document.querySelector('ul.' + classPage).style.display != 'none') { // пагинация включена
                        // включаем закладку
                        $('ul.' + classPage + ' a.active').removeClass('active');
                        $('ul.' + classPage + ' a[data-page=' + subpage + ']').addClass('active');

                        $('form[data-auth=' + auth + '] .form-group [data-page]').each(function () {
                            this.closest('.form-group').style.display = +this.getAttribute('data-page') === subpage ? '' : 'none';
                        });
                    }
                    // перелистнем страницу Переберем страницы карусели и найдем там себя
                    $('#irsCarousel>.carousel-inner>div.hideitem').each(function () {
                        if (this.querySelector('form[data-auth="' + auth + '"]') === null)
                            return; // не мы
                        $(this).addClass('item').removeClass('hideitem').css("display", "");
                    });
                }
            }
            funcWatchdog();
            $(classwrap + ' .loader').hide();
        }
        if (dataPOST.ban) {
            for (tag in dataPOST.ban)
                typeof tag == 'string' && tag && fields[tag].ban() ;
            funcWatchdog();
        }
        if (dataPOST.unban) {
            for (tag in dataPOST.unban)
                typeof tag == 'string' && tag && fields[tag].unban();
            funcWatchdog();
        }
        if (dataPOST.setintro) { // Установка из sync
            for (tag in dataPOST.setintro)
                if (typeof tag == 'string' && fields[tag]) {
                    const be = fields[tag].val(),
                        set = Array.isArray(dataPOST.setintro[tag]) ? dataPOST.setintro[tag][0] : dataPOST.setintro[tag];
                    if (be == set) continue;
                    fields[tag].val(dataPOST.setintro[tag]);
                    if (fields[tag].val() != set) {
                        debugger;
                        console.error('Не удачная установка значения setintro ' + set + ' tag:' + tag + ' type:' + fields[tag].widget);
                    }
                }
            funcWatchdog(); // На отправку
        }
        if (dataPOST.set) { // Set важнее setintro и идет позже.
            for (tag in dataPOST.set)
                if (typeof tag == 'string' && fields[tag]) {
                    const be = fields[tag].val(), set = Array.isArray(dataPOST.set[tag]) ? dataPOST.set[tag][0] : dataPOST.set[tag];
                    if (be == set) continue;
                    fields[tag].val(dataPOST.set[tag]);
                    if (fields[tag].val() != set) {
                        debugger;
                        console.error('Не удачная установка значения ' + set + ' tag:' + tag + ' type:' + fields[tag].widget);
                    }
                }
            clear_values = {}; // Команда set приходит из 1с. Нужно данные отправить в yii2
            funcWatchdog();
            $(classwrap + ' .loader').hide();
        }
        if (dataPOST.messagebox) {
            var prom = new Promise(function (resolve, reject) {
                swal({title: 'Сообщение от сервера', text: dataPOST.messagebox, icon: "warning"});
            });
            prom.then(null, null);
        }
        $('.background-wait').hide();
    },
    take$data: (settings) => {
        var $data = {};
        $data[yii.getCsrfParam()] = yii.getCsrfToken();
        if (settings && typeof settings == 'object')
            for (var key in settings)
                $data[key] = settings[key];
        return $data;
    },
    sortDOM: function (iFieldList) { //++tst
        var parentsArray = [], frm, grp, j, widgetList, needSort = !1;
        for (var tag in iFieldList) {
            if (needSort)
                break; // понятно что сортировка нужна
            grp = iFieldList[tag].in_el.closest('.form-group');
            if (!grp)
                continue; // Это как-то не виджет
            frm = grp.parentNode;
            if (!~parentsArray.indexOf(frm)) { // найден
                parentsArray.push(frm);
                widgetList = frm.querySelectorAll('.form-group');// найдем все виджеты
                for (var i = 0, x = 0, it, n = widgetList.length; i < n; i++) {
                    it = widgetList[i].querySelector('[data-sorder]');
                    if (it === null)
                        continue; // например FULLBUTTON
                    if (!x) {
                        x = it.getAttribute('data-sorder');
                        continue;
                    }
                    j = it.getAttribute('data-sorder');
                    if (+j < +x) { // следующий не может быть меньше предыдущего
                        needSort = !0;
                        break;
                    }
                    x = j;
                }
            }

        }
        if (!needSort)
            return; // сортировка не нужна - не мучаем браузер перестроением DOM

        var itemsArray = [];
        parentsArray = [];
        var lList = Object.keys(iFieldList).map(key => iFieldList[key].in_el);

        //собираем родителей
        for (var i = 0, n = lList.length; i < n; i++) {
            grp = lList[i].closest('.form-group');
            if (!grp)
                continue;
            frm = grp.parentNode;
            j = parentsArray.indexOf(frm);
            if (!~j) { // найден
                j = parentsArray.length;
                parentsArray[j] = frm;
                itemsArray[j] = [];
            }
            if (!lList[i].matches('[data-sorder]')) { // есть ли признак сортировки - что бы не было исключения null.getAttribute
                continue;
            }
            itemsArray[j].push(frm.removeChild(grp));

        }
        for (var i = 0, n = itemsArray.length; i < n; i++) {
            itemsArray[i].sort(function (nodeA, nodeB) {
                var numberA = +nodeA.querySelector('[data-sorder]').getAttribute('data-sorder'),
                    numberB = +nodeB.querySelector('[data-sorder]').getAttribute('data-sorder');
                if (numberA < numberB)
                    return 1;
                if (numberA > numberB)
                    return -1;
                return 0;
            })
                .forEach(function (node) {
                    parentsArray[i].insertBefore(node, parentsArray[i].firstChild);
                });
        }
    }, 
    

    classFabrica: type => new Function(
        "sorder, tag, label, placeholder, value, tooltip, subpage, mask, options, typecode, presentation, in_el, picture",
        "var iField = new irs" + type[0].toUpperCase() + type.replace(/\-/g, '').slice(1)
        + "(sorder, tag, label, placeholder, value, tooltip, subpage, mask, options, typecode, presentation, picture); "
        + "iField.in_el = in_el; iField.$in_el = $(in_el); return iField;"),

    // обновим коллекцию классов по DOM    
    watchDom: function (dirty_values, clear_values, fields, statusBan, statusUnBan) {
        var old_fields = {}, tags = [], items = [], tag;
        // backup нужного
        for (var key in fields)
            old_fields[key] = fields[key];
        for (tag in old_fields) {
            tags.push(tag);
            items.push(old_fields[tag].in_el);
        }
        // Все входные перемнные чистим
        dirty_values.irsClear();
        statusBan.irsClear();
        statusUnBan.irsClear();
        fields.irsClear();
        clear_values.irsClear();

        $('#irsCarousel form>div.form-group [data-widget]').each(function () {
            // включим картинки
            if (this.matches('[data-picture]')) {
                let namePicture, gr, img;
                if ((namePicture = this.getAttribute('data-picture').trim()) &&
                    (gr = this.closest('div.form-group')) &&
                    (!gr.querySelector('img'))) {

                    img = document.createElement('img');
                    img.src = webalias() + '/pictures/' + namePicture + '.png';
                    gr.insertBefore(img, gr.firstChild);

                    img = document.createElement('hr');
                    img.className = 'fg';
                    gr.insertBefore(img, gr.firstChild);
                }
            }

            var find = items.indexOf(this);
            if (~find) { // Забираем заново, это позволяет уйти от ошибок замыкания, когда в объекте элементы уже и не в DOM
                tag = tags[find], fields[tag] = old_fields[tag];
                dirty_values[tag] = fields[tag].val();
               (fields[tag].isban? statusBan: statusUnBan).push(tag);
                return;
            }

            var vreg = /\-(.+)$/i.exec(this.id);

            var tag = vreg && vreg[1], type = this.getAttribute('data-widget');
            tag = String(tag).toUpperCase();

            if (!tag || !type) {
                console.error('При сборе виджетов по DOM не удалось найти тег или тип виджета');
                return;
            }

            fields[tag] = (irslibrary.classFabrica(type))(
                this.getAttribute('data-sorder'),
                tag,
                'Ошибка: рабочий класс irsField',
                this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : '',
                '' + this.value,
                (this.hasAttribute('data-toggle') && this.getAttribute('data-toggle') == "tooltip") ? this.getAttribute('title') : '',
                +this.getAttribute('data-page'),
                '',
                {},
                this.hasAttribute('data-typecode') ? +this.getAttribute('data-typecode') : 0,
                'Ошибка: рабочий класс irsField',
                this,
                this.hasAttribute('data-picture') ? this.hasAttribute('data-picture') : ''
            );

            dirty_values[tag] = fields[tag].val();
            (fields[tag].isban? statusBan: statusUnBan).push(tag);
        });
    },
    addElForm: function (auth, elpack) {
        var $form = $('form[data-auth=' + auth + ']');
        if (!$form.length) {
            console.log('Не найдена Form при добавлении виджета, для data-auth=' + auth);
            return;
        }
        var frmId = $form[0].id, isfind = 0, forbefore = !1, sorder = elpack.sorder;

        $('#' + frmId + ' div.form-group [data-sorder]').parents('div.form-group').each(function () {
            var l_order = this.querySelector('[data-sorder]');
            l_order = l_order === null ? 0 : l_order.getAttribute('data-sorder');
            if (l_order > sorder && (!isfind || isfind > l_order)) {
                isfind = l_order;
                forbefore = this;
            }
        });

        forbefore = forbefore ? $(forbefore) : $('#' + frmId + ' div.form-group button.fullpress').parents('div.form-group');
        forbefore.before(elpack.html);
        elpack.reinit(); // инициализируем виджет
    },

    addField: function (boundle, tag, addElForm, fields) {

        if (!tag)
            return;

        var elpack = (irslibrary.classFabrica(boundle.type))(
            +boundle.sorder,
            tag,
            '' + boundle.label,
            '' + boundle.placeholder,
            '' + boundle.value,
            '' + boundle.tooltip,
            +boundle.subpage,
            '' + boundle.mask,
            boundle.options,
            +boundle.typecode,
            '' + boundle.presentation,
            null,
            '' + boundle.picture
        );

        if (fields)
            fields[tag] = elpack; // Добавим в коллекцию - что бы watchDom быстрее находил

        addElForm(boundle.auth, elpack);


        elpack.$in_el = $('#mutability-' + String(tag).toLowerCase());
        elpack.in_el = elpack.$in_el[0];
        boundle.readonly?elpack.ban():elpack.unban();
    }
};
