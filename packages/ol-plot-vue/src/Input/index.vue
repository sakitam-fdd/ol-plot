<template>
  <div
      ref="root"
      :class="['ol-plot-vue-input',
    inputSize ? 'ol-plot-vue-input--' + inputSize : '',
    {
      'is-disabled': inputDisabled,
      'ol-plot-vue-input-group': $slots.prepend || $slots.append,
      'ol-plot-vue-input-group--append': $slots.append,
      'ol-plot-vue-input-group--prepend': $slots.prepend,
      'ol-plot-vue-input--prefix': $slots.prefix || prefixIcon,
      'ol-plot-vue-input--suffix': $slots.suffix || suffixIcon
    }
    ]"
     @mouseenter="hovering = true"
     @mouseleave="hovering = false"
  >
    <!-- 前置元素 -->
    <div class="ol-plot-vue-input-group__prepend" v-if="$slots.prepend">
      <slot name="prepend"></slot>
    </div>
    <input
        :tabindex="tabindex"
        v-if="type !== 'textarea'"
        class="ol-plot-vue-input__inner"
        v-bind="$props"
        :disabled="inputDisabled"
        :autocomplete="autoComplete"
        :value="stateValue"
        ref="input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        :aria-label="label"
    >
    <!-- 前置内容 -->
    <span class="ol-plot-vue-input__prefix" v-if="$slots.prefix || prefixIcon" :style="prefixOffset">
        <slot name="prefix"></slot>
        <i class="ol-plot-vue-input__icon"
           v-if="prefixIcon"
           :class="prefixIcon">
        </i>
      </span>
    <!-- 后置内容 -->
    <span
        class="ol-plot-vue-input__suffix"
        v-if="$slots.suffix || suffixIcon || showClear || validateState && needStatusIcon"
        :style="suffixOffset">
        <span class="ol-plot-vue-input__suffix-inner">
          <template v-if="!showClear">
            <slot name="suffix"></slot>
            <i class="ol-plot-vue-input__icon"
               v-if="suffixIcon"
               :class="suffixIcon">
            </i>
          </template>
          <i v-else
             class="ol-plot-vue-input__icon el-icon-circle-close ol-plot-vue-input__clear"
             @click="clear"
          ></i>
        </span>
      </span>
    <!-- 后置元素 -->
    <div class="ol-plot-vue-input-group__append" v-if="$slots.append">
      <slot name="append"></slot>
    </div>
  </div>
</template>
<script lang="ts">

import { defineComponent, watch, ref, reactive, onMounted, computed } from 'vue-demi';

export default defineComponent({
  name: 'ol-plot-vue-input',
  componentName: 'ol-plot-vue-input',
  props: {
    value: [String, Number],
    placeholder: String,
    size: String,
    resize: String,
    name: String,
    form: String,
    id: String,
    maxlength: Number,
    minlength: Number,
    readonly: Boolean,
    autofocus: Boolean,
    disabled: Boolean,
    type: {
      type: String,
      default: 'text'
    },
    rows: {
      type: Number,
      default: 2
    },
    autoComplete: {
      type: String,
      default: 'off'
    },
    max: {},
    min: {},
    step: {},
    suffixIcon: String,
    prefixIcon: String,
    label: String,
    clearable: {
      type: Boolean,
      default: false
    },
    tabindex: String
  },

  setup(props, { slots, attrs, expose, emit }) {
    const stateValue = ref(props.value);
    const focused = ref(false);
    const hovering = ref(false);
    const input = ref<HTMLInputElement | null>(null);
    const root = ref<HTMLDivElement | null>(null);

    const state = reactive<{
      prefixOffset: any,
      suffixOffset: any,
    }>({
      prefixOffset: null,
      suffixOffset: null,
    });

    const inputSize = computed(() => {
      return props.size;
    });
    const inputDisabled = computed(() => {
      return props.disabled;
    });
    const isGroup = computed(() => {
      return slots.prepend || slots.append;
    });
    const showClear = computed(() => {
      return props.clearable && stateValue.value !== '' && (focused.value || hovering.value);
    });

    watch(
      () => props.value,
      () => {
        stateValue.value = props.value;
      },
    );

    const focus = () => {
      input.value?.focus();
    };

    const handleBlur = (event: any) => {
      focused.value = false;
      emit('blur', event);
    };
    const inputSelect = () => {
      input.value?.select();
    };
    const handleFocus = (event: any) => {
      focused.value = true;
      emit('focus', event);
    };

    const handleInput = (event: any) => {
      const value = event.target.value;
      emit('input', value);
      stateValue.value = value;
    };

    const handleChange = (event: any) => {
      emit('change', event.target.value);
    };

    const calcIconOffset = (place: 'suf' | 'pre') => {
      const pendantMap = {
        'suf': 'append',
        'pre': 'prepend'
      };

      const pendant = pendantMap[place];

      if (slots[pendant] && root.value) {
        return {
          transform: `translateX(${place === 'suf' ? '-' : ''}${root.value.querySelector(`.ol-plot-vue-input-group__${pendant}`).offsetWidth}px)`
        };
      }
    };
    const clear = () => {
      emit('input', '');
      emit('change', '');
      stateValue.value = '';
      focus();
    };

    onMounted(() => {
      if (isGroup) {
        state.prefixOffset = calcIconOffset('pre');
        state.suffixOffset = calcIconOffset('suf');
      }
    });

    expose({
      input,
      focus,
      blur,
      inputSelect,
      clear,
    });

    return {
      input,
      inputSize,
      inputDisabled,
      isGroup,
      showClear,

      focus,
      clear,
      handleBlur,
      inputSelect,
      handleFocus,
      handleInput,
      handleChange,
    };
  },
});
</script>
