<template>
  <span>
    <input :name="name" type="hidden" v-model="duration" />
    <b-timepicker :enableSeconds="enableSeconds" v-model="time" inline></b-timepicker>
  </span>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: () => ""
    },
    initial: {
      type: String,
      default: () => { return this.enableSeconds ? "00:00:00" : "00:00"}
    },
    enableSeconds: {
        type: Boolean,
        default: false
    }
  },
  name: "duration-input",
  computed: {
      duration: {
            get: function () {
                return this.convertDateToDuration(this.time)
            },
        set: function (newValue) {
            this.time = this.convertDurationToDate(newValue)
        }
      }
  },
  data() {
    return {
      time: this.convertDurationToDate(this.initial)
    };
  },
  methods: {
    convertDurationToDate(duration) {
        const time = duration.split(':')
        let hours = parseInt(time[0], 10)
        const minutes = parseInt(time[1], 10)
        const seconds = this.enableSeconds ? parseInt(time[2], 10) : 0
        let d = new Date();
        d.setMilliseconds(0);
        d.setSeconds(seconds)
        d.setMinutes(minutes)
        // if (vm.hourFormat === HOUR_FORMAT_12) {
        //     if (am && hours === 12) {
        //         hours = 0
        //     } else if (!am && hours !== 12) {
        //         hours += 12
        //     }
        // }
        d.setHours(hours)
        return d;
    },
    convertDateToDuration(date) {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }
  }
};
</script>

<style>
</style>