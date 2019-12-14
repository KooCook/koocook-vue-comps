<template>
  <b-field>
      <input :name="name" type="hidden" v-model="asString" />
    <p class="control">
      <b-input
        size="is-small"
        type="number"
        step="any"
        autofocus
        v-model="number"
      />
    </p>
    <p class="control">
      <b-select class="is-inline" v-model="selectedUnit" size="is-small">
        <option v-for="(name, index) in units" :key="index" :value="name.unit">{{ name | pluralize(number) }}</option>
      </b-select>
    </p>
  </b-field>
</template>

<script>
export default {
  props: ["section", "name", "initial"],
  name: 'quantity-input',
  computed: {
      asString() {
          return `${this.number} ${this.selectedUnit}`
      }
  },
  data: () => { return {
    conversionTable: [],
    selectedUnit: 'serving',
    units: [],
    number: 0
  }},
  async created() {
      if (this.initial) {
          this.number = this.initial.amount;
          this.selectedUnit = this.initial.unit;
      }
    const formBody = new FormData();
    if (this.section) formBody.set("section", this.section);
    const resp = await fetch(`/recipes/unit_conv`, {
      body: new URLSearchParams(formBody),
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-CSRFToken": getCookie("csrftoken")
      }
    });
    if (resp.ok) {
      if (typeof (await resp.clone().json()).current == "undefined")
        this.units = [];
      else {
        this.conversionTable = (await resp.clone().json()).current;
        for (const category in this.conversionTable) {
          const item = this.conversionTable[category];
          this.units.push(...item);
        }
      }
    }
  }
};
</script>

<style>
</style>