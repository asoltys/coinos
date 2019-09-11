<template>
  <div>
    <v-divider class="my-2"></v-divider>
    <v-layout>
      <v-flex xs6>
        <v-card>
          <v-card-text>
            <v-text-field
              label="New Password"
              v-model="form.password"
              type="password"
            ></v-text-field>
            <v-text-field
              label="Confirm Password"
              v-model="form.passconfirm"
              type="password"
            ></v-text-field>
            <v-btn type="submit">Change Password</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex class="ml-2" xs6>
        <v-card>
          <v-card-text>
            <v-text-field
              label="New Withdrawal Pin"
              v-model="form.pin"
              type="pin"
            ></v-text-field>
            <v-text-field
              label="Confirm Withdrawal Pin"
              v-model="form.pinconfirm"
              type="pin"
            ></v-text-field>
            <v-btn type="submit">Change Pin</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>
