<template>
  <div class="comment-editor">
    <label class="textarea comment-editor__input">
      <div class="comment-editor__author"> {{ userNickname }} </div>
      <div class="comment-editor__content">
        <textarea
          :placeholder="$t('placeholder')"
          v-model="content"
          ref="input"
          class="comment-editor__editor"
          rows="2"
          :style="{ height }"
          @keydown.shift.enter.prevent="saveComment"
          @input="autosize"
        />
      </div>
    </label>

    <div class="comment-editor__buttons">
      <button
        v-if="editComment || parentComment"
        @click="closeComment"
        class="button is-text comment-editor__submit"
        :class="{ 'is-loading': isUploading }"
        :disabled="isUploading"
      >
        {{ $t('close-comment') }}
      </button>

      <button
        @click="saveComment"
        class="button is-text comment-editor__submit"
        :class="{ 'is-loading': isUploading }"
        :disabled="isUploading"
      >
        {{ $t('new-comment') }}
      </button>
    </div>
  </div>
</template>

<script>
import { createComment, updateComment } from '@/api'
import { mapGetters } from 'vuex'

export default {
  name: 'PostCommentEditor',

  data () {
    return {
      content: this.text,
      height: 'auto',
      isUploading: false
    }
  },

  props: {
    text: {
      type: String,
      default: ''
    },

    parentArticle: {
      default: null
    },

    parentComment: {
      default: null
    },

    editComment: {
      default: null
    }
  },

  computed: {
    ...mapGetters([ 'userNickname' ])
  },

  methods: {
    autosize () {
      this.height = 'auto'
      this.$nextTick(() => {
        const contentHeight = this.$refs.input.scrollHeight
        this.height = `${contentHeight}px`
      })
    },

    async saveComment () {
      if (this.isUploading) {
        return
      }

      this.isUploading = true

      try {
        const result = this.editComment
          ? (await updateComment(this.editComment, {
            content: this.content
          }))

          : (await createComment({
            parent_article: this.parentArticle,
            parent_comment: this.parentComment,
            content: this.content
          }))

        this.$emit('upload', result)
        this.content = ''
        this.autosize()
      } catch (err) {
        this.$store.dispatch('dialog/toast', {
          text: this.$t('write-failed'),
          type: 'error'
        })
      }

      this.isUploading = false
    },

    closeComment () {
      this.$emit('close')
    },

    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>

<i18n>
ko:
  placeholder: '댓글을 작성하세요.'
  new-comment: '등록'
  close-comment: '취소'
  write-failed: '댓글 작성에 실패하였습니다'

en:
  placeholder: 'Type here...'
  new-comment: 'Send'
  close-comment: 'Cancel'
  write-failed: 'Failed to write comment'
</i18n>

<style lang="scss" scoped>
  .comment-editor {
    position: relative;

    &__input {
      padding: 18px 24px;
      max-height: none;
      min-height: unset;
      height: auto;
    }

    &__editor {
      resize: none;
      font-size: 1rem;
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
    }

    &__author {
      padding-bottom: 7px;
      font-size: .85rem;
      font-weight: 500;
      white-space: nowrap;
      z-index: 1;
    }

    &__buttons {
      position: absolute;
      color: var(--grey-600);
      right: 24px;
      bottom: 18px;

      button {
        text-decoration: none;
      }
    }
  }
</style>
