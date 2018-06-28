import $ from 'jquery';
import 'jquery.scrollto';
import Kinetic from 'kinetic';

CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
  let newR = r;
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

const methods = {

  init(options) {
    const defaults = {
      onNextClick() { },
      onSkipClick() { },
      animation_time: 800,
      backdrop_color: 'rgba(0,0,0,0.6)',
    };

    return this.each(() => {
      this.enjoyhintObj = {};
      const that = this.enjoyhintObj;

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

      const $that = $(this);
      that.options = $.extend(defaults, options);

      // general classes
      that.gcl = {
        chooser: 'enjoyhint',
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
        kinetic_container: 'kinetic_container',
      };

      function makeSVG(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);

        Object.keys(attrs || {}).forEach((key) => {
          el.setAttribute(key, attrs[key]);
        });

        return el;
      }


      // =======================================================================
      // ========================---- enjoyhint ----==============================
      // =======================================================================

      that.canvasSize = {
        w: $(window).width() * 1.4,
        h: $(window).height() * 1.4,
      };

      const canvasId = 'enj_canvas';

      that.enjoyhint = $('<div>', { class: `${that.cl.enjoy_hint} ${that.cl.svg_transparent}` }).appendTo($that);
      that.enjoyhintSvgWrapper = $('<div>', { class: `${that.cl.svg_wrapper} ${that.cl.svg_transparent}` }).appendTo(that.enjoyhint);
      that.$stageContainer = $(`<div id="${that.cl.kinetic_container}">`).appendTo(that.enjoyhint);
      that.$canvas = $(`<canvas id="${canvasId}" width="${that.canvasSize.w}" height="${that.canvasSize.h}" class="${that.cl.main_canvas}">`).appendTo(that.enjoyhint);
      that.$svg = $(`<svg width="${that.canvasSize.w}" height="${that.canvasSize.h}" class="${that.cl.main_canvas} ${that.cl.main_svg}">`).appendTo(that.enjoyhintSvgWrapper);

      const defs = $(makeSVG('defs'));
      const marker = $(makeSVG('marker', {
        id: 'arrowMarker', viewBox: '0 0 36 21', refX: '21', refY: '10', markerUnits: 'strokeWidth', orient: 'auto', markerWidth: '16', markerHeight: '12',
      }));
      const polilyne = $(makeSVG('path', { style: 'fill:none; stroke:rgb(255,255,255); stroke-width:2', d: 'M0,0 c30,11 30,9 0,20' }));

      defs.append(marker.append(polilyne)).appendTo(that.$svg);

      that.kineticStage = new Kinetic.Stage({
        container: that.cl.kinetic_container,
        width: that.canvasSize.w,
        height: that.canvasSize.h,
        scaleX: 1,
      });

      that.layer = new Kinetic.Layer();
      that.rect = new Kinetic.Rect({
        fill: that.options.backdrop_color,
        width: that.canvasSize.w,
        height: that.canvasSize.h,
      });

      const $topDisEvents = $('<div>', { class: that.cl.disable_events_element }).appendTo(that.enjoyhint);
      const $bottomDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);
      const $leftDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);
      const $rightDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);
      that.$elementDisEvents = $topDisEvents.clone().appendTo(that.enjoyhint);

      const stopPropagation = (e) => {
        e.stopImmediatePropagation();
      };

      $('button').focusout(stopPropagation);
      $topDisEvents.click(stopPropagation);
      $bottomDisEvents.click(stopPropagation);
      $leftDisEvents.click(stopPropagation);
      $rightDisEvents.click(stopPropagation);
      that.$elementDisEvents.click(stopPropagation);

      that.$skip_btn = $('<div>', { class: that.cl.skip_btn }).appendTo(that.enjoyhint).html('Skip').click(() => {
        that.hide();
        that.options.onSkipClick();
      });
      that.$next_btn = $('<div>', { class: that.cl.next_btn }).appendTo(that.enjoyhint).html('Next').click(() => {
        that.options.onNextClick();
      });

      that.$close_btn = $('<div>', { class: that.cl.close_btn }).appendTo(that.enjoyhint).html('').click(() => {
        that.hide();
        that.options.onSkipClick();
      });

      that.$canvas.mousedown((e) => {
        $('canvas').css({ left: '4000px' });

        const BottomElement = document.elementFromPoint(e.clientX, e.clientY);
        $('canvas').css({ left: '0px' });

        $(BottomElement).click();

        return false;
      });


      const circleR = 0;
      const shapeInitShift = 130;

      that.shape = new Kinetic.Shape({
        radius: circleR,
        centerX: -shapeInitShift,
        centerY: -shapeInitShift,
        width: 0,
        height: 0,
        sceneFunc(/* context */) {
          const ctx = this.getContext('2d')._context; // eslint-disable-line no-underscore-dangle
          // const { pos } = this;
          const defComp = ctx.globalCompositeOperation;
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();

          const x = this.attrs.centerX - Math.round(this.attrs.width / 2);
          const y = this.attrs.centerY - Math.round(this.attrs.height / 2);
          ctx.roundRect(x, y, this.attrs.width, this.attrs.height, this.attrs.radius);
          ctx.fillStyle = 'red';
          ctx.fill();

          ctx.globalCompositeOperation = defComp;
        },
      });

      that.shape.radius = circleR;
      that.layer.add(that.rect);
      that.layer.add(that.shape);
      that.kineticStage.add(that.layer);

      $(window).on('resize.enjoy_hint', () => {
        if (!($(that.stepData.enjoyHintElementSelector).is(':visible'))) {
          that.stopFunction();
          $(window).off('resize.enjoy_hint');
          return;
        }

        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        that.kineticStage.setAttr('width', newWidth);
        that.kineticStage.setAttr('height', newHeight);

        that.rect = new Kinetic.Rect({
          fill: that.options.backdrop_color,
          width: newWidth,
          height: newHeight,
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

        const tween = new Kinetic.Tween({
          node: that.shape,
          duration: 0.002,
          centerX: -shapeInitShift,
          centerY: -shapeInitShift,
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
        const r = data.r || 0;
        const x = data.x || 0;
        const y = data.y || 0;

        const tween = new Kinetic.Tween({
          node: that.shape,
          duration: 0.2,
          centerX: x,
          centerY: y,
          width: r * 2,
          height: r * 2,
          radius: r,
        });

        tween.play();

        const left = x - r;
        const right = x + r;
        const top = y - r;
        const bottom = y + r;
        const margin = 20;

        return {
          x,
          y,
          left,
          right,
          top,
          bottom,
          conn: {
            left: {
              x: left - margin,
              y,
            },
            right: {
              x: right + margin,
              y,
            },
            top: {
              x,
              y: top - margin,
            },
            bottom: {
              x,
              y: bottom + margin,
            },
          },
        };
      };

      that.renderRect = function renderRect(data, timeout) {
        const r = data.r || 0;
        const x = data.x || 0;
        const y = data.y || 0;
        const w = data.w || 0;
        const h = data.h || 0;
        const margin = 20;

        const tween = new Kinetic.Tween({
          node: that.shape,
          duration: timeout,
          centerX: x,
          centerY: y,
          width: w,
          height: h,
          radius: r,
        });

        tween.play();

        const halfWidth = Math.round(w / 2);
        const halfHeight = Math.round(h / 2);
        const left = x - halfWidth;
        const right = x + halfWidth;
        const top = y - halfHeight;
        const bottom = y + halfHeight;

        return {
          x,
          y,
          left,
          right,
          top,
          bottom,
          conn: {
            left: {
              x: left - margin,
              y,
            },
            right: {
              x: right + margin,
              y,
            },
            top: {
              x,
              y: top - margin,
            },
            bottom: {
              x,
              y: bottom + margin,
            },
          },
        };
      };

      that.renderLabel = function renderLabel(data) {
        const x = data.x || 0;
        that.originalElementX = x;
        const y = data.y || 0;
        // const text = data.text || 0;

        const label = that.getLabelElement({
          x,
          y,
          text: data.text,
        });

        const labelWidth = label.width();
        const labelHeight = label.height();
        const labelLeft = label.offset().left;
        const labelRight = label.offset().left + labelWidth;
        const labelTop = label.offset().top - $(document).scrollTop();
        const labelBottom = label.offset().top + labelHeight;

        const margin = 10;

        const connLeft = {
          x: labelLeft - margin,
          y: labelTop + Math.round(labelHeight / 2),
        };

        const connRight = {
          x: labelRight + margin,
          y: labelTop + Math.round(labelHeight / 2),
        };

        const connTop = {
          x: labelLeft + Math.round(labelWidth / 2),
          y: labelTop - margin,
        };

        const connBottom = {
          x: labelLeft + Math.round(labelWidth / 2),
          y: labelBottom + margin,
        };

        label.detach();

        setTimeout(() => {
          $('#enjoyhint_label').remove();
          label.appendTo(that.enjoyhint);
        }, that.options.animation_time / 2);

        return {
          label,
          left: labelLeft,
          right: labelRight,
          top: labelTop,
          bottom: labelBottom,
          conn: {
            left: connLeft,
            right: connRight,
            top: connTop,
            bottom: connBottom,
          },

        };
      };

      that.renderArrow = function renderArrow(data) {
        const {
          xFrom = 0, yFrom = 0, xTo = 0, yTo = 0, byTopSide,
        } = data;

        let controlPointX = 0;
        let controlPointY = 0;

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

        setTimeout(() => {
          $('#enjoyhint_arrow_line').remove();

          const d = `M${xFrom},${yFrom} Q${controlPointX},${controlPointY} ${xTo},${yTo}`;
          that.$svg.append(makeSVG('path', {
            style: 'fill:none; stroke:rgb(255,255,255); stroke-width:3', 'marker-end': 'url(#arrowMarker)', d, id: 'enjoyhint_arrow_line',
          }));
          that.enjoyhint.removeClass(that.cl.svg_transparent);
        }, that.options.animation_time / 2);
      };

      that.getLabelElement = function getLabelElement(data) {
        return $('<div>', { class: 'enjoy_hint_label', id: 'enjoyhint_label' })
          .css({
            top: `${data.y}px`,
            left: `${data.x}px`,
          })
          .html(data.text).appendTo(that.enjoyhint);
      };


      that.disableEventsNearRect = function disableEventsNearRect(rect) {
        $topDisEvents.css({
          top: '0',
          left: '0',
        }).height(rect.top);

        $bottomDisEvents.css({
          top: `${rect.bottom}px`,
          left: '0',
        });

        $leftDisEvents.css({
          top: '0',
          left: `${0}px`,
        }).width(rect.left);

        $rightDisEvents.css({
          top: '0',
          left: `${rect.right}px`,
        });

        that.$elementDisEvents.css({
          top: `${rect.top}px`,
          left: `${rect.left}px`,
        })
          .width(rect.right - rect.left)
          .height(rect.bottom - rect.top)
          .hide();
      };

      $.event.special.destroyed = {
        remove(o) {
          if (o.handler) {
            o.handler();
          }
        },
      };

      that.renderLabelWithShape = function renderLabelWithShape(dataParam) {
        const data = dataParam;
        that.stepData = data;

        function findParentDialog(element) {
          if (element.tagName === 'MD-DIALOG') {
            return element;
          } if (typeof element.tagName === 'undefined') {
            return null;
          }

          return findParentDialog($(element).parent()[0]);
        }

        const dialog = findParentDialog($(that.stepData.enjoyHintElementSelector)[0]);

        if (dialog != null) {
          $(dialog).on('dialogClosing', () => {
            that.stopFunction();
          });
        }

        // that.resetComponentStuff();

        const shapeType = data.shape || 'rect';
        let shapeData = {};

        let halfWidth = 0;
        let halfHeight = 0;

        const shapeOffsets = {
          top: data.top || 0,
          bottom: data.bottom || 0,
          left: data.left || 0,
          right: data.right || 0,
        };

        let sidesPos;
        let width;
        let height;
        let newHalfWidth;
        let newHalfHeight;

        switch (shapeType) {
          case 'circle':
            halfWidth = data.radius;
            halfHeight = data.radius;

            sidesPos = {
              top: data.centerY - halfHeight + shapeOffsets.top,
              bottom: data.centerY + halfHeight - shapeOffsets.bottom,
              left: data.centerX - halfWidth + shapeOffsets.left,
              right: data.centerX + halfWidth - shapeOffsets.right,
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
              r: data.radius,
            });
            break;

          case 'rect':
            halfWidth = Math.round(data.width / 2);
            halfHeight = Math.round(data.height / 2);

            sidesPos = {
              top: data.centerY - halfHeight + shapeOffsets.top,
              bottom: data.centerY + halfHeight - shapeOffsets.bottom,
              left: data.centerX - halfWidth + shapeOffsets.left,
              right: data.centerX + halfWidth - shapeOffsets.right,
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
              r: data.radius,
            }, 0.2);
            break;

          default:
            break;
        }

        const bodySize = {
          w: that.enjoyhint.width(),
          h: that.enjoyhint.height(),
        };

        const label = that.getLabelElement({
          x: 0,
          y: 0,
          text: data.text,
        });

        const labelWidth = label.outerWidth();
        const labelHeight = label.outerHeight();
        label.remove();
        const topOffset = data.centerY - halfHeight;
        const bottomOffset = bodySize.h - (data.centerY + halfHeight);
        // const leftOffset = data.centerX - halfWidth;
        // const rightOffset = bodySize.w - (data.centerX + halfWidth);

        // const labelHorSide = (bodySize.w - data.centerX) < data.centerX ? 'left' : 'right';
        const labelVerSide = (bodySize.h - data.centerY) < data.centerY ? 'top' : 'bottom';
        const labelShift = 150;
        const labelMargin = 40;
        // const labelShiftWithLabelWidth = labelShift + labelWidth + labelMargin;
        const labelShiftWithLabelHeight = labelShift + labelHeight + labelMargin;
        // const labelHorOffset = halfWidth + labelShift;
        const labelVerOffset = halfHeight + labelShift;

        // original: let labelX = (labelHorSide == 'left')
        //   ? data.centerX - labelHorOffset - labelWidth
        //   : data.centerX + labelHorOffset;
        let labelY = (labelVerSide === 'top') ? data.centerY - labelVerOffset - labelHeight : data.centerY + labelVerOffset;
        const labelX = window.innerWidth / 2 - labelWidth / 2;

        if (topOffset < labelShiftWithLabelHeight && bottomOffset < labelShiftWithLabelHeight) {
          labelY = data.centerY + labelMargin;
        }

        // if (window.innerWidth <= 640) {
        // }

        const labelData = that.renderLabel({
          x: labelX,
          y: labelY,
          text: data.text,
        });

        that.$next_btn.css({
          left: labelX,
          top: labelY + labelHeight + 20,
        });

        let leftSkip = labelX + that.$next_btn.width() + 10;

        if (that.nextBtn === 'hide') {
          leftSkip = labelX;
        }

        that.$skip_btn.css({
          left: leftSkip,
          top: labelY + labelHeight + 20,
        });

        that.$close_btn.css({
          right: 10,
          top: 10,
        });

        that.disableEventsNearRect({
          top: shapeData.top,
          bottom: shapeData.bottom,
          left: shapeData.left,
          right: shapeData.right,
        });

        // const xTo = 0;
        // const yTo = 0;
        let arrowSide = false;
        let connLabelSide = 'left';
        let connCircleSide = 'left';

        const isCenter = (labelData.left <= shapeData.x && labelData.right >= shapeData.x);
        const isLeft = (labelData.right < shapeData.x);
        // const isRight = (labelData.left > shapeData.x);

        // const isAbsLeft = (labelData.right < shapeData.left);
        // const isAbsRight = (labelData.left > shapeData.right);

        const isTop = (labelData.bottom < shapeData.top);
        const isBottom = (labelData.top > shapeData.bottom);
        const isMid = (labelData.bottom >= shapeData.y && labelData.top <= shapeData.y);
        const isMidTop = (labelData.bottom <= shapeData.y && !isTop);
        const isMidBottom = (labelData.top >= shapeData.y && !isBottom);


        function setArrowData(labelSideParam, circleSideParam, arrowSideParam) {
          connLabelSide = labelSideParam;
          connCircleSide = circleSideParam;
          arrowSide = arrowSideParam;
        }

        function sideStatements(topSide, midTopSide, midSide, midBottomSide, bottomSide) {
          let statement = [];

          if (isTop) {
            statement = topSide;
          } else if (isMidTop) {
            statement = midTopSide;
          } else if (isMid) {
            statement = midSide;
          } else if (isMidBottom) {
            statement = midBottomSide;
          } else { // bottom
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
          sideStatements(
            ['right', 'top', 'top'], // top
            ['bottom', 'left', 'bottom'], // mid_top
            ['right', 'left', 'top'], // mid
            ['top', 'left', 'top'], // mid_bot
            ['right', 'bottom', 'bottom'], // bot
          );
        } else { // right
          sideStatements(
            ['left', 'top', 'top'], // top
            ['bottom', 'right', 'bottom'], // mid_top
            ['left', 'right', 'top'], // mid
            ['top', 'right', 'top'], // mid_bot
            ['left', 'bottom', 'bottom'], // bot
          );
        }

        const labelConnCoordinates = labelData.conn[connLabelSide];
        const circleConnCoordinates = shapeData.conn[connCircleSide];
        const byTopSide = (arrowSide === 'top');

        that.renderArrow({
          xFrom: labelConnCoordinates.x,
          yFrom: labelConnCoordinates.y,
          xTo: window.innerWidth < 640
            ? shapeData.left + (shapeData.left > 0)
            : circleConnCoordinates.x,
          yTo: window.innerWidth < 640 ? shapeData.conn.left.y : circleConnCoordinates.y,
          byTopSide,
        });
      };

      that.clear = function clear() {
        $('#enjoyhint_arrow_line').remove();
        $('#enjoyhint_label').remove();
        $(window).off('resize.enjoy_hint');
      };

      return this;
    });
  },

  set(val) {
    this.each(() => {
      this.enjoyhintObj.setValue(val);
    });

    return this;
  },

  show() {
    this.each(() => {
      this.enjoyhintObj.show();
    });

    return this;
  },

  hide() {
    this.each(() => {
      this.enjoyhintObj.hide();
    });

    return this;
  },

  hideNext() {
    this.each(() => {
      this.enjoyhintObj.hideNextBtn();
    });

    return this;
  },

  showNext() {
    this.each(() => {
      this.enjoyhintObj.showNextBtn();
    });

    return this;
  },

  hideSkip() {
    this.each(() => {
      this.enjoyhintObj.hideSkipBtn();
    });

    return this;
  },

  showSkip() {
    this.each(() => {
      this.enjoyhintObj.showSkipBtn();
    });

    return this;
  },

  renderCircle(x, y, r) {
    this.each(() => {
      this.enjoyhintObj.renderCircle(x, y, r);
    });

    return this;
  },

  renderLabel(x, y, r) {
    this.each(() => {
      this.enjoyhintObj.renderLabel(x, y, r);
    });

    return this;
  },

  renderLabelWithShape(data, stopFunction, updateShapeData) {
    this.each(() => {
      this.enjoyhintObj.stopFunction = stopFunction;
      this.enjoyhintObj.updateShapeData = updateShapeData;
      this.enjoyhintObj.renderLabelWithShape(data);
    });

    return this;
  },

  redoEventsNearRect(rect) {
    this.enjoyhintObj.disableEventsNearRect({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
  },

  clear() {
    this.each(() => {
      this.enjoyhintObj.clear();
    });

    return this;
  },

  close(/* val */) {
    this.each(() => {
      this.enjoyhintObj.closePopdown();
    });

    return this;
  },

  disableElementEvents() {
    this.each(() => {
      this.enjoyhintObj.disableEventsOfRect();
    });

    return this;
  },

};

$.fn.enjoyhint = function enjoyhint(method, ...args) {
  if (methods[method]) {
    return methods[method].apply(this, args);
  } if (typeof method === 'object' || !method) {
    return methods.init.apply(this, [method, ...args]);
  }

  $.error(`Method ${method} does not exist on $.numinput`);

  return this;
};
