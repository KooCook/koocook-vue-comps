<template>
    <div class="taginput control" :class="rootClasses">
        <div
            class="taginput-container"
            :class="[statusType, size, containerClasses]"
            :disabled="disabled"
            @click="hasInput && focus($event)">
            <b-taglist attached v-for="(tag, index) in tags" :key="index">
                <b-tag
                    v-if="!tag.deleted"
                    :type="type"
                    :size="size"
                    :attached="attached"
                    :tabstop="false"
                    :disabled="disabled"
                    :ellipsis="ellipsis"
                    :title="ellipsis && getNormalizedTagText(tag.name)"
                    @close="removeTag(index)">
                    {{ getNormalizedTagText(tag.name) }}
                </b-tag>
                 <b-tag v-if="tag.label.name && tag.done && !tag.deleted"
                    :type="labelStyle[tag.label.level - 1]"
                    :size="size"
                    :rounded="rounded"
                    :tabstop="false"
                    :disabled="disabled"
                    :ellipsis="ellipsis"
                    :closable="closable"
                    :title="ellipsis && getNormalizedTagText(tag.label.name)"
                    @close="removeTag(index)">
                    {{ getNormalizedTagText(tag.label.name) }}
                </b-tag>
                <b-dropdown position="is-top-right" trap-focus :close-on-click="false" v-else-if="!tag.deleted">
                    <b-tag class="add" type="is-success" slot="trigger" role="button">
                        <b-icon icon="plus" size="is-small" @click="editLabel(tag)"></b-icon>
                    </b-tag>
                    <b-dropdown-item :custom="true" aria-role="listitem">
                        <p>Label</p>
                        <b-field>
                            <b-input size="is-small" v-model="tag.label.name"></b-input>
                                <p class="control">
                                    <b-button size="is-small" type="is-primary" @click="editLabel(tag)">Done</b-button>
                                </p>
                        </b-field>
                        <b-field>
                            <!-- <b-radio-button v-model="tag.label.level"
                                native-value="1"
                                type="is-info"
                                focus>
                                <b-icon icon="check-circle" ></b-icon> 
                            </b-radio-button>
                            <b-radio-button v-model="tag.label.level"
                                native-value="2"
                                type="is-success">
                                <b-icon icon="check-circle" ></b-icon> 
                            </b-radio-button>
                            <b-radio-button v-model="tag.label.level"
                                native-value="3"
                                type="is-warning">
                                <b-icon icon="check-circle" ></b-icon> 
                            </b-radio-button>
                            <b-radio-button v-model="tag.label.level"
                                native-value="4"
                                type="is-danger">
                                <b-icon icon="check-circle"></b-icon> 
                            </b-radio-button> -->
                            <RecipeRadioButton v-model="tag.label.level"
                                native-value="1"
                                type="is-info">
                                <b-icon icon="check-circle" type="is-white"></b-icon>
                            </RecipeRadioButton>
                            <RecipeRadioButton v-model="tag.label.level"
                                native-value="2"
                                type="is-success">
                                <b-icon icon="check-circle" type="is-white"></b-icon>
                            </RecipeRadioButton>
                            <RecipeRadioButton v-model="tag.label.level"
                                native-value="3"
                                type="is-warning">
                                <b-icon icon="check-circle" type="is-white"></b-icon>
                            </RecipeRadioButton>
                            <RecipeRadioButton v-model="tag.label.level"
                                native-value="4"
                                type="is-danger">
                                <b-icon icon="check-circle" type="is-white"></b-icon>
                            </RecipeRadioButton>
                        </b-field>
                    </b-dropdown-item>
                </b-dropdown>
            </b-taglist>

            <b-autocomplete
                ref="autocomplete"
                v-if="hasInput"
                v-model="newTag"
                v-bind="$attrs"
                :data="internalData"
                :field="field"
                :icon="icon"
                :icon-pack="iconPack"
                :maxlength="maxlength"
                :has-counter="false"
                :size="size"
                :disabled="disabled"
                :loading="loading"
                :autocomplete="nativeAutocomplete"
                :keep-first="!allowNew"
                :use-html5-validation="useHtml5Validation"
                @typing="onTyping"
                @focus="onFocus"
                @blur="customOnBlur"
                @keydown.native="keydown"
                @select="onSelect">
                <template :slot="headerSlotName">
                    <slot name="header" />
                </template>
                <template
                    :slot="defaultSlotName"
                    slot-scope="props">
                    <b-field grouped>
                    <slot
                        :option="props.option"
                        :index="props.id" />
                        <div class="control">
                     <b-taglist attached>
                        <b-tag type="is-dark">{{ props.option.name }}</b-tag>
                        <b-tag v-if="props.option.label" :type="labelStyle[props.option.label.level - 1]">{{ props.option.label.name }}</b-tag>
                </b-taglist>
                        </div>
                    </b-field>
                </template>
                <template :slot="emptySlotName">
                    <slot name="empty" />
                </template>
                <template :slot="footerSlotName">
                    <slot name="footer" />
                </template>
            </b-autocomplete>
        </div>

        <small v-if="hasCounter && (maxtags || maxlength)" class="help counter">
            <template v-if="maxlength && valueLength > 0">
                {{ valueLength }} / {{ maxlength }}
            </template>
            <template v-else-if="maxtags">
                {{ tagsLength }} / {{ maxtags }}
            </template>
        </small>
    </div>
</template>

<style scoped>
.add {
    cursor: pointer;
}
.add:focus, .add:hover {
    background-color: rgba(10,10,10,.3);
}
</style>

<script>
import debounce from 'lodash/debounce'
import { getValueByPath } from 'Buefy/src/utils/helpers'
import Tag from 'Buefy/src/components/tag/Tag'
import Autocomplete from 'Buefy/src/components/autocomplete/Autocomplete'
import config from 'Buefy/src/utils/config'
import FormElementMixin from 'Buefy/src/utils/FormElementMixin'
import RecipeRadioButton from './components/RecipeRadioButton.vue'
export default {
    name: 'recipe-tag-input',
    components: {
        [Autocomplete.name]: Autocomplete,
        [Tag.name]: Tag,
        [RecipeRadioButton.name]: RecipeRadioButton
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        value: {
            type: Array,
            default: () => []
        },
        data: {
            type: Array,
            default: () => []
        },
        type: { 
            type: String,
            default: 'is-light' 
        },
        rounded: {
            type: Boolean,
            default: false
        },
        attached: {
            type: Boolean,
            default: false
        },
        maxtags: {
            type: [Number, String],
            required: false
        },
        hasCounter: {
            type: Boolean,
            default: () => config.defaultTaginputHasCounter
        },
        field: {
            type: String,
            default: 'value'
        },
        autocomplete: Boolean,
        nativeAutocomplete: String,
        disabled: Boolean,
        ellipsis: Boolean,
        closable: {
            type: Boolean,
            default: true
        },
        confirmKeyCodes: {
            type: Array,
            default: () => [13, 188]
        },
        removeOnKeys: {
            type: Array,
            default: () => [8]
        },
        allowNew: Boolean,
        onPasteSeparators: {
            type: Array,
            default: () => [',']
        },
        beforeAdding: {
            type: Function,
            default: () => true
        },
        allowDuplicates: {
            type: Boolean,
            default: false
        },
        careDeleted: {
            type: Boolean,
            default: false
        },
        labelStyle: {
            type: Array,
            default: () => ['is-info', 'is-success', 'is-warning', 'is-danger']
        }
    },
    data() {
        return {
            tags: Array.isArray(this.value) ? this.value.slice(0) : (this.value || []),
            typing: false,
            newTag: '',
            isFetching: false,
            internalData: this.data,
            _elementRef: 'input',
            _isTaginput: true,
        }
    },
    computed: {
        rootClasses() {
            return {
                'is-expanded': this.expanded
            }
        },
        containerClasses() {
            return {
                'is-focused': this.isFocused,
                'is-focusable': this.hasInput
            }
        },
        valueLength() {
            return this.newTag.trim().length
        },
        defaultSlotName() {
            return this.hasDefaultSlot ? 'default' : 'dontrender'
        },
        emptySlotName() {
            return this.hasEmptySlot ? 'empty' : 'dontrender'
        },
        headerSlotName() {
            return this.hasHeaderSlot ? 'header' : 'dontrender'
        },
        footerSlotName() {
            return this.hasFooterSlot ? 'footer' : 'dontrender'
        },
        hasDefaultSlot() {
            return !!this.$scopedSlots.default
        },
        hasEmptySlot() {
            return !!this.$slots.empty
        },
        hasHeaderSlot() {
            return !!this.$slots.header
        },
        hasFooterSlot() {
            return !!this.$slots.footer
        },
        /**
         * Show the input field if a maxtags hasn't been set or reached.
         */
        hasInput() {
            return this.maxtags == null || this.tagsLength < this.maxtags
        },
        tagsLength() {
            return this.tags.length
        },
        /**
         * If Taginput has onPasteSeparators prop,
         * returning new RegExp used to split pasted string.
         */
        separatorsAsRegExp() {
            const sep = this.onPasteSeparators
            return sep.length ? new RegExp(sep.map((s) => {
                return s ? s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : null
            }).join('|'), 'g') : null
        }
    },
    watch: {
        /**
         * When v-model is changed set internal value.
         */
        value(value) {
            this.tags = value
        },
        hasInput() {
            if (!this.hasInput) this.onBlur()
        }
    },
    methods: {
        getAsyncData: debounce(function (name) {
            if (!name.length) {
                    this.internalData = []
                    return
                }
                this.isFetching = true
                this.$http.get(`/recipes/tags?name=${name}`)
                    .then(({ data }) => {
                        this.internalData = []
                        data.current.forEach((item) => this.internalData.push(item))
                    })
                    .catch((error) => {
                        this.internalData = []
                        throw error
                    })
                    .finally(() => {
                        this.isFetching = false
                    })
            }, 500),
        editLabel(tag) {
            this.$set(tag, "done", true);
        },
        addTag(tag) {
            const tagToAdd = tag || this.newTag.trim()
            if (tagToAdd) {
                if (!this.autocomplete) {
                    const reg = this.separatorsAsRegExp
                    if (reg && tagToAdd.match(reg)) {
                        tagToAdd.split(reg)
                            .map((t) => t.trim())
                            .filter((t) => t.length !== 0)
                            .map(this.addTag)
                        return
                    }
                }
                // Add the tag input if it is not blank
                // or previously added (if not allowDuplicates).
                const add = !this.allowDuplicates ? this.tags.map(tag => tag.name).indexOf(tagToAdd.name) === -1 : true
                if (add && this.beforeAdding(tagToAdd)) {
                    if (typeof tagToAdd === 'string') this.tags.push({ name: tagToAdd, label: { name: '', level: 1 } })
                    else {
                        if (!tagToAdd.label) tagToAdd.label = { name: '' };
                        this.tags.push(tagToAdd);
                    }
                    this.$emit('input', this.tags)
                    this.$emit('add', tagToAdd)
                }
            }
            this.newTag = ''
        },
        getNormalizedTagText(tag) {
            if (typeof tag === 'object') {
                return getValueByPath(tag, this.field)
            }
            return tag
        },
        customOnBlur($event) {
            // Add tag on-blur if not select only
            if (!this.autocomplete) this.addTag()
            this.onBlur($event)
        },
        onSelect(option) {
            if (!option) return
            this.addTag(option)
            this.$nextTick(() => {
                this.newTag = ''
            })
        },
        removeTag(index) {
            let tag = this.tags[index];
            if (this.tags[index].id && this.careDeleted) tag.deleted = true;
            else { tag = this.tags.splice(index, 1)[0]; }
            this.$emit('input', this.tags);
            this.$emit('remove', tag);
            return tag
            
        },
        removeLastTag() {
            if (this.tagsLength > 0) {
                this.removeTag(this.tagsLength - 1)
            }
        },
        keydown(event) {
            if (this.removeOnKeys.indexOf(event.keyCode) !== -1 && !this.newTag.length) {
                this.removeLastTag()
            }
            // Stop if is to accept select only
            if (this.autocomplete && !this.allowNew) return
            if (this.confirmKeyCodes.indexOf(event.keyCode) >= 0) {
                event.preventDefault()
                this.addTag()
            }
        },
        onTyping($event) {
            this.$emit('typing', $event.trim());
            this.getAsyncData($event);
        }
    }
}
</script>