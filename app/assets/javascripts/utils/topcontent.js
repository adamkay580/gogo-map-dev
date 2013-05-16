define([
    'application'
    ],
    function( Application, obj ) {

        var TopContent;

        TopContent = function( obj ) {

            this.dataStore = {};
            this.topStore = [];

            this.trimFlag = false;

            // this is the value that you will use as a key in the Dictionary, this is required
            this.itemKey = "";
            if (typeof obj.itemKey !== 'undefined') {
                this.itemKey = obj.itemKey;
            }

            // this is the number of top items that you want to track, this is set to 10 by default
            this.topCount = 10;
            if (typeof obj.topCount !== 'undefined' && obj.topCount > 0) {
                this.topCount = obj.topCount;
            }
            // pass a new top count to change the returned top count this requires a topData update
            this.setTopCount = function (newTopCount) {
                if (newTopCount > 0) {
                    this.topCount = newTopCount;
                    this.trim(true); // true indicates to the trimmer that it is a one time update
                }
            };

            this.setTrimWindow = function (newTrimWindow) {
                if (typeof newTrimWindow !== 'undefined' && newTrimWindow > 0) {
                    this.trimWindow = newTrimWindow * 1000;  // multiply by 1000 to facilitate passing 'seconds'
                }
            };

            this.setItemKey = function (newItemKey) {
                if (typeof newItemKey !== 'undefined' && newItemKey != '') {
                    while (trimFlag) { }
                    this.trimFlag = true;
                    this.itemKey = newItemKey;
                    this.dataStore = {};
                    this.topStore = [];
                    this.trimFlag = false;
                }
            };

            // this is an array of values that you require the item contains in order to add it to the set
            this.requiredValues = [];
            if (typeof obj.requiredValues !== 'undefined' && obj.requiredValues.length > 0) {
                this.requiredValues = obj.requiredValues;
            }

            // pass an empty array to remove required values passed previously
            this.setRequiredValues = function (newRequiredValues) {
                this.requiredValues = newRequiredValues;
            };

            // this is the length of time in seconds that you will give the items before you trim them.
            this.trimWindow = 10;
            if (typeof obj.trimWindow !== 'undefined' && obj.trimWindow > 0) {
                this.trimWindow = obj.trimWindow * 1000; // multiply by 1000 to facilitate passing 'seconds'
                var wttop = this;
                setTimeout(function () { wttop.trim(false); }, wttop.trimWindow);
            }
            else if( obj.trimWindow == 0 ){
                this.trimWindow = obj.trimWindow;
            }

            // this is the function that can be used to increment attributes on the valid items as they are added
            this.incrementCounts = function (item) { return true; };
            this.setIncrementFunction = function (incrementFunction) {
                this.incrementCounts = incrementFunction;
            };

            // Convenience function to mimic array notation
            this.push = function (item) {
                this.addData(item);
            };

            this._addData = function( itemKeyVal, item ) {
                var existingItem = this.dataStore[ itemKeyVal ];
                if (existingItem) {
                    existingItem.count = existingItem.hitList.push(Date.now());
                    existingItem.allTimeTotal = existingItem.allTimeTotal + 1;
                    this.incrementCounts(existingItem);
                    this.sortTop(existingItem);
                    return;
                }

                // otherwise we create a new item and add it to the object container
                item.count = 1;
                item.allTimeTotal = 1;
                item.hitList = [Date.now()];

                // Here we create an empty history array
                // each item is a checkpoint of size for the last second
                item.history = [];
                for(var i = 0; i < (this.trimWindow/1000); i++){
                    item.history.push(0);
                }

                this.incrementCounts(item);
                this.dataStore[ itemKeyVal ] = item;

                if (this.topStore.length < this.topCount) {
                    this.sortTop(item);
                }
            };

            // function for handling an a new data item
            this.addData = function (item) {
                var i, _len;

                // exit if we are doing a trim / we could miss a couple of items but
                // we wont corrupt our data by adding and removing simultaniously
                if (this.trimFlag) return;

                // return if the key did not exist in the item
                if ( !item || !item[this.itemKey]) return;

                // return if any of the required values dont exist
                for (i = 0, _len=this.requiredValues.length; i < _len; i++) {
                    if (!item[ this.requiredValues[i] ]) return;
                }

                // now we check if the value exists in our object container already and do the incrementing, timestamping, and sorting
                // We make a shallow copy version of item ( the original item passed to addData )
                // because the item could be passed here more than once, if it's key value is an array
                // and we want to avoid any values changing by reference.

                var val = item[this.itemKey];
                if ( !_.isArray( val ) ) {
                    this._addData( val, item );
                } else {
                    for ( i = 0, _len=val.length; i<_len; i++ ) {
                        var _item = _.clone( item );
                        _item[ this.itemKey ] = val[i];
                        this._addData( val[i], _item );
                    }
                }

            };

            this.getTop = function () {
                if (this.trimFlag) return null;
                var topList = [];

                for (var i in this.topStore) {
                    var item = _.clone(this.topStore[i]);
                    topList.push(item);
                }

                return topList;
            };

            this.getTopCountSum = function () {
                var sumTotal = 0;
                var topList = this.topStore;
                for (var i = 0; i < topList.length; i++) {
                    sumTotal += topList[i].count;
                }
                return sumTotal;
            }

            this.getLength = function () {
                var count = 0;
                for (var key in this.dataStore) {
                    count++;
                }
                return count;
            }

            this.getAllSorted = function() {

                var tuples = [];
                for (var key in this.dataStore) {
                    tuples.push([key, this.dataStore[key]]);
                }

                // now we use the array sort function for sorting
                tuples.sort(function (tup1, tup2) {
                    return tup2[1].count - tup1[1].count;
                });

                return tuples;
            }

            this.sortTop = function (testItem) {
                if (typeof testItem !== 'undefined' && this.topStore.indexOf(testItem) == -1) {
                    this.topStore.push(testItem);
                }

                this.topStore.sort(function (item1, item2) {
                    return item2.count - item1.count;
                });

                if (this.topStore.length > this.topCount) {
                    this.topStore = this.topStore.slice(0, this.topCount);
                }
            };

            // you start the trimmer manually, you may pass it a time in seconds for the trim
            this.startTrimmer = function (trimWindow) {
                if (typeof trimWindow !== 'undefined') {
                    this.setTrimWindow(trimWindow);
                }
                if (this.trimWindow === 0) return;
                var wttop = this;
                setTimeout(function () { wttop.trim(false); }, 1000);
            };

            this.trim = function (oneTimeTrim) {

                // prevent adds durring the trim
                this.trimFlag = true;

                // get the time to compare
                var now = Date.now();

                // create a tuple of the items for the sorting we'll do later
                var tuples = [];
                for (var key in this.dataStore) {
                    var sliceLocation = -1;
                    var historyCount = 0;
                    for (var i = 0; i < this.dataStore[key].count; i++) {
                        if (sliceLocation == -1 && (now - this.dataStore[key].hitList[i]) <= this.trimWindow) {
                            sliceLocation = i;
                        }
                        if((now - this.dataStore[key].hitList[i]) <= 1000){
                            historyCount = this.dataStore[key].count - i;
                            break;
                        }
                    }

                    if (sliceLocation == -1) {
                        delete this.dataStore[key];
                        continue;
                    } else {
                        this.dataStore[key].hitList = this.dataStore[key].hitList.slice(sliceLocation);
                        this.dataStore[key].count = this.dataStore[key].hitList.length;

                        this.dataStore[key].history.push(historyCount);
                        var historySize = this.trimWindow / 1000;
                        if (this.dataStore[key].history.length > historySize) {
                            this.dataStore[key].history = this.dataStore[key].history.slice(this.dataStore[key].history.length - historySize);
                        }
                    }

                    // otherwise we add them to our array for sorting
                    tuples.push([key, this.dataStore[key]]);
                }

                // now we use the array sort function for sorting
                tuples.sort(function (tup1, tup2) {
                    return tup2[1].count - tup1[1].count;
                });

                // make sure we get the proper number of top items
                var topLength = this.topCount;
                if (tuples.length < topLength) topLength = tuples.length;

                // clear out our old topStore
                this.topStore = [];

                // add in the new top list
                for (var i = 0; i < topLength; i++) {
                    this.topStore.push(this.dataStore[tuples[i][0]]);
                }

                // we're done so stuff can get added now
                this.trimFlag = false;

                // if this wasnt a one time event we schedule a new trim
                if (!oneTimeTrim) {
                    var wttop = this;
                    setTimeout(function () { wttop.trim(false); }, 1000);
                }
            };
        };

        return TopContent;
    }
);
    
