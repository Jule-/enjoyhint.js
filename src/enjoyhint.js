import $ from 'jquery';

export default class EnjoyHint {
  constructor(_options) {
    const defaults = {
      onStart() { },
      onEnd() { },
      onSkip() { },
      onNext() { },

      container: 'body',

      animation_time: 800,
      backdrop_color: 'rgba(0,0,0,0.6)',
    };

    this.options = $.extend(defaults, _options);

    this.data = [];
    this.currentStep = 0;

    this.$eventElement = null;
    this.$body = $(this.options.container);

    this.init();
  }

  /** ******************* PRIVATE METHODS ************************************** */

  init() {
    if ($('.enjoyhint')) {
      $('.enjoyhint').remove();
    }

    this.$body.enjoyhint({
      onNextClick: () => {
        this.nextStep();
      },

      onSkipClick: () => {
        this.options.onSkip();
        this.skipAll();
      },

      animation_time: this.options.animation_time,
      backdrop_color: this.options.backdrop_color,
    });


    $(window).on('resize.enjoy_hint_permanent', () => {
      if (this.$eventElement[0]) {
        this.$body.enjoyhint('redo_events_near_rect', this.$eventElement[0].getBoundingClientRect());
      }
    });
  }

  static lockTouch(e) {
    e.preventDefault();
  }

  destroyEnjoy() {
    this.options.onEnd();
    this.$body.enjoyhint('clear');
    this.$body.enjoyhint('hide');
    this.$body.css({ overflow: 'auto' });
    $(document).off('touchmove', EnjoyHint.lockTouch);
  }

  clear() {
    const $nextBtn = $('.enjoyhint_next_btn');
    const $skipBtn = $('.enjoyhint_skip_btn');

    $nextBtn.removeClass(this.nextUserClass);
    $nextBtn.text('Next');
    $skipBtn.removeClass(this.skipUserClass);
    $skipBtn.text('Skip');
  }

  stepAction() {
    if (!(this.data && this.data[this.currentStep])) {
      this.destroyEnjoy();
      return;
    }

    this.options.onNext();

    const $enjoyhint = $('.enjoyhint');

    $enjoyhint.removeClass(`enjoyhint-step-${this.currentStep}`);
    $enjoyhint.removeClass(`enjoyhint-step-${this.currentStep + 1}`);
    $enjoyhint.addClass(`enjoyhint-step-${this.currentStep + 1}`);

    const stepData = this.data[this.currentStep];

    if (stepData.onBeforeStart && typeof stepData.onBeforeStart === 'function') {
      stepData.onBeforeStart();
    }

    const timeout = stepData.timeout || 0;

    setTimeout(() => {
      if (!stepData.selector) {
        Object.keys(stepData).forEach((prop) => {
          if (prop.split(' ')[1]) {
            let tempEvent = '';
            [tempEvent, stepData.selector] = prop.split(' ');

            if (tempEvent === 'next' || tempEvent === 'auto' || tempEvent === 'custom') {
              stepData.event_type = tempEvent;
            } else {
              stepData.event = tempEvent;
            }

            stepData.description = stepData[prop];
          }
        });
      }

      setTimeout(() => {
        this.clear();
      }, 250);

      this.$body.scrollTo(stepData.selector,
        stepData.scrollAnimationSpeed || 250,
        { offset: -100 });

      setTimeout(() => {
        let $element = $(stepData.selector);
        const eventName = EnjoyHint.makeEventName(stepData.event);

        this.$body.enjoyhint('show');
        this.$body.enjoyhint('hideNext');
        this.$eventElement = $element;

        if (stepData.event_selector) {
          this.$eventElement = $(stepData.event_selector);
        }

        if (!stepData.event_type && stepData.event === 'key') {
          $element.keydown((event) => {
            if (event.which === stepData.keyCode) {
              this.currentStep += 1;
              this.stepAction();
            }
          });
        }

        if (stepData.showNext === true) {
          this.$body.enjoyhint('showNext');
        }

        if (stepData.showSkip === false) {
          this.$body.enjoyhint('hideSkip');
        } else {
          this.$body.enjoyhint('showSkip');
        }

        if (stepData.nextButton) {
          const $nextBtn = $('.enjoyhint_next_btn');

          $nextBtn.addClass(stepData.nextButton.className || '');
          $nextBtn.text(stepData.nextButton.text || 'Next');
          this.nextUserClass = stepData.nextButton.className;
        }

        if (stepData.skipButton) {
          const $skipBtn = $('.enjoyhint_skip_btn');

          $skipBtn.addClass(stepData.skipButton.className || '');
          $skipBtn.text(stepData.skipButton.text || 'Skip');
          this.skipUserClass = stepData.skipButton.className;
        }

        if (stepData.event_type) {
          switch (stepData.event_type) {
            case 'auto':
              $element[stepData.event]();

              this.currentStep += 1;
              this.stepAction();

              return;

            case 'custom':
              this.on(stepData.event, () => {
                this.currentStep += 1;
                this.off(stepData.event);
                this.stepAction();
              });
              break;

            case 'next':
              this.$body.enjoyhint('showNext');
              break;

            default:
              break;
          }
        } else {
          this.$eventElement.on(eventName, (e) => {
            if (stepData.keyCode && e.keyCode !== stepData.keyCode) {
              return;
            }

            this.currentStep += 1;
            $(this).off(eventName);

            this.stepAction(); // clicked
          });
        }

        const updateShapeData = () => {
          $element = $(stepData.selector);

          const rect = $element[0].getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;
          const maxHabarites = Math.max(w, h);
          const radius = stepData.radius || Math.round(maxHabarites / 2) + 5;
          const offset = $element.offset();
          const shapeMargin = (stepData.margin !== undefined) ? stepData.margin : 10;

          const coords = {
            x: offset.left + Math.round(w / 2),
            y: offset.top + Math.round(h / 2) - $(document).scrollTop(),
          };

          const shapeData = {
            enjoyHintElementSelector: stepData.selector,
            centerX: coords.x,
            centerY: coords.y,
            text: stepData.description,
            top: stepData.top,
            bottom: stepData.bottom,
            left: stepData.left,
            right: stepData.right,
            margin: stepData.margin,
            scroll: stepData.scroll,
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
        const updatedShapeData = updateShapeData();

        this.$body.enjoyhint('renderLabelWithShape', updatedShapeData, this.stop, updateShapeData);

        if (stepData.event === 'next') {
          this.$body.enjoyhint('disableElementEvents');
        }
      }, stepData.scrollAnimationSpeed + 20 || 270);
    }, timeout);
  }

  nextStep() {
    this.currentStep += 1;
    this.stepAction();
  }

  skipAll() {
    const stepData = this.data[this.currentStep];
    const $element = $(stepData.selector);

    this.off(stepData.event);
    $element.off(EnjoyHint.makeEventName(stepData.event));
    $element.off(EnjoyHint.makeEventName(stepData.event), true);

    this.destroyEnjoy();
  }

  static makeEventName(name, isCustom) {
    return `${name + (isCustom ? 'custom' : '')}.enjoy_hint`;
  }

  on(eventName, callback) {
    this.$body.on(EnjoyHint.makeEventName(eventName, true), callback);
  }

  off(eventName) {
    this.$body.off(EnjoyHint.makeEventName(eventName, true));
  }


  /** ******************* PUBLIC METHODS ************************************** */


  stop() {
    this.skipAll();
  }

  reRunScript(cs) {
    this.currentStep = cs;
    this.stepAction();
  }

  runScript() {
    this.$body.css({ overflow: 'hidden' });
    $(document).on('touchmove', EnjoyHint.lockTouch);

    this.currentStep = 0;
    this.options.onStart();
    this.stepAction();
  }

  resumeScript() {
    this.stepAction();
  }

  setCurrentStep(cs) {
    this.currentStep = cs;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  trigger(eventName) {
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

  setScript(_data) {
    if (_data) {
      this.data = _data;
    }
  }

  // support deprecated API methods
  set(_data) {
    this.setScript(_data);
  }

  setSteps(_data) {
    this.setScript(_data);
  }

  run() {
    this.runScript();
  }

  resume() {
    this.resumeScript();
  }
}
