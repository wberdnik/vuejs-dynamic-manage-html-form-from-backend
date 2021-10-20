<?php

use aki\vue\AxiosAsset;
use aki\vue\VueAsset;
use app\modules\settings\models\SlagDirectSitesSearch;
use yii\bootstrap\Modal;
use yii\data\ActiveDataProvider;
use yii\grid\GridView;
use yii\helpers\Html;
use yii\web\View;


$this->registerCssFile('/css/settings/directspy.css');
$this->registerJsFile('/js/settings/directspy.js', [
    'depends' => [VueAsset::className()],
    'position' => View::POS_END]);

VueAsset::register($this);
?>
<div id="directspy-table" class="slag-direct-sites-index">

     <div class="st-icon" style="background-image: url(/img/icon/spydirect.png); position:relative;
    width:56px; height:56px;  margin-right:10px; display: inline-block;"></div>
     <h3 style="margin-top: 10px;display: inline-block;"><?= Html::encode($this->title) ?></h3>
    <p>
        <?= Html::a('Создать', ['#'], ['class' => 'btn btn-outline-secondary btn-sm', 'v-on:click'=>'createrow']) ?>
    </p>

    <div  class="grid-view">
        <paginator v-bind:page="page" v-on:go_newpage="go_newpage" v-bind:pages="pages"></paginator>
        <table class="table table-striped table-bordered" v-on:contextmenu="contextmenu" v-on:click="editrow">
            <thead>
                <tr>
                    <th>#</th>
                    <th is="head-site" v-model="filterSite">
            <sort-label v-bind:sorti="sort" we="Host" v-on:mysort="changeSort"></sort-label>
            </th>        
            <th is="head-slagid" v-bind:optlist="SlagIdList" v-model="filterSlag">
            <sort-label v-bind:sorti="sort" we="SlagId" v-on:mysort="changeSort"></sort-label>
            </th>
            <th is="head-double" v-bind:consist="{LimitShowPerDay:'Лимит показов',LimitLeadsPerDay:'Лимит заявок'}">
                <template v-slot:default="slotProps">
                    <sort-label v-bind:we="slotProps.we_slot" v-bind:sorti="sort" v-on:mysort="changeSort"></sort-label>
                </template>
            </th>   
            <th is="head-double" v-bind:consist="{todayShow:'Показы сегодня',todaySuccess:'Заявок сегодня'}"  >
                <template v-slot:default="slotProps">
                    <sort-label v-bind:we="slotProps.we_slot" v-bind:sorti="sort" v-on:mysort="changeSort"></sort-label>
                </template>                
            </th> 

            <th is="head-single"  v-bind:consist="{todayError:'Ошибки сегодня',}">
            <sort-label v-bind:sorti="sort" we="todayError" v-on:mysort="changeSort"></sort-label>
            </th>                                   
            </tr>

            </thead>
            <tbody>
                <tr v-for="(_view, index) in data"  v-bind:data-id="_view.id" v-bind:key="_view.id" >
                    <td>{{index+1}}</td><td>{{_view.cells.Host}}</td>
                    <td v-bind:style="{color: slagColor(_view)}">{{fetchSlag(_view)}}</td>
                    <td align ="right">{{_view.cells.LimitShowPerDay}}<br/> <b>{{_view.cells.LimitLeadsPerDay}}</b></td>
                    <td align ="right">{{_view.cells.todayShow}}<br/> <b>{{_view.cells.todaySuccess}}</b></td>
                    <td align ="right">{{_view.cells.todayError}}</td>                   
                </tr>
            </tbody>
        </table> 

        <div id="l-context-menu" class="widgetmenu" v-on:click="clickContext">
            <ul>
                <li data-item="edit" ><span class="glyphicon glyphicon-pencil"></span>&nbsp; Править</li>
                <li data-item="copy" ><span class="glyphicon glyphicon-duplicate"></span>&nbsp; Скопировать</li>
                <li data-item="delete"><span class="glyphicon glyphicon-erase"></span>&nbsp; Удалить</li>
                <br>
                <li>&nbsp; Отмена</li>
            </ul>
        </div>



        <?php
        Modal::begin([
            'size' => Modal::SIZE_LARGE,
            'options' => ['id' => 'direct-spysmodal'],
            'clientOptions' => ['show' => false,],
            'header' => '<h4 class="modal-title" v-if="this.insert_row">Создание новой карточки сайта</h4>'
            . '<h4 class="modal-title" v-else>Редактирование карточки сайта</h4>',
        ]);
        ?>
        <div class="form-group">
            <label class="control-label" for="directspy-host">Сайт</label>
            <input type="text" id="directspy-host" class="form-control" v-model="l_modal.Host">
            <div class="help-block host"></div>
        </div>    
        <div class="form-group">
            <label class="control-label" for="directspy-slag">Поток продаж со статусом DirectSpy</label>
            <select id="directspy-slag" class="form-control" v-model="l_modal.SlagId">
                <option value=""></option>
                <option v-for="(_view, name) in SlagIdList" v-bind:value="name">{{_view}}</option>
            </select>
            <div class="help-block slagid"></div>
        </div>  

        <div class="form-group">
            <label class="control-label">Согласованность регионов отправки</label>
            <div id="directspy-checkregions">
                <label><input type="radio" v-model="l_modal.CheckRegions" value="0"> Любой регион</label><br>
                <label><input type="radio" v-model="l_modal.CheckRegions" value="1"> Москва и Санкт-Петербург</label><br>
                <label><input type="radio" v-model="l_modal.CheckRegions" value="2"> Точное соответствие </label>
            </div>

            <div class="help-block checkregions"></div>
        </div>
        <div class="form-group">
            <label class="control-label" for="directspy-limitshow">Максимум показов виджета в день (0-не показывать)</label>
            <input type="text" id="directspy-limitshow" style="text-align: right;" class="form-control" v-model="l_modal.LimitShowPerDay">
            <div class="help-block limitshowperday"></div>
        </div>    
        <div class="form-group">
            <label class="control-label" for="directspy-limitleads">Максимум продаж лидов в день (антифрод при ошибке,0-не продавать)</label>
            <input type="text" id="directspy-limitleads" style="text-align: right;" class="form-control" v-model="l_modal.LimitLeadsPerDay">
            <div class="help-block limitleadsperday"></div>
        </div>   

        <div class="form-group">
            <label class="control-label" for="directspy-urlscript">Полный скрипт показа виджета</label>
            <input type="text" id="directspy-urlscript" class="form-control" v-model="l_modal.UrlScriptShow">
            <div class="help-block urlscriptshow"></div>
        </div>   
        
        <div class="form-group">
            <label class="control-label" for="directspy-msend">Процедура отправки</label>
            <select id ="directspy-msend" class="form-control" v-model="l_modal.MethodSend">
                <option v-for="(_view, name) in MethodSendList" v-bind:value="name">{{_view}}</option>
            </select>
            <div class="help-block methodsend"></div>
        </div>  
        <div class="form-group">
            <button type="button" class="btn btn-success" v-on:click="SaveModal">Сохранить</button>    
            <button type="button" class="btn btn-default" data-dismiss="modal" aria-hidden="true">Отмена</button>    
        </div>



        <?php Modal::end(); ?>
    </div>
</div>

