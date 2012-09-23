var cordova = require('../cordova'),
    wrench = require('wrench'),
    mkdirp = wrench.mkdirSyncRecursive,
    path = require('path'),
    rmrf = wrench.rmdirSyncRecursive,
    fs = require('fs'),
    config_parser = require('../src/config_parser'),
    tempDir = path.join(__dirname, '..', 'temp');

var cwd = process.cwd();

describe('build command', function() {
    beforeEach(function() {
        // Make a temp directory
        try { rmrf(tempDir); } catch(e) {}
        mkdirp(tempDir);
    });

    it('should not run inside a Cordova-based project with no added platforms', function() {
        this.after(function() {
            process.chdir(cwd);
        });

        cordova.create(tempDir);
        process.chdir(tempDir);
        expect(function() {
            cordova.build();
        }).toThrow();
    });
    
    it('should run inside a Cordova-based project with at least one added platform', function() {
        this.after(function() {
            process.chdir(cwd);
        });

        var buildcb = jasmine.createSpy();
        var cb = jasmine.createSpy();

        runs(function() {
            cordova.create(tempDir);
            process.chdir(tempDir);
            cordova.platform('add', 'android', cb);
        });
        waitsFor(function() { return cb.wasCalled; }, 'platform add android callback');

        runs(function() {
            var s = spyOn(require('shelljs'), 'exec').andReturn({code:0});
            expect(function() {
                cordova.build(buildcb);
            }).not.toThrow();
            expect(s).toHaveBeenCalled();
        });
        waitsFor(function() { return buildcb.wasCalled; }, 'build call', 20000);
    });
    
    it('should not run outside of a Cordova-based project', function() {
        this.after(function() {
            process.chdir(cwd);
        });

        process.chdir(tempDir);

        expect(function() {
            cordova.build();
        }).toThrow();
    });
    describe('binary creation', function() {
        beforeEach(function() {
            cordova.create(tempDir);
            process.chdir(tempDir);
        });

        afterEach(function() {
            process.chdir(cwd);
        });
        it('should shell out to debug command on Android', function() {
            var buildcb = jasmine.createSpy();
            var cb = jasmine.createSpy();

            runs(function() {
                cordova.platform('add', 'android', cb);
            });
            waitsFor(function() { return cb.wasCalled; }, 'platform add android callback');

            runs(function() {
                var s = spyOn(require('shelljs'), 'exec').andReturn({code:0});
                cordova.build(buildcb);
                expect(s.mostRecentCall.args[0].match(/android\/cordova\/debug > \/dev\/null$/)).not.toBeNull();
            });
        });
        it('should shelll out to debug command on iOS', function() {
            var buildcb = jasmine.createSpy();
            var cb = jasmine.createSpy();
            var s;

            runs(function() {
                cordova.platform('add', 'ios', cb);
            });
            waitsFor(function() { return cb.wasCalled; }, 'platform add ios callback');
            runs(function() {
                s = spyOn(require('shelljs'), 'exec').andReturn({code:0});
                cordova.build(buildcb);
            });
            waitsFor(function() { return buildcb.wasCalled; }, 'build call', 20000);
            runs(function() {
                expect(s).toHaveBeenCalled();
                expect(s.mostRecentCall.args[0].match(/ios\/cordova\/debug > \/dev\/null$/)).not.toBeNull();
            });
        });
    });

    describe('before each run it should interpolate config.xml app metadata', function() {
        var cfg;
        beforeEach(function() {
            cordova.create(tempDir);
            process.chdir(tempDir);
            cfg = config_parser(path.join(tempDir, 'www', 'config.xml'));
        });

        afterEach(function() {
            process.chdir(cwd);
        });

        describe('into Android builds', function() {
          it('should interpolate app name', function () {
              /*
              var buildcb = jasmine.createSpy();
              var cb = jasmine.createSpy();
              var newName = "devil ether";

              runs(function() {
                  cordova.platform('add', 'android', cb);
              });
              waitsFor(function() { return cb.wasCalled; }, 'platform add android callback');

              runs(function() {
                  cfg.name(newName); // set a new name in the config.xml
                  cordova.build(buildcb);
              });
              waitsFor(function() { return buildcb.wasCalled; }, 'build call', 20000);
              runs(function() {
                  // TODO
              });
              */
          });
          it('should interpolate package name');
        });
        describe('into iOS builds', function() {
          it('should interpolate app name');
          it('should interpolate package name');
        });
    });
});
