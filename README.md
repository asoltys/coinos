# CoinOS UI

CoinOS is a bitcoin wallet app that supports payments over the <a href="https://bitcoin.org">bitcoin</a>, <a href="https://blockstream.com/liquid/">liquid</a> and <a href="http://lightning.network/">lightning</a> networks. Try it out at <a href="https://coinos.io/">coinos.io</a>.

This repository contains the code for the frontend user interface which is a progressive web application built with VueJS. If you intend to run it yourself you'll also need to host an instance of <a href="https://github.com/asoltys/coinos-server">coinos-server</a> which provides a REST/Websocket API and interfaces with <a href="https://github.com/bitcoin/bitcoin">bitcoind</a>, <a href="https://github.com/ElementsProject/elements">elementsd</a>, and <a href="https://github.com/lightningnetwork/lnd">lnd</a>.

## Getting Started

    git clone https://github.com/coinos/coinos-ui.git
    cd coinos
    yarn
    yarn start

## Troubleshooting

If you get an issue like the following when running `yarn`:

    error Command failed.
    Exit code: 128
    Command: git
    Arguments: ls-remote --tags --heads ssh://git@github.com/vulpemventures/liquidjs-lib.git
    Directory: C:\Users\adrie\Work\coinos-ui
    Output:
    git@github.com: Permission denied (publickey).
    fatal: Could not read from remote repository.

you need to set up an SSH agent.  First, create an SSH key if you don't already have one, then try following the instructions in the accepted answer to <a href="https://unix.stackexchange.com/questions/12195/how-to-avoid-being-asked-passphrase-each-time-i-push-to-bitbucket">this StackExchange question</a>.
