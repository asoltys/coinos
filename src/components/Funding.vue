<template>
  <div>
    <v-card class="mb-2" color="secondary">
      <v-card-text class="white--text body-1">
        <p>
          <v-icon>$canada</v-icon>
          <b>Oct 15, 2020</b>
        </p>

        <p>
          Coinos now supports Canadian dollar funding and withdrawals for
          verified users. When you fund your account with Interac or Bank Wire,
          we'll credit your wallet with
          <v-btn color="liquid" class="black--text toggle">CAD</v-btn>, a
          stablecoin we've issued on the Liquid network that's fully backed by
          Canadian dollars in our bank account.
        </p>

        <p>
          You can trade
          <v-btn color="liquid" class="black--text toggle">CAD</v-btn> for
          bitcoin or other assets, or transfer it to another liquid wallet or
          exchange. We'll buy it back at par when you issue a withdrawal
          request.
        </p>
      </v-card-text>
    </v-card>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step
          :complete="step > 1"
          step="1"
          color="green"
          complete-icon="$check"
        >
          Funding Method
        </v-stepper-step>

        <v-stepper-step
          :complete="step > 2"
          step="2"
          color="green"
          complete-icon="$check"
        >
          Contact Information
        </v-stepper-step>

        <v-stepper-step step="3" color="green" complete-icon="$check">
          Upload Documents
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card class="mb-2">
            <v-card-text class="body-1">
              <div class="d-flex">
                <v-btn-toggle
                  v-model="method"
                  tile
                  color="primary accent-3"
                  group
                  class="mx-auto flex-wrap mb-4 text-center"
                >
                  <v-btn value="interac" class="flex-grow-1">
                    <v-icon left color="grey">$interac</v-icon>
                    Interac e-Transfer
                  </v-btn>
                  <v-btn value="wire" class="flex-grow-1">
                    <v-icon left color="pink">$bank</v-icon>
                    Bank Wire
                  </v-btn>
                </v-btn-toggle>
              </div>

              <div v-if="method === 'interac'">
                <ol class="mb-2">
                  <li>
                    Send an Interac e-Transfer to:
                    <span class="title white--text">funding@coinos.io</span>
                  </li>
                  <li>
                    Use your username as the security question:
                    <span class="white--text title">{{ user.username }}</span>
                  </li>
                  <li>
                    Use this code as the security answer:
                    <span class="white--text title">12345</span>
                  </li>
                </ol>
              </div>
              <div v-if="method === 'wire'">
                <ol class="mb-2">
                  <li>
                    Send a wire transfer to our account at CIBC:
                  </li>
                  <p>
                    CIBC Swift Code:
                    <span class="white--text title">CIBCCATT</span><br />
                    CIBC Institution Number:
                    <span class="white--text title">010</span><br />
                    Transit Number: <span class="white--text title">07500</span
                    ><br />
                    Account Number:
                    <span class="white--text title">1029002</span>
                  </p>
                  <li>
                    Put this as the reference code:
                    <span class="white--text title">coinos-12345</span>
                  </li>
                </ol>
                <v-text-field label="Amount" suffix="CAD" />
              </div>
            </v-card-text>
          </v-card>

          <div class="text-right">
            <v-btn @click="step = 2">
              <v-icon color="primary" left>$right</v-icon>
              Next
            </v-btn>
          </div>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-card class="mb-2">
            <v-card-text>
              <v-form>
                <div class="d-flex flex-wrap">
                  <v-text-field label="First Name" class="mr-2" />
                  <v-text-field label="Middle Name" class="mr-2" />
                  <v-text-field label="Last Name" />
                </div>
                <div class="d-flex flex-wrap">
                  <v-text-field label="Suite/Unit" class="flex-grow-0 mr-2" />
                  <v-text-field label="Street Address" class="flex-grow-1" />
                </div>
                <div class="d-flex">
                  <v-text-field
                    label="Country"
                    value="Canada"
                    readonly
                    class="mr-2"
                  />
                  <v-select label="Province/Territory" :items="provinces" />
                </div>
                <v-text-field label="Email" />
                <v-text-field label="Phone" />
              </v-form>
            </v-card-text>
          </v-card>

          <div class="text-right">
            <v-btn @click="step = 1">
              <v-icon color="primary" left>$left</v-icon>
              Back
            </v-btn>
            <v-btn @click="step = 3">
              <v-icon color="primary" left>$right</v-icon>
              Next
            </v-btn>
          </div>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card class="mb-2">
            <v-card-text>
              <v-form>
                <v-file-input
                  prepend-icon="$paperclip"
                  label="Passport or Driver's Licence"
                  hint="A clear photo/scan of your ID"
                  persistent-hint
                  accept=".pdf,image/*"
                />
                <v-file-input
                  prepend-icon="$paperclip"
                  label="Selfie with ID and Message"
                  hint="Selfie of you holding up your ID and a piece of paper with the word 'COINOS' and today's date written on it"
                  persistent-hint
                  accept=".pdf,image/*"
                />
              </v-form>
            </v-card-text>
          </v-card>

          <div class="text-right">
            <v-btn @click="step = 2">
              <v-icon color="primary" left>$left</v-icon>
              Back
            </v-btn>
            <v-btn @click="submit">
              <v-icon color="primary" left>$check</v-icon>
              Submit
            </v-btn>
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';

export default {
  data: () => ({
    method: 'interac',
    step: 1,
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
  computed: {
    user: get('user'),
  },
};
</script>
