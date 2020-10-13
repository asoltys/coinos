<template>
  <div>
    <h1>Canadian Dollar Funding Options</h1>
    <p>
      Fund your account with Canadian dollars via Interac e-Transfer or Bank
      Wire
    </p>

    <p>
      You'll receive an equivalent amount of
      <v-btn class="black--text" color="liquid">CAD</v-btn> in return, a
      stablecoin we've issued on the Liquid network that's backed with dollars
      in our bank account.
    </p>

    <p>
      You can opt to self-custody your
      <v-btn class="black--text" color="liquid">CAD</v-btn> in a non-custodial
      or 3rd party wallet, trade it for bitcoin or other assets on our exchange,
      or redeem it here at face value and choose to receive payment by Interac
      or Bank Wire.
    </p>

    <v-stepper v-model="e1">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1" color="green">
          Contact Information
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2">
          Upload Documents
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3">
          Choose a Funding Method
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card class="mb-12">
            <v-card-text>
              <v-form>
                <div class="d-flex flex-wrap">
                  <v-text-field label="First Name" class="mr-2" />
                  <v-text-field label="Middle Name" class="mr-2" />
                  <v-text-field label="Last Name" />
                </div>
                <div class="d-flex flex-wrap">
                  <v-text-field label="Suite/Unit" class="flex-grow-0 mr-2" />
                  <v-text-field label="Address 1" class="flex-grow-1" />
                </div>
                <div class="d-flex">
                <v-text-field label="Country" value="Canada" readonly />
                <v-select label="Province/Territory" :items="provinces" />
                  </div>
                <v-text-field label="Email" />
                <v-text-field label="Phone" />
              </v-form>
            </v-card-text>
          </v-card>

          <v-btn @click="e1 = 2">
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

          <v-btn @click="e1 = 3">
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

          <v-btn @click="e1 = 1">
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
export default {
  data: () => ({
    e1: 1,
    provinces: [
      {
        text: 'Alberta',
        value: 'AB',
      },
      {
        text: 'British Columbia',
        value: 'BC',
      },
      {
        text: 'Manitoba',
        value: 'MB',
      },
      {
        text: 'New Brunswick',
        value: 'NB',
      },
      {
        text: 'Newfoundland and Labrador',
        value: 'NL',
      },
      {
        text: 'Northwest Territories',
        value: 'NT',
      },
      {
        text: 'Nova Scotia',
        value: 'NS',
      },
      {
        text: 'Nunavut',
        value: 'NU',
      },
      {
        text: 'Ontario',
        value: 'ON',
      },
      {
        text: 'Prince Edward Island',
        value: 'PE',
      },
      {
        text: 'Quebec',
        value: 'QC',
      },
      {
        text: 'Saskatchewan',
        value: 'SK',
      },
      {
        text: 'Yukon Territory',
        value: 'YT',
      },
    ],
  }),
};
</script>
