<template>
  <div class="border pt-2">
    <h2 class="text-center">Email Client</h2>
    <form @submit.prevent>
      <span class="d-flex gap-3 flex-row flex-wrap p-3"> 
        <label>Your Name</label>
        <input class="border-0 border-bottom"
          :value="yourName"
          @input="$emit('update:yourName', $event.target.value)"
          type="text"
          placeholder="Ms. Pretty"
        /><br></br>
        <label>Subject</label>
        <input class="border-0 border-bottom"
          :value="subject"
          @input="$emit('update:subject', $event.target.value)"
          type="text"
          placeholder="Subject"
        />
        <label>Recipient Email</label>
        <input class="border-0 border-bottom"
          :value="recipientEmail"
          @input="$emit('update:recipientEmail', $event.target.value)"
          type="text"
          placeholder="cindylou@example.com"
        />
        <label>Recipient Name</label>
        <input class="border-0 border-bottom"
          :value="recipientName"
          @input="$emit('update:recipientName', $event.target.value)"
          type="text"
          placeholder="Their name"
        />
        <label>Email Color</label>
        <input class="border-0 border-bottom"
          :value="emailColor"
          @input="$emit('update:emailColor', $event.target.value)"
          type="color"
        />
      </span>
      <span class="d-flex gap-3 flex-column border m-2 p-3" :style="{ backgroundColor: emailColor }">
        <section class="border-bottom">
          <h5 v-if="subject">Subject: {{ subject }}</h5>
          <h5 v-else>Subject:</h5>
        </section>
        <p v-if="recipientName">Dear {{ recipientName }},</p>
        <p v-else="" class="d-none"></p>
        <input
          :value="message"
          @input="$emit('update:message', $event.target.value)"
          type="text"
          placeholder="Your message here"
        />
        <p v-if="yourName">From, {{ yourName }}</p>
        <p v-else="" class="d-none"></p>
      </span>
    </form>
  </div>
</template>

<script>
export default {
  name: 'DemoForm',
  props: { 
    yourName: String, 
    subject: String,
    recipientEmail: String,
    recipientName: String,
    emailColor: String,
    message: String,
   }, 
            
  emits: [
    'update:yourName', 
    'update:subject', 
    'update:recipientEmail', 
    'update:recipientName',
    'update: emailColor',
    'update: message']                               
}
</script>