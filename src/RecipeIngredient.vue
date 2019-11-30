<template>
    <div class="ingredient-table">
      <input name="ingredients" type="hidden" v-model="itemsAsStr" />
      <b-table
        draggable
        :data="liveIngredients"
        :columns="columns"
        @dragstart="dragstart"
        @drop="drop"
        @dragover="dragover"
        @dragleave="dragleave"
      >
        <template slot-scope="props">
          <td class="has-text-centered">{{ props.index + 1 }}.</td>
          <td v-if="props.row.editing">
            <b-field>
              <b-input
                v-model="props.row.name"
                placeholder="Enter a ingredient name"
                type="text"
                size="is-small"
                required
              ></b-input>
              <p class="control">
                <b-input
                  size="is-small"
                  type="number"
                  autofocus
                  v-model.trim="props.row.quantity.number"
                />
              </p>
              <p class="control">
                <b-select class="is-inline" v-model="props.row.quantity.unit" size="is-small">
                  <option v-for="(name, unit) in selectableUnits" :value="unit">{{ name }}</option>
                </b-select>
              </p>
              <p class="control">
                <b-button size="is-small" @click="toggleEditing(props.row)">
                  <b-icon icon="check"></b-icon>
                </b-button>
              </p>
              <p class="control">
                <button type="button" class="button is-small" @click="removeIngredient(props.row)">
                  <b-icon icon="close"></b-icon>
                </button>
              </p>
            </b-field>
          </td>

          <td v-else>
            {{ props.row.name }} {{ props.row.quantity.number }}
            <b-select class="is-inline" v-model="props.row.quantity.unit" size="is-small">
              <option v-for="(name, unit) in selectableUnits" :value="unit">{{ name }}</option>
            </b-select>
            <b-button size="is-small" type="is-light" @click="toggleEditing(props.row)">
              <b-icon icon="pencil"></b-icon>
            </b-button>
            <button type="button" class="button is-small" @click="removeIngredient(props.row)">
              <b-icon icon="close"></b-icon>
            </button>
          </td>
        </template>
        <template slot="footer">
          <th colspan="2" class="is-hidden-mobile">
            <button class="button add-url-row" type="button" @click="addIngredient">
              <b-icon icon="plus" size="is-medium"></b-icon>
            </button>
          </th>
        </template>
        <template slot="empty">
          <section class="section">
            <div class="content has-text-grey has-text-centered">
              <p>
                <b-icon icon="food-croissant" size="is-large"></b-icon>
              </p>
              <p>No ingredients have been added. Consider adding one.</p>
            </div>
          </section>
        </template>
      </b-table>
    </div>

    <!-- <div class="is-centered" v-for="ingredient in liveIngredients" :key="ingredient.id">
      <input type="text" v-model="ingredient.name" />
      <input autofocus v-model.trim="ingredient.quantity.number" />
      <b-select class="is-inline" v-model="ingredient.quantity.unit" size="is-small">
        <option v-for="(name, unit) in selectableUnits" :value="unit">{{ name }}</option>
      </b-select>
      <button type="button" @click="removeIngredient(ingredient)">-</button>
    </div>
    <button type="button" @click="addIngredient">Add an ingredient</button>-->
</template>

<script>
export default {
  name: "ingredient-chooser",
  props: {"selectableUnits": { type: Object }, "initial": { type: Array, default: []}},
  computed: {
    liveIngredients() {
      for (let ingredient of this.ingredients) {
        const { number, type } = this.convertToFactor(ingredient.quantity);
        ingredient.name;
        ingredient.removed;
        ingredient.type = type;
        ingredient.quantity.number = number;
        ingredient.quantity.prevUnit = ingredient.quantity.unit;
      }
      return this.ingredients.filter(item => !item.removed);
    },
    itemsAsStr() {
      const ingredients = []
      const none = {}
      this.ingredients.forEach(element => ingredients.push(Object.assign(none, element)));
        ingredients.forEach(element => delete element.editing);
      return JSON.stringify(ingredients);
    }
  },
  methods: {
    addIngredient() {
      this.ingredients.push({
        name: "",
        type: "volumeUnit",
        quantity: { unit: "tbsp", number: 0, prevUnit: "tbsp" },
        added: true,
        editing: true
      });
    },
    toggleEditing(item) {
      item.editing = !item.editing;
      this.$forceUpdate();
    },
    removeIngredient(ingredient) {
      ingredient.removed = true;
      const index = this.ingredients.findIndex(x => x === ingredient);
      if (ingredient.added) this.ingredients.splice(index, 1);
      this.ingredients.push({});
      this.ingredients.pop();
    },
    getTypeByUnit(value, table) {
      for (const prop in table) {
        if (table.hasOwnProperty(prop))
          if (table[prop].find(el => el.unit === value)) return prop;
      }
    },
    convertToFactor(quantity, conversion_table = CONVERSION_FACTORS) {
      const { unit, number, prevUnit } = quantity;
      const type = this.getTypeByUnit(unit, conversion_table);
      try {
        const base = conversion_table[type].filter(x => x.unit === prevUnit)[0]
          .value;
        let conversionFactor =
          conversion_table[type].filter(x => x.unit === unit)[0].value / base;
        return { number: number * conversionFactor, type };
      } catch (e) {
        return { number: number, type };
      }
    },
    dragstart(payload) {
      this.draggingRow = payload.row;
      this.draggingRowIndex = payload.index;
      payload.event.dataTransfer.effectAllowed = "copy";
    },
    dragover(payload) {
      payload.event.dataTransfer.dropEffect = "copy";
      payload.event.target.closest("tr").classList.add("is-selected");
      payload.event.preventDefault();
    },
    dragleave(payload) {
      payload.event.target.closest("tr").classList.remove("is-selected");
      payload.event.preventDefault();
    },
    drop(payload) {
      payload.event.target.closest("tr").classList.remove("is-selected");
      const droppedOnRowIndex = payload.index;
      const droppedOn = this.ingredients[droppedOnRowIndex];
      this.ingredients[droppedOnRowIndex] = this.ingredients[this.draggingRowIndex];
      this.ingredients[this.draggingRowIndex] = droppedOn;
      const original = droppedOn.name
      this.ingredients[this.draggingRowIndex].name = droppedOn.name + 'changed';
      this.ingredients[this.draggingRowIndex].name = original;
    }
  },
  data: function() {
    return {
      ingredients: this.initial,
      columns: [
        {
          field: "true",
          label: "Ing. #",
          width: "40",
          centered: true
        },
        {
          field: "text",
          label: "Ingredient"
        }
      ]
    };
  }
};
</script>

<style>
    .ingredient-table {
        max-height: 300px;
        overflow: auto;
    }
</style>