<template></template>

<script>
export default {
  name: "followee-list",
  data() {
    return {
      followees: []
    };
  },
  mounted: async function() {
    const resp = await fetch(`/profile/follow/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-CSRFToken": getCookie("csrftoken")
      }
    });
    if (resp.ok) {
      if (typeof (await resp.clone().json()).current == "undefined")
        this.$data.followees = [];
      else this.$data.followees = (await resp.clone().json()).current;
      this.$forceUpdate();
    } else {
      this.$buefy.toast.open({
        message: "Failed to follow! Try again",
        type: "is-danger"
      });
    }
  }
};
</script>

<style>
</style>