<template>
  <div class="searchbar field">
    <form class="control has-icons-right" @submit.prevent="search">
      <input class="input is-medium" name="query" type="text" v-model="searchText">
      <button class="icon is-small is-right" type="submit">
        <i class="material-icons">search</i>
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return { searchText: '' }
  },

  props: {
    searchable: Boolean
  },

  methods: {
    search () {
      if (!this.searchable) {
        this.$router.push({ name: 'board', query: { query: this.searchText } })
        return
      }

      this.$router.push({ query: { query: this.searchText } })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/theme.scss";

.searchbar {
  button.icon {
    cursor: pointer;
    background: transparent;
    border: none;
    pointer-events: auto;
  }

  @include breakPoint(min) {
    .input {
      height: 2.5rem;
      font-size: .8rem;
    }
  }
}
</style>
