function doAlways() {
    start();
}

( function( $ ) {

    module( "DataManager: WebSQL" );

    test( "Existence of WebSQL", function() {
        expect( 1 );
        ok( window.openDatabase );
    });

    var dm = AeroGear.DataManager();
    dm.add({
        name: "test1",
        type: "WebSQL",
        settings: {
            crypto: {
                agcrypto: AeroGear.Crypto(),
                options: {
                    key: "password"
                }
            }
        }
    });
})( jQuery );

( function( $ ) {
    var dm = AeroGear.DataManager();

    module( "DataManager: WebSQL - Create and Test open failure", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });
        },
        teardown: function() {
            dm.remove( "test1" );
        }
    });

    test( "Create - Name String", function(){
        expect( 2 );

        equal( Object.keys( dm.stores ).length, 1, "1 store created" );
        equal( dm.stores.test1 instanceof AeroGear.DataManager.adapters.WebSQL, true, "new WebSQL DB instance created" );
    });

    test( "Read - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.read( undefined );
            },
            "Database not opened",
            "throws"
        );
    });

    test( "Save - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.save( {} );
            },
            "Database not opened",
            "throws"
        );
    });

    test( "Remove - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.remove( undefined );
            },
            "Database not opened",
            "throws"
        );
    });

    test( "Filter - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.filter( { "name": "Lucas" }, true );
            },
            "Database not opened",
            "throws"
        );
    });
})( jQuery );

( function( $ ) {
    var dm = AeroGear.DataManager();

    module( "DataManager: WebSQL - Open", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });
        },
        teardown: function() {
            var dbs = [ "test1" ];
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            });
        }
    });

    asyncTest( "Open", function() {
        expect( 1 );

        dm.stores.test1.open({
            success: function( data ) {
                ok( true, "WebSQL test1 created successfully" );
            },
            error: function( error ) {
                ok( false, "error, WebSQL create error" + error );
            }
        }).always( doAlways );
    });

    asyncTest( "Open as a promise", function() {
        expect( 1 );

        dm.stores.test1.open().then( function( data ) {
            ok( true, "WebSQL test1 created successfully" );
        }).always( doAlways );
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Save", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var dbs = [ "test1" ];
            hasopened = undefined;
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            });
        }
    });

    asyncTest( "Save Data - Array", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data, {
            success: function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                equal( data[ 1 ].name, "Otter", "encrypted saved data is decrypted successfully" );
            },
            error: function( error ) {
                console.log( error );
                ok( false, "Failed to save records" + error );
            }
            }).always( doAlways );
        });
    });

    asyncTest( "Save Data - 1 Item", function() {
        expect( 3 );
            hasopened.always( function() {
                dm.stores.test1.save( { "id": 3, "name": "Grace", "type": "Little Person" }, {
                success: function( data ) {
                    ok( true, "Data Saved Successfully" );
                    equal( data.length, 1, "1 items in database" );
                    equal( data[ 0 ].name, "Grace", "encrypted saved data is decrypted successfully"  );
                },
                error: function( error ) {
                    console.log( error );
                    ok( false, "Failed to save records" + error );
                }
            }).always( doAlways );
        });
    });

    asyncTest( "Save Data - Array - as a promise", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
            }).always( doAlways );
        });
    });

    asyncTest( "Save Data - Array - Reset - as a promise", function() {
        expect( 4 );
        var newData = [
                {
                    "id": 3,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 4,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

        hasopened.always( function() {
            dm.stores.test1.save( data ).then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                dm.stores.test1.save( newData, { reset: true } ).then( function( data ) {
                    ok( true, "Data Saved Successfully" );
                    equal( data.length, 2, "2 items in database" );
                }).always( doAlways );
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Read", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var dbs = [ "test1" ];
            hasopened = undefined;
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            });
        }
    });

    asyncTest( "Read Data - All", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.read( undefined, {
                    success: function( data ) {
                        ok( true, "read all data successful" );
                        equal( data.length, 2, "2 items returned" );
                    },
                    error: function( error ) {
                        ok( false, "Read All has errors" + error );
                    }
                }).always( doAlways );
            });
        });
    });

    asyncTest( "Read Data - 1 item - string", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.read( 1, {
                    success: function( data ) {
                        ok( true, "read 1 item successful" );
                        equal( data.length, 1, "1 items returned" );
                    },
                    error: function( error ) {
                        ok( false, "Read 1 has errors" + error );
                    }
                }).always( doAlways );
            });
        });
    });

    asyncTest( "Read Data - All - as a Promise", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.read().then( function( data ) {
                    ok( true, "read all data successful" );
                    equal( data.length, 2, "2 items returned" );
                }).always( doAlways );
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Update", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var dbs = [ "test1" ];
            hasopened = undefined;
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            });
        }
    });

    asyncTest( "Update Data - 1 item", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.save( { "id": 1, "name": "Lucas", "type": "human" }, {
                    success: function( data ) {
                        ok( true, "update 1 item successful" );
                        equal( data.length, 2, "2 items still returned" );
                        equal( data[ 1 ].name, "Lucas", "Name field Updated"  );
                    },
                    error: function( error ) {
                        ok( false, "update 1 has errors" + error );
                    }
                }).always( doAlways );
            });
        });
    });

    asyncTest( "Update Data - 1 item - as a promise", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.save( { "id": 1, "name": "Lucas", "type": "human" } ).then( function( data ) {
                    ok( true, "update 1 item successful" );
                    equal( data.length, 2, "2 items still returned" );
                    equal( data[ 1 ].name, "Lucas", "Name field Updated"  );
                }).always( doAlways );
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Remove", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var dbs = [ "test1" ];
            hasopened = undefined;
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            });
        }
    });

    asyncTest( "Remove Data - 1 item - string", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.remove( 1, {
                    success: function( data ) {
                        ok( true, "remove 1 item successful" );
                        equal( data.length, 1, "1 items returned" );
                    },
                    error: function( error ) {
                        ok( false, "remove 1 has errors" + error );
                    }
                }).always( doAlways );
            });
        });
    });

    asyncTest( "Remove Data - All", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.remove( undefined, {
                    success: function( data ) {
                        ok( true, "remove all items" );
                        equal( data.length, 0, "0 items returned" );
                    },
                    error: function( error ) {
                        ok( false, "remove all has errors" + error );
                    }
                }).always( doAlways );
            });
        });
    });

    asyncTest( "Remove Data - All - as a promise", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.remove().then( function( data ) {
                    ok( true, "remove all items" );
                    equal( data.length, 0, "0 items returned" );
                }).always( doAlways );
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Filter", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var dbs = [ "test1" ];
            hasopened = undefined;
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            });
        }
    });

    asyncTest( "filter Data - 1 item", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.filter( { "name": "Luke" }, true, {
                    success: function( data ) {
                        ok( true, "filter 1 item successfully" );
                        equal( data.length, 1, "1 item returned" );
                        equal( data[ 0 ].name, "Luke", "Name field returned"  );
                    },
                    error: function( error ) {
                        ok( false, "update 1 has errors" + error );
                    }
                }).always( doAlways );
            });
        });
    });

    asyncTest( "filter Data - 1 item - as a promise", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.filter( { "name": "Luke" }, true ).then( function( data ) {
                    ok( true, "filter 1 item successfully" );
                    equal( data.length, 1, "1 item returned" );
                    equal( data[ 0 ].name, "Luke", "Name field returned"  );
                }).always( doAlways );
            });
        });
    });
})( jQuery );

( function( $ ) {
    var dm = AeroGear.DataManager();
    dm.add({
        name: "test1",
        type: "WebSQL",
        settings: {
            crypto: {
                agcrypto: AeroGear.Crypto(),
                options: {
                    key: "password"
                }
            }
        }
    });
    module( "DataManager - Indexed - Cleanup on End",{
        setup: function() {
            hasopened = dm.stores.test1.open();
        }
    });

    asyncTest( "end clean", function() {
        expect( 0 );
        var dbs = [ "test1" ];
        hasopened.done( function() {
            dm.stores.test1.remove( undefined, {
                success: function( data ) {
                },
                error: function( error ) {
                }
            }).always( doAlways );
        });
    });
})( jQuery );
