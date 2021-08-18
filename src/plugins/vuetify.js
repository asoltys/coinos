import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

import Account from 'vue-material-design-icons/Account';
import AccountMultiplePlus from 'vue-material-design-icons/AccountMultiplePlus';
import AccountCheck from 'vue-material-design-icons/AccountCheck';
import AccountDetails from 'vue-material-design-icons/AccountDetails';
import Add from 'vue-material-design-icons/Plus';
import Alert from 'vue-material-design-icons/Alert';
import ArrowLeft from 'vue-material-design-icons/ArrowLeft';
import ArrowRight from 'vue-material-design-icons/ArrowRight';
import ArrowCollapseVertical from 'vue-material-design-icons/ArrowCollapseVertical';
import ArrowExpandVertical from 'vue-material-design-icons/ArrowExpandVertical';
import Atom from 'vue-material-design-icons/Atom';
import Bank from 'vue-material-design-icons/Bank';
import BellRing from 'vue-material-design-icons/BellRing';
import Camera from 'vue-material-design-icons/Camera';
import Cancel from 'vue-material-design-icons/Close';
import CellphoneAndroid from 'vue-material-design-icons/CellphoneAndroid';
import Check from 'vue-material-design-icons/Check';
import Clear from 'vue-material-design-icons/Close';
import Cloud from 'vue-material-design-icons/Cloud';
import ClipboardText from 'vue-material-design-icons/ClipboardText';
import ChevronDown from 'vue-material-design-icons/ChevronDown';
import ChevronUp from 'vue-material-design-icons/ChevronUp';
import ChevronLeft from 'vue-material-design-icons/ChevronLeft';
import ChevronRight from 'vue-material-design-icons/ChevronRight';
import Code from 'vue-material-design-icons/CodeTags';
import ContentCopy from 'vue-material-design-icons/ContentCopy';
import Delete from 'vue-material-design-icons/Delete';
import Dialpad from 'vue-material-design-icons/Dialpad';
import DotsVertical from 'vue-material-design-icons/DotsVertical';
import Download from 'vue-material-design-icons/Download';
import Upload from 'vue-material-design-icons/Upload';
import Edit from 'vue-material-design-icons/FileDocumentEdit';
import Email from 'vue-material-design-icons/Email';
import Eye from 'vue-material-design-icons/Eye';
import Fire from 'vue-material-design-icons/Fire';
import Snowflake from 'vue-material-design-icons/Snowflake';
import FileOutline from 'vue-material-design-icons/FileOutline';
import Flash from 'vue-material-design-icons/Flash';
import FormatLineWeight from 'vue-material-design-icons/FormatLineWeight';
import Forward from 'vue-material-design-icons/Forward';
import Gift from 'vue-material-design-icons/Gift';
import Help from 'vue-material-design-icons/InformationOutline';
import Home from 'vue-material-design-icons/Home';
import Info from 'vue-material-design-icons/Information';
import Key from 'vue-material-design-icons/Key';
import Link from 'vue-material-design-icons/Link';
import Lock from 'vue-material-design-icons/Lock';
import Login from 'vue-material-design-icons/Login';
import Mail from 'vue-material-design-icons/Mail';
import Menu from 'vue-material-design-icons/Menu';
import Nfc from 'vue-material-design-icons/Nfc';
import Note from 'vue-material-design-icons/Note';
import OpenInNew from 'vue-material-design-icons/OpenInNew';
import PackageDown from 'vue-material-design-icons/PackageDown';
import PageFirst from 'vue-material-design-icons/PageFirst';
import PageLast from 'vue-material-design-icons/PageLast';
import Paperclip from 'vue-material-design-icons/Paperclip';
import Pencil from 'vue-material-design-icons/Pencil';
import Power from 'vue-material-design-icons/Power';
import Qrcode from 'vue-material-design-icons/Qrcode';
import RadioboxMarked from 'vue-material-design-icons/RadioboxMarked';
import RadioboxBlank from 'vue-material-design-icons/RadioboxBlank';
import Refresh from 'vue-material-design-icons/Refresh';
import Save from 'vue-material-design-icons/ContentSave';
import Search from 'vue-material-design-icons/AccountSearch';
import Seed from 'vue-material-design-icons/Seed';
import Send from 'vue-material-design-icons/Send';
import Settings from 'vue-material-design-icons/Settings';
import SwapHorizontal from 'vue-material-design-icons/SwapHorizontal';
import SwapVertical from 'vue-material-design-icons/SwapVertical';
import Sync from 'vue-material-design-icons/Sync';
import Tor from 'vue-material-design-icons/Tor';
import Undo from 'vue-material-design-icons/Undo';
import UnfoldLess from 'vue-material-design-icons/UnfoldLessHorizontal';
import UnfoldMore from 'vue-material-design-icons/UnfoldMoreHorizontal';
import Update from 'vue-material-design-icons/Update';
import Wallet from 'vue-material-design-icons/Wallet';
import Water from 'vue-material-design-icons/Water';
import WaterPump from 'vue-material-design-icons/WaterPump';

import Bitcoin from '../icons/Bitcoin';
import Canada from '../icons/Canada';
import Interac from '../icons/Interac';
import Liquid from '../icons/Liquid';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#faf601',
        secondary: '#333',
        accent: colors.yellow,
        error: '#b71c1c',
        liquid: '#2cccbf',
        modal: '#555'
      },
    },
  },
  icons: {
    values: {
      'account': { component: Account },
      'addAccount': { component: AccountMultiplePlus },
      'accountcheck': { component: AccountCheck },
      'account-details': { component: AccountDetails },
      'add': { component: Add },
      'alert': { component: Alert },
      'left': { component: ArrowLeft },
      'right': { component: ArrowRight },
      'collapse': { component: ArrowCollapseVertical },
      'expand': { component: ArrowExpandVertical },
      'atom': { component: Atom },
      'assignment': { component: ClipboardText },
      'bell': { component: BellRing },
      'camera': { component: Camera },
      'cancel': { component: Cancel },
      'cellphone': { component: CellphoneAndroid },
      'check': { component: Check },
      'clear': { component: Clear },
      'cloud': { component: Cloud },
      'code': { component: Code },
      'copy': { component: ContentCopy },
      'delete': { component: Delete },
      'dialpad': { component: Dialpad },
      'dotsv': { component: DotsVertical },
      'down': { component: ChevronDown },
      'download': { component: Download },
      'upload': { component: Upload },
      'edit': { component: Edit },
      'email': { component: Email },
      'eye': { component: Eye },
      'fire': { component: Fire },
      'snowflake': { component: Snowflake },
      'file': { component: FileOutline },
      'flash': { component: Flash },
      'forward': { component: Forward },
      'gift': { component: Gift },
      'help': { component: Help },
      'home': { component: Home },
      'info': { component: Info },
      'key': { component: Key, props: { size: 64 } },
      'link': { component: Link },
      'liquid': { component: Liquid },
      'bitcoin': { component: Bitcoin },
      'canada': { component: Canada },
      'bank': { component: Bank },
      'interac': { component: Interac },
      'back': { component: ChevronLeft },
      'lock': { component: Lock },
      'login': { component: Login },
      'mail': { component: Mail },
      'menu': { component: Menu },
      'nfc': { component: Nfc },
      'next': { component: ChevronRight },
      'note': { component: Note },
      'open': { component: OpenInNew },
      'archive': { component: PackageDown },
      'page_first': { component: PageFirst },
      'page_last': { component: PageLast},
      'paperclip': { component: Paperclip },
      'payments': { component: FormatLineWeight },
      'pencil': { component: Pencil },
      'power': { component: Power },
      'previous': { component: ChevronLeft },
      'qrcode': { component: Qrcode },
      'radiobox_marked': { component: RadioboxMarked },
      'radiobox_blank': { component: RadioboxBlank },
      'refresh': { component: Refresh },
      'save': { component: Save },
      'search': { component: Search },
      'seed': { component: Seed },
      'send': { component: Send },
      'settings': { component: Settings},
      'swap': { component: SwapHorizontal },
      'swapv': { component: SwapVertical },
      'sync': { component: Sync },
      'tor': { component: Tor },
      'undo': { component: Undo },
      'unfold_less': { component: UnfoldLess },
      'unfold_more': { component: UnfoldMore },
      'up': { component: ChevronUp },
      'update': { component: Update },
      'wallet': { component: Wallet },
      'water': { component: Water },
      'waterpump': { component: WaterPump },
    },
  },
});
