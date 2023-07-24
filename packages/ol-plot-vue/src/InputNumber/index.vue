<template>
  <div
    ref="root"
    class="ol-plot-vue-input-number"
    :class="[
      inputNumberSize ? 'ol-plot-vue-input-number--' + inputNumberSize : '',
      { 'is-disabled': disabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight },
    ]"
  >
    <span
      v-if="controls"
      class="input-number__decrease"
      :class="{ 'is-disabled': minDisabled }"
      @keydown.enter="decrease"
      role="button"
    >
      <i :class="`el-icon-${controlsAtRight ? 'arrow-down' : 'minus'}`"></i>
    </span>
    <span
      v-if="controls"
      class="input-number__increase"
      :class="{ 'is-disabled': maxDisabled }"
      @keydown.enter="increase"
      role="button"
    >
      <i :class="`el-icon-${controlsAtRight ? 'arrow-up' : 'plus'}`"></i>
    </span>
    <Input
      :value="currentValue"
      @keydown.up.native.prevent="increase"
      @keydown.down.native.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleInputChange"
      :disabled="disabled"
      :size="inputNumberSize"
      :max="max"
      :min="min"
      :name="name"
      ref="input"
      :label="label"
    >
      <template v-slot:prepend v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </template>
      <template v-slot:append v-if="$slots.append">
        <slot name="append"></slot>
      </template>
    </Input>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, onMounted, onUpdated, ref, watch, reactive } from 'vue-demi';
  import Input from '../Input/index.vue';

  export default defineComponent({
    name: 'OlPlotVueInputNumber',
    components: {
      Input,
    },
    props: {
      step: {
        type: Number,
        default: 1,
      },
      max: {
        type: Number,
        default: Infinity,
      },
      min: {
        type: Number,
        default: -Infinity,
      },
      value: {
        default: 0,
      },
      disabled: Boolean,
      size: String,
      controls: {
        type: Boolean,
        default: true,
      },
      controlsPosition: {
        type: String,
        default: '',
      },
      name: String,
      label: String,
    },
    setup(props, { slots, attrs, expose, emit }) {
      const stateValue = ref(props.value);
      const focused = ref(false);
      const hovering = ref(false);
      const input = ref<HTMLInputElement | null>(null);

      const minDisabled = computed(() => _decrease(props.value, props.step) < props.min);
      const maxDisabled = computed(() => _increase(props.value, props.step) > props.max);
      const precision = computed(() => Math.max(getPrecision(props.value), getPrecision(props.step)));

      const controlsAtRight = computed(() => props.controlsPosition === 'right');
      const inputNumberSize = computed(() => props.size);

      watch(
        () => props.value,
        (value) => {
          let newVal = Number(value);
          if (isNaN(newVal)) return;
          if (newVal >= props.max) newVal = props.max;
          if (newVal <= props.min) newVal = props.min;
          stateValue.value = newVal;
          emit('input', newVal);
        },
        { immediate: true },
      );

      const focus = () => {
        input.value?.focus();
      };

      const handleFocus = (event: MouseEvent | FocusEvent) => {
        emit('focus', event);
      };

      const handleBlur = (event: MouseEvent | FocusEvent) => {
        emit('blur', event);
      };

      const _increase = (val: any, step: number) => {
        if (typeof val !== 'number') return stateValue.value;

        const precisionFactor = 10 ** precision.value;

        return toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
      };

      const _decrease = (val: any, step: number) => {
        if (typeof val !== 'number') return stateValue.value;
        const precisionFactor = 10 ** precision.value;
        return toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
      };

      const increase = () => {
        if (props.disabled || maxDisabled) return;
        const value = props.value || 0;
        const newVal = _increase(value, props.step);
        if (newVal > props.max) return;
        setCurrentValue(newVal);
      };

      const decrease = () => {
        if (props.disabled || minDisabled) return;
        const value = props.value || 0;
        const newVal = _decrease(value, props.step);
        if (newVal < props.min) return;
        setCurrentValue(newVal);
      };

      const toPrecision = (num: number, p?: number) => {
        if (p === undefined) p = precision.value;
        // @ts-ignore
        return parseFloat(parseFloat(Number(num).toFixed(p)));
      };

      const getPrecision = (value: any) => {
        const valueString = value.toString();
        const dotPosition = valueString.indexOf('.');
        let precision = 0;
        if (dotPosition !== -1) {
          precision = valueString.length - dotPosition - 1;
        }
        return precision;
      };

      const setCurrentValue = (newVal: any) => {
        const oldVal = stateValue.value;
        if (newVal >= props.max) newVal = props.max;
        if (newVal <= props.min) newVal = props.min;
        if (oldVal === newVal && input) {
          // input.setCurrentValue(stateValue.value);
          return;
        }
        emit('change', newVal, oldVal);
        emit('input', newVal);
        stateValue.value = newVal;
      };

      const handleInputChange = (value: number) => {
        const newVal = Number(value);
        if (!isNaN(newVal)) {
          setCurrentValue(newVal);
        }
      };

      onMounted(() => {
        if (input.value) {
          // const { min, max, disabled } = props
          // const innerInput = input.value?.input as HTMLInputElement
          // innerInput.setAttribute('role', 'spinbutton');
          // innerInput.setAttribute('aria-valuemax', String(max));
          // innerInput.setAttribute('aria-valuemin', String(min));
          // innerInput.setAttribute('aria-valuenow', String(stateValue.value));
          // innerInput.setAttribute('aria-disabled', String(disabled));
        }
      });

      onUpdated(() => {
        // const innerInput = input.value?.input
        // innerInput?.setAttribute('aria-valuenow', `${data.currentValue}`)
      });

      expose({
        input,
        focus,
        blur,
      });

      return {
        input,
        inputNumberSize,
        controlsAtRight,
        maxDisabled,
        minDisabled,

        focus,
        handleBlur,
        handleFocus,
        increase,
        decrease,
        handleInputChange,
      };
    },
  });
</script>
