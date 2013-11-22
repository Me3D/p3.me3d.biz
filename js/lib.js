var resp; //response from random.org
var salt; //salt used for key generation and encryption
var key128Bits; //final key



$( "#target" ).keyup(function() {
	$('#md5').html( CryptoJS.MD5( $('#target').val()).toString() );
	$('#ripemd').html( CryptoJS.RIPEMD160( $('#target').val()).toString() );
	$('#sha1').html( CryptoJS.SHA1( $('#target').val()).toString() );
	$('#sha256').html( CryptoJS.SHA256( $('#target').val()).toString() );
	$('#sha512').html( CryptoJS.SHA512( $('#target').val()).toString() );
	$('#sha3').html( CryptoJS.SHA3( $('#target').val()).toString() );
});


function calculating(keysize){
	
	
        $('#go').addClass("alert alert-info");
	
	switch(keysize) {
        case 128:
		$('#go').html("<p>calculating...128 bit key..this should take about 1 second.</p>");
		break;
	case 256:
		$('#go').html("<p>calculating...256 bit key..this should take about 3 seconds.</p>");
		break;
	case 512:
		$('#go').html("<p>calculating...512 bit key..this should take about 15 seconds.</p>");
		break;	
	}//end case
}//end calculating

function keygen(keysize) {
	var startTime = new Date().getTime();
	calculating(keysize); 
      
        $.when($.ajax({
		url: 'http://www.random.org/cgi-bin/randbyte?nbytes=16&format=h', //grab 16 bytes of random hex
		dataType: 'text',
		async: true,
		success: function( resp ) {                                       //upon success dump result into 'resp' var
       
		resp = $.trim(resp).replace(/ /g,'');                           //rip out white spaces
		//console.log("From random:"+ resp);
		salt = CryptoJS.enc.Hex.parse(resp);                         //hex to WordArray
		console.log("Salt:"+ salt);
		//console.log(salt);
		console.log("Calculating " + keysize + " bit key");
		//Perform key expansion combining a password plus salt..2000 times
		keybits = CryptoJS.PBKDF2("thisismypassword", salt, { keySize: keysize/32, iterations: 1000 });
		
		
		var endTime = new Date().getTime();
		var time = endTime - startTime;
		console.log("Key took " + time/1000 + " seconds to generate." );
          },  //end success
		error: function( req, status, err ) {
		console.log( 'something went wrong', status, err );
          }
          })).then(   //end $.ajax and $.when
                function(){  //this function is called $.when ajax is done.
			crypto_go();        
                }); //end anon function
}//end key128


function crypto_go() {     
	console.log("My key:" + keybits);
	
	//set the div to alert-success
	$('#go').removeClass("alert-info");
	$('#go').addClass("alert-success");
	$('#go').html("<p>Completed!</p>");
	
	//encrypt the message
	var encrypted = CryptoJS.AES.encrypt("Messagemonkey", keybits.toString());
	console.log("CipherText:"+encrypted.ciphertext.toString());
	//decrypt the message
	var decrypted = CryptoJS.AES.decrypt(encrypted, keybits.toString());
	console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8)); 
}//end final

function move(next_page){
    switch (next_page) {
	    case intro:

	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    console.log("ran");
	    });
	   
	    $("#intro").delay(800).fadeIn("slow", function (){
	    console.log("ran");
	    });
	    break;
	case hashes:

	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    console.log("ran");
	    });
	   
	    $("#hashes").delay(800).fadeIn("slow", function (){
	    console.log("ran");
	    });
	    break;
	case random:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    console.log("ran");
	    });
	   
	    $("#random").delay(800).fadeIn("slow", function (){
		console.log("ran");
	    });
	    break;
	
	case key:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
		console.log("ran");
	    });
	   
	    $("#key").delay(800).fadeIn("slow", function (){
		console.log("ran");
	    });
	    break;
	
	case encrypt:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
		console.log("ran");
	    });
	   
	    $("#encrypt").delay(800).fadeIn("slow", function (){
		console.log("ran");
	    });
	    break;
	
	case decrypt:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
		console.log("ran");
	    });
	   
	    $("#decrypt").delay(800).fadeIn("slow", function (){
		console.log("ran");
	    });
	    break;
	
   }
   

}