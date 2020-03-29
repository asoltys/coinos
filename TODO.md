- currency select box is janky when typing or clicking out
- small amounts have scientific notation when viewing code
- scroll to password and username fields
- show fiat amounts on send page for amount and fee
- support toggling between SAT and BTC units
- show wallet balances, user count on about page
- require pin on send
- more payment details, "from", "fees"
- upload db backups to sia
- add notes to invoices and payments
- lightning static chanel backups
- require current password and pin on settings change
- show fixed payment rate on sent page not fluctuating global rate
- update elements to get 0.1 sat fees and support decimals in fee rate dialog
- host coinos and nodes as tor services
- unsaved settings values get overridden on pin set or when transaction confirms or any user update comes in
- private key scanning
- make 3rd party api calls optional
- make all nodes/payment methods optional depending on if config settings exist
- exchange rate percent modifier
- zero-amount lightning invoices for sending arbitrary amounts
- nfc tap
- print-friendly sent payment receipts
- configurable developer fees
- docker image, make self-hosting easy
- payments filters and csv export
- use coinos names in payment history and sent/received dialog
- detect internal payments and prompt to avoid on-chain or lightning

long term
- push notifications
  - show users online, allow approved merchants to push invoices to them
  - show users you've transacted with at the top
  - allow pushing between anyone you've transacted with
- c-lightning backend
- create account on the fly from URL or localStorage uuid token
- accept lnd spontaneous payments with memo to indicate recipient account
- send to email/phone/social media
- sms api
- payment total audit payment totals in db should match user balances
- channel/wallet rebalancing, connect to exchange for auto topup
- public username url for push payments/donations
- multipart payments
- psbt support
- liquid assets payments
- liquid issue new assets
- liquid atomic swaps starting with tether
- token markets and orderbooks
- atomic swap network
- non-custodial PK/HD/watchonly bitcoin/liquid accounts
- build elementsjs-lib
- open channel and peering requests, maybe for a fee
- sia storage front end, skynet ui
- multisig accounts, tapscript
- coinjoin, payjoin
- show unconfirmed outgoing payments

wishlist

abandoned
- send lnd self payments instead of running 2 nodes (causes routing fees)
- svelte frontend
- sqlite backend // kind of supported by sequelize already

done

- welcome screen
- payments, deposit button on homepage
- multiple fiat currencies
- more server side logging
- migrate hosting
- new on-chain addresses on receive
- customize on-chain fees
- fix link to liquid explorer
- fix liquid transactions not confirming
- add tip function
- new demo video
- set pin function
- update installation docs
- liquid LBTC payments
- printer-friendly invoices
- db backups
- separate invoices from payments in db
- better docs on about page
