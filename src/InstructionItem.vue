<template>
  <tr><td><slot name="header"><b-icon icon="menu" v-handle class="handle"></b-icon></slot></td> <slot></slot></tr>
</template>

<script>
import { ElementMixin, HandleDirective } from 'vue-slicksort';
export default {
    name: 'instruction-item',
    mixins: [ElementMixin],
  directives: { handle: HandleDirective },
}
</script>

<style>

</style>