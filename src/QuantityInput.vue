<template>
  <span>
    <p class="control">
      <b-input
        size="is-small"
        type="number"
        step="any"
        autofocus
        v-model="props.row.quantity.number"
      />
    </p>
    <p class="control">
      <b-select class="is-inline" v-model="props.row.quantity.unit" size="is-small">
        <option v-for="(name, index) in units" :key="index" :value="name.unit">{{ name.unit }}</option>
      </b-select>
    </p>
  </span>
</template>

<script>
export default {
    data: {
        units: []
    },
    async created() {
    const resp = await fetch(`/recipes/unit_conv`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-CSRFToken": getCookie("csrftoken")
      }
    });
    // if (resp.ok) {
    //   if (typeof (await resp.clone().json()).current == "undefined")
    //     this.selectables = [];
    //   else {
    //     this.conversionTable = (await resp.clone().json()).current;
    //     for (const category in this.conversionTable) {
    //       const item = this.conversionTable[category];
    //       this.selectables.push(...item);
    //     }
    //   }
    // }
  }
};
</script>

<style>
</style>