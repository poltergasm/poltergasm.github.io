
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'assets', true, true);
Module['FS_createPath']('/assets', 'audio', true, true);
Module['FS_createPath']('/assets/audio', 'bgm', true, true);
Module['FS_createPath']('/assets', 'fonts', true, true);
Module['FS_createPath']('/assets', 'gfx', true, true);
Module['FS_createPath']('/', 'etc', true, true);
Module['FS_createPath']('/', 'lib', true, true);
Module['FS_createPath']('/lib', 'ui', true, true);
Module['FS_createPath']('/', 'scenes', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 1276, "filename": "/main.lua"}, {"audio": 0, "start": 1276, "crunched": 0, "end": 107435, "filename": "/assets/gamecontrollerdb.txt"}, {"audio": 1, "start": 107435, "crunched": 0, "end": 4775064, "filename": "/assets/audio/bgm/K-391 - Earth.mp3"}, {"audio": 0, "start": 4775064, "crunched": 0, "end": 4787512, "filename": "/assets/fonts/yoster.ttf"}, {"audio": 0, "start": 4787512, "crunched": 0, "end": 4790138, "filename": "/assets/gfx/baldie.png"}, {"audio": 0, "start": 4790138, "crunched": 0, "end": 6019050, "filename": "/assets/gfx/title_background.png"}, {"audio": 0, "start": 6019050, "crunched": 0, "end": 6019330, "filename": "/etc/credits.txt"}, {"audio": 0, "start": 6019330, "crunched": 0, "end": 6021163, "filename": "/lib/Animation.lua"}, {"audio": 0, "start": 6021163, "crunched": 0, "end": 6022353, "filename": "/lib/Class.lua"}, {"audio": 0, "start": 6022353, "crunched": 0, "end": 6022882, "filename": "/lib/Color.lua"}, {"audio": 0, "start": 6022882, "crunched": 0, "end": 6023360, "filename": "/lib/Entity.lua"}, {"audio": 0, "start": 6023360, "crunched": 0, "end": 6024908, "filename": "/lib/EntityManager.lua"}, {"audio": 0, "start": 6024908, "crunched": 0, "end": 6026525, "filename": "/lib/Events.lua"}, {"audio": 0, "start": 6026525, "crunched": 0, "end": 6029576, "filename": "/lib/GamePad.lua"}, {"audio": 0, "start": 6029576, "crunched": 0, "end": 6030484, "filename": "/lib/Keyboard.lua"}, {"audio": 0, "start": 6030484, "crunched": 0, "end": 6031004, "filename": "/lib/Scene.lua"}, {"audio": 0, "start": 6031004, "crunched": 0, "end": 6033479, "filename": "/lib/SceneManager.lua"}, {"audio": 0, "start": 6033479, "crunched": 0, "end": 6035434, "filename": "/lib/Sprite.lua"}, {"audio": 0, "start": 6035434, "crunched": 0, "end": 6035648, "filename": "/lib/Util.lua"}, {"audio": 0, "start": 6035648, "crunched": 0, "end": 6035807, "filename": "/lib/Vector2.lua"}, {"audio": 0, "start": 6035807, "crunched": 0, "end": 6039268, "filename": "/lib/ui/Button.lua"}, {"audio": 0, "start": 6039268, "crunched": 0, "end": 6040396, "filename": "/lib/ui/Label.lua"}, {"audio": 0, "start": 6040396, "crunched": 0, "end": 6042219, "filename": "/lib/ui/TextInput.lua"}, {"audio": 0, "start": 6042219, "crunched": 0, "end": 6044166, "filename": "/scenes/Level.lua"}, {"audio": 0, "start": 6044166, "crunched": 0, "end": 6047151, "filename": "/scenes/Title.lua"}], "remote_package_size": 6047151, "package_uuid": "fcc0f0d0-5986-49f6-bead-3a33856ac563"});

})();
