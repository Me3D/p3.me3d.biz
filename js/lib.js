var noise; //response from random.org
var salt; //salt used for key generation and encryption
var keybits; //final key
var hash; //hash of password
var password; //password
var hash_type; //type of hash
var encrypted; //output of encryption
var decrypted; //output of decryption
var message; //paintext message
var algo_chosen; //which crypto algorithm chosen

//Startup and fade in first page
$(document).ready( function() {
	$("#intro").delay(800).fadeIn("slow", function (){
	    });
	}).tooltip({
		position: {
			my: "left bottom-20",  //center of tooltip, 20 px below it
			at: "right"	//center of hovered object, float above it			
		}	
	});


//Function to receive hash type and output password hash data
function getHash(hash_type) {
	console.log("hash selected: " + hash_type);
		switch(hash_type) {
		case 'md5':
			hash = CryptoJS.MD5( $('#password-encrypt.form-control').val()).toString();
			$('#password-hash-out').html( "Your password hash is: " + hash ).addClass("alert alert-success").removeClass("alert-warning");
			console.log("MD5 HASH: " + hash);
			break;
		case 'ripemd':
			hash = CryptoJS.RIPEMD160( $('#password-encrypt.form-control').val()).toString();
			$('#password-hash-out').html( "Your password hash is: " + hash ).addClass("alert alert-success").removeClass("alert-warning");
			console.log("ripe HASH: " + hash);
			break;
		case 'sha1':
			hash = CryptoJS.SHA1( $('#password-encrypt.form-control').val()).toString();
			$('#password-hash-out').html( "Your password hash is: " + hash ).addClass("alert alert-success").removeClass("alert-warning");
			console.log("sha1 HASH: " + hash);
			break;
		case 'sha256':
			hash = CryptoJS.SHA256( $('#password-encrypt.form-control').val()).toString();
			$('#password-hash-out').html( "Your password hash is: " + hash ).addClass("alert alert-success").removeClass("alert-warning");
			console.log("sha256 HASH: " + hash);
			break;
		case 'sha512':
			hash = CryptoJS.SHA512( $('#password-encrypt.form-control').val()).toString();
			$('#password-hash-out').html( "Your password hash is: " + hash ).addClass("alert alert-success").removeClass("alert-warning");
			console.log("sha512 HASH: " + hash);
			break;
		case 'sha3':
			hash = CryptoJS.SHA3( $('#password-encrypt.form-control').val()).toString();
			$('#password-hash-out').html(  "Your password hash is: " + hash ).addClass("alert alert-success").removeClass("alert-warning");
			console.log("sha3 HASH: " + hash);
			break;
		}
	
}

//Output live hash of entered text.
$( "#target" ).keyup(function() {
	$('#md5 ').html( CryptoJS.MD5( $('#target').val()).toString() );
	$('#ripemd').html( CryptoJS.RIPEMD160( $('#target').val()).toString() );
	$('#sha1').html( CryptoJS.SHA1( $('#target').val()).toString() );
	$('#sha256').html( CryptoJS.SHA256( $('#target').val()).toString() );
	$('#sha512').html( CryptoJS.SHA512( $('#target').val()).toString() );
	$('#sha3').html( CryptoJS.SHA3( $('#target').val()).toString() );
});

//get the password value from encryption form
$("#password-encrypt.form-control").keyup(function(){
	password = $("#password-encrypt.form-control").val();
});

//get the password value from password hash page
$("#password.form-control").keyup(function(){
	password = $("#password.form-control").val();
});

//output status condition of key generation
function calculating(keysize){
        $('.key').addClass("alert alert-info").removeClass("alert-warning");
	
	switch(keysize) {
        case 128:
		$('.key').html("<p>calculating...128 bit key..this should take about 1 second.</p>");
		break;
	case 256:
		$('.key').html("<p>calculating...256 bit key..this should take about 3 seconds.</p>");
		break;
	case 512:
		$('.key').html("<p>calculating...512 bit key..this should take about 15 seconds.</p>");
		break;	
	}//end case
}//end calculating

//Generate keys
function keygen(keysize) {
	//get random only
	if (keysize == 0) {
		$('.noise').addClass("alert alert-info");
		$('.noise').html("<p>Getting some randomness</p>");
		$.ajax({
			url: 'http://www.random.org/cgi-bin/randbyte?nbytes=16&format=h', //grab 16 bytes of random hex
			dataType: 'text',
			async: true,
			success: function( noise ) {		
					$('.noise').addClass("alert alert-success").removeClass("alert-info");
					$('.noise').html("Completed! Your random noise is: " + noise);
			}	
		});//end ajax	
	} else {        //do realworld key generation
			if ( password.length >= 1 ) {
			var startTime = new Date().getTime();
			calculating(keysize);
			$.when($.ajax({
				url: 'http://www.random.org/cgi-bin/randbyte?nbytes=16&format=h', 	//grab 16 bytes of random hex
				dataType: 'text',
				async: true,
				success: function( noise ) {                                       	//upon success dump result into 'noise' var
		       
					noise = $.trim(noise).replace(/ /g,'');                       	//rip out white spaces

					salt = CryptoJS.enc.Hex.parse(noise);                         	//hex to WordArray
					console.log("Salt: "+ salt);
					
					console.log("Calculating " + keysize + " bit key");
					//get password from form
					console.log("Password: " + password);
					
					var endTime = new Date().getTime();
					var time = endTime - startTime;
					console.log("Key took " + time/1000 + " seconds to generate." );
			  },  //end success
				error: function( req, status, err ) {
				console.log( 'something went wrong', status, err );
			  }
			  })).then(   	//end $.ajax and $.when
				function(){  	//this function is called $.when ajax is done.
					
					var option = $("input:radio[name='optionsRadios']:checked").val();
					getHash(option);
					
					//Perform key expansion combining a password plus salt..1000 times
					keybits = CryptoJS.PBKDF2(hash, salt, { keySize: keysize/32, iterations: 1000 });
					
					
					console.log("My key:" + keybits);
					//set the div to alert-success
					$('.key').removeClass("alert-info").removeClass("alert-warning");
					$('.key').addClass("alert alert-success");
					$('.key').html("<p>Completed! Your key is: " + keybits.toString()  + "</p>");
				}); //end anon function
			}else{	//you didn't type a password
				$('.key').html( "Whoa! Timeout! Hey buddy, you gotta type something in the password box!").addClass ("alert alert-warning");
				
			} //end inside else
		
		}//end outside else
	
}//end keygen

//encrypt the message with the provided algorithm
function encrypt(algo) {
	
	password = $("#password-encrypt").val();
	message = $("#secret-message").val();

	
	console.log("Password: " + password);
	console.log("Password hash: " + hash);
	console.log("Message: " + message);
	console.log("Salt: " + salt);
	console.log("Key: " + keybits);
	
	if (typeof keybits !== undefined && message.length >=1 ) {    //only run if we have a key and atleast 1 charachter to encrypt
		switch(algo) {
			case 'aes':
				//encrypt the message
				encrypted = CryptoJS.AES.encrypt(message, keybits.toString());
				console.log("CipherText:"+encrypted.ciphertext.toString());
				$('#encrypt-output').removeClass("alert-info").removeClass("alert-warning");
				$('#encrypt-output').addClass("alert alert-success");
				$('#encrypt-output').html("<p>Your encrypted message is: " + encrypted.ciphertext.toString()  + "</p>");
				algo_chosen = 'aes';
				//decrypt the message
				//decrypted = CryptoJS.AES.decrypt(encrypted, keybits.toString());
				//console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				break;
			case '3des':
				encrypted = CryptoJS.TripleDES.encrypt(message, keybits.toString());
				console.log("CipherText:"+encrypted.ciphertext.toString());
				$('#encrypt-output').removeClass("alert-info").removeClass("alert-warning");
				$('#encrypt-output').addClass("alert alert-success");
				$('#encrypt-output').html("<p>Your encrypted message is: " + encrypted.ciphertext.toString()  + "</p>");
				algo_chosen = '3des';
				//decrypted = CryptoJS.TripleDES.decrypt(encrypted, keybits.toString());
				//console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				break;
			
			case 'rabbit':
				encrypted = CryptoJS.Rabbit.encrypt(message, keybits.toString());
				console.log("CipherText:"+encrypted.ciphertext.toString());
				$('#encrypt-output').removeClass("alert-info").removeClass("alert-warning");
				$('#encrypt-output').addClass("alert alert-success");
				$('#encrypt-output').html("<p>Your encrypted message is: " + encrypted.ciphertext.toString()  + "</p>");
				algo_chosen = 'rabbit';
				//decrypted = CryptoJS.Rabbit.decrypt(encrypted, keybits.toString());
				//console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				break;
			
			case 'rc4':
				encrypted = CryptoJS.RC4Drop.encrypt(message, keybits.toString(), { drop: 3072/4 });
				console.log("CipherText:"+encrypted.ciphertext.toString());
				$('#encrypt-output').removeClass("alert-info").removeClass("alert-warning");
				$('#encrypt-output').addClass("alert alert-success");
				$('#encrypt-output').html("<p>Your encrypted message is: " + encrypted.ciphertext.toString()  + "</p>");
				algo_chosen = 'rc4';
				//decrypted = CryptoJS.RC4Drop.decrypt(encrypted, keybits.toString(), { drop: 3072/4 });
				//console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				break;
		}	
	}
}//end encrypt


//decrypt the cipher text with the provided algorithm
function decrypt(algo) {
	
	password = $("#password-encrypt").val();
	message = $("#secret-message").val();

	console.log("Password: " + password);
	console.log("Password hash: " + hash);
	console.log("Message: " + message);
	console.log("Salt: " + salt);
	console.log("Key: " + keybits);
	
	if (typeof keybits !== undefined && message.length >=1 ) {    //only run if we have a key and atleast 1 charachter to encrypt
		switch(algo) {
			case 'aes':
				decrypted = CryptoJS.AES.decrypt(encrypted, keybits.toString());
				console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				$("#decrypt-output").html("<p>Your secret message is: "+decrypted.toString(CryptoJS.enc.Utf8).replace(/(<([^>]+)>)/ig,"")).addClass("alert alert-success");
				break;
			case '3des':
				decrypted = CryptoJS.TripleDES.decrypt(encrypted, keybits.toString());
				console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				$("#decrypt-output").html("<p>Your secret message is: "+decrypted.toString(CryptoJS.enc.Utf8).replace(/(<([^>]+)>)/ig,"")).addClass("alert alert-success");
				break;
			
			case 'rabbit':				
				decrypted = CryptoJS.Rabbit.decrypt(encrypted, keybits.toString());
				console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				$("#decrypt-output").html("<p>Your secret message is: "+decrypted.toString(CryptoJS.enc.Utf8).replace(/(<([^>]+)>)/ig,"")).addClass("alert alert-success");
				break;
			
			case 'rc4':
				decrypted = CryptoJS.RC4Drop.decrypt(encrypted, keybits.toString(), { drop: 3072/4 });
				console.log("PlainText:"+decrypted.toString(CryptoJS.enc.Utf8));
				$("#decrypt-output").html("<p>Your secret message is: "+decrypted.toString(CryptoJS.enc.Utf8).replace(/(<([^>]+)>)/ig,"")).addClass("alert alert-success");
				break;
		}	
	}
}//end decrypt


//Logic for next/back buttons for navigation
function move(next_page){
    switch (next_page) {
	    case intro:

	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    });
	   
	    $("#intro").delay(800).fadeIn("slow", function (){
	    });
	    break;
	case hashes:

	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    });
	   
	    $("#hashes").delay(800).fadeIn("slow", function (){
	    });
	    break;
	case random:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    });
	    $(".noise").html("").removeClass("alert alert-success");
	    $("#random").delay(800).fadeIn("slow", function (){
	    });
	    break;
	
	case key:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    });
	    password = "";
	    keybits = "";
	    $(".key").html("").removeClass("alert alert-success");
	    
	    $("#key").delay(800).fadeIn("slow", function (){
	    });
	    break;
	
	case encrypt:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    });
		encrypted = "";
		password = "";
		keybits = "";
		$("#password.form-control").val(""); //remove prior text entry
		$("#password-encrypt.form-control").val(""); //remove current text entry
		$("#password-hash-out").html("").removeClass("alert alert-success");
		$(".key").html("").removeClass("alert alert-success");
		$("#encrypt-output").html("").removeClass("alert alertSuccess");
		
	    $("#encrypt").delay(800).fadeIn("slow", function (){
	    });
	    break;
	
	case decrypt:
	    $("#intro, #hashes, #random, #key, #encrypt, #decrypt").fadeOut("slow", function (){
	    });
		$("#key-decrypt").html("").removeClass("alert alert-success alert-info");
		$("#decrypt-output").html("").removeClass("alert alert-success alert-info");
		$("#ciphertext-decrypt").html("").removeClass("alert alert-success alert-info");
		$("#decrypt-row").hide();
		$("#de_aes").hide();
		$("#de_3des").hide();
		$("#de_rabbit").hide();
		$("#de_rc4").hide();

		if (keybits.toString().length >1 && encrypted.toString().length > 1) {
			$("#key-decrypt").html("<p>Your key is: " + keybits.toString()  + "</p>").addClass("alert alert-success");
			$("#ciphertext-decrypt").html("<p>Your ciphertext is: " +encrypted.ciphertext.toString()  + "</p>").addClass("alert alert-success");
			$("#decrypt-row").show();
			switch(algo_chosen){
				case 'aes':
					$("#de_aes").show();
					break;
				case '3des':
					$("#de_3des").show();
					break;				
				case 'rabbit':
					$("#de_rabbit").show();
					break;
				case 'rc4':
					$("#de_rc4").show();
					break;
			} //end switch
			
		}else{
			$("#key-decrypt").html("You have no key or encrypted message! Go back a page and calculate a key and encrypt a message for me. Pretty please. With sprinkles.").addClass("alert alert-info");
		}
	   
	   
	    $("#decrypt").delay(800).fadeIn("slow", function (){
	    });
	    break;
	
   }
   

}
