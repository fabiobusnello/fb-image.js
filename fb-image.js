//pega a orientação
function getOrientation(file, callback) {
  var reader = new FileReader();
  
  reader.onload = function(e) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
    var view = new DataView(e.target.result);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    var length = view.byteLength, offset = 2;
    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file);
}

//corrige a orientação para cameras digitais de aparelhos móveis e webcans
function resetOrientation(file, callback) {
	getOrientation(file.files[0], function(orientation) {
	srcOrientation=orientation;
  var img = new Image();    
  var reader = new FileReader();
  reader.readAsDataURL(file.files[0]);
  reader.onload=function(e){
	  img64=reader.result;
	  img.src=img64;
  };
  img.onerror = function(e){
	  alert('erro');
  };
  img.onload = function() {
    var width = img.width;
    var height = img.height;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
	if(width>500){
		height=((100-(Math.round(((width-500)/width)*100)))/100)*height;
		width=500;
	}
    if (4 < srcOrientation && srcOrientation < 9) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // Transforme o contexto antes de desenhar a imagem
    switch (srcOrientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height , width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: break;
    }
    // desenhar imagem
    ctx.drawImage(img, 0, 0, width, height);

    // exporta base64
    callback(canvas.toDataURL('image/jpeg'), img64);
  };
  });
}

//uso: se vc usa jquery
/*
resetOrientation(this, function(imgCorrigida, imgOriginal){
  //exibe a foto tirada em uma tag <img id="image-id">
  $("#image-id").attr("src", imgCorrigida);
  //colocar o base64 retornado no textarea
	$("#textarea-id").val(imgCorrigida);
  });	
*/

