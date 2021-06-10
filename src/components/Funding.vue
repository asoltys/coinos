<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="body-1">
        <p>
          <v-icon>$canada</v-icon>

          Coinos now supports Canadian dollar funding and withdrawals for
          verified users. When you fund your account with Interac or Bank Wire,
          we'll credit your wallet with
          <v-btn color="liquid" class="black--text toggle" @click="viewCad"
            >CAD</v-btn
          >
          &mdash; a stablecoin we've issued on the Liquid network that's fully
          backed by Canadian dollars in our bank account.
        </p>

        <p>
          You can trade
          <v-btn color="liquid" class="black--text toggle" @click="viewCad"
            >CAD</v-btn
          >
          for bitcoin or other assets here, or transfer it to another liquid
          wallet or exchange. We'll buy it back at par when you issue a
          withdrawal request.
        </p>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if='!isReferred'>
      <v-alert class="text-center">
        <p>Not currently referred</p>
        <p>Funding access is limited to referred users</p>
        <v-btn @click='openReferral=true' color="#59316B"> Enter Referral Code </v-btn>
        <v-btn @click='openQueue=true' color="#59316B"> Join Waiting List </v-btn>
      </v-alert>
    </div>
    <div v-else>
      <v-alert class="text-center">
        Referred:
        <v-icon color='green'> $check </v-icon>
        <p />
        Your Verification Status:
        <span v-if="user.verified === 'verified'" class="title green--text"
          >Verified</span
        >
        <span v-if="user.verified === 'pending'" class="title primary--text"
          >Pending</span
        >
        <span v-if="!user.verified" class="title red--text">Not Verified</span>
      </v-alert>
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
                  <span class="white--text title">{{ funding.code }}</span>
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
                  <span class="white--text title">{{ funding.code }}</span>
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
              v-model="funding.amount"
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
    <v-dialog v-model='openReferral' dark max-width='500'>
      <v-card style='background-color: grey'>
        <v-card-title>
          <b class='text-center'>Verify Referral Code</b>
        </v-card-title>
        <v-card-text>
          <p v-if='referralWarning'> {{referralWarning}} </p>
<!--           <v-alert class="ma-4 text-center font-weight-bold"> -->
          <v-text-field v-model='referral' label='Referral Code'/>
<!--           </v-alert> -->
        </v-card-text>
        <v-card-actions>
          <v-btn @click='verifyReferral' color="green"> Submit Referral Code </v-btn>
          <v-btn @click='openReferral=false'> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model='openQueue' dark max-width='500'>
      <v-card style='background-color: grey'>
        <v-card-title>
          <b class='text-center'> Add Me to Waiting List</b>
        </v-card-title>
        <v-card-text>
          <p v-if='queueMessage'> {{queueMessage}} </p>
          <v-form class="mt-4">
            <v-text-field class='validate' label='Email' v-model='queue.email' autocapitalize='none' ref='email' append-icon='$mail' :rules='rules.email'/>
            <v-text-field class='validate' label='SMS' v-model='queue.sms' dark='' autocapitalize='none' ref='sms' :rules='rules.phone'/>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click='joinQueue()' :disabled='!queue.email && !queue.sms' color="green"> Join Waiting List </v-btn>
          <v-btn @click='openQueue=false'> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { call, get } from 'vuex-pathify';
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;
import config from '@/config'
import Vue from 'vue';

export default {
  components: {
  },
  data: () => ({
    loading: true,
    openReferral: false,
    referral: '',
    isReferred: null, // object attributes not dynamically updated during store update
    referralWarning: '',

    openQueue: false,
    queueMessage: '',
    queue: {
      email: '',
      sms: ''
    },
    rules: {},

    mode: 0,
    submitting: false,
    fundingSuccess: false,
    withdrawalSuccess: false,
    id: null,
    amount: null,
    funding: {
      amount: null,
    },
    withdrawal: {
      amount: null,
      bank: null,
      email: null,
      account: null,
      institution: null,
      transit: null,
      notes: null,
    },
    idSuccess: false,
    idLoading: false,
    proof: null,
    proofSuccess: false,
    proofLoading: false,
    method: 'interac',
    step: 1
  }),
  computed: {
    user: get('user'),
  },
  methods: {
    checkReferral: call('checkReferral'),
    joinWaitingList: call('joinWaitingList'),

    async verifyReferral () {
      this.referralWarning = ''
      var check = await this.checkReferral(this.referral)
      console.log('Referral response: ' + JSON.stringify(check))
      if (check.verified) {
        this.isReferred = true
        this.openReferral = false
      } else {
        this.referralWarning = check.message || check.error || 'Could not verify referral code at this time.'
      }
      this.referral = '' // clear form element
    },
    async joinQueue () {
      var check = await this.joinWaitingList(this.queue)
      if (check.verified) {
        this.queueMessage = 'Thanks for submitting this. We will contact you if we open this to the public.'
        setTimeout(() => {
          this.openQueue = false
        }, 4000)  
      } else {
        this.queueMessage= check.message || check.error || 'Could not verify referral code at this time.'
        setTimeout(() => {
          this.openQueue = false
        }, 4000)  
      }
    },

    viewCad() {
      this.$go(`/markets/${btc.substr(0, 8)}-${lcad.substr(0, 8)}`);
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
      await this.createFunding(this.funding);
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

    async checkIfReferred (user_id) {
      Vue.axios.get('/referrals/isReferred/' + this.user.id)
        .then( response => {
          this.isReferred = response.data
        })
        .catch( err => {
          this.isReferred = null
          console.debug('error checking referral')
        })
    }
  },
  async mounted() {
    this.rules = config.rules || {}
    
    this.funding = await this.createFunding();
    const waitForUser = resolve => {
      if (!this.user.index && this.user.index !== 0)
        return (this.timeout = setTimeout(() => waitForUser(resolve), 1000));
      resolve();
    };
    await new Promise(waitForUser);
    
    if (this.user.verified === 'verified') this.mode = 1;
    this.loading = false;

    this.checkIfReferred(this.user.id);
  },
};
</script>
