<template>
  <b-rate v-model="ratingScore" icon="star" :max="max" :disabled="readOnly" @change="change = true"></b-rate>
</template>

<script>
export default {
  name: "star-rating",
  props: {
    itemId: Number,
    initial: {
      type: [Number, String],
      default: 0
    },
    rateUrl: String,
    recipeName: String,
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ratingScore: parseFloat(this.initial),
      max: 5,
      change: false
    };
  },
  methods: {
    notifyChange: () => {}
  },

  watch: {
    ratingScore: async function(score, oldScore) {
      const rateURL =
        this.rateUrl && this.itemId
          ? this.rateUrl
          : `/recipes/${this.itemId}/rate`;
      if (score < 1 || !this.change) return;
      else if (parseFloat(score) === parseFloat(oldScore)) return;
      const formBody = new FormData();
      formBody.set("rating_score",  parseInt(score));
      const resp = await fetch(rateURL, {
        body: new URLSearchParams(formBody),
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": getCookie("csrftoken")
        }
      });
      if (resp.ok) {
        this.change = false;
        this.ratingScore = parseFloat(
          (await resp.json()).current["rating_value"]
        );
        this.$emit("change-score", this.ratingScore.toFixed(1));
        this.$buefy.toast.open({
          message: this.recipeName ? `Rated ${this.recipeName}!` : "Rated!",
          type: "is-success"
        });
      } else {
        this.$buefy.toast.open({
          message: this.recipeName
            ? `Failed to rate ${this.recipeName}! Try again`
            : "Failed to rate! Try again",
          type: "is-danger"
        });
      }
    }
  }
};
</script>

<style>
</style>