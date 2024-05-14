
let url = location+'';
const qrcode = new QRCode(document.getElementById('qrcode'), {
	text: url,
	width: 60,
	height: 68,
	colorDark : '#000',
	colorLight : '#fff',
	correctLevel : QRCode.CorrectLevel.H
  });