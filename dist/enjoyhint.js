'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EnjoyHint = function () {
  function EnjoyHint(_options) {
    _classCallCheck(this, EnjoyHint);

    var defaults = {
      onStart: function onStart() {},
      onEnd: function onEnd() {},
      onSkip: function onSkip() {},
      onNext: function onNext() {},


      container: 'body',

      animation_time: 800,
      backdrop_color: 'rgba(0,0,0,0.6)'
    };

    this.options = _jquery2.default.extend(defaults, _options);

    this.data = [];
    this.currentStep = 0;

    this.$eventElement = null;
    this.$body = (0, _jquery2.default)(this.options.container);

    this.init();
  }

  /** ******************* PRIVATE METHODS ************************************** */

  _createClass(EnjoyHint, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if ((0, _jquery2.default)('.enjoyhint')) {
        (0, _jquery2.default)('.enjoyhint').remove();
      }

      this.$body.enjoyhint({
        onNextClick: function onNextClick() {
          _this.nextStep();
        },

        onSkipClick: function onSkipClick() {
          _this.options.onSkip();
          _this.skipAll();
        },

        animation_time: this.options.animation_time,
        backdrop_color: this.options.backdrop_color
      });

      (0, _jquery2.default)(window).on('resize.enjoy_hint_permanent', function () {
        if (_this.$eventElement[0]) {
          _this.$body.enjoyhint('redo_events_near_rect', _this.$eventElement[0].getBoundingClientRect());
        }
      });
    }
  }, {
    key: 'destroyEnjoy',
    value: function destroyEnjoy() {
      this.options.onEnd();
      this.$body.enjoyhint('clear');
      this.$body.enjoyhint('hide');
      this.$body.css({ overflow: 'auto' });
      (0, _jquery2.default)(document).off('touchmove', EnjoyHint.lockTouch);
    }
  }, {
    key: 'clear',
    value: function clear() {
      var $nextBtn = (0, _jquery2.default)('.enjoyhint_next_btn');
      var $skipBtn = (0, _jquery2.default)('.enjoyhint_skip_btn');

      $nextBtn.removeClass(this.nextUserClass);
      $nextBtn.text('Next');
      $skipBtn.removeClass(this.skipUserClass);
      $skipBtn.text('Skip');
    }
  }, {
    key: 'stepAction',
    value: function stepAction() {
      var _this2 = this;

      if (!(this.data && this.data[this.currentStep])) {
        this.destroyEnjoy();
        return;
      }

      this.options.onNext();

      var $enjoyhint = (0, _jquery2.default)('.enjoyhint');

      $enjoyhint.removeClass('enjoyhint-step-' + this.currentStep);
      $enjoyhint.removeClass('enjoyhint-step-' + (this.currentStep + 1));
      $enjoyhint.addClass('enjoyhint-step-' + (this.currentStep + 1));

      var stepData = this.data[this.currentStep];

      if (stepData.onBeforeStart && typeof stepData.onBeforeStart === 'function') {
        stepData.onBeforeStart();
      }

      var timeout = stepData.timeout || 0;

      setTimeout(function () {
        if (!stepData.selector) {
          Object.keys(stepData).forEach(function (prop) {
            if (prop.split(' ')[1]) {
              var tempEvent = '';

              var _prop$split = prop.split(' ');

              var _prop$split2 = _slicedToArray(_prop$split, 2);

              tempEvent = _prop$split2[0];
              stepData.selector = _prop$split2[1];


              if (tempEvent === 'next' || tempEvent === 'auto' || tempEvent === 'custom') {
                stepData.event_type = tempEvent;
              } else {
                stepData.event = tempEvent;
              }

              stepData.description = stepData[prop];
            }
          });
        }

        setTimeout(function () {
          _this2.clear();
        }, 250);

        _this2.$body.scrollTo(stepData.selector, stepData.scrollAnimationSpeed || 250, { offset: -100 });

        setTimeout(function () {
          var $element = (0, _jquery2.default)(stepData.selector);
          var eventName = EnjoyHint.makeEventName(stepData.event);

          _this2.$body.enjoyhint('show');
          _this2.$body.enjoyhint('hideNext');
          _this2.$eventElement = $element;

          if (stepData.event_selector) {
            _this2.$eventElement = (0, _jquery2.default)(stepData.event_selector);
          }

          if (!stepData.event_type && stepData.event === 'key') {
            $element.keydown(function (event) {
              if (event.which === stepData.keyCode) {
                _this2.currentStep += 1;
                _this2.stepAction();
              }
            });
          }

          if (stepData.showNext === true) {
            _this2.$body.enjoyhint('showNext');
          }

          if (stepData.showSkip === false) {
            _this2.$body.enjoyhint('hideSkip');
          } else {
            _this2.$body.enjoyhint('showSkip');
          }

          if (stepData.nextButton) {
            var $nextBtn = (0, _jquery2.default)('.enjoyhint_next_btn');

            $nextBtn.addClass(stepData.nextButton.className || '');
            $nextBtn.text(stepData.nextButton.text || 'Next');
            _this2.nextUserClass = stepData.nextButton.className;
          }

          if (stepData.skipButton) {
            var $skipBtn = (0, _jquery2.default)('.enjoyhint_skip_btn');

            $skipBtn.addClass(stepData.skipButton.className || '');
            $skipBtn.text(stepData.skipButton.text || 'Skip');
            _this2.skipUserClass = stepData.skipButton.className;
          }

          if (stepData.event_type) {
            switch (stepData.event_type) {
              case 'auto':
                $element[stepData.event]();

                _this2.currentStep += 1;
                _this2.stepAction();

                return;

              case 'custom':
                _this2.on(stepData.event, function () {
                  _this2.currentStep += 1;
                  _this2.off(stepData.event);
                  _this2.stepAction();
                });
                break;

              case 'next':
                _this2.$body.enjoyhint('showNext');
                break;

              default:
                break;
            }
          } else {
            _this2.$eventElement.on(eventName, function (e) {
              if (stepData.keyCode && e.keyCode !== stepData.keyCode) {
                return;
              }

              _this2.currentStep += 1;
              (0, _jquery2.default)(_this2).off(eventName);

              _this2.stepAction(); // clicked
            });
          }

          var updateShapeData = function updateShapeData() {
            $element = (0, _jquery2.default)(stepData.selector);

            var rect = $element[0].getBoundingClientRect();
            var w = rect.width;
            var h = rect.height;
            var maxHabarites = Math.max(w, h);
            var radius = stepData.radius || Math.round(maxHabarites / 2) + 5;
            var offset = $element.offset();
            var shapeMargin = stepData.margin !== undefined ? stepData.margin : 10;

            var coords = {
              x: offset.left + Math.round(w / 2),
              y: offset.top + Math.round(h / 2) - (0, _jquery2.default)(document).scrollTop()
            };

            var shapeData = {
              enjoyHintElementSelector: stepData.selector,
              centerX: coords.x,
              centerY: coords.y,
              text: stepData.description,
              top: stepData.top,
              bottom: stepData.bottom,
              left: stepData.left,
              right: stepData.right,
              margin: stepData.margin,
              scroll: stepData.scroll
            };

            if (stepData.shape && stepData.shape === 'circle') {
              shapeData.shape = 'circle';
              shapeData.radius = radius;
            } else {
              shapeData.radius = 0;
              shapeData.width = w + shapeMargin;
              shapeData.height = h + shapeMargin;
            }
            return shapeData;
          };
          var updatedShapeData = updateShapeData();

          _this2.$body.enjoyhint('renderLabelWithShape', updatedShapeData, _this2.stop, updateShapeData);

          if (stepData.event === 'next') {
            _this2.$body.enjoyhint('disableElementEvents');
          }
        }, stepData.scrollAnimationSpeed + 20 || 270);
      }, timeout);
    }
  }, {
    key: 'nextStep',
    value: function nextStep() {
      this.currentStep += 1;
      this.stepAction();
    }
  }, {
    key: 'skipAll',
    value: function skipAll() {
      var stepData = this.data[this.currentStep];
      var $element = (0, _jquery2.default)(stepData.selector);

      this.off(stepData.event);
      $element.off(EnjoyHint.makeEventName(stepData.event));
      $element.off(EnjoyHint.makeEventName(stepData.event), true);

      this.destroyEnjoy();
    }
  }, {
    key: 'on',
    value: function on(eventName, callback) {
      this.$body.on(EnjoyHint.makeEventName(eventName, true), callback);
    }
  }, {
    key: 'off',
    value: function off(eventName) {
      this.$body.off(EnjoyHint.makeEventName(eventName, true));
    }

    /** ******************* PUBLIC METHODS ************************************** */

  }, {
    key: 'stop',
    value: function stop() {
      this.skipAll();
    }
  }, {
    key: 'reRunScript',
    value: function reRunScript(cs) {
      this.currentStep = cs;
      this.stepAction();
    }
  }, {
    key: 'runScript',
    value: function runScript() {
      this.$body.css({ overflow: 'hidden' });
      (0, _jquery2.default)(document).on('touchmove', EnjoyHint.lockTouch);

      this.currentStep = 0;
      this.options.onStart();
      this.stepAction();
    }
  }, {
    key: 'resumeScript',
    value: function resumeScript() {
      this.stepAction();
    }
  }, {
    key: 'setCurrentStep',
    value: function setCurrentStep(cs) {
      this.currentStep = cs;
    }
  }, {
    key: 'getCurrentStep',
    value: function getCurrentStep() {
      return this.currentStep;
    }
  }, {
    key: 'trigger',
    value: function trigger(eventName) {
      switch (eventName) {
        case 'next':
          this.nextStep();
          break;

        case 'skip':
          this.skipAll();
          break;

        // Trigger a custom event
        default:
          this.$body.trigger(EnjoyHint.makeEventName(eventName, true));
          break;
      }
    }
  }, {
    key: 'setScript',
    value: function setScript(_data) {
      if (_data) {
        this.data = _data;
      }
    }

    // support deprecated API methods

  }, {
    key: 'set',
    value: function set(_data) {
      this.setScript(_data);
    }
  }, {
    key: 'setSteps',
    value: function setSteps(_data) {
      this.setScript(_data);
    }
  }, {
    key: 'run',
    value: function run() {
      this.runScript();
    }
  }, {
    key: 'resume',
    value: function resume() {
      this.resumeScript();
    }
  }], [{
    key: 'lockTouch',
    value: function lockTouch(e) {
      e.preventDefault();
    }
  }, {
    key: 'makeEventName',
    value: function makeEventName(name, isCustom) {
      return name + (isCustom ? 'custom' : '') + '.enjoy_hint';
    }
  }]);

  return EnjoyHint;
}();

exports.default = EnjoyHint;
;'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

require('jquery.scrollto');

var _kinetic = require('kinetic');

var _kinetic2 = _interopRequireDefault(_kinetic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
  var newR = r;
  if (w < 2 * newR) newR = w / 2;
  if (h < 2 * newR) newR = h / 2;
  this.beginPath();
  this.moveTo(x + newR, y);
  this.arcTo(x + w, y, x + w, y + h, newR);
  this.arcTo(x + w, y + h, x, y + h, newR);
  this.arcTo(x, y + h, x, y, newR);
  this.arcTo(x, y, x + w, y, newR);
  this.closePath();
  return this;
};

// let originalLabelLeft;
// let originalLabelTop;
// let originalArrowLeft;
// let originalArrowTop;
// let originalCenterX;
// let originalCenterY;
// let originalSkipbuttonLeft;
// let originalSkipbuttonTop;
// let prevWindowWidth;
// let prevWindowHeight;
// let originalWidth = window.innerWidth;
// let originalHeight = window.innerHeight;

var methods = {
  init: function init(options) {
    var _this = this;

    var defaults = {
      onNextClick: function onNextClick() {},
      onSkipClick: function onSkipClick() {},

      animation_time: 800,
      backdrop_color: 'rgba(0,0,0,0.6)'
    };

    return this.each(function () {
      _this.enjoyhintObj = {};
      var that = _this.enjoyhintObj;

      // that.resetComponentStuff = () => {
      //   originalLabelLeft = null;
      //   originalLabelTop = null;
      //   originalArrowLeft = null;
      //   originalArrowTop = null;
      //   originalCenterX = null;
      //   originalCenterY = null;
      //   originalSkipbuttonLeft = null;
      //   originalSkipbuttonTop = null;
      //   prevWindowWidth = null;
      //   prevWindowHeight = null;
      //   originalWidth = window.innerWidth;
      //   originalHeight = window.innerHeight;
      // };

      var $that = (0, _jquery2.default)(_this);
      that.options = _jquery2.default.extend(defaults, options);

      // general classes
      that.gcl = {
        chooser: 'enjoyhint'
      };

      // classes
      that.cl = {
        enjoy_hint: 'enjoyhint',
        hide: 'enjoyhint_hide',
        disable_events_element: 'enjoyhint_disable_events',
        btn: 'enjoyhint_btn',
        skip_btn: 'enjoyhint_skip_btn',
        close_btn: 'enjoyhint_close_btn',
        next_btn: 'enjoyhint_next_btn',
        main_canvas: 'enjoyhint_canvas',
        main_svg: 'enjoyhint_svg',
        svg_wrapper: 'enjoyhint_svg_wrapper',
        svg_transparent: 'enjoyhint_svg_transparent',
        kinetic_container: 'kinetic_container'
      };

      function makeSVG(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);

        Object.keys(attrs || {}).forEach(function (key) {
          el.setAttribute(key, attrs[key]);
        });

        return el;
      }

      // =======================================================================
      // ========================---- enjoyhint ----==============================
      // =======================================================================

      that.canvasSize = {
        w: (0, _jquery2.default)(window).width() * 1.4,
        h: (0, _jquery2.default)(window).height() * 1.4
      };

      var canvasId = 'enj_canvas';

      that.enjoyhint = (0, _jquery2.default)('<div>', { class: that.cl.enjoy_hint + ' ' + that.cl.svg_transparent }).appendTo($that);
      that.enjoyhintSvgWrapper = (0, _jquery2.default)('<div>', { class: that.cl.svg_wrapper + ' ' + that.cl.svg_transparent }).appendTo(that.enjoyhint);
      that.$stageContainer = (0, _jquery2.default)('<div id="' + that.cl.kinetic_container + '">').appendTo(that.enjoyhint);
      that.$canvas = (0, _jquery2.default)('<canvas id="' + canvasId + '" width="' + that.canvasSize.w + '" height="' + that.canvasSize.h + '" class="' + that.cl.main_canvas + '">').appendTo(that.enjoyhint);
      that.$svg = (0, _jquery2.default)('<svg width="' + that.canvasSize.w + '" height="' + that.canvasSize.h + '" class="' + that.cl.main_canvas + ' ' + that.cl.main_svg + '">').appendTo(that.enjoyhintSvgWrapper);

      var defs = (0, _jquery2.default)(makeSVG('defs'));
      var marker = (0, _jquery2.default)(makeSVG('marker', {
        id: 'arrowMarker', viewBox: '0 0 36 21', refX: '21', refY: '10', markerUnits: 'strokeWidth', orient: 'auto', markerWidth: '16', markerHeight: '12'
      }));
      var polilyne = (0, _jquery2.default)(makeSVG('path', { style: 'fill:none; stroke:rgb(255,255,255); stroke-width:2', d: 'M0,0 c30,11 30,9 0,20' }));

      defs.append(marker.append(polilyne)).appendTo(that.$svg);

      that.kineticStage = new _kinetic2.default.Stage({
        container: that.cl.kinetic_container,
        width: that.canvasSize.w,
        height: that.canvasSize.h,
        scaleX: 1
      });

      that.layer = new _kinetic2.default.Layer();
      that.rect = new _kinetic2.default.Rect({
        fill: that.options.backdrop_color,
        width: that.canvasSize.w,
        height: that.canvasSize.h
      });

      var $topDisEvents = (0, _jquery2.default)('<div>', { class: that.cl.disable_events_element }).appendTo(that.enjoyhint);
      var $bottomDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);
      var $leftDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);
      var $rightDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);
      that.$elementDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);

      var stopPropagation = function stopPropagation(e) {
        e.stopImmediatePropagation();
      };

      (0, _jquery2.default)('button').focusout(stopPropagation);
      $topDisEvents.click(stopPropagation);
      $bottomDisEvents.click(stopPropagation);
      $leftDisEvents.click(stopPropagation);
      $rightDisEvents.click(stopPropagation);
      that.$elementDisEvents.click(stopPropagation);

      that.$skip_btn = (0, _jquery2.default)('<div>', { class: that.cl.skip_btn }).appendTo(that.enjoyhint).html('Skip').click(function () {
        that.hide();
        that.options.onSkipClick();
      });
      that.$next_btn = (0, _jquery2.default)('<div>', { class: that.cl.next_btn }).appendTo(that.enjoyhint).html('Next').click(function () {
        that.options.onNextClick();
      });

      that.$close_btn = (0, _jquery2.default)('<div>', { class: that.cl.close_btn }).appendTo(that.enjoyhint).html('').click(function () {
        that.hide();
        that.options.onSkipClick();
      });

      that.$canvas.mousedown(function (e) {
        (0, _jquery2.default)('canvas').css({ left: '4000px' });

        var BottomElement = document.elementFromPoint(e.clientX, e.clientY);
        (0, _jquery2.default)('canvas').css({ left: '0px' });

        (0, _jquery2.default)(BottomElement).click();

        return false;
      });

      var circleR = 0;
      var shapeInitShift = 130;

      that.shape = new _kinetic2.default.Shape({
        radius: circleR,
        centerX: -shapeInitShift,
        centerY: -shapeInitShift,
        width: 0,
        height: 0,
        sceneFunc: function sceneFunc() /* context */{
          var ctx = this.getContext('2d')._context; // eslint-disable-line no-underscore-dangle
          // const { pos } = this;
          var defComp = ctx.globalCompositeOperation;
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();

          var x = this.attrs.centerX - Math.round(this.attrs.width / 2);
          var y = this.attrs.centerY - Math.round(this.attrs.height / 2);
          ctx.roundRect(x, y, this.attrs.width, this.attrs.height, this.attrs.radius);
          ctx.fillStyle = 'red';
          ctx.fill();

          ctx.globalCompositeOperation = defComp;
        }
      });

      that.shape.radius = circleR;
      that.layer.add(that.rect);
      that.layer.add(that.shape);
      that.kineticStage.add(that.layer);

      (0, _jquery2.default)(window).on('resize.enjoy_hint', function () {
        if (!(0, _jquery2.default)(that.stepData.enjoyHintElementSelector).is(':visible')) {
          that.stopFunction();
          (0, _jquery2.default)(window).off('resize.enjoy_hint');
          return;
        }

        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        that.kineticStage.setAttr('width', newWidth);
        that.kineticStage.setAttr('height', newHeight);

        that.rect = new _kinetic2.default.Rect({
          fill: that.options.backdrop_color,
          width: newWidth,
          height: newHeight
        });

        that.layer.removeChildren();
        that.layer.add(that.rect);
        that.layer.add(that.shape);
        that.layer.draw();
        that.kineticStage.draw();

        that.renderLabelWithShape(that.updateShapeData());
      });

      // const enjoyhintElements = [
      //   that.enjoyhint,
      //   $topDisEvents,
      //   $bottomDisEvents,
      //   $leftDisEvents,
      //   $rightDisEvents,
      //   that.$elementDisEvents,
      // ];

      that.show = function show() {
        that.enjoyhint.removeClass(that.cl.hide);
      };

      that.hide = function hide() {
        that.enjoyhint.addClass(that.cl.hide);

        var tween = new _kinetic2.default.Tween({
          node: that.shape,
          duration: 0.002,
          centerX: -shapeInitShift,
          centerY: -shapeInitShift
        });

        tween.play();
      };

      that.hide();

      that.hideNextBtn = function hideNextBtn() {
        that.$next_btn.addClass(that.cl.hide);
        that.nextBtn = 'hide';
      };

      that.showNextBtn = function showNextBtn() {
        that.$next_btn.removeClass(that.cl.hide);
        that.nextBtn = 'show';
      };

      that.hideSkipBtn = function hideSkipBtn() {
        that.$skip_btn.addClass(that.cl.hide);
      };

      that.showSkipBtn = function showSkipBtn() {
        that.$skip_btn.removeClass(that.cl.hide);
      };

      that.disableEventsOfRect = function disableEventsOfRect() {
        that.$elementDisEvents.show();
      };

      that.renderCircle = function renderCircle(data) {
        var r = data.r || 0;
        var x = data.x || 0;
        var y = data.y || 0;

        var tween = new _kinetic2.default.Tween({
          node: that.shape,
          duration: 0.2,
          centerX: x,
          centerY: y,
          width: r * 2,
          height: r * 2,
          radius: r
        });

        tween.play();

        var left = x - r;
        var right = x + r;
        var top = y - r;
        var bottom = y + r;
        var margin = 20;

        return {
          x: x,
          y: y,
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          conn: {
            left: {
              x: left - margin,
              y: y
            },
            right: {
              x: right + margin,
              y: y
            },
            top: {
              x: x,
              y: top - margin
            },
            bottom: {
              x: x,
              y: bottom + margin
            }
          }
        };
      };

      that.renderRect = function renderRect(data, timeout) {
        var r = data.r || 0;
        var x = data.x || 0;
        var y = data.y || 0;
        var w = data.w || 0;
        var h = data.h || 0;
        var margin = 20;

        var tween = new _kinetic2.default.Tween({
          node: that.shape,
          duration: timeout,
          centerX: x,
          centerY: y,
          width: w,
          height: h,
          radius: r
        });

        tween.play();

        var halfWidth = Math.round(w / 2);
        var halfHeight = Math.round(h / 2);
        var left = x - halfWidth;
        var right = x + halfWidth;
        var top = y - halfHeight;
        var bottom = y + halfHeight;

        return {
          x: x,
          y: y,
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          conn: {
            left: {
              x: left - margin,
              y: y
            },
            right: {
              x: right + margin,
              y: y
            },
            top: {
              x: x,
              y: top - margin
            },
            bottom: {
              x: x,
              y: bottom + margin
            }
          }
        };
      };

      that.renderLabel = function renderLabel(data) {
        var x = data.x || 0;
        that.originalElementX = x;
        var y = data.y || 0;
        // const text = data.text || 0;

        var label = that.getLabelElement({
          x: x,
          y: y,
          text: data.text
        });

        var labelWidth = label.width();
        var labelHeight = label.height();
        var labelLeft = label.offset().left;
        var labelRight = label.offset().left + labelWidth;
        var labelTop = label.offset().top - (0, _jquery2.default)(document).scrollTop();
        var labelBottom = label.offset().top + labelHeight;

        var margin = 10;

        var connLeft = {
          x: labelLeft - margin,
          y: labelTop + Math.round(labelHeight / 2)
        };

        var connRight = {
          x: labelRight + margin,
          y: labelTop + Math.round(labelHeight / 2)
        };

        var connTop = {
          x: labelLeft + Math.round(labelWidth / 2),
          y: labelTop - margin
        };

        var connBottom = {
          x: labelLeft + Math.round(labelWidth / 2),
          y: labelBottom + margin
        };

        label.detach();

        setTimeout(function () {
          (0, _jquery2.default)('#enjoyhint_label').remove();
          label.appendTo(that.enjoyhint);
        }, that.options.animation_time / 2);

        return {
          label: label,
          left: labelLeft,
          right: labelRight,
          top: labelTop,
          bottom: labelBottom,
          conn: {
            left: connLeft,
            right: connRight,
            top: connTop,
            bottom: connBottom
          }

        };
      };

      that.renderArrow = function renderArrow(data) {
        var _data$xFrom = data.xFrom,
            xFrom = _data$xFrom === undefined ? 0 : _data$xFrom,
            _data$yFrom = data.yFrom,
            yFrom = _data$yFrom === undefined ? 0 : _data$yFrom,
            _data$xTo = data.xTo,
            xTo = _data$xTo === undefined ? 0 : _data$xTo,
            _data$yTo = data.yTo,
            yTo = _data$yTo === undefined ? 0 : _data$yTo,
            byTopSide = data.byTopSide;


        var controlPointX = 0;
        var controlPointY = 0;

        if (window.innerWidth >= 640) {
          if (byTopSide) {
            if (yFrom >= yTo) {
              controlPointY = yTo;
              controlPointX = xFrom;
            } else {
              controlPointY = yFrom;
              controlPointX = xTo;
            }
          } else if (yFrom >= yTo) {
            controlPointY = yFrom;
            controlPointX = xTo;
          } else {
            controlPointY = yTo;
            controlPointX = xFrom;
          }
        }

        // const text = data.text || '';
        that.enjoyhint.addClass(that.cl.svg_transparent);

        setTimeout(function () {
          (0, _jquery2.default)('#enjoyhint_arrow_line').remove();

          var d = 'M' + xFrom + ',' + yFrom + ' Q' + controlPointX + ',' + controlPointY + ' ' + xTo + ',' + yTo;
          that.$svg.append(makeSVG('path', {
            style: 'fill:none; stroke:rgb(255,255,255); stroke-width:3', 'marker-end': 'url(#arrowMarker)', d: d, id: 'enjoyhint_arrow_line'
          }));
          that.enjoyhint.removeClass(that.cl.svg_transparent);
        }, that.options.animation_time / 2);
      };

      that.getLabelElement = function getLabelElement(data) {
        return (0, _jquery2.default)('<div>', { class: 'enjoy_hint_label', id: 'enjoyhint_label' }).css({
          top: data.y + 'px',
          left: data.x + 'px'
        }).html(data.text).appendTo(that.enjoyhint);
      };

      that.disableEventsNearRect = function disableEventsNearRect(rect) {
        $topDisEvents.css({
          top: '0',
          left: '0'
        }).height(rect.top);

        $bottomDisEvents.css({
          top: rect.bottom + 'px',
          left: '0'
        });

        $leftDisEvents.css({
          top: '0',
          left: 0 + 'px'
        }).width(rect.left);

        $rightDisEvents.css({
          top: '0',
          left: rect.right + 'px'
        });

        that.$elementDisEvents.css({
          top: rect.top + 'px',
          left: rect.left + 'px'
        }).width(rect.right - rect.left).height(rect.bottom - rect.top).hide();
      };

      _jquery2.default.event.special.destroyed = {
        remove: function remove(o) {
          if (o.handler) {
            o.handler();
          }
        }
      };

      that.renderLabelWithShape = function renderLabelWithShape(dataParam) {
        var data = dataParam;
        that.stepData = data;

        function findParentDialog(element) {
          if (element.tagName === 'MD-DIALOG') {
            return element;
          }if (typeof element.tagName === 'undefined') {
            return null;
          }

          return findParentDialog((0, _jquery2.default)(element).parent()[0]);
        }

        var dialog = findParentDialog((0, _jquery2.default)(that.stepData.enjoyHintElementSelector)[0]);

        if (dialog != null) {
          (0, _jquery2.default)(dialog).on('dialogClosing', function () {
            that.stopFunction();
          });
        }

        // that.resetComponentStuff();

        var shapeType = data.shape || 'rect';
        var shapeData = {};

        var halfWidth = 0;
        var halfHeight = 0;

        var shapeOffsets = {
          top: data.top || 0,
          bottom: data.bottom || 0,
          left: data.left || 0,
          right: data.right || 0
        };

        var sidesPos = void 0;
        var width = void 0;
        var height = void 0;
        var newHalfWidth = void 0;
        var newHalfHeight = void 0;

        switch (shapeType) {
          case 'circle':
            halfWidth = data.radius;
            halfHeight = data.radius;

            sidesPos = {
              top: data.centerY - halfHeight + shapeOffsets.top,
              bottom: data.centerY + halfHeight - shapeOffsets.bottom,
              left: data.centerX - halfWidth + shapeOffsets.left,
              right: data.centerX + halfWidth - shapeOffsets.right
            };

            width = sidesPos.right - sidesPos.left;
            height = sidesPos.bottom - sidesPos.top;
            data.radius = Math.round(Math.min(width, height) / 2);

            // new half habarites
            halfWidth = Math.round(data.radius / 2);
            halfHeight = halfWidth;

            newHalfWidth = Math.round(width / 2);
            newHalfHeight = Math.round(height / 2);

            // new centerX and centerY
            data.centerX = sidesPos.left + newHalfWidth;
            data.centerY = sidesPos.top + newHalfHeight;

            shapeData = that.renderCircle({
              x: data.centerX,
              y: data.centerY,
              r: data.radius
            });
            break;

          case 'rect':
            halfWidth = Math.round(data.width / 2);
            halfHeight = Math.round(data.height / 2);

            sidesPos = {
              top: data.centerY - halfHeight + shapeOffsets.top,
              bottom: data.centerY + halfHeight - shapeOffsets.bottom,
              left: data.centerX - halfWidth + shapeOffsets.left,
              right: data.centerX + halfWidth - shapeOffsets.right
            };

            data.width = sidesPos.right - sidesPos.left;
            data.height = sidesPos.bottom - sidesPos.top;

            halfWidth = Math.round(data.width / 2);
            halfHeight = Math.round(data.height / 2);

            // new centerX and centerY
            data.centerX = sidesPos.left + halfWidth;
            data.centerY = sidesPos.top + halfHeight;

            shapeData = that.renderRect({
              x: data.centerX,
              y: data.centerY,
              w: data.width,
              h: data.height,
              r: data.radius
            }, 0.2);
            break;

          default:
            break;
        }

        var bodySize = {
          w: that.enjoyhint.width(),
          h: that.enjoyhint.height()
        };

        var label = that.getLabelElement({
          x: 0,
          y: 0,
          text: data.text
        });

        var labelWidth = label.outerWidth();
        var labelHeight = label.outerHeight();
        label.remove();
        var topOffset = data.centerY - halfHeight;
        var bottomOffset = bodySize.h - (data.centerY + halfHeight);
        // const leftOffset = data.centerX - halfWidth;
        // const rightOffset = bodySize.w - (data.centerX + halfWidth);

        // const labelHorSide = (bodySize.w - data.centerX) < data.centerX ? 'left' : 'right';
        var labelVerSide = bodySize.h - data.centerY < data.centerY ? 'top' : 'bottom';
        var labelShift = 150;
        var labelMargin = 40;
        // const labelShiftWithLabelWidth = labelShift + labelWidth + labelMargin;
        var labelShiftWithLabelHeight = labelShift + labelHeight + labelMargin;
        // const labelHorOffset = halfWidth + labelShift;
        var labelVerOffset = halfHeight + labelShift;

        // original: let labelX = (labelHorSide == 'left')
        //   ? data.centerX - labelHorOffset - labelWidth
        //   : data.centerX + labelHorOffset;
        var labelY = labelVerSide === 'top' ? data.centerY - labelVerOffset - labelHeight : data.centerY + labelVerOffset;
        var labelX = window.innerWidth / 2 - labelWidth / 2;

        if (topOffset < labelShiftWithLabelHeight && bottomOffset < labelShiftWithLabelHeight) {
          labelY = data.centerY + labelMargin;
        }

        // if (window.innerWidth <= 640) {
        // }

        var labelData = that.renderLabel({
          x: labelX,
          y: labelY,
          text: data.text
        });

        that.$next_btn.css({
          left: labelX,
          top: labelY + labelHeight + 20
        });

        var leftSkip = labelX + that.$next_btn.width() + 10;

        if (that.nextBtn === 'hide') {
          leftSkip = labelX;
        }

        that.$skip_btn.css({
          left: leftSkip,
          top: labelY + labelHeight + 20
        });

        that.$close_btn.css({
          right: 10,
          top: 10
        });

        that.disableEventsNearRect({
          top: shapeData.top,
          bottom: shapeData.bottom,
          left: shapeData.left,
          right: shapeData.right
        });

        // const xTo = 0;
        // const yTo = 0;
        var arrowSide = false;
        var connLabelSide = 'left';
        var connCircleSide = 'left';

        var isCenter = labelData.left <= shapeData.x && labelData.right >= shapeData.x;
        var isLeft = labelData.right < shapeData.x;
        // const isRight = (labelData.left > shapeData.x);

        // const isAbsLeft = (labelData.right < shapeData.left);
        // const isAbsRight = (labelData.left > shapeData.right);

        var isTop = labelData.bottom < shapeData.top;
        var isBottom = labelData.top > shapeData.bottom;
        var isMid = labelData.bottom >= shapeData.y && labelData.top <= shapeData.y;
        var isMidTop = labelData.bottom <= shapeData.y && !isTop;
        var isMidBottom = labelData.top >= shapeData.y && !isBottom;

        function setArrowData(labelSideParam, circleSideParam, arrowSideParam) {
          connLabelSide = labelSideParam;
          connCircleSide = circleSideParam;
          arrowSide = arrowSideParam;
        }

        function sideStatements(topSide, midTopSide, midSide, midBottomSide, bottomSide) {
          var statement = [];

          if (isTop) {
            statement = topSide;
          } else if (isMidTop) {
            statement = midTopSide;
          } else if (isMid) {
            statement = midSide;
          } else if (isMidBottom) {
            statement = midBottomSide;
          } else {
            // bottom
            statement = bottomSide;
          }

          if (statement) {
            setArrowData(statement[0], statement[1], statement[2]);
          }
        }

        if (isCenter) {
          if (isTop) {
            setArrowData('bottom', 'top', 'top');
          } else if (isBottom) {
            setArrowData('top', 'bottom', 'bottom');
          } else {
            return;
          }
        } else if (isLeft) {
          sideStatements(['right', 'top', 'top'], // top
          ['bottom', 'left', 'bottom'], // mid_top
          ['right', 'left', 'top'], // mid
          ['top', 'left', 'top'], // mid_bot
          ['right', 'bottom', 'bottom'] // bot
          );
        } else {
          // right
          sideStatements(['left', 'top', 'top'], // top
          ['bottom', 'right', 'bottom'], // mid_top
          ['left', 'right', 'top'], // mid
          ['top', 'right', 'top'], // mid_bot
          ['left', 'bottom', 'bottom'] // bot
          );
        }

        var labelConnCoordinates = labelData.conn[connLabelSide];
        var circleConnCoordinates = shapeData.conn[connCircleSide];
        var byTopSide = arrowSide === 'top';

        that.renderArrow({
          xFrom: labelConnCoordinates.x,
          yFrom: labelConnCoordinates.y,
          xTo: window.innerWidth < 640 ? shapeData.left + (shapeData.left > 0) : circleConnCoordinates.x,
          yTo: window.innerWidth < 640 ? shapeData.conn.left.y : circleConnCoordinates.y,
          byTopSide: byTopSide
        });
      };

      that.clear = function clear() {
        (0, _jquery2.default)('#enjoyhint_arrow_line').remove();
        (0, _jquery2.default)('#enjoyhint_label').remove();
        (0, _jquery2.default)(window).off('resize.enjoy_hint');
      };

      return _this;
    });
  },
  set: function set(val) {
    var _this2 = this;

    this.each(function () {
      _this2.enjoyhintObj.setValue(val);
    });

    return this;
  },
  show: function show() {
    var _this3 = this;

    this.each(function () {
      _this3.enjoyhintObj.show();
    });

    return this;
  },
  hide: function hide() {
    var _this4 = this;

    this.each(function () {
      _this4.enjoyhintObj.hide();
    });

    return this;
  },
  hideNext: function hideNext() {
    var _this5 = this;

    this.each(function () {
      _this5.enjoyhintObj.hideNextBtn();
    });

    return this;
  },
  showNext: function showNext() {
    var _this6 = this;

    this.each(function () {
      _this6.enjoyhintObj.showNextBtn();
    });

    return this;
  },
  hideSkip: function hideSkip() {
    var _this7 = this;

    this.each(function () {
      _this7.enjoyhintObj.hideSkipBtn();
    });

    return this;
  },
  showSkip: function showSkip() {
    var _this8 = this;

    this.each(function () {
      _this8.enjoyhintObj.showSkipBtn();
    });

    return this;
  },
  renderCircle: function renderCircle(x, y, r) {
    var _this9 = this;

    this.each(function () {
      _this9.enjoyhintObj.renderCircle(x, y, r);
    });

    return this;
  },
  renderLabel: function renderLabel(x, y, r) {
    var _this10 = this;

    this.each(function () {
      _this10.enjoyhintObj.renderLabel(x, y, r);
    });

    return this;
  },
  renderLabelWithShape: function renderLabelWithShape(data, stopFunction, updateShapeData) {
    var _this11 = this;

    this.each(function () {
      _this11.enjoyhintObj.stopFunction = stopFunction;
      _this11.enjoyhintObj.updateShapeData = updateShapeData;
      _this11.enjoyhintObj.renderLabelWithShape(data);
    });

    return this;
  },
  redoEventsNearRect: function redoEventsNearRect(rect) {
    this.enjoyhintObj.disableEventsNearRect({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right
    });
  },
  clear: function clear() {
    var _this12 = this;

    this.each(function () {
      _this12.enjoyhintObj.clear();
    });

    return this;
  },
  close: function close() /* val */{
    var _this13 = this;

    this.each(function () {
      _this13.enjoyhintObj.closePopdown();
    });

    return this;
  },
  disableElementEvents: function disableElementEvents() {
    var _this14 = this;

    this.each(function () {
      _this14.enjoyhintObj.disableEventsOfRect();
    });

    return this;
  }
};

_jquery2.default.fn.enjoyhint = function enjoyhint(method) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (methods[method]) {
    return methods[method].apply(this, args);
  }if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
    return methods.init.apply(this, [method].concat(args));
  }

  _jquery2.default.error('Method ' + method + ' does not exist on $.numinput');

  return this;
};
