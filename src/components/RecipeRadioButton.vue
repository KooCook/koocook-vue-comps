<template>
    <div class="control" :class="{ 'is-expanded': expanded }">
        <label
            class="b-radio radio button has-text-centered"
            ref="label"
            :class="[type, size, {
                'is-disabled': disabled,
                'is-focused': isFocused
            }]"
            :disabled="disabled"
            @click="focus"
            @keydown.prevent.enter="$refs.label.click()">
            <slot></slot>
            <b-icon icon="check-circle" type="is-white" v-if="newValue === nativeValue"></b-icon>
            <b-icon icon="check-circle" :type="type" v-else></b-icon>
            <input
                v-model="computedValue"
                type="radio"
                ref="input"
                @click.stop
                :disabled="disabled"
                :required="required"
                :name="name"
                :value="nativeValue"
                @focus="isFocused = true"
                @blur="isFocused = false">
        </label>
    </div>
</template>

<script>
import CheckRadioMixin from '../utils/CheckRadioMixin.js'

export default {
    name: 'RecipeRadioButton',
    mixins: [CheckRadioMixin],
    props: {
        type: {
            type: String,
            default: 'is-primary'
        },
        expanded: Boolean
    },
    data() {
        return {
            isFocused: false
        }
    }
}
</script>
