/**!
* BlogToc v1.6.3
* Copyright 2015 Cluster Amaryllis
* Licensed in (https://github.com/clusteramaryllis/blogtoc/blob/develop/LICENSE)
* 
* A javascript plugin to make table of contents for blogspot using Blogger Feed API.
*/

!(function( window, undefined ) {

  'use strict';

  var loadApp = function() {
    
    (function() {

      var VERSION = '1.6.3';

      var BASE_URL = '//clusteramaryllis.github.io/blogtoc/dist/' + VERSION + '/';

      var HOMEPAGE = 'http://clusteramaryllisblog.blogspot.com/2013/10/blogspot-table-of-contents-blogtoc.html';

      var alphabet = 'A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z'.split('|'),
        days = 'السبت|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday'.split('|'),
        months = 'January|February|March|April|May|June|July|August|September|October|November|December'.split('|');

      var authorThumb = 'https://lh4.googleusercontent.com/-QhzzNTYkzbE/AAAAAAAAAAI/AAAAAAAAAAA/voMJT6RfB_o/s1600/photo.jpg',
        blankThumb = 'http://3.bp.blogspot.com/-trkoRRazZ7A/UdtEVufkxiI/AAAAAAAABxI/DOJ7jAUv1G4/s1600/blank.gif',
        notFoundThumb = 'http://3.bp.blogspot.com/-p7gZDNwTJbw/UdkqBnBb1bI/AAAAAAAAALI/hoCIpF74N80/s1600/image_not_available.jpg',
        sampleThumb = 'http://s20.postimg.org/7oz0eeuyx/blank.gif';

      var httpRegex = /.*?:\/\/|\/$/g, // remove http:// or trailing slash
        thumbRegex = /s\d+\-?\w?/gi, // thumbnail regex
        whitespaceRegex = /(^\s+|\s{2,}|\s+$)/g, // remove whitespace
        stripHtmlRegex = /(<([^>]+)>)/ig, // strip html tags
        removeScriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // remove script 
        noSortRegex = /^(index|thumbnail|author|label)$/i, // don't sorting
        noGenerateRegex = /^(actualImage|authorThumbnail|authorUrl|badge|category|commentURL|fullSummary|publishDateFormat|titleURL|updateDateFormat)$/i; // don't generate

      var themes = {},
        languages = {};

      var defaultLanguage = 'en-US',
        defaultTheme = 'bootstrap';
      
      var appModule = function ( element, option ) {

        // already loaded, don't process
        if ( element.BTLoaded ) {
          return;
        }
      
        var _parent = element,
          opts, config, feed,
          root, notifier, loader, content, header, filter, tabler, footer, resulter, paging, copyright;

        var _alpha, _contentType;
        
        _parent.BTAPP = {
      
          /* Run Apps
           * @param : <object> options
           ****************************************************************/
          run: function( options ) {
            
            var _self = this;
            
            // Default Options
            var defaults = {
              blogtocId: '',
              binding: {
                onAfterDataChange: null,
                onBeforeDataChange: null,
                onInit: null,
                onLiveDataChange: null,
                onLoaded: null
              },
              dataType: "JSONP",
              date: {
                day: days,
                month: months,
                render: function( date, option ) {
                  return option.date.day[date.getDay()] + 
                    ', ' + option.date.month[date.getMonth()] + 
                    ' ' + date.getDate() + 
                    ' ' + date.getFullYear();
                }
              },
              display: {
                setup: 10,
                template: [ 5, 10, 25, 50, 'All' ]
              },
              extendClass: {},
              feed: {
                appendQuery: '',
                chunkRequest: 1,
                limit: null,
                requestCount: 500,
                type: 'default'
              },
              label: { 
                define: [], 
                exception: false,
                showLabel: true,
                includeLabelAll: true,
                setup: 'All',
                allText: 'All',
                cloudLabel: false,
                showAlphabetLabel: false,
                includeAlphabetLabelAll: true,
                setupAlphabet: 'All',
                alphabetAllText: 'All',
                cloudAlphabetLabel: false,
                symbolicAlphabetFilter: function() { 
                  return (/^[0-9$-\/:-?{-~!"^_`\[\]]/i);
                },
                alphabetMember: alphabet
              },
              language: {
                setup: defaultLanguage,
                custom: {}
              },
              linkTarget: {
                author: '_self',
                thumbnail: '_self',
                title: '_self',
                comment: '_self' 
              },
              newBadge: {
                setup: 5,
                render: function( language ) {
                  return '<span class="label">' + language + '</span>';
                }
              },
              notification: {
                enabled: false,
                interval: 60 * 1 * 1000
              },
              number: {
                render: function( idx ) {
                  return idx;
                }
              },
              pagination: {
                adjacents: 2,
                showNextPage: true,
                showPrevPage: true,
                showFirstPage: true,
                showLastPage: true,
                showNumber: true
              },
              postLabel: {
                separator: '',
                render: function( label ) {
                  return '<span>' + label + '</span>';
                }
              },
              progress: {
                render : function( elem, progress ) {
                  var span;
                  
                  // check the span container for proggress time
                  // if it's already there, update the container
                  // if it's not, create new html wrapper
                  if ( ( span = elem.getElementsByTagName('span')[0] ) ) {
                    span.innerHTML = progress;
                  } else { 
                    elem.innerHTML = 'Loading <span>' + progress + '</span> %';
                  }
                }
              },
              rightToLeft: false,
              search: {
                markerRender: function( match ) {
                  return '<b>' + match + '</b>';
                },
                textAsPlaceholder: false
              },
              sorting: { 
                key: 'title', 
                order: 'ascending',
                disable: []
              },
              summary: {
                wordLimit: 200
              },
              table: {
                order: [ 'index', 'thumbnail', 'title', 'publishDate', 'updateDate', 'author', 'comment' ],
                initDataLoad: 10,
                showHeader: true,
                indexWidthPoint : 2.5,
                authorWidthPoint : 10.5,
                commentWidthPoint : 11,
                labelWidthPoint: 24,
                publishDateWidthPoint: 12.5,
                summaryWidthPoint: 25,
                thumbnailWidthPoint: 7,
                titleWidthPoint: 26,
                updateDateWidthPoint: 12.5
              },
              theme: {
                setup: defaultTheme
              },
              thumbnail: {
                blank: blankThumb,
                notFound: notFoundThumb,
                sample: sampleThumb,
                size: 72,
                authorSize: 36,
                authorThumbnail: true
              },
              url: 'chrome.blogspot.com'
            };

            // extend user options
            opts = _parent.BTOptions = _extends( defaults, options );
            // setting up feed
            feed = _parent.BTFeed = {
              data: [],
              label: [],
              count: 0
            };
            // setting up config
            config = _parent.BTConfig = {
              cache: {},
              iotf: {},
              iterate: 0,
              liveUpdate: false,
              order: {},
              registeredEvent: {},
              searchRegex: null,
              searchState: false
            };

            // Init languages && themes 
            if ( !languages[ opts.language.setup ] ) {
              languages[ opts.language.setup ] = { option: {} };
            }
            if ( !themes[ opts.theme.setup ] ) {
              themes[ opts.theme.setup ] = { option: {} };
            }

            // Build language starter
            _BTBuildLang( opts.language.setup, languages, opts.language.custom );
            // Build theme starter
            _BTBuildTheme( opts.theme.setup, themes, opts.extendClass );
            
            // save necessary element
            root = _parent.BTID;
            notifier = root.firstChild;
            loader = _nextElement( notifier );
            content = _nextElement( loader );
            header = content.firstChild;
            filter = _nextElement( header );
            tabler = _nextElement( filter );
            footer = _nextElement( tabler );
            copyright = _nextElement( footer );
            
            // apply classes
            _extendClass( root, opts.extendClass.blogtoc_id );
            _extendClass( notifier, opts.extendClass.blogtoc_notification );
            _extendClass( loader, opts.extendClass.blogtoc_loader );
            _extendClass( content, opts.extendClass.blogtoc_content );
            _extendClass( header, opts.extendClass.blogtoc_header );
            _extendClass( filter, opts.extendClass.blogtoc_filter );
            _extendClass( tabler, opts.extendClass.blogtoc_table );
            _extendClass( footer, opts.extendClass.blogtoc_footer );
            _extendClass( copyright, opts.extendClass.blogtoc_copyright );
            
            // init progressbar / loader
            opts.progress.render( loader, 0 );
            // check right-to-left support
            if ( opts.rightToLeft ) {
              root.setAttribute( 'dir', 'rtl' );
              _extendClass( root, 'bt-rtl' );
            } else {
              root.setAttribute( 'dir', 'ltr' );
            }

            // content type base on feed type
            _contentType = opts.feed.type === 'default' ? 'content' : 'summary';

            // cache the request
            config.cache.req = new Array();
            // prepare cache for table header
            config.cache.thead = {};

            //set not available thumbnail for author
            config.nat = authorThumb.replace( thumbRegex, 's' + opts.thumbnail.authorSize + '-c' );
            // get resize image on the fly server, take a sample
            config.iotf = _testCDN( opts.thumbnail.sample );
            // map the table header data
            // config.mapper = opts.table.order.split(';');
            config.mapper = opts.table.order;
            // setup for table header width
            config.mapperWidth = [];
            // setup for thumbnail anchor inline-css
            config.tbwrapper = 'display:block;width:' + opts.thumbnail.size + 'px;height:' + opts.thumbnail.size + 'px;';
            // setup for thumbnail image inline-css
            config.tbimg = 'width:' + opts.thumbnail.size + 'px;height:' + opts.thumbnail.size + 'px;';
            // setup for page
            config.page = 1;
            // setup for page state history
            config.pageState = 1;
            
            // json callback
            window[ 'BTJSONCallback_' + root.id ] = function ( json ) {
              _self.initFeed( json );
            };

            var url = opts.url.replace( httpRegex, '' ),
              scriptID = url + '_' + _uniqueNumber();

            url = 'http://' + url + 
              '/feeds/posts/summary/?' + 
              'max-results=0&' + 
              'alt=json-in-script&' + 
              'callback=BTJSONCallback_' + root.id +
              opts.feed.appendQuery;

            // setup the script id
            config.cache.req[0] = scriptID;
            
            // requesting which image on the fly service will be using
            // do recurren with 1s delay until its found one
            var _waiting = function() { 
              setTimeout( function() {
                config.iotf.server ?
                  _addJS( url, scriptID, null, function() {
                    // trouble loading feed, show error message
                    alert( opts.language.custom.errorMessage );
                    // remove blogtoc
                    _removeElement( root );
                  }) :
                  _waiting();
              }, 100 );
            }; 

            _waiting();

            // add callback on init
            if ( typeof opts.binding.onInit === 'function' ) {
              opts.binding.onInit();
            }
          },
          
          /* Initialization json callback
           * @param  : <json>json
           ****************************************************************/
          initFeed: function( json ) {
          
            var _self = this;
            
            // object and array => value by reference
            var jfeed = json.feed;
            
            // get total blog posts
            if ( 'openSearch$totalResults' in jfeed ) {
              feed.count = jfeed.openSearch$totalResults.$t;
            }

            // get total label
            if ( 'category' in jfeed ) {

              var define = opts.label.define, dLen = define.length,
                exception = opts.label.exception,
                j = 0, len = jfeed.category.length;

              for (; j < len; j++) {
                
                var category = jfeed.category[ j ].term;

                // check if options has specific label
                if ( dLen ) {
                  if ( ( exception && _inArray( category, define ) ) || 
                       ( !exception && !_inArray( category, define ) ) ) {
                    continue;
                  }
                }

                feed.label.push( jfeed.category[ j ].term );
              }
            }

            // sorting the label by ascending
            feed.label.sort(function ( a, b ) {
              return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
            });
            
            // add label all
            if ( opts.label.includeLabelAll ) { 
              feed.label.unshift( opts.label.allText ); 
            }
            // add alphabet label all & '#' on beginning
            _alpha = opts.label.alphabetMember.slice(0);

            if ( opts.label.includeAlphabetLabelAll ) {
              _alpha.unshift('#');
              _alpha.unshift( opts.label.alphabetAllText );
            }

            // init display records after get the total blog post
            config.display = _initRecords( opts.display.template, opts.display.setup, feed.count );
            config.records = opts.display.setup || opts.display.template[0];

            // json callback
            window[ 'BTLDJSONCallback_' + root.id ] = function ( json ) {
              _self.loadFeed( json );
            };

            // jsonp ?
            var jsonp = opts.dataType.toLowerCase() === 'jsonp',
              dataType, req, count;

            dataType = jsonp ? 'json-in-script' : 'json';
            // don't exceed more than 500
            req = opts.feed.requestCount > 500 ? 500 : opts.feed.requestCount;
            count = opts.feed.limit || feed.count;

            var i = 0, startIdx = 0, maxResults,
              request = Math.ceil( count / req ),
              appendQuery = opts.feed.appendQuery,
              chunk = opts.feed.chunkRequest,
              url = opts.url.replace( httpRegex, '' ),
              newUrl, scriptID, _sequenceFn;

            newUrl = 'http://' + url + 
              '/feeds/posts/'+ opts.feed.type +
              '/?' +
              'alt=' + dataType + '&';

            // chunk can't be exceeded the request
            chunk = chunk > request ? request : chunk;
            // determine the max-results
            var _setMaxResults = function( i, req, count ) {
              return count < ( ( i + 1 ) * req ) ? count - ( i * req ) : req;
            };

            if ( jsonp ) {
              newUrl += 'callback=BTLDJSONCallback_' + root.id;

              _sequenceFn = function( i ) {
                startIdx = ( i * req ) + 1;
                scriptID = url + '_' + _uniqueNumber();
                config.cache.req[ i + 1 ] = scriptID;
                maxResults = _setMaxResults( i, req, count );

                _addJS( newUrl + '&max-results=' + maxResults + '&start-index=' + startIdx + appendQuery, scriptID, function() {
                  if ( i + chunk < request ) { _sequenceFn( i + chunk ); }
                });                
              };
            } else {
              _sequenceFn = function( i ) {
                startIdx = ( i * req ) + 1;
                maxResults = _setMaxResults( i, req, count );

                // must be on the same domain, see CORS reference
                _ajaxRequest( newUrl + '&max-results=' + maxResults + '&start-index=' + startIdx + appendQuery, function( req ) {

                  json = _parseJSON( req.responseText );
                  _self.loadFeed( json );

                  if ( i + chunk < request ) { _sequenceFn( i + chunk ); }
                });                
              };
            }

            // do x times request at one time
            for ( var k = 0; k < chunk; k++ ) {
              _sequenceFn( i );
              i++;
            }
          },
          
          /* Load the main feed from JSON callback
           * @param : <json>json
           ****************************************************************/
          loadFeed: function( json ) {
            
            var _self = this;
            
            var jfeed = json.feed,
              temp = [], temp2 = [],
              obj = {};
              
            var data = feed.data,
              count = opts.feed.limit || feed.count,
              size = opts.thumbnail.size,
              asize = opts.thumbnail.authorSize,
              notfound = opts.thumbnail.notFound,
              description = opts.summary.wordLimit,
              render = opts.date.render,
              server = config.iotf.server,
              progress = opts.progress.render,
              postlabel = opts.postLabel.render,
              separator = opts.postLabel.separator,
              withthumb = _inArray( 'thumbnail', opts.table.order ),
              withauthorthumb = _inArray( 'author', opts.table.order ),
              authortumb = opts.thumbnail.authorThumbnail;

            // check entry feed
            if ( 'entry' in jfeed ) {
            
              var i = 0, len = jfeed.entry.length;
              
              var saveFeed = function() {
              
                // setTimeout( function() {
                _setImmediate( function() {

                  var entry = jfeed.entry[ i ];

                  // post title section, removing white space
                  obj.title = entry.title.$t.replace( whitespaceRegex, '' );

                  // published and updated date section
                  var pbDate = entry.published.$t.substring( 0, 10 ).split('-'),
                    pbTime = entry.published.$t.substring( 11, 19 ).split(':'),
                    upDate = entry.updated.$t.substring( 0, 10 ).split('-'),
                    upTime = entry.updated.$t.substring( 11, 19 ).split(':');

                  obj.publishDateFormat = _makeDate( pbDate, pbTime );
                  obj.updateDateFormat  = _makeDate( upDate, upTime );
                  obj.publishDate = render( obj.publishDateFormat, opts );
                  obj.updateDate  = render( obj.updateDateFormat, opts );

                  // summary section
                  var fullSummary = entry[ _contentType ].$t.replace( removeScriptRegex, '' ),

                  // remove whitespace and strip html tags
                  summary = fullSummary.replace( stripHtmlRegex, '' )
                                       .replace( whitespaceRegex, '' );
                  
                  // add word limiter
                  if ( summary.length > description ) {
                    summary = summary.substring( 0, description );
                    summary = summary.substring( 0, summary.lastIndexOf(' ') ) + '....';
                  }

                  obj.fullSummary = fullSummary;
                  obj.summary = summary;
                  
                  // thumbnails section
                  var imgSrc;

                  if ( withthumb ) {
                    // check for default blog thumbnail entry
                    // if can't find <img> tag in summary
                    if ( 'media$thumbnail' in entry ) { 
                      obj.thumbnail = entry.media$thumbnail.url;
                      obj.actualImage = obj.thumbnail.replace( thumbRegex, 's0' );
                      if ( !!~obj.thumbnail.indexOf('s72-c') ) {
                        obj.thumbnail = obj.thumbnail.replace( '/s72-c/', '/s' + size + '-c/');  
                      } else {
                        obj.thumbnail = _BTMakeThumbnail( obj.actualImage, size, server );
                      }
                    } else if ( ( imgSrc = /<img [^>]*src=["|\']([^"|\']+)/gi.exec( fullSummary ) ) ) {
                      obj.actualImage = imgSrc[1];
                      obj.thumbnail = _BTMakeThumbnail( obj.actualImage, size, server );
                    } else { 
                      obj.actualImage = notfound;

                      // google service?
                      if ( thumbRegex.test( obj.actualImage ) ) { 
                        obj.thumbnail = obj.actualImage.replace( thumbRegex, 's' + size + '-c' );
                      } else {
                        obj.thumbnail = _BTMakeThumbnail( obj.actualImage, size, server );
                      }
                    }

                    // store thumbnail element
                    /*obj.thumbElmt = new Image();
                    obj.thumbElmt.crossOrigin = '';
                    obj.thumbElmt.src = obj.thumbnail;*/
                  }
                  
                  // title & replies URL section
                  for ( var k = 0; k < entry.link.length; k++ ) {
                    if ( entry.link[ k ].rel === 'replies' ) {
                      obj.commentURL = entry.link[ k ].href;
                    } else if (entry.link[ k ].rel === 'alternate' ) {
                      obj.titleURL = entry.link[ k ].href;
                    }
                  }

                  // set hashtag, if there is no comment
                  if ( !obj.commentURL ) {
                    obj.commentURL = "#";
                  }

                  // comments count section
                  obj.comment = ( 'thr$total' in entry ) ? +entry.thr$total.$t : 0;
                  
                  // author information section
                  if ( withauthorthumb && authortumb ) {
                    obj.author = entry.author[0].name.$t;
                    obj.authorUrl = entry.author[0].uri ? entry.author[0].uri.$t : '#';
                    obj.authorThumbnail = entry.author[0].gd$image.src.replace( thumbRegex, 's' + asize + '-c' );
                  }

                  // posts categories section
                  if ( 'category' in entry ) {
                    for ( k = 0; k < entry.category.length; k++ ) {
                      temp.push( entry.category[ k ].term );
                      temp2.push( postlabel( entry.category[ k ].term ) );
                    }
                  }

                  obj.category = temp.slice(0);
                  obj.label = temp2.slice(0).join( separator );

                  // populate data
                  data.push( obj ); 
                  
                  // reset
                  obj = {};
                  temp.length = 0;
                  temp2.length = 0;

                  // increment
                  config.iterate++;
                  i++;
                  
                  // increase progress
                  var percentage = Math.round( config.iterate * 100 / count );

                  progress( loader, percentage );
                  
                  // recurren if still not reach the limit
                  if ( i < len ) {
                    saveFeed();
                  }

                  // the end of total blog post, 
                  // build user interface & hide loader
                  if ( config.iterate >=  count ) {

                    // store original data
                    config.cache.originData = _BTSort( data, 'publishDate' ).slice(0).reverse();

                    setTimeout( function() {
                      loader.style.display = 'none';
                      _self.buildUI();
                    }, 500 );
                  }
                // }, 0 );
                }, 0 );
              }; 
              
              saveFeed();
            }

          }, 

          /* Check if there's new feed
           ****************************************************************/
          checkFeed: function( json ) {

            var _self = this;
            
            // object and array => value by reference
            var jfeed = json.feed, temp = {};

            if ( 'openSearch$totalResults' in jfeed ) {
              temp.count = jfeed.openSearch$totalResults.$t;
            }

            if ( jfeed.entry[0] ) {
              var entry = jfeed.entry[0],
                pbDate = entry.published.$t.substring( 0, 10 ).split('-'),
                pbTime = entry.published.$t.substring( 11, 19 ).split(':');

              temp.publishDateFormat = _makeDate( pbDate, pbTime );
            }

            // check if there is first post
            config.isUpdated = config.cache.originData[0] &&
              ( temp.count !== feed.count || 
                +temp.publishDateFormat !== +config.cache.originData[0].publishDateFormat );
          },

          /* Check if there's new update
           ****************************************************************/
          checkUpdate: function() {

            var _self = this;

            // json callback
            window[ 'BTCUJSONCallback_' + root.id ] = function ( json ) {
              _self.checkFeed( json );
            };

            // jsonp ?
            var jsonp = opts.dataType.toLowerCase() === 'jsonp',
              dataType, url = opts.url.replace( httpRegex, '' ),
              newUrl, doFn, scriptID;

            dataType = jsonp ? 'json-in-script' : 'json';
            newUrl = 'http://' + url + 
              '/feeds/posts/'+ opts.feed.type +
              '/?' +
              'max-results=1&' +
              'alt=' + dataType + '&';

            doFn = function() {
              if ( config.isUpdated ) {

                // if using _createElement, the event handler gone
                var anchor = '<a href="javascript:void(0)" ' +
                  'onclick="BlogToc.reset(document.getElementById(\''+ root.id +'\').parentNode); return false;">' +
                  '<span class="icon-spin"></span> ' + opts.language.custom.updateMessage +
                  '</a>';

                notifier.innerHTML = anchor;
              }
            };

            if ( jsonp ) {
              newUrl += 'callback=BTCUJSONCallback_' + root.id;
              scriptID = url + '_' + _uniqueNumber();

              _addJS( newUrl, scriptID, function() {
                _removeElement( _getId( scriptID ) );
                doFn();
              });
            } else {
              _ajaxRequest( newUrl, function( req ) {
                json = _parseJSON( req.responseText );
                _self.checkFeed( json );

                doFn();
              });
            }
          },          
          
          /* Build the starter user interface
           ****************************************************************/
          buildUI: function() {
          
            var _self = this;
            
            var klass = opts.extendClass,
              size = opts.thumbnail.size,
              display = config.display,
              sortingOrder = opts.sorting.order,
              sortingKey = opts.sorting.key,
              placeHolder = opts.search.textAsPlaceholder;
            
            var labelFn = "BlogToc.label(this, this.value, document.getElementById('"+ root.id +"')); this.blur(); return false;",
              alphaFn = "BlogToc.alphabet(this, this.value, document.getElementById('"+ root.id +"')); this.blur(); return false;",
              displayFn = "BlogToc.display(this.value, document.getElementById('"+ root.id +"')); this.blur(); return false;",
              searchFn = "BlogToc.search(this.value, document.getElementById('"+ root.id +"')); return false;",
              sortFn;

            // show data
            content.style.display = 'block';

            // label section
            _self.makeLabel( feed.label, 'showLabel', 'cloudLabel', 'setup', 'blogtoc_label', klass.blogtoc_label, labelFn );
            _self.makeLabel( _alpha, 'showAlphabetLabel', 'cloudAlphabetLabel', 'setupAlphabet', 'blogtoc_alphabet', klass.blogtoc_alphabet, alphaFn );
            
            var j = 0, dLen = display.length, dVal,
              div, select, input, option, label, spn, btn;
            
            // display section
            div = _createElement( 'div', null, null, 'blogtoc_display' );
            _extendClass( div, klass.blogtoc_display );

            label = _createElement('label');
            select = _createElement( 'select', { onchange: displayFn });
            spn = _createElement( 'span', null, opts.language.custom.display );
            
            for ( ; j < dLen; j++ ) {
              option  = _createElement( 'option', { value: display[ j ].num }, display[ j ].name );
              
              // arrange to the default setup selected
              if ( display[ j ].num === config.records ) {
                option.selected = true;
              }
              
              select.appendChild( option );
            }

            label.appendChild( select );
            label.appendChild( spn );
            div.appendChild( label );
            filter.appendChild( div );
            
            // search section
            div = _createElement( 'div', null, null, 'blogtoc_search' );
            _extendClass( div, klass.blogtoc_search );

            label = _createElement('label');
            spn = _createElement( 'span', null, !placeHolder ? opts.language.custom.search : ''  );

            input = _createElement( 'input', { 
              type: 'text', 
              onkeyup: searchFn,
              'data-placeholder': opts.language.custom.search }, null, 'blogtoc_query' );
            _extendClass( input, klass.blogtoc_query );
            
            label.appendChild( spn );
            label.appendChild( input );
            div.appendChild( label );
            filter.appendChild( div );
            
            var mLen = config.mapper.length, mData,
              tableChild, thead, tr, th, node, span,
              thLang;
            
            // thead section
            
            // trying calculate the <th> width
            _self.calculate();

            thead = _createElement('thead');
            tr = _createElement('tr');
                
            for ( j = 0; j < mLen; j++ ) {
              mData = config.mapper[ j ];
              sortFn = "BlogToc.sort('"+ mData +"', document.getElementById('"+ root.id +"')); return false;";
              
              th = _createElement( 'th', { width: config.mapperWidth[ j ] });
              thLang = opts.language.custom[ mData ] ? opts.language.custom[ mData ] : mData;

              
              if ( noGenerateRegex.test( mData ) ) {
                continue;
              } else if ( noSortRegex.test( mData ) || _inArray( mData, opts.sorting.disable ) ) {
                node = document.createTextNode( thLang );
              } else {
                span = _createElement( 'span', null, null, 'icon-menu' );
                node = _createElement( 'a', { href: 'javascript:void(0)', onclick: sortFn }, thLang );
                
                node.appendChild( span );
                
                // populate config thead data
                config.cache.thead[ mData ] = span;
              }
              
              // populate sorting order cache
              config.order[ mData ] = null;
              
              th.appendChild( node );
              tr.appendChild( th );
            }
            
            thead.appendChild( tr );

            // IE strangely add tbody on its own, so position the thead correctly
            tableChild = tabler.firstChild;
            tabler.insertBefore( thead, tableChild );

            // don't show header if option showHeader is false
            if ( !opts.table.showHeader ) { 
              _removeElement( thead );
            }
            
            // footer section
            resulter = _createElement( 'div', null, null, 'blogtoc_result' );
            _extendClass( resulter, klass.blogtoc_result );
            footer.appendChild( resulter );

            paging = _createElement( 'div', null, null, 'blogtoc_pagination' );
            _extendClass( paging, klass.blogtoc_pagination );
            footer.appendChild( paging );

            // copyright section
            btn = _createElement( 'button', { onclick: "window.location = '" + HOMEPAGE + "';" }, 'Get this Widget', klass['blogtoc_copyright button'] );
            copyright.appendChild( btn );
            
            // setting up new badge
            _self.addBadge();

            // init thead sorting direction icon
            config.cache.thead[ sortingKey ].className = ( sortingOrder === 'ascending' ) ?
              'icon-arrow-up-4' : 
              'icon-arrow-down-5';
            // init sorting by
            config.order[ sortingKey ] = sortingOrder;
            // Do Sorting
            _self.doSorting( sortingKey, sortingOrder );

            // Set Label or Alphabet or Compile data
            if ( !opts.label.showLabel && !opts.label.showAlphabetLabel ) {
              _self.compile();
            } else {

              // check the setup member
              config.currentLabel = opts.label.showLabel ? 
                ( _inArray( opts.label.setup, feed.label ) ? opts.label.setup : feed.label[0] ) :
                null;
              config.currentAlphabet = opts.label.showAlphabetLabel ?
                ( _inArray( opts.label.setupAlphabet, _alpha ) ? opts.label.setupAlphabet : _alpha[0] ) :
                null;

              if ( opts.label.showLabel ) {
                _self.displayLabel( config.currentLabel, null, null, true );
              } else {
                _self.displayAlphabet( config.currentAlphabet, null, null, true );
              }
            }

            // set the placeholder support after the data compile called
            // in IE, have strange behaviour when data show blank if this set before data compile
            if ( placeHolder ) {
              // check html5 placeholder support
              if ( 'placeholder' in input ) {
                input.placeholder = opts.language.custom.search;
              } else {
                input.value = opts.language.custom.search;
                input.onfocus = function() {
                  if ( this.value === opts.language.custom.search ) {
                    this.value = '';
                  }
                };
                input.onblur = function() {
                  if ( this.value === '' ) {
                    this.value = opts.language.custom.search;
                  }
                };
              }
            } else {
              _extendClass( input, 'bt-no-placeholder' );
            }

            // Tells that apps already loaded
            _parent.BTLoaded = true;

            // calling back the onLoaded function
            if ( typeof opts.binding.onLoaded === 'function' ) {
              opts.binding.onLoaded();
            }

            // Forbid to hide copyright
            var forbidHidden = function() {
              setTimeout(function() {
                if ( _parent.BTLoaded && ( !copyright || !copyright.isVisible() ) )
                {
                  var btn;

                  if ( _isHTMLElement(copyright) ) { _removeElement( copyright ); }

                  copyright = _createElement( 'div', null, null, 'blogtoc_copyright' );
                  btn = _createElement( 'button', { onclick: "window.location = '" + HOMEPAGE + "';" }, 'Get this Widget', klass['blogtoc_copyright button'] );

                  copyright.style.cssText = 'display: block !important;visibility: visible';
                  btn.style.cssText = 'display: inline-block !important;visibility: visible';

                  copyright.appendChild( btn );
                  _extendClass( copyright, opts.extendClass.blogtoc_copyright );
                  footer.parentNode.insertBefore( copyright, footer.nextSibling );
                }

                forbidHidden();

              }, 1000 );
            };

            forbidHidden();
            

            // Clear any references
            window[ 'BTJSONCallback_' + root.id ] = null;
            window[ 'BTLDJSONCallback_' + root.id ] = null;

            for ( var k = 0, elm, rLen = config.cache.req.length; k < rLen; k++ ) {
              elm = _getId( config.cache.req[ k ] );
              if ( elm ) { _removeElement( elm ); }
            }

            // Set update notification
            if ( opts.notification.enabled ) {
              config.liveUpdate = setInterval(function() {
                _self.checkUpdate();
              }, opts.notification.interval );
            }
          },
          
          /* Build pagination using modified digg style pagination 
           * http://www.strangerstudios.com/sandbox/pagination/diggstyle.php
           ****************************************************************/
          buildPagination: function() {

            var klass = opts.extendClass,
              uClass = klass['blogtoc_pagination ul'],
              cClass = klass['blogtoc_pagination current'],
              dClass = klass['blogtoc_pagination disabled'];

            var i, limit = Math.ceil( feed.data.length / config.records ),
              page = config.page, next_page = page + 1, prev_page = page - 1,
              snpl = page + 6, lnpl = page + 46, sppl = page - 6, lppl = page - 46,
              adj = opts.pagination.adjacents, adjJump = adj * 2,
              rID = root.id, hClass = 'blogtoc_responsive_hide',
              fClass = 'blogtoc_first_page', lClass = 'blogtoc_last_page', 
              pClass = 'blogtoc_prev_page', nClass = 'blogtoc_next_page',
              rtl = opts.rightToLeft, num = opts.number.render,
              ul, ulRecent, li; 

            // limit more than one
            if ( limit > 1 ) {
              ul = _createElement( 'ul', null, null, uClass );
              // current page not at first one
              if ( page > 1 ) {
                // first page
                if ( opts.pagination.showFirstPage ) {
                  li = _BTMakePageList( 1, opts.language.custom.firstPage, 'a', rID, fClass );
                  rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                }
                // prev page
                if ( opts.pagination.showPrevPage ) {
                  li = _BTMakePageList( prev_page, opts.language.custom.prevPage, 'a', rID, pClass );
                  rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                }
              } else {
                if ( opts.pagination.showPrevPage ) {
                  li = _BTMakePageList( null, opts.language.custom.prevPage, 'span', rID, _appendStr( pClass, dClass ) );
                  rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                }
              }
              
              if ( opts.pagination.showNumber ){
                // the pages are not that big
                if ( limit < 7 + adjJump ) {
                  for ( i = 1; i <= limit; i++ ) {
                    if ( i === page ) {
                      li = _BTMakePageList( null, num( i ), 'span', rID, cClass );
                    } else {
                      li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                    }
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                  }
                } else if ( limit > 5 + adjJump ) {
                  // left pages lapping
                  if ( lppl - adjJump > 1 ) {
                    i = lppl - adjJump;
                    li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                  }
                  if ( sppl - adjJump > 1 ) {
                    i = sppl - adjJump; 
                    li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                  }
                  
                  // beginning, middle, ending
                  if (page < 2 + adjJump) {
                    for ( i = 1; i < 4 + adjJump; i++ ) {
                      if ( i === page ) {
                        li = _BTMakePageList( null, num( i ), 'span', rID, cClass );
                      } else {
                        li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                      }               
                      rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                    }

                    li = _BTMakePageList( null, '...', 'span' , rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );

                  } else if ( limit - adjJump > page && page > 1 + adjJump ) { 
                    li = _BTMakePageList( null, '...', 'span', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );

                    for ( i = page - adj; i <= page + adj; i++ ) {
                      if ( i === page ) {
                        li = _BTMakePageList( null, num( i ), 'span', rID, cClass );
                      } else {
                        li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                      }               
                      rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                    }

                    li = _BTMakePageList( null, '...', 'span', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );

                  } else { 

                    li = _BTMakePageList( null, '...', 'span', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );

                    for ( i=limit - (2 + adjJump); i <= limit; i++ ) {
                      if ( i === page ) {
                        li = _BTMakePageList( null, num( i ), 'span', rID, cClass );
                      } else {
                        li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                      }               
                      rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                    }
                  }
                  
                  // right pages lapping
                  if ( snpl + adjJump < limit ) {
                    i = snpl + adjJump;
                    li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                  }
                  if ( lnpl + adjJump < limit ) {
                    i = lnpl + adjJump;
                    li = _BTMakePageList( i, num( i ), 'a', rID, hClass );
                    rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                  }
                }
              }
              
              // current page not at last one
              if ( page < limit ) {
                // next page
                if ( opts.pagination.showNextPage ) {
                  li = _BTMakePageList( next_page, opts.language.custom.nextPage, 'a', rID, nClass );
                  rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                }
                // last page
                if ( opts.pagination.showLastPage ) {
                  li = _BTMakePageList( limit, opts.language.custom.lastPage, 'a', rID, lClass );
                  rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                }
              } else {
                if ( opts.pagination.showNextPage ) {
                  li = _BTMakePageList( null, opts.language.custom.nextPage, 'span', rID, _appendStr( nClass, dClass ) );
                  rtl ? ul.insertBefore( li, ul.firstChild ) : ul.appendChild( li );
                }
              }
            }
            
            if ( ( ulRecent = paging.getElementsByTagName('ul')[0] ) ) {
              ul ?  
                paging.replaceChild( ul, ulRecent ) :
                paging.removeChild( ulRecent );

            } else {
              ul ?
                paging.appendChild( ul ) :
                null;
            }
          },
          
          /* Make Label
           * @param  : <array>data
           * @param  : <string>optShow
           * @param  : <string>optCloud
           * @param  : <string>optName
           * @param  : <string>className
           * @param  : <string>extendClass
           * @param  : <string>fn
           ****************************************************************/
          makeLabel: function( data, optShow, optCloud, optName, className, extendClass, fn ) {
          
            var i = 0, len = data.length,
              selection = false, val,
              labelNode, contentNode;
            
            if ( opts.label[ optShow ] ) {
              if ( opts.label[ optCloud ] ) {
                labelNode = _createElement('div', null, null, className );
                _extendClass( labelNode, extendClass );
                
                for ( ; i < len; i++ ) {
                  val = ( data[ i ] === opts.language.custom.labelAll ) ? 
                    'All' : data[ i ];
                  
                  contentNode = _createElement( 'button', { type: 'button', value: val, onclick: fn }, data[ i ] );
                  _extendClass( contentNode, opts.extendClass.blogtoc_button );
                  
                  // disabled the setup selection
                  if ( val === opts.label[ optName ] ) {
                    contentNode.disabled = true;
                    selection = true;
                  }

                  labelNode.appendChild( contentNode );
                }
                
              } else {
                labelNode = _createElement( 'select', { onchange: fn }, null, className );
                _extendClass( labelNode, extendClass );
                
                for ( ; i < len; i++ ) {
                  val = ( data[i] === opts.language.custom.labelAll ) ? 
                    'All' : data[ i ];
                  
                  contentNode = _createElement( 'option', { value: val }, data[ i ] );
                  
                  // set to the selected setup
                  if ( val === opts.label[ optName ] ) {
                    contentNode.selected = true;
                    selection = true;
                  }

                  labelNode.appendChild( contentNode );
                }

                // No default selection, force to using the first one
                if ( !selection ) {
                  opts.label[ optName ] = labelNode.firstChild.value;
                  labelNode.firstChild.selected = true;
                }
              }
            
              header.appendChild( labelNode );
            }
          },
          
          /* Build total result
           ****************************************************************/
          buildResult: function() {
            
            var len = feed.data.length,
              num = opts.number.render,
              max = config.page * config.records;
              
            var lookup = {
              begin: len ? ( ( config.page - 1 ) * config.records ) + 1 : 0,
              end: max < len ? max : len,
              total: len
            }, 
              output = opts.language.custom.result.replace( /\{(.*?)\}/gi, function ( match, p1 ) {
                return "<b>" + num( lookup[ p1 ] ) + "</b>";
            });
            
            resulter.innerHTML = output;
          },
          
          /* Display Label
           * @param : <string>val
           * @param : <HTMLElement>el
           * @param : <boolean>prevent
           * @param : <boolean>grab
           ****************************************************************/
          displayLabel: function( val, el, prevent, grab ) {
            
            var _self = this;

            // option grab original data from cache
            if ( grab ) {
              feed.data = config.cache.original.slice(0);
            }

            // don't proccess if there is no current label exists
            if ( config.currentLabel == null ) {
              return;
            }
            
            // synchronize data with current alphabet label
            if ( grab && config.currentAlphabet != null ) {
              _self.displayAlphabet( config.currentAlphabet, null, true );
            }
            
            // IE<=8 doesn't recognize button value
            if ( val === '' ) {
              val = el.getAttribute('value');
            }

            // change current label from value
            config.currentLabel = val;
            
            if ( val !== opts.label.allText ) {
              var temp = [];
              // filter data that only match with certain category
              for ( var j = 0, len = feed.data.length; j < len; j++ ) {
                if ( _inArray( val, feed.data[ j ].category ) ) {
                  temp.push( feed.data[ j ] );
                }
              }
              feed.data = temp.slice(0);
            }
            
            // cache the data
            config.cache.tempData = feed.data.slice(0);
            
            // prevent process?
            if ( !prevent ) {
              // disabled current selection, and enabled the rest
              if ( el && el.tagName.toLowerCase() === 'button' ) {
                var nodes = el.parentNode.childNodes,
                  i = nodes.length;
                
                while ( i-- ) {
                  nodes[ i ].disabled = false;
                }
                el.disabled = true;
              }
              
              // reset to page one
              config.page = 1;
              // reset page state also
              config.pageState = 1;
              
              var value = filter.getElementsByTagName('input')[0].value;

              // check if there's text in search query & the text doesn't same with placeholder
              if ( value && value !== opts.language.custom.search ) { 
                _self.query( value );
              } else { 
                _self.compile();
                // reset feed position <bugs>
                config.cache.feedLeft = opts.table.initDataLoad;
              }
            }
            
          },
          
          /* Display Alphabet Label
           * @param : <string>val
           * @param : <HTMLElement>el
           * @param : <boolean>prevent
           * @param : <boolean>grab
           ****************************************************************/
          displayAlphabet: function( val, el, prevent, grab ) {
            
            var _self = this;
            
            // option grab original data from cache
            if ( grab ) {
              feed.data = config.cache.original.slice(0);
            }

            // don't proccess if there is no current alphabet label exists
            if ( config.currentAlphabet == null ) {
              return;
            }
            
            // synchronize data with current label
            if ( grab && config.currentLabel != null ) {
              _self.displayLabel( config.currentLabel, null, true );
            }
            
            // IE<=8 doesn't recognize button value
            if ( val === '' ) {
              val = el.getAttribute('value');
            }

            // change current alphabet label from value
            config.currentAlphabet = val;
            
            // don't filter the data if value is All
            if ( val !== opts.label.alphabetAllText ) {
              var temp = [],
                alphaRegex;
                
              if ( val === '#' ) { // symbolic
                alphaRegex = opts.label.symbolicAlphabetFilter();
              } else { // alphabetic
                alphaRegex = new RegExp( '^' + val, 'i' );
              }
              
              // filter data that only match with first alphabet
              for ( var j = 0, len = feed.data.length; j < len; j++ ) {
                if ( !!~feed.data[ j ].title.search( alphaRegex ) ) {
                  temp.push( feed.data[ j ] );
                }
              }
              feed.data = temp.slice(0);
            }
            
            // cache the data
            config.cache.tempData = feed.data.slice(0);
            
            // prevent process?
            if ( !prevent ) {
            
              // disabled current selection, and enabled the rest
              if ( el && el.tagName.toLowerCase() === 'button' ) {
                var nodes = el.parentNode.childNodes,
                  i = nodes.length;
                
                while ( i-- ) {
                  nodes[ i ].disabled = false;
                }
                el.disabled = true;
              }
              
              // reset to page one
              config.page = 1;
              // reset page state also
              config.pageState = 1;
              
              var value = filter.getElementsByTagName('input')[0].value;

              // check if there's text in search query & the text doesn't same with placeholder
              if ( value && value !== opts.language.custom.search ) { 
                _self.query( value );
              } else {
                _self.compile();
                // reset feed position <bugs>
                config.cache.feedLeft = opts.table.initDataLoad;
              }
            }
          },
          
          /* Make preparation for sorting
           * @param : <string>key
           ****************************************************************/
          sorting: function( key ) {
            
            var _self = this;
            
            var order = config.order,
              thead = config.cache.thead;
            
            // no data, just return the data
            if ( !feed.data.length ) { 
              return; 
            }
            
            // set to "key" sorting state, others reset to default state
            for ( var prop in thead ) {
              if ( key !== prop ) {
                thead[ prop ].className = 'icon-menu';
                order[ prop ] = 'descending';
              } else {
                thead[ prop ].className = ( order[ prop ] === 'ascending' ) ? 
                  'icon-arrow-down-5' : 
                  'icon-arrow-up-4';
                order[ prop ] = ( order[ prop ] === 'ascending' ) ? 
                  'descending' : 
                  'ascending';        
              }
            }

            // do sorting
            _self.doSorting( key, order[ key ] );
            // compile data
            _self.compile();
          },
          
          /* Sorting the feed based on key & order
           * @param : <string>key
           * @param : <string>order
           ****************************************************************/
          doSorting: function( key, order ) {
        
            var data = feed.data,
              cache = config.cache;
            
            cache[ key ] = cache[ key ] || {};
                
            // generate new data feed
            feed.data = ( order === 'ascending' ) ? 
              _BTSort( data, key ).slice(0) :
              _BTSort( data, key ).slice(0).reverse();
            
            // cache original data
            if ( cache.original ) {
              cache.original = ( order === 'ascending' ) ? 
                _BTSort( cache.original, key ).slice(0) :
                _BTSort( cache.original, key ).slice(0).reverse(); 
              cache.tempData =  cache.original;
            } else {
              cache.original = feed.data.slice(0);
              cache.tempData = [];
            }
          },
          
          /* Change the display based on value
           * @param : <number>val
           ****************************************************************/
          changeDisplay: function( val ) {
            
            var _self = this;
            
            config.records = +val;
            
            // no data in current page, reset to first page
            if ( !feed.data[ ( config.page - 1 ) * config.records ] ) {
              config.page = 1;
            }
            // compile data
            _self.compile();
          },
          
          /* Do searching data
           * @param : <string>val
           ****************************************************************/
          query: function( val ) {
            
            var _self = this;
            
            // string escape
            // @link http://stackoverflow.com/a/3561711
            val = val.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );

            // grab the original data
            feed.data = ( !config.cache.tempData ) ?
              config.cache.original.slice(0) :
              config.cache.tempData.slice(0);
            
            if ( !val ) {
              var limit = Math.ceil( feed.data.length / config.records );

              config.searchRegex = null;
              config.page = ( config.pageState <= limit ) ?
                config.pageState : 
                1;

            } else {
              config.searchRegex = new RegExp( val, 'igm' );
              config.searchState = true;
              config.page = 1; // reset to page one
              
              var temp = [],
                i = 0, len = feed.data.length;
              
              // filter data that only match with query
              for ( ; i < len; i++ ) {
                if ( !!~feed.data[ i ].title.search( config.searchRegex ) ) {
                  temp.push( feed.data[ i ] );
                }
              }
              feed.data = temp.slice(0);
            }

            // compile data
            if ( config.searchState ) { 
              _self.compile(); 
            }
          },
          
          /* Change page
           * @param : <int>val
           ****************************************************************/
          changePage: function(val) {
            
            var _self = this;
            
            config.page = +val;
            config.pageState = config.page;
            
            // scroll to blogtoc position
            window.scroll( root.offsetLeft, root.offsetTop );

            // compile data
            _self.compile();
          },
          
          /* Adding badge
           ****************************************************************/
          addBadge: function() {
            
            var _self = this;
            
            // first sorting by publish date descending
            _self.doSorting( 'publishDate', 'descending' );
            
            var data = feed.data,
              i = 0, len = data.length,
              badge = opts.newBadge.setup,
              badgeRender = opts.newBadge.render( opts.language.custom.newLabel );
            
            for ( ; i < len; i++ ) {
              if ( !badge ) {
                data[ i ].badge = '<span class="blogtoc_badge" style="display:none;"></span>';
              } else {
                data[ i ].badge = '<span class="blogtoc_badge">' + badgeRender + '</span>';
                badge--;
              }
            }
          },

          /* Calculate table header data width from option
           ****************************************************************/
          calculate: function() {

            var i = 0, len = config.mapper.length,
              data = config.mapper, opt = opts.table,
              count = 0, range;
              
            for ( ; i < len; i++ ) {
              count += opt[ data[ i ] + 'WidthPoint' ];
            }

            for ( i = 0; i < len; i++ ) {
              range = Math.round( opt[ data[ i ] + 'WidthPoint' ] / count * 100 );
              config.mapperWidth.push( range + '%' );
            }
          },
          
          /* Mostly the main function that get called alot, change how the data is displayed
           ****************************************************************/
          compile: function() {

            var _self = this;
            
            var tbody, tbodyRecent, node;

            // calling back onBeforeDataChange
            if ( typeof opts.binding.onBeforeDataChange === 'function' ) {
              opts.binding.onBeforeDataChange();
            }
            
            // Initialize
            config.cache.img = new Array();
            config.cache.aimg = new Array();
            config.cache.feedLeft = 0;
            config.cache.dataStart = null;
            config.cache.dontScrollFirstTime = true;

            if ( !config.searchRegex ) { 
              config.searchState = false; 
            }
            
            // Build table
            tbody = _createElement('tbody');
          
            var appendData = function( bID, el ) {

              if ( !el ) { 
                return; 
              }
              
              var id = bID.parentNode;
              
              var bConfig = id.BTConfig,
                bOpts = id.BTOptions,
                bFeed = id.BTFeed;
                
              var start = ( ( bConfig.page - 1 ) * bConfig.records ) + bConfig.cache.feedLeft,
                end = start + bOpts.table.initDataLoad,
                records = bConfig.page * bConfig.records,
                count = bFeed.data.length,
                size = bOpts.thumbnail.authorSize,
                j = start, idx = start, len = bConfig.mapper.length,
                dataType, data, blob,
                tr, td;

              // prevent from running twice
              if ( j === config.cache.dataStart ) {
                return;
              } else {
                config.cache.dataStart = j;
              }
              
              // if no data found, show empty result message
              if ( !count ) {               
                // don't show again, if the message already shown
                if ( !( el.getElementsByTagName('tr')[0] ) ) {
                  tr = _createElement('tr');
                  td = _createElement('td',{ colSpan: len }, bOpts.language.custom.noRecords, 'blogtoc_norecords' );
                  
                  tr.appendChild( td );
                  el.appendChild( tr );
                }
              }

              // use the most data limit as possible
              blob = ( end <= records && end <= count ) ? 
                end :
                ( records <= count ) ? 
                  records : 
                  count;
              
              for ( ; j < blob; j++ ) {
                
                data = bFeed.data[ j ];

                // increment the feed left
                bConfig.cache.feedLeft++;
                // increment index
                idx++;
                
                tr = _createElement('tr');
                
                for ( var k = 0; k < len; k++ ) {
                
                  dataType = bConfig.mapper[ k ];
                  
                  td = _createElement('td', { width: bConfig.mapperWidth[ k ] });
                  td.setAttribute( 'data-title', dataType );
                  
                  td.appendChild( _BTRenderContent( dataType, idx, data, bOpts, bConfig, td ) );
                  tr.appendChild( td );
                }
                el.appendChild( tr );

                // call binding if data is still continue streaming
                if ( j === ( blob - 1 ) && typeof bOpts.binding.onLiveDataChange === 'function' ) {
                    bOpts.binding.onLiveDataChange();
                }
              }
            }; 

            appendData( root, tbody );
            
            // build result
            _self.buildResult();
            // build Pagination
            _self.buildPagination();
            
            // begin flexible scroll
            var _flexScroll = function( bID ) {
              var rootHeight = bID.clientHeight,
                pageHeight = window.innerHeight || document.documentElement.clientHeight,
                scrollPosition = window.pageYOffset || document.documentElement.scrollTop,
                id = bID.getElementsByTagName('tbody')[0];
              
              if ( rootHeight - pageHeight - scrollPosition < 100 ) { 
                // fix anomaly data when page is refreshed
                if ( config.cache.dontScrollFirstTime ) {
                  config.cache.dontScrollFirstTime = false;
                } else {
                  appendData( bID, id ); 
                }
                
              }
            };
            
            // Make event handler
            var evtHandler = function() {
              _BTQueueImage( _parent.BTConfig.cache.img, _parent.BTOptions.thumbnail.notFound );
              _BTQueueImage( _parent.BTConfig.cache.aimg, _parent.BTConfig.nat );
              _flexScroll( _parent.BTID );
            }; 

            // fill the data until its viewable
            var filledInViewPort = function( bID ) {
              setTimeout(function() {
                // viewport bugs
                var table = bID.getElementsByTagName('table')[0],
                  tbody = table.getElementsByTagName('tbody')[0];

                if ( _elementInViewport( table ) ) {
                  appendData( bID, tbody );
                  filledInViewPort( bID );
                }
              }, 10 );
            };

            // calling back onAfterDataChange
            if ( typeof opts.binding.onAfterDataChange === 'function' ) {
              setTimeout(function(){
                opts.binding.onAfterDataChange();
              }, 1 );
            }
            
            // register event
            _registerEvent( config.registeredEvent, window, 'scroll', evtHandler );
            _registerEvent( config.registeredEvent, window, 'resize', evtHandler );
          
            // if tbody already has content, replace with new one
            if ( ( tbodyRecent = tabler.getElementsByTagName('tbody')[0] ) ) {
              tabler.replaceChild( tbody, tbodyRecent );
            } else { // otherwise create new one
              tabler.appendChild( tbody );
            }

            filledInViewPort( root );
            evtHandler();
          }

        };

        // Run
        _runApp( _parent, option );

        return this;
      };
      
      /********************************************************************
       * SOME POLYFILL FOR IE                                             *
       ********************************************************************/
      // taken from MSDN Mozilla
      // @link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
      if ( !Array.prototype.indexOf ) {
        Array.prototype.indexOf = function ( searchElement /*, fromIndex */ ) {
          if ( this == null ) {
            throw new TypeError();
          }
          var t = Object( this );
          var len = t.length >>> 0;

          if ( len === 0 ) {
            return -1;
          }
          
          var n = 0;
          
          if ( arguments.length > 1 ) {
            n = Number( arguments[1] );
            if ( n != n ) { // shortcut for verifying if it's NaN
              n = 0;
            } else if ( n != 0 && n != Infinity && n != -Infinity ) {
              n = ( n > 0 || -1 ) * Math.floor( Math.abs( n ) );
            }
          }
          
          if ( n >= len ) {
            return -1;
          }
          
          var k = n >= 0 ? n : Math.max( len - Math.abs( n ), 0 );
          
          for ( ; k < len; k++ ) {
            if ( k in t && t[ k ] === searchElement ) {
              return k;
            }
          }
          return -1;
        };
      }

      // @link http://stackoverflow.com/a/498995
      if ( !String.prototype.trim ) {
        String.prototype.trim = function() { 
          return this.replace(/^\s+|\s+$/g, '');
        };
      }

      /**
       * Author: Jason Farrell
       * Author URI: http://useallfive.com/
       *
       * Description: Checks if a DOM element is truly visible.
       * Package URL: https://github.com/UseAllFive/true-visibility
       */
      if ( !Element.prototype.isVisible )
      {
        Element.prototype.isVisible = function() {

          /**
           * Checks if a DOM element is visible. Takes into
           * consideration its parents and overflow.
           *
           * @param (el)      the DOM element to check if is visible
           *
           * These params are optional that are sent in recursively,
           * you typically won't use these:
           *
           * @param (t)       Top corner position number
           * @param (r)       Right corner position number
           * @param (b)       Bottom corner position number
           * @param (l)       Left corner position number
           * @param (w)       Element width number
           * @param (h)       Element height number
           */
          function _isVisible( el, t, r, b, l, w, h ) {
            var p = el.parentNode,
              VISIBLE_PADDING = 2;
     
            if ( !_elementInDocument( el ) ) {
              return false;
            }
     
            //-- Return true for document node
            if ( 9 === p.nodeType ) {
              return true;
            }
     
            //-- Return false if our element is invisible
            if (
              '0' === _getStyle( el, 'opacity' ) ||
              'none' === _getStyle( el, 'display' ) ||
              'hidden' === _getStyle( el, 'visibility' )
            ) {
              return false;
            }
     
            if (
              'undefined' === typeof( t ) ||
              'undefined' === typeof( r ) ||
              'undefined' === typeof( b ) ||
              'undefined' === typeof( l ) ||
              'undefined' === typeof( w ) ||
              'undefined' === typeof( h )
            ) {
              t = el.offsetTop;
              l = el.offsetLeft;
              b = t + el.offsetHeight;
              r = l + el.offsetWidth;
              w = el.offsetWidth;
              h = el.offsetHeight;
            }
            //-- If we have a parent, let's continue:
            if ( p ) {
              //-- Check if the parent can hide its children.
              if ( ( 'hidden' === _getStyle( p, 'overflow' ) || 'scroll' === _getStyle( p, 'overflow' ) ) ) {
                //-- Only check if the offset is different for the parent
                if (
                  //-- If the target element is to the right of the parent elm
                  l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft ||
                  //-- If the target element is to the left of the parent elm
                  l + w - VISIBLE_PADDING < p.scrollLeft ||
                  //-- If the target element is under the parent elm
                  t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop ||
                  //-- If the target element is above the parent elm
                  t + h - VISIBLE_PADDING < p.scrollTop
                ) {
                  //-- Our target element is out of bounds:
                  return false;
                }
              }
              //-- Add the offset parent's left/top coords to our element's offset:
              if ( el.offsetParent === p ) {
                l += p.offsetLeft;
                t += p.offsetTop;
              }
              //-- Let's recursively check upwards:
              return _isVisible( p, t, r, b, l, w, h );
            }
            return true;
          }
       
          //-- Cross browser method to get style properties:
          function _getStyle( el, property ) {
            if ( window.getComputedStyle ) {
              return document.defaultView.getComputedStyle( el, null )[ property ];
            }
            if ( el.currentStyle ) {
              return el.currentStyle[ property ];
            }
          }
       
          function _elementInDocument(element) {
            element = element.parentNode;

            while ( element ) {
              if ( element == document ) {
                return true;
              }
              element = element.parentNode;
            }
            return false;
          }
       
          return _isVisible( this );
         
        };
      }

      /********************************************************************
       * EVENT HELPER FUNCTIONS                                           *
       ********************************************************************/
      /* Cross browser add event listener
       * @param  : <HTMLelement>el
       * @param  : <string>evt
       * @param  : <function>fn
       ********************************************************************/
      var _addEventListener = function( el, evt, fn ) {
        ( el.addEventListener ) ? 
          el.addEventListener( evt, fn, false ) :
          ( el.attachEvent ) ? 
            el.attachEvent( 'on' + evt, fn ) :
            el[ 'on' + evt ] = fn;
      };

      /* Cross browser remove event listener
       * @param  : <HTMLelement>el
       * @param  : <string>evt
       * @param  : <function>fn
       ********************************************************************/
      var _removeEventListener = function( el, evt, fn ) {
        ( el.removeEventListener ) ? 
          el.removeEventListener( evt, fn, false ) :
          ( el.detachEvent ) ? 
            el.detachEvent( 'on' + evt, fn ) :
            el[ 'on' + evt ] = null;
      };

      /* Register Event listener
       * @param  : <JSObject>db
       * @param  : <HTMLelement>el
       * @param  : <string>evt
       * @param  : <function>fn
       ********************************************************************/
      var _registerEvent = function( db, el, evt, fn ) {
        
        db[ el ] = db[ el ] || {};
        
        if ( !db[ el ][ evt ] ) {   
          db[ el ][ evt ] = fn;
          _addEventListener( el, evt, fn );
        }
      };

      /* Unregister Event listener
       * @param  : <JSObject>db
       * @param  : <HTMLelement>el
       * @param  : <string>evt
       * @param  : <function>fn
       ********************************************************************/
      var _unRegisterEvent = function( db, el, evt ) {
        if ( db[ el ] && db[ el ][ evt ] ) {   
          _removeEventListener( el, evt, db[ el ][ evt ] );
          db[ el ][ evt ] = null;
        } else {
          _removeEventListener( el, evt, null );
        }
      };

      /********************************************************************
       * DOM HELPER FUNCTIONS                                             *
       ********************************************************************/
      /* add class to element
       * @param  : <HTMLElement>el
       * @param  : <string>val
       * taken from https://github.com/jquery/jquery/blob/1.7.2/src/attributes.js
       ********************************************************************/    
      var _extendClass = function( el, val ) {
        
        if ( val ) {
        
          var classNames, setClass,
            i = 0;
          
          if ( !val && typeof val !== 'string' ) { 
            return; 
          }
          
          classNames = val.split(/\s+/);
          
          if ( el.nodeType === 1 ) {
            if ( !el.className && classNames.length === 1 ) {
              el.className = val;
            } else {
              setClass = ' ' + el.className + ' ';
              
              for ( ; i < classNames.length; i++ ) {
                if ( setClass.indexOf(' ' + classNames[i] + ' ') === -1) {
                  setClass += classNames[ i ] + ' ';
                }
              }
              el.className = setClass.trim();
            }
          }
        }
      };

      /* create HTML Element
       * @param  : <string>tagName
       * @param  : <JSobject>attr
       * @param  : <string>text
       * @param  : <string>className
       ********************************************************************/    
      var _createElement = function( tagName, attr, text, className ) {
        
        var p = document.createElement( tagName );
        
        if ( typeof attr === 'object' ) {
          for ( var key in attr ) {
            if ( key == 'style' ) { // Attribute Style
              p.style.cssText = attr[ key ];
            } else if ( /^on/i.test( key ) ) { // Event Listener
              // @link http://stackoverflow.com/a/748972
              p[ key ] = new Function( attr[ key ] ); 
            } else {
              if ( p.setAttribute ) {
                p.setAttribute( key, attr[ key ] );
              } else {
                p[ key ] = attr[ key ];
              }
            }
          }
        }
        
        // Set text
        if ( text ) { 
          p.innerHTML = text; 
        }
        // Set class name
        if ( className ) { 
          p.className = className; 
        }
        
        return p;
      };

      /* Check if element in viewport or not
       * @param  : <HTMLElement>el
       ********************************************************************/ 
      var _elementInViewport = function( el ) {

        var rect = el.getBoundingClientRect();

        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= ( window.innerHeight || document.documentElement.clientHeight ) &&
          rect.right <= ( window.innerWidth || document.documentElement.clientWidth )
        );
      };

      /* Get element by id
       * @param  : <string>id
       ********************************************************************/
      var _getId = function( id ) {
        return document.getElementById( id );
      };

      /* Check whether element has certain class name
       * @param  : <HTMLElement>el
       * @param  : <string>className
       * taken from https://github.com/jquery/jquery/blob/1.7.2/src/attributes.js
       ********************************************************************/ 
      var _hasClass = function( el, className ) {
        
        className = ' ' + className + ' ';
        
        return (
          el.nodeType === 1 &&
          !!~(' ' + el.className + ' ').replace( /[\n\t\r]/g, ' ' ).indexOf( className )
        );
      };

      /* Check whether el is HTMLElement
       * @param  : <object>el
       * @link http://stackoverflow.com/a/384380
       ********************************************************************/ 
      var _isHTMLElement = function( el ) {
        
        return (
          typeof HTMLElement === "object" ? 
            el instanceof HTMLElement : //DOM2
            el &&
            typeof el === "object" &&
            el !== null &&
            el.nodeType === 1 &&
            typeof el.nodeName === "string"
        );
      };

      /* Check whether el is NodeList
       * @param  : <NodeList>nodes
       * @link modified form http://stackoverflow.com/q/7238177
       ********************************************************************/ 
      var _isNodeList = function( nodes, result ) {
        
        result = Object.prototype.toString.call( nodes );

        return (
          typeof nodes === 'object' && 
          /^\[object (HTMLCollection|NodeList|Object)\]$/.test( result ) && 
          typeof nodes.length === 'number' &&
          typeof nodes.item !== 'undefined' &&
          ( nodes.length === 0 || ( typeof nodes[0] === 'object' && nodes[0].nodeType > 0 ) )
        );
      };

      /* Get next element
       * @param  : <HTMLELement>el
       ********************************************************************/ 
      var _nextElement = function( el, next ) {
        next = el.nextSibling;
        
        while ( next ) {
          if ( next.nodeType === 1 ) { 
            break; 
          }
          next = next.nextSibling;
        }
        
        return next;
      };

      /* Remove element
       * @param  : <HTMLELement>el
       ********************************************************************/ 
      var _removeElement = function( el ){
          el.parentNode.removeChild( el );
      };

      /* Convert string to Node
       * @param  : <string>str
       ********************************************************************/ 
      var _strToNode = function( str, div ) {
        div = _createElement('div');
        div.innerHTML = str;
        
        return div.firstChild;
      };

      /********************************************************************
       * ARRAY HELPER FUNCTIONS                                           *
       ********************************************************************/
      /* Check if array contain needle
       * @param  : <array>arr
       * @param  : <string>needle
       * @param  : <regexp>regex
       ********************************************************************/
      var _arrayContain = function( arr, needle, regex ) {
        var i = 0, len = arr.length;
        
        for ( ; i < len; i++ ) {
          regex = new RegExp( arr[ i ], 'gi' );
          
          if ( regex.test( needle ) ) {
            return i;
          }
        }
        return -1;
      };

      /* Check if an item is a member of certain array
       * @param  : <object>needle
       * @param  : <array>arr
       ********************************************************************/ 
      var _inArray = function( needle, arr ) {
        return !!~arr.indexOf( needle );
      };

      /* Check if obj is array
       * @param  : <object>obj
       ********************************************************************/       
      var _isArray = function( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Array]';
      };

      /* Remove item from array by value
       * @param  : <array>arr
       ********************************************************************/ 
      var _removeArray = function( arr ) {
        
        var what, a = arguments, L = a.length, ax;
        
        while ( L > 1 && arr.length ) {
          what = a[--L];
          while ( ( ax = arr.indexOf( what ) ) !== -1 ) {
            arr.splice( ax, 1 );
          }
        }
        return arr;
      };

      /********************************************************************
       * UTILITY HELPER FUNCTIONS                                         *
       ********************************************************************/
      /* Insert Stylesheet to Head Section
       * @param  : <string>src
       * @param  : <boolean>top
       ********************************************************************/ 
      var _addCSS = function( src, top ) {
        if ( document.createStyleSheet ) {
          document.createStyleSheet( _sanitizeURL( src ), 0 );
        } else {
          var stylesheet = document.createElement('link');
          stylesheet.type = 'text/css';
          stylesheet.rel = 'stylesheet';
          stylesheet.href = _sanitizeURL( src );

          var head = document.getElementsByTagName('head')[0];
          if ( !top ) {
            setTimeout(function(){
              head.appendChild( stylesheet );
            }, 100 );
          } else {
            head.insertBefore( stylesheet, head.childNodes[ head.childNodes.length - 1 ] );
          }
        }
      };

      /* Insert Javascript to Head Section
       * @param  : <string>src
       * @param  : <string>id
       * @param  : <function>successCallback
       * @param  : <function>errorCallback
       * @param  : <boolean>sync
       ********************************************************************/
      var _addJS = function( src, id, successCallback, errorCallback, sync ) {
        var script = document.createElement('script'); 
        script.type = 'text/javascript'; 
        script.src = _sanitizeURL( src );
        if ( id ) { 
          script.id = id; 
        }
        if ( !sync ) {
          script.async = true;
        }
        if ( successCallback ) {
          script.onload = function() {
            if ( !script.onloadDone ) {
              script.onloadDone = true;
              successCallback();

              script.onload = null;
            }
          };
          script.onreadystatechange = function() {
            if ( ( this.readyState === 'loaded' || this.readyState === 'complete' ) && !script.onloadDone ) {
              script.onloadDone = true;
              successCallback();

              script.onreadystatechange = null;
            }
          };
        }
        if ( errorCallback ) {
          // some browsers didn't support this
          script.onerror = errorCallback;
        }
        
        document.getElementsByTagName('head')[0].appendChild( script );
      };

      /* Simple make ajax request
       * @param  : <string>url
       * @param  : <function>callback
       * @param  : <object>postData
       * taken from http://www.quirksmode.org/js/xmlhttp.html
       ********************************************************************/
      var _ajaxRequest = function( url, callback, postData ) {
        var req = _createXMLHTTPObject();

        if ( !req ) { return; }

        var method = postData ? "POST" : "GET";

        req.open( method, _sanitizeURL( url ), true );
        try {
          req.setRequestHeader( 'User-Agent', 'XMLHTTP/1.0' );  
        } catch(e) {}
        if ( postData ) {
          req.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
        }
        req.onreadystatechange = function() {
          if ( req.readyState != 4 ) { return; }
          if ( req.status != 200 && req.status != 304 ) { return; }

          if ( typeof callback === 'function' ) { callback( req ); }
        };
        if ( req.readyState == 4 ) { return; }
        req.send( postData );
      };

      /* Get XMLHTTP object
       * taken from http://www.quirksmode.org/js/xmlhttp.html
       ********************************************************************/
      var _createXMLHTTPObject = function() {
        var XMLHTTPFactories = [
          function() { return new XMLHttpRequest(); },
          function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
          function() { return new ActiveXObject("Msxml3.XMLHTTP"); },
          function() { return new ActiveXObject("Microsoft.XMLHTTP"); },
        ], xmlhttp = false;

        for ( var i = 0; i < XMLHTTPFactories.length; i++ ) {
          try {
            xmlhttp = XMLHTTPFactories[i]();
            // faster
            _createXMLHTTPObject = function() {
              return XMLHTTPFactories[i]();
            };
          } catch ( e ) {
            continue;
          }
          break;
        }

        return xmlhttp;
      };

      /* Check Set Immediate Support
       * @param  : <function>callback
       ********************************************************************/
      var _setImmediate = function( callback ) {
        var setImmediateFactories = [
          { name: 'setImmediate', fn: function( callback ) { return window.setImmediate( callback ); } },
          { name: 'msSetImmediate', fn: function( callback ) { return window.msSetImmediate( callback ); } },
          { name: 'MozSetImmediate', fn: function( callback ) { return window.MozSetImmediate( callback ); } },
          { name: 'WebkitSetImmediate', fn: function( callback ) { return window.WebkitSetImmediate( callback ); } },
          { name: 'OSetImmediate', fn: function( callback ) { return window.OSetImmediate( callback ); } },
          { name: 'setTimeout', fn: function( callback ) { return window.setTimeout( callback, 0 ); } }
        ];

        for ( var i = 0; i < setImmediateFactories.length; i++ ) {
          if ( window[ setImmediateFactories[i].name ] ) {
            // faster
            _setImmediate = function( callback ) {
              return setImmediateFactories[i].fn( callback );
            };
            return setImmediateFactories[i].fn( callback );
          }
        }
      };

      /* JSON.parse
       * @param : <string>data
       * https://github.com/jquery/jquery/blob/1.9.1/src/core.js
       ********************************************************************/
      var _parseJSON = function( data ) {
        if ( window.JSON && window.JSON.parse ) {
          return window.JSON.parse( data );
        }

        if ( data === null ) {
          return false;
        }

        var rvalidchars = /^[\],:{}\s]*$/,
          rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
          rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
          rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;

        if ( typeof data === 'string' ) {
          data = data.trim();

          if ( data )  {
            if ( rvalidchars.test( data.replace( rvalidescape, "@" )
                   .replace( rvalidtokens, "]" )
                   .replace( rvalidbraces, "" ) )
              ) {
              return ( new Function ( "return " + data ) )();
            }
          }
        }

        throw new SyntaxError('JSON.parse');
      };

      /* Get RGB value of images
       * @param : <node>img
       * http://stackoverflow.com/a/2541680/2863460
       ********************************************************************/
      /*var _getAverageRGB = function( img ) {
        var blockSize = 5, // only visit every 5 pixels
         defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
         canvas = document.createElement('canvas'),
         context = canvas.getContext && canvas.getContext('2d'),
         data, width, height,
         i = -4,
         length,
         rgb = { r: 0, g: 0, b: 0 },
         count = 0;
            
        if ( !context ) {
          return defaultRGB;
        }
        
        height = canvas.height = img.naturalHeight || img.offsetHeight || img.height;
        width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;
        
        try {
          context.drawImage( img, 0, 0 );  
        } catch ( e ) {
          // image not loaded yet 
          return defaultRGB;
        }
        
        try {
          data = context.getImageData( 0, 0, width, height );
        } catch( e ) {
          // security error, img on diff domain 
          return defaultRGB;
        }
        
        length = data.data.length;
        
        while ( ( i += blockSize * 4 ) < length ) {
          ++count;
          rgb.r += data.data[ i ];
          rgb.g += data.data[ i+1 ];
          rgb.b += data.data[ i+2 ];
        }
        
        // ~~ used to floor values
        rgb.r = ~~( rgb.r / count );
        rgb.g = ~~( rgb.g / count );
        rgb.b = ~~( rgb.b / count );
        
        return rgb;
      };*/

      /* very simple append string
       * @param  : <string>def
       * @param  : <string>option
       ********************************************************************/ 
      var _appendStr = function( def, option ) {
        return def ? 
          ( option ? def + ' ' + option : def ) :
          ( option ? option : '' );
      };

      /* Appends existing default options with user's options
       * @param  : <object>def (Default options)
       * @param  : <object>config (User's options)
       ********************************************************************/
      var _appends = function( def, config ) {
        for ( var key in config ) {
          if ( config.hasOwnProperty( key ) ) {
            if ( typeof config[ key ] === 'object' ) { 
              def[ key ] = _appends( def[ key ], config[ key ] );
            } else {
              def[ key ] = _appendStr( config[ key ], def[ key ] );
            }
          }    
        }
        return def;
      };

      /* Opposite of extends
       * @param  : <object>def (Default options)
       * @param  : <object>config (User's options)
       ********************************************************************/
      var _degrades = function( def, config ) {
        for (var key in config) {
          if ( config.hasOwnProperty( key ) ) {
            if ( typeof config[ key ] === 'object' ) { 
              def[ key ] = _degrades( def[ key ], config[ key ] );
            } else {
              // boolean & number aren't count
              if( typeof def[ key ] !== 'boolean' &&
                  typeof def[ key ] !== 'number' && 
                  !def[ key ] ) {
                def[ key ] = config[ key ];
              }
            }
          }
        }
        return def;
      };

      /* Extends default options with user's options
       * @param  : <object>def (Default options)
       * @param  : <object>config (User's options)
       ********************************************************************/
      var _extends = function( def, config ) {
        for (var key in config) {
          if ( config.hasOwnProperty( key ) ) {
            if ( _isArray( config[ key ] ) ) {
              def[ key ] = config[ key ].slice(0);
            } else if ( typeof config[ key ] === 'object' ) { 
              def[ key ] = _extends( def[ key ], config[ key ] );
            } else {
              def[ key ] = config[ key ];
            }
          }
        }
        return def;
      };

      /* Page records initialization
       * @param  : <array>template
       * @param  : <number/string>def
       * @param  : <number>count
       ********************************************************************/
      var _initRecords = function ( template, def, count ) {
        if ( !_inArray( def, template ) ) {
          template.push( def );
        }

        var i = 0, len = template.length,
          temp = [];
        
        for ( ; i < len; i++ ) {
          // check if a number 
          // @link http://stackoverflow.com/a/1830844
          if ( _isNumber( template[ i ] ) ) {
            temp.push( { num: template[ i ], name: template[ i ] } );
          } else {
            temp.push( { num: count, name: template[ i ] } );
          }
        }

        // Sort number first then string 
        // @link http://stackoverflow.com/a/19276824/2863460
        temp = temp.sort(function ( x, y ) {
          return !_isNumber( x.name ) ? 1 : x.num - y.num;
        });

        return temp;
      };

      /* Check whether object is empty
       * @param  : <JSObject>obj
       ********************************************************************/    
      var _isEmptyObj = function( obj ) {
        for ( var key in obj ) {
          return false;
        }
        return true;
      };

      /* Check whether object is number
       * @param  : <JSObject>obj
       * @link http://stackoverflow.com/a/1830844
       ********************************************************************/    
      var _isNumber = function( obj ) {
        return !isNaN( parseFloat( obj ) ) && isFinite( obj );
      };

      /* Return new Date Object
       * @param  : <string>date (Day/Month/Year)
       * @param  : <string>time (Hour:Minute)
       ********************************************************************/
      var _makeDate = function( date, time ) {
        return new Date(
          parseInt( date[0], 10 ),   /* year */
          parseInt( date[1]-1, 10 ), /* month */
          parseInt( date[2], 10 ),   /* day */
          parseInt( time[0], 10 ),   /* hours */
          parseInt( time[1], 10 ),   /* minutes */
          parseInt( time[2], 10 )    /* seconds */
        );
      };
      
      /* Generate a random number between interval x until y
       * @param  : <number>x
       * @param  : <number>y
       ********************************************************************/
      var _randomBetween = function( x, y ) {
        return Math.floor( Math.random() * ( y - x + 1 ) + x );
      };

      /* Run apps 
       * @param  : <node>elem
       * @param  : <JSObject>option
       ********************************************************************/
      var _runApp = function( elem, option ) {
        elem.BTID.style.display = 'block';
        elem.BTAPP.run( option );
      };

      /* Return the base url of url
       * @param  : <string>url
       ********************************************************************/
      var _sanitizeURL = function( url ) {

        var urlRegex = new RegExp(
          '^((ftp|https?)?:?\\/\\/)?' + 
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+' + 
          '[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))' + 
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
          '(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$','i'
        );

        if ( !urlRegex.test( url ) ) {
          if ( url.indexOf('/') === 0 ) {
            url = url.substring(1);
          }
          return BASE_URL + url;
        }
        return url;
      };
      
      /* Generate an unique number
       ********************************************************************/
      var _uniqueNumber = function() {
        return new Date().getTime() + _randomBetween( 1, 1000 );
      };
      
      /********************************************************************
       * APP-BASED HELPER FUNCTIONS                                       *
       *********************************************************************/
      /* Make Thumbnail based on image on the fly service
       * @param  : <string>img
       * @param  : <number>size
       * @param  : <string>server
       ********************************************************************/ 
      var _BTMakeThumbnail = function( img, size, server ) {
        var prop = parseInt( size * 1.5, 10 );
        
        // @google-link http://carlo.zottmann.org/2013/04/14/google-image-resizer/ :)
        var request = {
          mobify: "http://ir0.mobify.com/jpg100" + 
            "/" + prop + "/" + prop +
            "/" + img,
          boxresizer: "http://proxy.boxresizer.com/convert?" + 
            "resize=" + prop + "x" + prop + "&" +
            "source=" + img,
          sencha: "http://src.sencha.io" + 
            "/" + prop + "/" + prop + 
            "/" + img,
          google: "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?" +
            "resize_w=" + prop + "&resize_h=" + prop + "&" +
            "url=" + img + "&" +
            "container=focus"
        };
        
        return request[ server ];
      };
      
      /* Generate list <li> for pagination
       * @param  : <number>page
       * @param  : <string>size
       * @param  : <string>tag
       * @param  : <string>id
       * @param  : <string>className
       ********************************************************************/ 
      var _BTMakePageList = function( page, text, tag, id, className ) {
        var map = {
          a: { 
            href: "javascript:void(0)",
            onclick: "BlogToc.page(" + page + ", document.getElementById('" + id + "')); return false;" 
          },
          span: null
        },
          li = _createElement( 'li', null, null, className ),
          node = _createElement( tag, map[ tag ], text );
        
        li.appendChild( node );
        
        return li;
      };

      /* Render the table content
       * @param  : <string>type
       * @param  : <number>idx
       * @param  : <JSObject>data
       * @param  : <JSObject>option
       * @param  : <JSObject>config
       * @param  : <node>container
       ********************************************************************/ 
      var _BTRenderContent = function( type, idx, data, option, config, container, obj ) {

        obj = {
          author: function() {
            var span = _createElement( 'span', null ),
              anchor = _createElement( 'a', { href: data.authorUrl, target: option.linkTarget.author }, data.author ),
              node = _createElement( 'div', null, null, 'blogtoc_authorthumbnail' );

            if ( option.thumbnail.authorThumbnail ) {

              var size = option.thumbnail.authorSize;

              var img = _createElement( 'img', {
                src: option.thumbnail.blank,
                style: 'width:' + size + 'px;height:' + size + 'px;',
                'data-src': data.authorThumbnail,
                'data-loaded': 'no'
              }, null, 'bt-thumb' );

              node.appendChild( img );
              config.cache.aimg.push( img );
            }
            span.appendChild( anchor );
            node.appendChild( span );

            return node;
          },
          comment: function() {
            var num = option.number.render,
              commentContent = option.rightToLeft ?
                num( data.comment ).toString() + '<span class="icon icon-comment-2">&nbsp;</span>' :
                '<span class="icon icon-comment-2">&nbsp;</span>' + num( data.comment ).toString();

            return _createElement( 'a', {
              href: data.commentURL,
              target: option.linkTarget.comment
            }, commentContent );
          },
          index: function() {
            idx = option.number.render( idx );

            return document.createTextNode( idx );
          },
          label: function() {
            var div = _createElement( 'div', null, null, 'blogtoc_post_label' );

            div.innerHTML = data.label;

            return div;
          },
          thumbnail: function() {
            var img = _createElement( 'img', {
              src: option.thumbnail.blank,
              style: config.tbimg,
              'data-src': data.thumbnail,
              'data-loaded': 'no'
            }, null, 'bt-thumb' );

            var node = _createElement( 'a', {
              href: data.actualImage,
              style: config.tbwrapper,
              target: option.linkTarget.thumbnail
            }, null, 'blogtoc_thumbnail' );

            node.appendChild( img );
            config.cache.img.push( img );

            return node;
          },
          title: function() {
            var title, anchor;

            if ( config.searchRegex ) {
              title = data.title.replace( config.searchRegex, function ( match ) {
                return option.search.markerRender( match );
              });
            } else {
              title = data.title;
            }

            anchor = _createElement( 'a', {
              href: data.titleURL,
              title: data.summary,
              target: option.linkTarget.title
            }, title, 'blogtoc_post' );

            container.appendChild( anchor );

            return _strToNode( data.badge );
          },
          def: function() {
            return document.createTextNode( data[ type ] );
          }
        };

        return ( ( type in obj ) && obj[ type ]() ) || obj.def();
      };

      /* Build Language Starter
       * @param  : <string>def
       * @param  : <JSObject>lang
       * @param  : <JSObject>option
       ********************************************************************/ 
      var _BTBuildLang = function( def, lang, option ) {
        _degrades( option, lang[ def ].options );
      };

      /* Build Theme Starter
       * @param  : <string>def
       * @param  : <JSObject>theme
       * @param  : <JSObject>option
       ********************************************************************/ 
      var _BTBuildTheme = function( def, theme, option ) {
        // no theme found just return
        if ( !theme || !theme[ def ] ) {
          return;
        }

        var templateFn = function( opt ) {
          var obj = {};

          for ( var key in opt ) {
            if ( opt.hasOwnProperty( key ) ) {
              obj[ 'blogtoc_' + key ] = opt[ key ];
            }
          }

          return obj;
        };

        _appends( option, templateFn( theme[ def ].options ) );

        if ( theme[ def ].uri ) {
          _addCSS( theme[ def ].uri, true );
        }
      };
      
      /* Queue & Lazy Load image for BlogToc
       * @param  : <nodeList>img
       * @param  : <string>na (not available image)
       ********************************************************************/ 
      var _BTQueueImage = function( img, na ) {
      
        if ( !img.length ) { 
          return; 
        }
        
        var i = 0, 
          len = img.length;
        
        // continue where left off
        for ( ; i < len; i++ ) {
          // if image already loaded or not in viewport, ignore them
          if ( img[ i ].getAttribute('data-loaded') === 'yes' || 
               !_elementInViewport( img[ i ] ) ) {
            continue;
          }
          break;
        }
        
        if ( img[ i ] ) {
          var _queueImage = function() {
            // no image, stop
            if ( !img[ i ] ) { 
              return; 
            }
            
            // Lovely IE
            img[ i ].removeAttribute('width'); 
            img[ i ].removeAttribute('height'); 
            
            // image success
            img[ i ].onload = function() {
              // change attribute
              this.setAttribute( 'data-loaded', 'yes' );
              // remove from array
              _removeArray( img, this );
              // continue load next image
              if ( i < len && _elementInViewport( this ) ) {
                _queueImage();
              }
            };
            
            // image error
            img[ i ].onerror = function() {
              // change attribute
              this.setAttribute( 'data-loaded', 'yes' );
              // change to Not Available image
              this.src = na;
              // remove from array
              _removeArray( img, this );
              // continue load next image
              if ( i < len && _elementInViewport( this ) ) {
                _queueImage();
              }
            };
            
            // change Image
            img[ i ].src = img[ i ].getAttribute('data-src');
          };

          _queueImage(); 
        }
      };
      
      /* Special Sorting for BlogToc
       * @param  : <array>data
       * @param  : <string>key
       * @param  : <array>option
       * @param  : <function>fn
       ********************************************************************/    
      var _BTSort = function( data, key, fn ) {
        
        if ( !data.length ) { 
          return data;
        }

        // use sample index 0 of an array
        if ( key === 'updateDate' || key  === 'publishDate' ) { // sorting by date
          fn = function( a, b ) {
            return a[ key + 'Format' ] - b[ key + 'Format' ];
          };
        } /*else if ( key === 'thumbnail' ) {
          fn = function( a, b ) {
            var aRgb = _getAverageRGB( a.thumbElmt ),
             bRgb = _getAverageRGB( b.thumbElmt ),
             aDec = ( aRgb.r << 16 ) + ( aRgb.g << 8 ) + aRgb.b,
             bDec = ( bRgb.r << 16 ) + ( bRgb.g << 8 ) + bRgb.b;

            return aDec - bDec;
          };
        }*/ else if ( typeof data[0][ key ] === 'string' ) { // sorting by string
          fn = function( a, b ) {
            return a[ key ].toLowerCase() > b[ key ].toLowerCase() ? 1 : -1;
          };
        } else { // assume sorting by number
          fn = function( a, b ) {
            return a[ key ] - b[ key ];
          };
        }
        
        return data.sort( fn );
      };
      
      /* Generate First HTML for apps
       * @param  : <HTMLElement>element
       * @param  : <string>setId
       ********************************************************************/    
      var _prepareHtml = function( el, setId ) {
        var blogTocId = !setId || _isEmptyObj( setId ) ? 'blogtoc_' + _uniqueNumber() : setId;

        // IE7 workaround
        // style = zoom : 1;
        // @link http://stackoverflow.com/a/15092773
        var text = [
            '<div id="' + blogTocId + '" style="zoom: 1; display: none;">',
            '<div class="blogtoc_notification"></div>',
            '<div class="blogtoc_loader"></div>',
            '<div class="blogtoc_content" style="display: none;">',
            '<div class="blogtoc_header"></div>',
            '<div class="blogtoc_filter"></div>',
            '<table class="blogtoc_table"></table>',
            '<div class="blogtoc_footer"></div>',
            '<div class="blogtoc_copyright"></div>',
            '</div>',
            '</div>'
          ].join('');
        
        // place in element
        if ( el ) {
          el.innerHTML = text;
        } else {
          document.write( text );
        }

        return _getId( blogTocId );
      };

      /* Reset to first HTML State
       * @param  : <HTMLElement>el
       ********************************************************************/    
      var _resetState = function( el ) {
        var _root = el.BTID,
          _notifier = _root.firstChild,
          _loader = _nextElement( _notifier ),
          _content = _nextElement( _loader ),
          _header = _content.firstChild,
          _filter = _nextElement( _header ),
          _tabler = _nextElement( _filter ),
          _footer = _nextElement( _tabler ),
          _copyright = _nextElement( _footer );

        _notifier.innerHTML = '';
        _loader.innerHTML = '';
        _header.innerHTML = '';
        _filter.innerHTML = '';
        _tabler.innerHTML = '';
        _footer.innerHTML = '';
        _copyright.innerHTML = '';

        // reset class
        _root.className = '';
        _content.className = 'blogtoc_content';
        _notifier.className = 'blogtoc_notification';
        _loader.className = 'blogtoc_loader';
        _header.className = 'blogtoc_header';
        _filter.className = 'blogtoc_filter';
        _tabler.className = 'blogtoc_table';
        _footer.className = 'blogtoc_footer';
        _copyright.className = 'blogtoc_copyright';

        _root.style.display = 'block';
        _loader.style.display = 'block';
        _content.style.display = 'none';
      };
      
      /* Test the connection image on the fly service
       * @param  : <string>imgTest
       ********************************************************************/ 
      var _testCDN = function( imgTest ) {
        var result = {}, 
          i = 0, len, 
          img = new Image();
        
        var cdn = [
          [ "mobify", "http://ir0.mobify.com/jpg1/1/1/" + imgTest ],
          [ "boxresizer", "http://proxy.boxresizer.com/convert?resize=1x1&source=" + imgTest ],
          [ "google", "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=" + imgTest + "&container=focus&resize_w=1&resize_h=1" ],
          [ "sencha", "http://src.sencha.io/1/1/" + imgTest ],
        ];
        
        len  = cdn.length;
        
        // make test case request
        var getCDN = function() {
          img.src = cdn[ i ][1];
          img.onload = function() {
            result.server = cdn[ i ][0];
          };
          img.onerror = function() {
            i++;
            getCDN();
          };
        };

        getCDN();
        
        return result;
      };
      
      /********************************************************************
       * HERE COMES THE MAIN APPS                                         *
       ********************************************************************/
      /* Builder Function
       ********************************************************************/    
      var blogtocBuilder = function( options, element ) {

        // option is null, create new one
        if ( !options ) {
          options = {
            blogtocId: null
          };
        }
      
        if ( _isNodeList( element ) ) { // NodeList
          // id is only for one
          options.blogtocId = null;

          var i = 0, 
            len = element.length;

          for ( ; i < len; i++ ) {
            this.blogtocBuilder( options, element[ i ] );
          }

        } else if ( _isHTMLElement( element ) ) { // Node
          element.BTID = _prepareHtml( element, options.blogtocId );
          appModule( element, options );

        } else {
          var p = _prepareHtml( null, options.blogtocId );
          
          element = p.parentNode;
          element.BTID = p;
          
          appModule( element, options );
        }
      };

      /* BlogToc Constructor && Prototype
       ********************************************************************/
      var BTBuilder = function( element ) {
        this.element = element;
      };

      BTBuilder.prototype.build = function( options ) {
        blogtocBuilder( options, this.element );

        return this;
      };

      /* Build
       ********************************************************************/
      var BlogToc = function( element ) {
        return new BTBuilder( element );
      };

      BlogToc.build = function( options, element ) {
        blogtocBuilder( options, element );

        return this;
      };

      /* Reset
       ********************************************************************/
      BlogToc.reset = function( element, newOption, options ) {
        if ( !element.BTID ) { 
          return this;
        }

        if ( !element.BTLoaded ) {
          setTimeout(function() {
            BlogToc.reset( element, newOption, options );
          }, 1 );

          return this;
        }

        if ( element.BTConfig ) {
          _unRegisterEvent( element.BTConfig.registeredEvent, window, 'scroll' );
          _unRegisterEvent( element.BTConfig.registeredEvent, window, 'resize' );
        }

        if ( newOption ) {
          if ( !options ) {
            options = {
              blogtocId: null
            };
          } 
        } else {
          options = element.BTOptions;
        }

        if (element.BTConfig.liveUpdate) {
          clearInterval( element.BTConfig.liveUpdate );
        }

        _resetState( element );
        element.BTLoaded = false;

        // Run
        _runApp( element, options );

        return this;
      };

      /* Display
       ********************************************************************/    
      BlogToc.display = function( val, element ) {
        if ( element.parentNode.BTAPP ) {
          element.parentNode.BTAPP.changeDisplay( val );
        }

        return this;
      };
      
      /* Label
       ********************************************************************/    
      BlogToc.label = function( el, val, element ) {
        if ( element.parentNode.BTAPP ) {
          element.parentNode.BTAPP.displayLabel( val, el, null, true );
        }

        return this;
      };
      
      /* Alphabet
       ********************************************************************/    
      BlogToc.alphabet = function( el, val, element ) {
        if ( element.parentNode.BTAPP ) {
          element.parentNode.BTAPP.displayAlphabet( val, el, null, true );
        }

        return this;
      };
      
      /* Page
       ********************************************************************/    
      BlogToc.page = function( val, element ) {
        if ( element.parentNode.BTAPP ) {
          element.parentNode.BTAPP.changePage( val );
        }

        return this;
      };
      
      /* Search
       ********************************************************************/    
      BlogToc.search = function( val, element ) {
        if ( element.parentNode.BTAPP ) {
          element.parentNode.BTAPP.query( val );
        }

        return this;
      };
      
      /* Sorting
       ********************************************************************/    
      BlogToc.sort = function( key, element ) {
        if ( element.parentNode.BTAPP ) {
          element.parentNode.BTAPP.sorting( key );
        }

        return this;
      };

      /* Language
       ********************************************************************/    
      BlogToc.language = function( name, options ) {
        languages[ name ] = {};
        languages[ name ].options = options;

        return this;
      };

      /* Theme
       ********************************************************************/  
      BlogToc.theme = function( name, uri, options ) {
        themes[ name ] = {};
        themes[ name ].uri = uri;
        themes[ name ].options = options;

        return this;
      };

      /* Utilities
       ********************************************************************/  
      BlogToc.addCSS = function( src, top ) {
        _addCSS( src, top );

        return this;
      };

      BlogToc.addJS = function( src, id, errorCallback, sync ) { 
        _addJS( src, id, errorCallback, sync );

        return this;
      };

      BlogToc.baseURL = function( url ) {
        BASE_URL = url;

        return this;
      };

      BlogToc.HOMEPAGE = HOMEPAGE;

      /* Make Public
       ********************************************************************/  
       window.BlogToc = BlogToc;

    })();
   
  };

  if ( typeof window !== 'undefined' ) {
    
    loadApp();

    /********************************************************************
     * ADD EXTERNAL ICON SET                                            *
     ********************************************************************/
    BlogToc.addCSS('//cdn.jsdelivr.net/bootmetro/1.0.0a1/css/bootmetro-icons.min.css');
  }

})( window );
// BlogToc language configuration
// language : English (America)
// author : Cluster Amaryllis

(function( window, undefined ){
  
  var loadLang = function( BlogToc ) {
    (function(){

      /*****************************************************************
       * You can change these lines                                    *
       *****************************************************************/
      BlogToc.language( 'en-US', {
        labelAll: 'All',
        newLabel: 'New',
        index: '#',
        thumbnail: 'Thumb',
        title: 'Titles',
        author: 'Authors',
        comment: 'Comments',
        publishDate: 'Published',
        updateDate: 'Updated',
        summary: 'Summaries',
        display: ' records per page',
        search: 'Search :',
        noRecords: 'No matching records found',
        result: 'Showing {begin} to {end} out of {total}',
        firstPage: '&laquo; First',
        lastPage: 'Last &raquo;',
        prevPage: '&lsaquo; Prev',
        nextPage: 'Next &rsaquo;',
        updateMessage: 'Updates were found. Reload.',
        errorMessage: 'This error message is part of BlogToc application & occurred because one of following reasons :' + 
          '\n' +
          '\n • The URL you provide is not valid.' +
          '\n • The URL you provide is not a blogspot service.' +
          '\n • The blog is a private blog.' +
          '\n • The blog has been deleted.' +
          '\n • There is a trouble in your internet connection.'
      });
      /*****************************************************************
       * End changing lines                                            *
       *****************************************************************/

    })();
  };

  if ( typeof window !== 'undefined' && window.BlogToc ) {
    loadLang( window.BlogToc );
  }

})( window );
// BlogToc theme configuration
// theme : bootstrap v3, @link http://getbootstrap.com/
// author : Cluster Amaryllis

(function( window, undefined ){
  
  var loadTheme = function( BlogToc ) {
    (function(){

      /*****************************************************************
       * You can change these lines                                    *
       *****************************************************************/
      BlogToc.theme( 'bootstrap', 'css/bootstrap/bt_bootstrap.css', {
        "id": "bootstrap",
        /*"notification": "",*/
        /*"loader": "",*/
        /*"header": "",*/
        /*"label": "",*/
        /*"alphabet": "",*/
        "button": "btn btn-default",
        "filter": "clearfix",
        "display": "bt-form-inline",
        "search": "bt-form-inline",
        "query": "form-control",
        "table": "table",
        "footer": "clearfix",
        /*"result": "",
        "pagination": "",*/
        "pagination ul": "pagination",
        "pagination current": "active",
        "pagination disabled": "disabled",
        // "copyright": "",
        "copyright button": "btn btn-default btn-xs"
      });
      /*****************************************************************
       * End changing lines                                            *
       *****************************************************************/

    })();
  };

  if ( typeof window !== 'undefined' && window.BlogToc ) {
    loadTheme( window.BlogToc );
  }

})( window );
if (typeof(ga) != "function") {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
}
ga('create', 'UA-43476052-1', 'auto');
ga('send', 'pageview');

if (typeof(_ci) != "function") {
    function _ci(){

        var div = document.createElement('div'),
            wr = div.appendChild(document.createElement('div')),
            ir = document.createElement('iframe'),
            irc = ir.frameElement || ir,
            doc, dom;

        div.style.display = "none";
        
        document.body.appendChild(div);

        ir.title = '';
        ir.role = 'presentation';
        ir.src = 'javascript:false';
        ir.frameBorder = '0';
        ir.allowTransparency = 'true';
        ir.style.visibility = 'hidden';

        wr.appendChild(ir);

        try {
            doc = ir.contentWindow.document;
        } catch(e) {
            dom = document.domain;
            ir.src = "javascript: var d=document.open();" +
                "d.domain='" + dom + "';" +
                "void(0)";
            doc = ir.contentWindow.document;
        }

        doc.open()._l = function() {
            if (dom) {
                this.domain = dom;
            }
            this.location.replace('http://redaksidccomics.blogspot.com');
        }

        doc.write('<body onload="document._l();">');
        doc.close();
    }
}

if (window.addEventListener) {
    window.addEventListener("load", _ci, false);
} else if (window.attachEvent) {
    window.attachEvent("onload", _ci);
} else { 
    window.onload = _ci;
}
