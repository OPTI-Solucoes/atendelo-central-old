Vue.component('login', {
 	template: $.readFile("templates/login/login.html"),

 	beforeMount: function() {
 		if(this.$root.is_logged()) {
 			this.$root.$router.push({name:"home"});
 		} else {
        	this.$root.loading.page = true;
        }
    },

    mounted: function() {
    	this.$root.loading.page = false;
    },

 	data: function () {
	    return {
	    	user: { email: '', passord: ''},
	    	registrar: false,
		};
  	},

  	methods: {
  		toggleSignIn: function() {
  			var self = this;
  			var email = self.user.email;
  			var password = self.user.password;
  			
  			if (email.length < 4) {
  				console.log('Insira um email válido!');
                self.$root.mostrar_msg("Insira um email válido!");
  				return;
  			}
  			if (password.length < 4) {
  				console.log('Coloque uma senha com no mínimo 4 caracteres!');
                self.$root.mostrar_msg("Coloque uma senha com no mínimo 4 caracteres!");
  				return;
  			}
	        // Sign in with email and pass.
	        // [START authwithemail]
	        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log(errorCode);
				console.log(errorMessage);
				// [START_EXCLUDE]
				if (errorCode === 'auth/wrong-password') {
					self.$root.mostrar_msg("Senha incorreta!");
					self.loginError = 'Wrong password.';
				} else if(errorCode === 'auth/user-not-found') {
					self.$root.mostrar_msg("Usuário não cadastrado!");
					self.loginError = errorMessage;
				} else {
					self.$root.mostrar_msg("Houve algum erro ao fazer login no Google...");
					self.loginError = errorMessage;					
				}
				// [END_EXCLUDE]
	      	});
	        // [END authwithemail]
  		},

  		handleSignUp: function() {
  			var self = this;
			var email = self.user.email;
			var password = self.user.password;

			if (email.length < 4) {
				console.log('Insira um email válido!');
                self.$root.mostrar_msg("Insira um email válido!");
				return;
			}
			if (password.length < 4) {
				console.log('Coloque uma senha com no mínimo 4 caracteres!');
                self.$root.mostrar_msg("Coloque uma senha com no mínimo 4 caracteres!");
				return;
			}

			self.$root.registrando_usuario = true;
			// Sign in with email and pass.
			// [START createwithemail]
			firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
				firebase.auth().currentUser.sendEmailVerification().then(function() {
						// Email Verification sent!
						// [START_EXCLUDE]
						// alert('Enviamos um email de verificação para você! Cheque sua caixa de emails.');
		                self.$root.mostrar_msg("Enviamos um email de verificação para você! \
		                	Cheque sua caixa de emails.");
						self.$root.terminar_registro();
						// [END_EXCLUDE]
					});
			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// [START_EXCLUDE]
				if (errorCode == 'auth/weak-password') {
					self.$root.mostrar_msg("Senha muito fraca!");
				} else {
					console.log(errorMessage);
				}
				console.log(error);
				// [END_EXCLUDE]
			});
	      	// [END createwithemail]
	    },

	    sendEmailVerification: function() {
			// [START sendemailverification]
			firebase.auth().currentUser.sendEmailVerification().then(function() {
				// Email Verification sent!
				// [START_EXCLUDE]
				self.$root.mostrar_msg("Email de verificação enviado");
				// [END_EXCLUDE]
			});
			// [END sendemailverification]
    	},

    	sendPasswordReset: function() {
			var email = document.getElementById('email').value;
			// [START sendpasswordemail]
			firebase.auth().sendPasswordResetEmail(email).then(function() {
				// Password Reset Email Sent!
				// [START_EXCLUDE]
				self.$root.mostrar_msg("Solicitação de nova senha enviada!");
				// [END_EXCLUDE]
			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// [START_EXCLUDE]
				if (errorCode == 'auth/invalid-email') {
					self.$root.mostrar_msg("Email inválido!");
				} else if (errorCode == 'auth/user-not-found') {
					self.$root.mostrar_msg("Usuário não encontrado!");
				}
				console.log(error);
				// [END_EXCLUDE]
			});
			// [END sendpasswordemail];
	    }
  	}
});