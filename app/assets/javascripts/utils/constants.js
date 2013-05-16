define([
    'application'
    ],
    function( App ) {
        return {
            proxy: {
                SERVER: App.config.proxy.SERVER,
                URL: App.config.proxy.SERVER + '/proxy?url='
            },
            api: {
                urls: {
                    LIST: App.config.api.URL_ROOT + 'list',
                    VIEW: App.config.api.URL_ROOT + 'view',
                    THUMBNAIL_ROOT: App.config.api.THUMBNAIL_ROOT
                },
                codes: {
                    TEST:               908,
                    CONVERSION_EVENT:   866,
                    FACTOR:             870
                },
                types: {
                    LOCATION:           'wm_dt_page_v1',
                    PROJECT:            'wm_dt_test_v1',
                    SITE:               'wm_dt_environmentdata_v1',
                    CONVERSION_EVENT:   'wt_dt_conversionevent_v1',
                    LEVEL:              'wt_dt_runcontent_v1',
                    FACTOR:             'wm_dt_factor_v1',
                    TEST:               'wm_dt_run_v1'
                }
            },
            testStates: {
                PENDING:            'PENDING',
                NORMAL:             'NORMAL'
            },
            conversionEventTypes: {
                TIME_ON_PAGE:           'TIMEONPAGE',
                CLICK:                  'ONCLICK',
                LOAD:                   'LOAD'
            },
            visualEditorStages: {
                CHOOSE_LOCATION:            'CHOOSELOCATION',
                CREATE_EXPERIMENTS:         'CREATEEXPERIMENTS',
                CHOOSE_CONVERSION_EVENT:    'CHOOSECONVERSIONEVENT',
                REVIEW_PUBLISH:             'REVIEWPUBLISH'
            }
        };
    }
);