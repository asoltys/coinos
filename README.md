# coinos

Coinos is a bitcoin wallet app that supports payments over the <a href="https://bitcoin.org">bitcoin</a>, <a href="https://blockstream.com/liquid/">liquid</a> and <a href="http://lightning.network/">lightning</a> networks. Try it out at <a href="https://coinos.io/">coinos.io</a>.

This repository contains the code for the frontend user interface which is a progressive web application built with VueJS. If you intend to run it yourself you'll also need to host an instance of <a href="https://github.com/coinos/coinos-server">coinos-server</a> which provides a REST/Websocket API and interfaces with <a href="https://github.com/bitcoin/bitcoin">bitcoind</a>, <a href="https://github.com/ElementsProject/elements">elementsd</a>, and <a href="https://github.com/lightningnetwork/lnd">lnd</a>.

## Getting Started

    git clone https://github.com/coinos/coinos-ui
    cd coinos-ui
    yarn
    yarn start
    
### Setup pre-commit git hooks
    
  We have a pre-commit git hook for running prettier on all files to keep the formatting consistent.
    
  `git config core.hooksPath "./git_hooks"` - This will set the git config path to use this directory for hooks.
    
  `chmod +x ./git_hooks/pre-commit` - This will give the hook the necessary permissions to run.
