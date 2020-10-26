<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="body-1">
        <p>
          <v-icon>$canada</v-icon>
          <b>Hey Canucks!</b>
        </p>

        <p>
          Coinos now supports Canadian dollar funding and withdrawals for
          verified users. When you fund your account with Interac or Bank Wire,
          we'll credit your wallet with
          <v-btn
            color="liquid"
            class="black--text toggle"
            @click="viewCad"
            >CAD</v-btn
          >
          &mdash; a stablecoin we've issued on the Liquid network that's fully
          backed by Canadian dollars in our bank account.
        </p>

        <p>
          You can trade
          <v-btn
            color="liquid"
            class="black--text toggle"
            @click="viewCad"
            >CAD</v-btn
          >
          for bitcoin or other assets here, or transfer it to another liquid
          wallet or exchange. We'll buy it back at par when you issue a
          withdrawal request.
        </p>
      </v-card-text>
    </v-card>

    <div class="d-flex">
      <v-btn-toggle
        tile
        color="primary accent-3"
        group
        class="flex-wrap mx-auto mb-2"
        v-model="mode"
        mandatory
      >
        <v-btn class="flex-grow-1" v-show="user.verified !== 'verified'">
          <v-icon left color="green">$accountcheck</v-icon>
          Get Verified
        </v-btn>
        <v-btn class="flex-grow-1">
          <v-icon left color="pink">$download</v-icon>
          Fund Your Account
        </v-btn>
        <v-btn class="flex-grow-1">
          <v-icon left color="blue">$upload</v-icon>
          Request a Withdrawal
        </v-btn>
      </v-btn-toggle>
    </div>

    <v-progress-linear v-if="loading" indeterminate />
    <div v-else>
      <v-alert class="text-center">
        Your Verification Status:
        <span v-if="user.verified === 'verified'" class="title green--text"
          >Verified</span
        >
        <span v-if="user.verified === 'pending'" class="title primary--text"
          >Pending</span
        >
        <span v-if="!user.verified" class="title red--text">Not Verified</span>
      </v-alert>
      <v-card class="mb-2" v-if="mode === 0">
        <v-card-text>
          <div
            v-if="user.verified === 'pending' || (idSuccess && proofSuccess)"
          >
            <v-alert class="text-center font-weight-bold">
              <v-icon color="success" left>$check</v-icon>
              Documents Submitted!
            </v-alert>
            <p class="body-1">
              Your documents will need to be manually verified. This could take
              some time. Reach out to
              <a href="mailto:compliance@coinos.io">compliance@coinos.io</a> if
              you'd like a status update or need to resubmit your documents.
            </p>
          </div>
          <v-form v-else>
            <v-file-input
              prepend-icon="$paperclip"
              label="Passport or Driver's Licence"
              hint="A clear photo/scan of your ID"
              persistent-hint
              accept=".pdf,image/*"
              @change="changeId"
              :loading="idLoading"
              :success="id && idSuccess"
              v-model="id"
              :append-icon="id && idSuccess ? '$check' : null"
            />
            <v-file-input
              prepend-icon="$paperclip"
              label="Selfie with ID and Message"
              hint="Selfie of you holding up your ID and a piece of paper with the word 'COINOS' and today's date written on it"
              persistent-hint
              accept=".pdf,image/*"
              @change="changeProof"
              :loading="proofLoading"
              :success="proof && proofSuccess"
              v-model="proof"
              :append-icon="proof && proofSuccess ? '$check' : null"
            />
          </v-form>
        </v-card-text>
      </v-card>

      <v-card class="mb-2" v-if="mode === 1">
        <v-card-text class="body-1">
          <div v-if="fundingSuccess">
            <v-alert class="ma-4 text-center font-weight-bold">
              <v-icon color="success" left>$check</v-icon>
              Funding Request Submitted!
            </v-alert>

            <p>
              Your account will be credited when we receive the funds in our
              bank account and manually review and approve the transaction.
            </p>
          </div>
          <v-progress-linear
            v-else-if="submitting"
            indeterminate
          ></v-progress-linear>
          <div v-else>
            <div class="d-flex">
              <v-btn-toggle
                v-model="method"
                tile
                color="primary accent-3"
                group
                class="mx-auto flex-wrap mb-2 text-center"
                mandatory
              >
                <v-btn value="interac" class="flex-grow-1">
                  <v-icon left color="grey">$interac</v-icon>
                  Interac e-Transfer
                </v-btn>
                <v-btn value="wire" class="flex-grow-1">
                  <v-icon left color="grey">$bank</v-icon>
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
                  <span class="white--text title">{{ code }}</span>
                </li>
                <li>
                  Tell us the amount you're sending so we know what to expect:
                  <span class="white--text title">&nbsp;</span>
                </li>
              </ol>
            </div>
            <div v-if="method === 'wire'">
              <ol class="mb-2">
                <li>
                  Send a wire transfer to our account at CIBC:
                </li>
                <p>
                  Swift Code:
                  <span class="white--text title">CIBCCATT</span><br />
                  Institution Number:
                  <span class="white--text title">010</span><br />
                  Transit Number: <span class="white--text title">07500</span
                  ><br />
                  Account Number:
                  <span class="white--text title">1029002</span>
                </p>
                <li>
                  Put this as the reference code:
                  <span class="white--text title">{{ code }}</span>
                </li>
                <li>
                  Tell us the amount you're sending so we know what to expect:
                </li>
              </ol>
            </div>
            <v-text-field
              label="Amount"
              suffix="CAD"
              prefix="$"
              v-model="amount"
            />
            <div class="d-flex">
              <v-btn class="flex-grow-1" @click="fund">
                <v-icon color="success" left>$send</v-icon
                ><span>Submit Funding Request</span>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="mb-2" v-if="mode === 2">
        <v-card-text>
          <div v-if="withdrawalSuccess">
            <v-alert class="ma-4 text-center font-weight-bold">
              <v-icon color="success" left>$check</v-icon>
              Withdrawal Request Submitted!
            </v-alert>
          </div>
          <v-progress-linear
            v-else-if="submitting"
            indeterminate
          ></v-progress-linear>
          <div v-else>
            <div class="d-flex">
              <v-btn-toggle
                v-model="method"
                tile
                color="primary accent-3"
                group
                class="mx-auto flex-wrap text-center"
                mandatory
              >
                <v-btn value="interac" class="flex-grow-1">
                  <v-icon left color="grey">$interac</v-icon>
                  Interac e-Transfer
                </v-btn>
                <v-btn value="wire" class="flex-grow-1">
                  <v-icon left color="grey">$bank</v-icon>
                  Bank Wire
                </v-btn>
              </v-btn-toggle>
            </div>

            <div v-if="method === 'interac'">
              <v-text-field label="Email" v-model="withdrawal.email" />
            </div>
            <div v-if="method === 'wire'">
              <v-text-field label="Bank Name" v-model="withdrawal.bank" />
              <div class="d-flex mb-2">
                <v-text-field
                  label="Institution"
                  v-model="withdrawal.institution"
                  hint="3 Digits"
                  length="3"
                  persistent-hint
                  class="mr-1"
                />
                <v-text-field
                  label="Transit"
                  v-model="withdrawal.transit"
                  hint="5 Digits"
                  persistent-hint
                />
              </div>
                <v-text-field
                  label="Account Number"
                  v-model="withdrawal.account"
                />
              <v-textarea
                label="Additional Notes or Instructions"
                v-model="withdrawal.notes"
              />
            </div>
            <v-text-field
              label="Amount"
              suffix="CAD"
              prefix="$"
              v-model="withdrawal.amount"
            />
            <div class="d-flex">
              <v-btn class="flex-grow-1" @click="withdraw">
                <v-icon color="success" left>$send</v-icon
                ><span>Submit Withdrawal Request</span>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { call, get } from 'vuex-pathify';
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;

export default {
  data: () => ({
    loading: true,
    mode: 0,
    submitting: false,
    fundingSuccess: false,
    withdrawalSuccess: false,
    id: null,
    amount: null,
    withdrawal: {
      amount: null,
      bank: null,
      email: null,
      account: null,
      institution: null,
      transit: null,
      notes: null,
    },
    code: null,
    idSuccess: false,
    idLoading: false,
    proof: null,
    proofSuccess: false,
    proofLoading: false,
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
  methods: {
    viewCad() {
      this.$go(`/markets/${btc.substr(0,6)}-${lcad.substr(0,6)}`);
    },
    createWithdrawal: call('createWithdrawal'),
    async withdraw() {
      this.submitting = true;
      await this.createWithdrawal(this.withdrawal);
      this.submitting = false;
      this.withdrawalSuccess = true;
    },
    async fund() {
      this.submitting = true;
      await this.createFunding({ amount: this.amount, code: this.code });
      this.submitting = false;
      this.fundingSuccess = true;
    },
    createFunding: call('createFunding'),
    async changeId(id) {
      this.idLoading = true;
      this.idSuccess = await this.uploadId(id);
      this.idLoading = false;
    },
    uploadId: call('uploadId'),
    async changeProof(proof) {
      this.proofLoading = true;
      this.proofSuccess = await this.uploadProof(proof);
      this.proofLoading = false;
    },
    uploadProof: call('uploadProof'),
    getCode() {
      let r = '';
      let d = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
      let l = d.length;
      for (let i = 0; i < 8; i++) {
        r += d.charAt(Math.floor(Math.random() * l));
      }
      return r;
    },
  },
  async mounted() {
    this.code = this.getCode();
    const waitForUser = resolve => {
      if (!this.user.index && this.user.index !== 0)
        return (this.timeout = setTimeout(() => waitForUser(resolve), 1000));
      resolve();
    };
    await new Promise(waitForUser);
    if (this.user.verified === 'verified') this.mode = 1;
    this.loading = false;
  },
};
</script>
