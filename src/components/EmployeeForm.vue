<template>
  <div id="employee-form">
    <form v-on:submit.prevent="handleSubmit">
      <label>Name</label>
      <input v-model="person.name" type="text" />
      <label>Email</label>
      <input v-model="person.email" type="text" />
        <p v-if="error && submitting" class="error-message">
            ❗Please fill out all required fields
        </p>
        <p v-if="success" class="success-message">
            ✅ Person successfully added
        </p>
      <button>Add data</button>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'employee-form',
    data() {
      return {
        submitting: false,
        error: false,
        success: false,
        person: {
          name: '',
          email: '',
        },
      }
    },
    methods: {
        handleSubmit() {

            this.submitting = true
            this.clearStatus()

            if (this.invalidName || this.invalidEmail) {
                this.error = true
                return
            }
            this.$emit('add:person', this.person)
            this.person = {
                name: '',
                email: '',
                }
            this.error = false
            this.success = true
            this.submitting = false
        },
        clearStatus() {
            this.success = false
            this.error = false
        }
    },
    computed: {
    invalidName() {
      return this.person.name === ''
    },

    invalidEmail() {
      return this.person.email === ''
    },
  },
  }
</script>

<style scoped>
  form {
    margin-bottom: 2rem;
  }

  [class*='-message'] {
    font-weight: 500;
  }

  .error-message {
    color: #d33c40;
  }

  .success-message {
    color: #32a95d;
  }
</style>