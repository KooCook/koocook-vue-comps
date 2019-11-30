<template>
  <div>
    <input type="hidden" name="image" id="id_image" v-model="JSON.stringify(images)" />
    <input type="hidden" name="video" id="id_video" />
    <form v-if="showAttach" class="holder-form" use-html5-validation @submit.prevent="addImage">
      <span class="details">
        <a class="delete" @click="hideAttachDialog()"></a>
        <div class="content">
          <span v-for="(url,i) in attachmentUrls">
            Image {{ i + 1 }} URL:
            <b-field>
              <b-input
                v-model="url.src"
                placeholder="Enter the URL of an image"
                size="is-small"
                icon="link"
                type="url"
                required
              ></b-input>
            </b-field>
          </span>
          <button class="button add-url-row" type="button" @click="addUrl()">
            <b-icon icon="plus" size="is-medium"></b-icon>
          </button>
          <button type="submit">Attach links</button>
        </div>
      </span>
    </form>
    <b-carousel
      v-if="carousels.length > 0"
      :indicator="true"
      :indicator-inside="indicatorInside"
      :indicator-mode="indicatorMode"
      :indicator-style="indicatorStyle"
    >
      <b-carousel-item v-for="(carousel, i) in carousels" :key="i">
        <span v-if="carousel.src" class="image">
          <img class="recipe-image-carousel" :src="carousel.src" />
        </span>
        <section v-else :class="`hero is-medium is-${carousel.color}`">
          <div class="hero-body has-text-centered">
            <h1 class="title">{{carousel.title}}</h1>
          </div>
        </section>
      </b-carousel-item>
      <button
        class="add-another-image-btn"
        type="button"
        @click="showAttachDialog()"
      >Customise links</button>
    </b-carousel>
    <div
      @click="showAttachDialog()"
      :class="showAttach ? 'dashed-placeholder expanded' : 'dashed-placeholder'"
      v-else
    >
      <div>
        <div class="is-horizontal-center">
          <img src="https://image.flaticon.com/icons/svg/1515/1515601.svg" width="75px" />
        </div>
        <div>No image attached. Please attach at least one.</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "image-holder",
  data() {
    return {
      images: [],
      showAttach: false,
      expandedClass: "expanded",
      indicator: true,
      indicatorInside: true,
      indicatorMode: "hover",
      indicatorStyle: "is-dots",
      attachmentUrls: [{ src: "" }],
      carousels: []
    };
  },
  methods: {
    showAttachDialog() {
      this.showAttach = true;
      this.indicator = true;
    },
    hideAttachDialog() {
      this.showAttach = false;
      this.indicator = false;
    },
    addImage() {
      this.carousels = this.attachmentUrls;
      this.images = [];
      this.carousels.forEach(element => this.images.push(element.src));
      this.showAttach = false;
    },
    addUrl() {
      this.attachmentUrls.push({ src: "" });
    }
  },
  props: ["videos"]
};
</script>

<style>
</style>