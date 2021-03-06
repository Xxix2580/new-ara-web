<template>
  <TheLayout class="post" :key="postId">
    <template #aside>
      <TheSidebar />
    </template>

    <ThePostHeader
      :post="post"
      :context="context"
      :showHidden="showHidden"
      @archive="archive"
      @report="report"
      @vote="vote"
      @block="block"
    />

    <ThePostDetail
      :post="post"
      :showHidden="showHidden"
      @archive="archive"
      @report="report"
      @vote="vote"
      @show-hidden="showHidden = true"
    />

    <ThePostComments
      :comments="post.comments"
      :postId="postId"
      @upload="addNewComment"
      @update="updateComment"
      @refresh="refresh"
    />
    <ThePostNavigation :post="post" :context="context" />
    <!-- @TODO: <TheBoard :board="board"/> -->
  </TheLayout>
</template>

<script>
import { archivePost, blockUser, fetchPost, reportPost, unarchivePost, unblockUser, votePost } from '@/api'
import { fetchWithProgress } from './helper.js'
import ThePostComments from '@/components/ThePostComments.vue'
import ThePostDetail from '@/components/ThePostDetail.vue'
import ThePostHeader from '@/components/ThePostHeader.vue'
import ThePostNavigation from '@/components/ThePostNavigation.vue'
import TheBoard from '@/components/TheBoard.vue'
import TheLayout from '@/components/TheLayout.vue'
import TheSidebar from '@/components/TheSidebar.vue'

export default {
  name: 'post',
  props: {
    postId: { required: true }
  },
  data () {
    return {
      post: {},
      showHidden: false
    }
  },
  computed: {
    /* eslint-disable camelcase */
    context () {
      const { from_view, from_page, search_query } = this.$route.query
      const query = {}
      if (from_page) {
        query['page'] = from_page
      }

      if (search_query) {
        query['query'] = search_query
      }

      switch (from_view) {
        case 'user':
          return { name: 'user', params: { username: this.$route.query.created_by }, query }

        case 'recent':
          query.board = 'recent'
          return { name: 'my-info', query }

        case 'scrap':
          return { name: 'archive', query }

        case 'all':
          return { name: 'board', query }

        default:
          return {
            name: 'board',
            params: {
              boardSlug: this.post.parent_board ? this.post.parent_board.slug : null
            },
            query
          }
      }
    }
  },
  methods: {
    async addNewComment (comment) {
      if (comment.parent_comment) {
        /* Save the new recomment in local first. */
        /*
        const rootComment = this.post.comments.find(parent => parent.id === comment.parent_comment)
        rootComment.comments = [
          ...rootComment.comments,
          comment
        ]
        */
        /* Then fetch data from DB. */
        return this.refresh()
      }

      /* Save the new comment in local first. */
      /*
      this.post.comments = [
        ...this.post.comments,
        comment
      ]
      */

      /* Then fetch data from DB. */
      return this.refresh()
    },

    async updateComment (update) {
      if (update.parent_comment) {
        const rootComment = this.post.comments.find(comment => comment.id === update.parent_comment)
        const replyIndex = rootComment.comments.findIndex(replyComment => replyComment.id === update.id)
        if (replyIndex < 0) return

        this.$set(rootComment.comments, replyIndex, update)
        return
      }

      const commentIndex = this.post.comments.findIndex(comment => comment.id === update.id)
      if (commentIndex < 0) return

      this.$set(this.post.comments, commentIndex, update)
    },

    // @TODO: 매번 refresh 하는게 최선인지는 좀 생각해 봐야할듯
    async refresh () {
      this.post = await fetchPost({ postId: this.postId, context: this.$route.query })
    },

    async vote ({ id, vote }) {
      await votePost(id, vote)
      await this.refresh()
    },

    async archive () {
      if (this.post.my_scrap) {
        await unarchivePost(this.post.my_scrap.id)
        this.post.my_scrap = null
        this.$store.dispatch('dialog/toast', this.$t('unarchived'))
      } else {
        const result = await archivePost(this.post.id)
        this.post.my_scrap = result
        this.$store.dispatch('dialog/toast', this.$t('archived'))
      }
      await this.$store.dispatch('fetchArchivedPosts')
    },

    async report () {
      const result = await this.$store.dispatch('dialog/confirm', this.$t('confirm-report'))
      if (!result) return

      await reportPost(this.post.id)
      this.$store.dispatch('dialog/toast', this.$t('reported'))
    },

    async block () {
      if (!this.post.created_by.is_blocked) {
        const result = await this.$store.dispatch('dialog/confirm', this.$t('confirm-block'))
        if (!result) return

        await blockUser(this.post.created_by.id)
        this.post.created_by.is_blocked = true
        this.$store.dispatch('dialog/toast', this.$t('blocked'))
      } else {
        await unblockUser(this.post.created_by.id)
        this.post.created_by.is_blocked = false
        this.$store.dispatch('dialog/toast', this.$t('unblocked'))
      }

      this.$router.push()
      /*
      const [ post ] = await fetchWithProgress([
        fetchPost({ postId: this.post.id, context: this.$route.query })
      ])
      this.post = post
      */
    }
  },

  async beforeRouteEnter ({ params: { postId }, query }, from, next) {
    const [ post ] = await fetchWithProgress([
      fetchPost({ postId, context: query })
    ])
    next(vm => { vm.post = post })
  },

  async beforeRouteUpdate ({ params: { postId }, query }, from, next) {
    const [ post ] = await fetchWithProgress([
      fetchPost({ postId, context: query })
    ])
    this.post = post
    this.showHidden = false
    next()
  },

  components: {
    TheBoard,
    TheLayout,
    ThePostComments,
    ThePostDetail,
    ThePostHeader,
    ThePostNavigation,
    TheSidebar
  }
}
</script>

<i18n>
ko:
  archived: '담아둔 게시글에 담아졌습니다!'
  unarchived: '담아둔 게시글에서 제거하였습니다!'
  reported: '신고되었습니다!'
  blocked: '해당 유저가 차단되었습니다!'
  unblocked: '해당 유저가 차단해제되었습니다!'
  confirm-report: '정말로 신고하시겠습니까?'
  confirm-block: '정말로 차단하시겠습니까?'

en:
  archived: 'Successfully added to your archive!'
  unarchived: 'Successfully removed from your archive!'
  reported: 'Successfully reported!'
  blocked: 'The user has been blocked!'
  unblocked: 'The user has been unblocked!'
  confirm-report: 'Are you really want to report this post?'
  confirm-block: 'Are you really want to block this user?'
</i18n>
