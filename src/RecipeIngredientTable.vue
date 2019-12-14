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
              <mathfield v-model="props.row.quantity.rendered">{{ props.row.quantity.rendered }}</mathfield>
              <!-- <b-input size="is-small" type="text" step="any" autofocus /> -->
            </p>
            <p class="control">
              <b-select class="is-inline" v-model="props.row.quantity.unit" size="is-small">
                <option
                  v-for="name in selectables"
                  :value="name.symbol"
                >{{ name | pluralize(props.row.quantity.number) }}</option>
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
          {{ props.row.name }}
          <mathfield v-model="props.row.quantity.rendered">{{ props.row.quantity.rendered }}</mathfield>
          <b-select class="is-inline" v-model="props.row.quantity.unit" size="is-small">
            <option
              v-for="name in selectables"
              :value="name.symbol"
            >{{ name | pluralize(props.row.quantity.number) }}</option>
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
import VueMathLive from "mathlive/dist/vue-mathlive.mjs";
const mathjs = math;
export default {
  name: "ingredient-chooser",
  props: {
    selectableUnits: { type: Object },
    initial: {
      type: Array,
      default: function() {
        return [];
      }
    },
    defaultQty: {
      type: Number,
      default: 1
    }
  },
  computed: {
    liveIngredients() {
      for (let ingredient of this.ingredients) {
        const exec = async () => {
          const { number, type } = await this.convertToFactor(
            ingredient.quantity,
            this.conversionTable
          );
          ingredient.name;
          ingredient.removed;
          ingredient.repr =
            ingredient.quantity === 1 ? ingredient.singular : ingredient.plural;
          ingredient.type = type;
          if (number) {
            try {
              ingredient.quantity.number = math.format(math.fraction(number), {
                fraction: "ratio"
              });
              const dis = math.number(math.fraction(number));
              if (0.001 < dis < 90000) {
                ingredient.quantity.rendered =
                  dis < 0.01 || dis % 1 == 0
                    ? math.format(number, {
                        fraction: "decimal",
                        notation: "fixed"
                      })
                    : math.parse(ingredient.quantity.number).toTex();
              } else {
                throw "Exceeded limit";
              }
            } catch (e) {
              console.log(e);
              ingredient.quantity.rendered = this.defaultQty;
              ingredient.quantity.number = this.defaultQty;
            }
          }
          ingredient.quantity.prevUnit = ingredient.quantity.unit;
        };
        exec();
      }
      return this.ingredients.filter(item => !item.removed);
    },
    itemsAsStr() {
      const ingredients = [];
      const none = {};
      this.ingredients.forEach(element =>
        ingredients.push(Object.assign(none, element))
      );
      ingredients.forEach(element => delete element.editing);
      return JSON.stringify(ingredients);
    }
  },
  methods: {
    addIngredient() {
      if (this.ingredients.length < 12)
        this.ingredients.push({
          name: "",
          type: "massUnit",
          quantity: {
            unit: "g",
            number: this.defaultQty,
            prevUnit: "g",
            rendered: this.defaultQty.toString()
          },
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
          if (table[prop].find(el => el.symbol === value)) return prop;
      }
    },
    async convertToFactor(quantity, conversion_table = CONVERSION_FACTORS) {
      const { unit, prevUnit } = quantity;
      const lit = this.toValidLiteral(quantity.rendered);
      const result = mathjs.evaluate(lit);
      const number = result;

      const type = this.getTypeByUnit(unit, conversion_table);
      try {
        const base = conversion_table[type].filter(
          x => x.symbol === prevUnit
        )[0].value;
        const val = conversion_table[type].filter(x => x.symbol === unit)[0]
          .value;
        if (val == "REQ_FUNC") {
          const converted = await this.calculateDynamic(
            prevUnit,
            unit,
            number,
            type
          );
          return { number: converted, type };
        } else if (!val) {
          return { number: number, type };
        } else {
          const conversionFactor = (base / val).toFixed(8);
          console.log(conversionFactor);
          return { number: number * conversionFactor, type };
        }
      } catch (e) {
        return { number: number, type };
      }
    },
    toValidLiteral: function(latex) {
      try {
        if (!latex) return this.defaultQty;
        const extracted = new RegExp("\\\\frac{(.*?)}{(.*?)}").exec(latex);
        if (extracted) {
          if (extracted.length == 2) return `${extracted[1]}`;
          else if (extracted.length == 3)
            return `${extracted[1]}/${extracted[2]}`;
          else return this.defaultQty;
        } else {
          try {
            return parseFloat(latex);
          } catch (e) {
            return this.defaultQty;
          }
        }
      } catch (e) {
        return this.defaultQty;
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
      this.ingredients[droppedOnRowIndex] = this.ingredients[
        this.draggingRowIndex
      ];
      this.ingredients[this.draggingRowIndex] = droppedOn;
      const original = droppedOn.name;
      this.ingredients[this.draggingRowIndex].name = droppedOn.name + "changed";
      this.ingredients[this.draggingRowIndex].name = original;
    },
    async calculateDynamic(base, quote, value, type) {
      const formBody = new FormData();
      formBody.set("type", type);
      formBody.set("value", value);
      formBody.set("base_unit", base);
      formBody.set("quote_unit", quote);
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
        return parseFloat((await resp.clone().json()).current);
      }
    }
  },
  data: function() {
    return {
      ingredients: this.initial,
      selectables: [],
      conversionTable: [],
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
  },
  async created() {
    const resp = await fetch(`/recipes/unit_conv`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-CSRFToken": getCookie("csrftoken")
      }
    });
    if (resp.ok) {
      if (typeof (await resp.clone().json()).current == "undefined")
        this.selectables = [];
      else {
        this.conversionTable = (await resp.clone().json()).current;
        for (const category in this.conversionTable) {
          const item = this.conversionTable[category];
          this.selectables.push(...item);
        }
      }
    }
  }
};
</script>

<style scoped>
.ingredient-table {
  max-height: 300px;
  overflow: auto;
}
.is-small,
.mathfield {
  font-size: 1.25rem;
}
</style>