export default function(n, p) {
  if (!parseInt(p)) return parseInt(n).toFixed(0);
  else {
    let x = n / 10 ** p;
    if (Math.abs(x) < 1.0) {
      let e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e);
        if (x.toString().indexOf('.') > -1)
          x = x.toString().replace('.', '');
        x = '0.' + new Array(e).join('0') + x;
      }
    } else {
      let e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join('0');
      }
    }
    if (x.toString().split('.')[1] > p && x.toFixed) return parseFloat(x.toFixed(p)).toString();
    return x;
  }
}
