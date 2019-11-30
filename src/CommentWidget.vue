
<template>
  <div style="display: block;">
    <article class="media" v-for="(comment, index) in comments" :key="index">
      <figure class="media-left">
        <p class="image is-64x64">
          <!-- <img src="../assets/img/placeholders/128x128.png"> -->
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <p>
            <strong>{{ comment.author.qualified_name }}</strong>
            <star-rating
              v-if="comment.id"
              :read-only="comment.author.id === authorId"
              :rate-url="rateURL.format(comment.id)"
              :item-id="comment.id"
              :initial="comment.aggregate_rating.rating_value"
            ></star-rating>
            <span v-html="comment.rendered"></span>
            <small>
              <!--<a>Like</a> ·-->
              <a @click="comment.showReplies = !comment.showReplies">
                <span v-if="!comment.showReplies">
                  <span v-if="comment.replies">{{ comment.replies }}</span>Reply
                </span>
                <span v-else>Hide replies</span>
              </a>
              · {{ comment.date_published|time-passed }}
            </small>
          </p>
        </div>
        <comments-widget
          @declare_replies="comment.replies = $event"
          :author-id="authorId"
          v-show="comment.showReplies"
          is-reply="true"
          :item-id="comment.id"
          item-name="this comment"
        ></comments-widget>
      </div>
    </article>
    <article class="media">
      <figure class="media-left">
        <p class="image is-64x64">
          <!-- <img src="../assets/img/placeholders/128x128.png"> -->
        </p>
      </figure>
      <div class="media-content" id="comments">
        <form method="post" novalidate @submit.prevent="postComment()">
          <strong>What do you think about {{ itemName }}?</strong>
          <div class="field">
            <p class="control">
              <formatted-textarea-md
                v-model="comment.body"
                placeholder="Add a comment..."
                required="required"
                class="textarea"
              ></formatted-textarea-md>
            </p>
            <b-loading :is-full-page="false" :active.sync="pending"></b-loading>
          </div>
          <div class="field">
            <p class="control">
              <button class="button is-primary" type="submit">Post comment</button>
            </p>
          </div>
        </form>
      </div>
    </article>
  </div>
</template>

<script>
const REPLIES_ENDPOINTS = {
  GET: `/comments/{0}`,
  POST: `/comments/{0}/comment`,
  PATCH: `/comments/{0}`,
  rate: {
    POST: `/comments/{0}/rate`
  }
};

/**
 * A Vue component
 * Comments widget
 *
 * @param {item-id} - An item id (required)
 * @param {item-name} - An item name
 *
 * @requires {COMMENTS_ENDPOINTS} - URL endpoints for each HTTP verbs, namely GET, POST, and PATCH.
 *
 */
export default {
  name: "comments-widget",
  data: function() {
    return {
      comment_endpoints: COMMENTS_ENDPOINTS,
      replies: 0,
      rateURL: REPLIES_ENDPOINTS.rate.POST,
      comments: [],
      comment: {
        body: ""
      },
      pending: false
    };
  },
  props: ["itemId", "itemName", "isReply", "customUrl", "authorId"],
  mounted: async function() {
    const comments = await this.prefetchData();
    if (Array.isArray(comments)) {
      comments.forEach(function(v) {
        v.showReplies = false;
        v.replies = 0;
      });
      if (this.isReply) this.$emit("declare_replies", comments.length);
      this.comments = comments;
    }
  },
  methods: {
    async prefetchData() {
      this.comment_endpoints = this.isReply
        ? REPLIES_ENDPOINTS
        : COMMENTS_ENDPOINTS;
      const endpoint =
        this.isReply || this.customUrl
          ? this.comment_endpoints.GET.format(this.itemId)
          : this.comment_endpoints.GET;
      return (await (await fetch(endpoint)).json()).current;
    },
    async postComment() {
      if (this.pending) return;
      this.pending = true;
      const endpoint = this.customUrl
        ? this.comment_endpoints.POST.format(this.itemId)
        : this.comment_endpoints.POST.format(this.itemId);
      const formBody = new FormData();
      formBody.set("body", this.comment.body);
      formBody.set("item_id", this.itemId);
      const resp = await fetch(endpoint, {
        body: new URLSearchParams(formBody),
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": getCookie("csrftoken")
        }
      });
      if (resp.ok) {
        this.pending = false;
        this.$buefy.toast.open({
          message: "Successfully commented!",
          type: "is-success"
        });
        this.comments.push((await resp.json()).current);
      } else {
        this.pending = false;
        this.$buefy.toast.open({
          message: "Commenting failed! Try again",
          type: "is-danger"
        });
      }
    }
  }
};
</script>

<style>
</style>