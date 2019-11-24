<template>
  <b-button type="is-outlined-primary" size="is-small" v-if="!following" @click="follow">Follow</b-button>
  <span v-else>
    <small class="has-text-primary">Following</small>
    <b-dropdown style="width:30px;" position="is-bottom-left" hoverable aria-role="list">
      <b-icon icon="chevron-down" slot="trigger" size="is-small"></b-icon>
      <b-dropdown-item aria-role="listitem" @click="unfollow">Unfollow</b-dropdown-item>
    </b-dropdown>
  </span>
</template>

<script>
import Buefy from "Buefy";
export default {
  name: "follow-widget",
  computed: {
    following: function() {
      return this.followees.findIndex(obj => obj.id === this.followeeId) !== -1;
    }
  },
  methods: {
    async follow() {
      const resp = await fetch(`/profile/follow/`, {
        body: "followee_id=" + this.followeeId,
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": getCookie("csrftoken")
        }
      });
      if (resp.ok) {
        this.followees.push((await resp.json()).current);
      } else {
        this.$buefy.toast.open({
          message: "Failed to follow! Try again",
          type: "is-danger"
        });
      }
    },
    async unfollow() {
      const resp = await fetch(`/profile/unfollow/`, {
        body: "followee_id=" + this.followeeId,
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": getCookie("csrftoken")
        }
      });
      if (resp.ok) {
        const idx = this.followees.findIndex(obj => obj.id === this.followeeId);
        this.followees.splice(idx, 1);
      } else {
        this.$buefy.toast.open({
          message: "Failed to follow! Try again",
          type: "is-danger"
        });
      }
    }
  },
  data() {
    return {
      followee: {}
    };
  },
  props: ["followeeId", "followees"]
};
</script>

<style>
</style>