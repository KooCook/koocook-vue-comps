<template>
  <div>
    <input
      type="hidden"
      name="cookware_list"
      id="id_cookware_list"
      v-model="itemsAsStr"
    />
    <b-table
      draggable
      :data="items"
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
              expanded
              v-model="props.row.name"
              placeholder="Enter your cookware name"
              type="textarea"
              required
            ></b-input>
            <p class="control">
              <b-button size="is-small" @click="toggleEditing(props.index)">
                <b-icon icon="check"></b-icon>
              </b-button>
            </p>
          </b-field>
        </td>

        <td v-if="!props.row.editing">
          {{ props.row.name }}
          <b-button size="is-small" type="is-light" @click="toggleEditing(props.index)">
            <b-icon icon="pencil"></b-icon>
          </b-button>
          <button type="button" class="button is-small" @click="doDelete(props.index)">
            <b-icon icon="close"></b-icon>
          </button>
        </td>
      </template>
      <template slot="footer">
        <th colspan="2" class="is-hidden-mobile">
          <button class="button add-url-row" type="button" @click="addInstruction()">
            <b-icon icon="plus" size="is-medium"></b-icon>
          </button>
        </th>
      </template>
      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large"></b-icon>
            </p>
            <p>No cookware has been added.</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "cookware-list",
  props: ["initial"],
  methods: {
    addInstruction() {
      this.items.push({ text: "", editing: true });
    },
    toggleEditing(item_idx) {
      this.items[item_idx].editing = !this.items[item_idx].editing;
    },
    doDelete(item_idx) {
      this.items[item_idx].deleted = true;
      this.items = this.items.splice(item_idx, item_idx);
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
      const droppedOn = this.items[droppedOnRowIndex];
      const original = droppedOn.name;
      this.items[droppedOnRowIndex] = this.items[this.draggingRowIndex];
      this.items[this.draggingRowIndex] = droppedOn;

      this.items[this.draggingRowIndex].name = droppedOn.name + "changed";
      this.items[this.draggingRowIndex].name = original;
      this.$forceUpdate();
    }
  },
  computed: {
    itemsAsStr() {
      return JSON.stringify( this.items
        // this.items.map(element => {
        //   return element.name;
        // })
      );
    }
  },
  directives: {
    replaceParent: {
      // directive definition
      inserted: function(el) {
        const parent = el.parentElement;
        const pp = el.parentElement;
        parent.replaceWith(el);
      }
      // bind(el, binding) {
      //     el.replaceWith(binding.value);
      // }
    }
  },
  data() {
    return {
      items: this.initial ? this.initial : [{ name: "", editing: true }],
      columns: [
        {
          field: "true",
          label: "#",
          width: "40",
          centered: true
        },
        {
          field: "text",
          label: "Equipment name"
        }
      ]
    };
  }
};
</script>