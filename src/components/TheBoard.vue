<template>
  <div class="board">
    <div class="board__header">
      <h1 class="board__name">
        {{ queryTitle }}
        <slot name="title" />
      </h1>

      <SearchBar class="board__mobile-search is-flex-touch" searchable />
    </div>
    <hr class="board__divider" v-if="title" />

    <TheBoardTable :posts="board.results" :fromQuery="fromQueryWithPage" />

    <div class="board__navbar">
      <ThePaginator
        :numPages="board.num_pages"
        :currentPage="board.current">
      </ThePaginator>
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue'
import ThePaginator from '@/components/ThePaginator.vue'
import TheBoardTable from '@/components/TheBoardTable.vue'

export default {
  name: 'the-board',
  props: {
    board: { required: true },
    title: { type: String },
    fromQuery: {}
  },
  computed: {
    fromQueryWithPage () {
      const query = {
        ...this.fromQuery
      }

      if (this.$route.query.query) {
        query.search_query = this.$route.query.query
      }

      if (this.$route.query.page) {
        query.from_page = this.$route.query.page
      }

      return query
    },
    queryTitle () {
      if (this.$route.query.query) { return this.$t('search', { title: this.title, query: this.$route.query.query }) }

      return this.title
    }
  },
  components: {
    SearchBar,
    ThePaginator,
    TheBoardTable
  }
}
</script>

<i18n>
ko:
  search: '{title}에서 {query} 검색'

en:
  search: 'Search {query} from {title}'
</i18n>

<style lang="scss" scoped>
.board {
  min-width: 100%;

  &__mobile-search {
    display: none;
    margin-bottom: 1rem;
  }

  &__name {
    flex-shrink: 0;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  &__divider {
    margin-top: 0;
  }
}
</style>
