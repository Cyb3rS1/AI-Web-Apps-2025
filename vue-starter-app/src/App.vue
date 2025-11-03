

<template>
  <MyNavBar />
  <div class="p-3">
    <h1 class="text-center text-success">{{ title }} {{ yourName }}</h1>
  

  <!-- Parent owns yourName -->
  <DemoForm 
  v-model:yourName="yourName" 
  v-model:subject="subject" 
  v-model:recipientEmail="recipientEmail"
  v-model:recipientName="recipientName"
  v-model:emailColor="emailColor"
  v-model:message="message"/>

  </div>
  <MyFooter />
</template>

<script>
import MyNavBar from './components/NavBar.vue';
import MyFooter from './components/Footer.vue';
import DemoForm from './components/DemoForm.vue';
export default {
  data() {
    return { 
      title: 'Welcome',
      yourName: '',
      subject: '',
      recipientEmail: '',
      recipientName: '',
      emailColor: '#FFFFFF',
      message: ''

     }
  },
  components: {
    MyNavBar,
    DemoForm,
    MyFooter 
  }
}
</script>

<style>
/* h1 {
  color: #42b983;
  font-family: sans-serif;
} */
</style>