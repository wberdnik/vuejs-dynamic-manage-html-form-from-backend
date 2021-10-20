
    <div id="vueprice">
        <div class="partners-type-index">
            <?= app\widgets\Alert::widget() ?>


            <?=
            GridView::widget([
                'dataProvider' => $dataProvider,
                'layout' => '
			<div class="panel panel-default">
				<div class="panel-heading">' . Html::encode($this->title) . '</div>
				<div class="panel-body ">
					<div>' . Html::button('Добавить', ['class' => 'btn btn-success', 'data-toggle' => 'modal', 'data-target' => '#itemModal']) . '</div>
					{summary}
				</div>
				{items}
				{pager}
			</div>',
                'summary' => '<div class="summary">Показаны <strong>{begin}</strong>-<strong>{end}</strong> из <strong>{totalCount}</strong></div>',
                'tableOptions' => [
                    'class' => 'table'
                ],
                'rowOptions' => function ($model, $key, $index, $grid) {
                    return [
                        'key' => $key,
                        'index' => $index,
                        'class' => 'item-container',
                    ];
                },
                'columns' => [
                    ['class' => 'yii\grid\SerialColumn'],
                    [
                        'attribute' => 'title',
                        'label' => 'Название',
                        'content' => function($data) {
                            return '<span class="field-info">' . Html::encode($data->title) . '</span>';
                        }
                    ],
                    [
                        'class' => 'app\components\CombinedDataColumn',
                        'labelTemplate' => '{0}  <br/>  {1}',
                        'valueTemplate' => '{0}  <br/>  {1}',
                        'labels' => [
                            'Город',
                            'Регион',
                        ],
                        'attributes' => [
                            'city_id:text',
                            'region_id:text',
                        ],
                        'values' => [
                            'city_',
                            'region_',
                        ],
                    ],
                    [
                        'class' => 'app\components\CombinedDataColumn',
                        'labelTemplate' => '{0}  <br/>  {1}',
                        'valueTemplate' => '{0}  <br/>  {1}',
                        'labels' => [
                            'Категория',
                            'Партнер',
                        ],
                        'attributes' => [
                            'category_id:text',
                            'partner_id:text',
                        ],
                        'values' => [
                            'category_',
                            'partner_',
                        ],
                    ],
                    ['class' => 'app\components\CombinedDataColumn',
                        'attributes' => ['price:integer', 'offer:text'],
                        'labelTemplate' => '{0}  <br/>  {1}',
                        'valueTemplate' => '{0}  <br/>  {1}',
                        'labels' => ['Цена (руб.)', 'Оффер'],
                        'contentOptions' => [
                            'data-field' => 'price-price',
                            'class' => 'field-info',
                        ],
                    ],
                    [
                        'class' => 'yii\grid\ActionColumn',
                        'template' => '{edit} {delete}',
                        'buttons' => [
                            'edit' => function ($url, $model, $key) {
                                return Html::button('<img src="/img/icon/edit.png"> Править', [
                                            'class' => 'edit-item-button btn btn-link',
                                            'v-on:click' => "editmodal",
                                            'data-selectmodal' => json_encode([
                                                'id' => $model->id,
                                                'title' => $model->title,
                                                'city_id' => $model->city_id,
                                                'city' => $model->city_,
                                                'category_id' => $model->category_id,
                                                'category' => $model->category_,
                                                'partner_id' => $model->partner_id,
                                                'partner' => $model->partner_,
                                                'region_id' => $model->region_id,
                                                'region' => $model->region_,
                                                'offer_id' => $model->offer_id,
                                                'price' => $model->price,
                                            ]),
                                            'data-toggle' => 'modal',
                                            'data-target' => '#itemModal']);
                            },
                            'delete' => function ($url, $model, $key) {
                                return Html::a('<img src="/img/icon/delete.png"> Удалить', ['delete', 'id' => $model->id], [
                                            'data' => [
                                                'confirm' => 'Вы точно хотите удалить запись?',
                                                'method' => 'post',
                                ]]);
                            },
                        ],
                        'contentOptions' => ['style' => 'max-width: 130px;']
                    ]
                ],
            ]);
            ?>

        </div>
       
    </div>

