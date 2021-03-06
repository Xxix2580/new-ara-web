<template>
  <div class="comment-wrapper">
    <div class="comment" :class="{'comment--reply-comment': isReplyComment}" v-if="!isEditing">
      <img class="comment__profile" :src="profileImage" />
      <div class="comment__body">
        <div class="comment__header">
          <router-link :to="{ name: 'user', params: { username: authorId } }" class="comment__author">
            {{ author }}
          </router-link>

          <span class="comment__time"> {{ date }} </span>

          <div class="dropdown is-right is-hoverable">
            <div class="dropdown-trigger">
              <button class="dropdown-button" aria-haspopup="true" aria-controls="dropdownMenu">
                <span class="icon">
                  <i class="material-icons">more_vert</i>
                </span>
              </button>
            </div>

            <div class="dropdown-menu" id="dropdownMenu" role="menu">
              <div class="dropdown-content">
                <div class="dropdown-item">
                  <template v-if="userNickname === author">
                    <a @click="editComment" class="dropdown-item">
                      {{ $t('edit') }}
                    </a>

                    <a @click="deleteComment" class="dropdown-item">
                      {{ $t('delete') }}
                    </a>
                  </template>

                  <a v-else @click="reportComment" class="dropdown-item">
                    {{ $t('report') }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="comment__content">{{comment.content}}</div>

        <div class="comment__footer">
          <LikeButton class="comment__vote" :item="comment" @vote="vote" votable />
          <a class="comment__write" v-if="!isReplyComment"
            @click="toggleReplyCommentInput">
            {{
              showReplyCommentInput
              ? $t('fold-reply-comment')
              : $t('reply-comment')
            }}
          </a>
        </div>
      </div>
    </div>

    <div class="comment comment--edit" :class="{'comment--reply-comment': isReplyComment}" v-else>
      <PostCommentEditor
        :text="comment.content"
        :edit-comment="comment.id"
        @upload="updateComment"
        @close="isEditing = false"
      />
    </div>

    <div class="comment__reply-comments">
      <PostComment
        v-for="replyComment in comment.comments"
        is-reply-comment
        :key="replyComment.id"
        :comment="replyComment"
        @vote="$emit('vote')"
        @delete="$emit('delete')"
        @update="$emit('update', $event)"
        @upload="$emit('upload', $event)"
      />

      <div v-show="showReplyCommentInput">
        <PostCommentEditor
          :parent-comment="comment.id"
          ref="commentEditor"
          @upload="$emit('upload', $event)"
          @close="showReplyCommentInput = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LikeButton from '@/components/LikeButton.vue'
import PostCommentEditor from '@/components/PostCommentEditor.vue'

import { mapGetters } from 'vuex'
import { voteComment, deleteComment, reportComment } from '@/api'
import { timeago } from '@/helper.js'

export default {
  name: 'PostComment',

  props: {
    comment: { required: true },
    isReplyComment: Boolean
  },

  data () {
    return {
      isEditing: false,
      isVoting: false,
      showReplyCommentInput: false
    }
  },

  computed: {
    author () { return this.comment.created_by.profile.nickname },
    authorId () { return this.comment.created_by.id },
    profileImage () { return this.comment.created_by.profile.picture },
    date () { return timeago(this.comment.created_at, this.$i18n.locale) },
    ...mapGetters([ 'userNickname' ])
  },

  methods: {
    async vote (ballot) {
      this.isVoting = true
      await voteComment(this.comment.id,
        this.comment.my_vote === ballot
          ? 'vote_cancel'
          : ballot ? 'vote_positive' : 'vote_negative'
      )
      this.$emit('vote')
      this.isVoting = false
    },

    toggleReplyCommentInput () {
      this.showReplyCommentInput = !this.showReplyCommentInput
      this.$nextTick(() => {
        this.$refs.commentEditor.focus()
      })
    },

    async deleteComment () {
      const result = await this.$store.dispatch('dialog/confirm', this.$t('confirm-delete'))
      if (!result) return

      await deleteComment(this.comment.id)
      this.$emit('delete')
    },

    async reportComment () {
      const result = await this.$store.dispatch('dialog/confirm', this.$t('confirm-report'))
      if (!result) return

      await reportComment(this.comment.id)
    },

    editComment () {
      this.isEditing = true
    },

    updateComment (event) {
      this.isEditing = false
      this.$emit('update', event)
    }
  },

  components: {
    LikeButton,
    PostCommentEditor
  }
}
</script>

<i18n>
ko:
  delete: '삭제'
  report: '신고'
  edit: '수정'
  fold-reply-comment: '답글접기'
  reply-comment: '답글쓰기'
  placeholder: '입력...'
  new-reply-comment: '작성하기'
  confirm-delete: '정말로 이 댓글을 삭제하시겠습니까?'
  confirm-report: '정말로 이 댓글을 신고하시겠습니까?'
en:
  delete: 'Delete'
  report: 'Report'
  edit: 'Edit'
  fold-reply-comment: 'Close reply'
  reply-comment: 'Reply'
  placeholder: 'Type here...'
  new-reply-comment: 'Send'
  confirm-delete: 'Are you really want to delete this comment?'
  confirm-report: 'Are you really want to report this comment?'
</i18n>

<style lang="scss" scoped>
.dropdown-button {
  border: none;
  outline: none;
  background: transparent;

  .material-icons {
    font-size: .9rem;
  }
}

.dropdown-content {
  min-width: 30%;
  max-width: 50%;
  float: right;
  text-align: right;
}

.dropdown-item {
  padding: 0.375rem 0.4rem
}

.comment {
  display: flex;
  margin: 24px 0;

  &--edit {
    display: block;
  }

  &__content {
    white-space: pre-wrap;
  }

  &__profile {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--grey-300);
    margin-right: 24px;
  }

  &__header {
    display: flex;
    align-items: center;
  }

  &__time {
    color: var(--grey-600);
    font-size: .75rem;
    margin-left: 10px;
  }

  &__author {
    font-size: .9rem;
  }

  &__footer {
    display: flex;
    margin-top: 8px;
  }

  &__write {
    margin-left: 20px;
  }

  &__reply-comments {
    margin-left: 24px;
  }
}
</style>
