# coinos
Coinos is a bitcoin wallet app that supports payments over the <a href="https://bitcoin.org">bitcoin</a>, <a href="https://blockstream.com/liquid/">liquid</a> and <a href="http://lightning.network/">lightning</a> networks. Try it out at <a href="https://coinos.io/">coinos.io</a>.

This repository contains the code for the frontend user interface which is a progressive web application built with VueJS. If you intend to run it yourself you'll also need to host an instance of <a href="https://github.com/asoltys/coinos-server">coinos-server</a> which provides a REST/Websocket API and interfaces with <a href="https://github.com/bitcoin/bitcoin">bitcoind</a>, <a href="https://github.com/ElementsProject/elements">elementsd</a>, and <a href="https://github.com/lightningnetwork/lnd">lnd</a>.

## Getting Started

    git clone https://github.com/asoltys/coinos.io
    cd coinos.io
    yarn
    yarn start
