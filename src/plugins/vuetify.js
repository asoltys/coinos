import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

import Cancel from 'vue-material-design-icons/Close';
import Forward from 'vue-material-design-icons/Forward';
import ArrowLeft from 'vue-material-design-icons/ArrowLeft';
import Send from 'vue-material-design-icons/Send';
import Edit from 'vue-material-design-icons/FileDocumentEdit';
import Update from 'vue-material-design-icons/Update';
import Code from 'vue-material-design-icons/CodeTags';
import Clear from 'vue-material-design-icons/Close';
import Info from 'vue-material-design-icons/Information';
import UnfoldMore from 'vue-material-design-icons/UnfoldMoreHorizontal';
import UnfoldLess from 'vue-material-design-icons/UnfoldLessHorizontal';
import Refresh from 'vue-material-design-icons/Refresh';
import Account from 'vue-material-design-icons/Account';
import Add from 'vue-material-design-icons/Plus';
import Camera from 'vue-material-design-icons/Camera';
import Check from 'vue-material-design-icons/Check';
import ClipboardText from 'vue-material-design-icons/ClipboardText';
import ContentCopy from 'vue-material-design-icons/ContentCopy';
import Delete from 'vue-material-design-icons/Delete';
import Dialpad from 'vue-material-design-icons/Dialpad';
import Download from 'vue-material-design-icons/Download';
import Flash from 'vue-material-design-icons/Flash';
import FormatLineWeight from 'vue-material-design-icons/FormatLineWeight';
import Gift from 'vue-material-design-icons/Gift';
import Help from 'vue-material-design-icons/InformationOutline';
import Home from 'vue-material-design-icons/Home';
import Key from 'vue-material-design-icons/Key';
import Lock from 'vue-material-design-icons/Lock';
import Nfc from 'vue-material-design-icons/Nfc';
import Note from 'vue-material-design-icons/Note';
import OpenInNew from 'vue-material-design-icons/OpenInNew';
import Portrait from 'vue-material-design-icons/CropPortrait';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Settings from 'vue-material-design-icons/Settings';
import SwapHorizontal from 'vue-material-design-icons/SwapHorizontal';
import Sync from 'vue-material-design-icons/Sync';
import Undo from 'vue-material-design-icons/Undo';
import Wallet from 'vue-material-design-icons/Wallet';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: colors.yellow,
        secondary: '#333',
        accent: colors.yellow,
        error: '#b71c1c',
      },
    },
  },
  icons: {
    values: {
      'add': { component: Add },
      'account': { component: Account },
      'assignment': { component: ClipboardText },
      'camera': { component: Camera },
      'check': { component: Check },
      'copy': { component: ContentCopy },
      'delete': { component: Delete },
      'dialpad': { component: Dialpad },
      'download': { component: Download },
      'flash': { component: Flash },
      'gift': { component: Gift },
      'help': { component: Help },
      'home': { component: Home },
      'key': { component: Key },
      'lock': { component: Lock },
      'unfold_more': { component: UnfoldMore },
      'unfold_less': { component: UnfoldLess },
      'info': { component: Info },
      'edit': { component: Edit },
      'update': { component: Update },
      'code': { component: Code },
      'clear': { component: Clear },
      'send': { component: Send },
      'arrow_back': { component: ArrowLeft },
      'cancel': { component: Cancel },
      'forward': { component: Forward },
      'refresh': { component: Refresh },
      'nfc': { component: Nfc },
      'note': { component: Note },
      'open': { component: OpenInNew },
      'payments': { component: FormatLineWeight },
      'portrait': { component: Portrait },
      'qrcode': { component: Qrcode },
      'settings': { component: Settings},
      'swap': { component: SwapHorizontal },
      'sync': { component: Sync },
      'undo': { component: Undo },
      'wallet': { component: Wallet },
    },
  },
});
