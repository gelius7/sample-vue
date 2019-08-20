<template>
  <div id="app" class="small-container">
    <div id="logo">
        <img alt="Vue logo" src="./assets/logo.png">
    </div>
    <h1>Sample Vue</h1>

    <employee-form @add:person="addEmployee" />

    <employee-table v-bind:people="peopleData" />
  </div>
</template>

<script>
  import EmployeeForm from '@/components/EmployeeForm.vue'
  import EmployeeTable from '@/components/EmployeeTable.vue'

  export default {
    name: 'app',
    components: {
      EmployeeTable,
      EmployeeForm,
    },
    data() {
        return {
            peopleData: [
                {
                id: 1,
                name: 'Kim me',
                email: 'me@gmail.com',
                },
                {
                id: 2,
                name: 'Lee you',
                email: 'reason@never.com',
                },
                {
                id: 3,
                name: 'Park he',
                email: 'ph@omg.com',
                },
                {
                id: 4,
                name: 'Jang she',
                email: 'hey@jang.com',
                },
            ],
        }
    },
    methods: {
        addEmployee(person) {
            const lastId =
                this.people.length > 0
                ? this.people[this.people.length - 1].id
                : 0;
            const id = lastId + 1;
            const newEmployee = { ...person, id };

            this.people = [...this.people, newEmployee];
        }
    }
  }
</script>

<style>
#logo{
    text-align: center;
}
  button {
    background: #009435;
    border: 1px solid #009435;
  }

button:hover,
button:active,
button:focus {
  background: #32a95d;
  border: 1px solid #32a95d;
}

  .small-container {
    max-width: 680px;
  }
</style>